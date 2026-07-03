/**
 * `TelegramClient` - a `Context.Service` (Tag + Layer) over the Effect
 * `HttpClient`. The volatile HTTP perimeter sits behind this port;
 * the domain talks to the port, never to `fetch`.
 *
 * The method surface ({@link TelegramClientService}) is **generated** from the Bot
 * API spec (`./generated/client`) - every Bot API method, fully typed. Only the
 * transport seam (`call`: HTTP request, token, `snake_case` encode/decode, error
 * mapping) is hand-written here. Methods fail with the typed
 * {@link module:TelegramError.TelegramError} union, never with thrown errors.
 *
 * @since 0.1.0
 */
import { Config, Context, Effect, Layer, Redacted, Schema, Stream } from "effect"
import { HttpClient, HttpClientRequest, HttpClientResponse } from "effect/unstable/http"
import * as NodeFs from "node:fs"
import NodePath from "node:path"

import * as BotApi from "./BotApi.js"
import * as GeneratedClient from "./generated/client.js"
import * as Multipart from "./Multipart.js"
import * as TelegramError from "./TelegramError.js"

const decodeResponse = Schema.decodeUnknownEffect(BotApi.ApiResponse)

/**
 * File download helpers layered on top of the generated Bot API. `getFile` returns
 * only a `file_path`; these resolve it to a ready URL and stream the bytes,
 * accounting for the configured API origin and local Bot API server file paths.
 *
 * @category models
 * @since 0.1.0
 */
export interface FileApi {
  /**
   * Resolves a `file_id` (or a {@link module:BotApi.File}) to a downloadable URL,
   * calling `getFile` first when the `file_path` is not already known.
   */
  readonly getFileUrl: (file: string | BotApi.File) => Effect.Effect<string, TelegramError.TelegramError>
  /**
   * Streams a file's bytes. Reads a local Bot API server's absolute file path from
   * disk; otherwise `GET`s the download URL.
   */
  readonly downloadFile: (file: string | BotApi.File) => Stream.Stream<Uint8Array, TelegramError.TelegramError>
}

/**
 * The service shape: the full Bot API generated from the spec, plus the
 * hand-written file {@link FileApi}. Each call is an `Effect` whose only failure
 * channel is the typed Telegram error union.
 *
 * @category models
 * @since 0.1.0
 */
export type TelegramClientService = GeneratedClient.TelegramClientService & FileApi

/**
 * The `TelegramClient` service tag. `yield*` it inside any handler to reach the
 * Bot API; provide it once at the edge with {@link layer} or {@link layerToken}.
 *
 * @example
 * import { TelegramClient } from "@fibergram/core/client"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const tg = yield* TelegramClient.TelegramClient
 *   yield* tg.sendMessage({ chatId: 1, text: "hi" })
 * })
 *
 * @category services
 * @since 0.1.0
 */
export class TelegramClient extends Context.Service<TelegramClient, TelegramClientService>()(
  "@fibergram/core/client/TelegramClient"
) {}

/**
 * Options for constructing a {@link TelegramClient}.
 *
 * @category models
 * @since 0.1.0
 */
export interface MakeOptions {
  /** Bot token from `@BotFather`. Accepts a plain string or a `Redacted`. */
  readonly token: Redacted.Redacted<string> | string
  /** Override the API origin (e.g. a local Bot API server or a test double). */
  readonly apiBaseUrl?: string
}

/**
 * Builds the {@link TelegramClientService} against the ambient `HttpClient`.
 * Prefer {@link layer}/{@link layerToken}; this is the seam tests wire a mock
 * `HttpClient` into.
 *
 * @example
 * import { TelegramClient } from "@fibergram/core/client"
 * import { Layer } from "effect"
 * import { FetchHttpClient } from "effect/unstable/http"
 *
 * const layer = Layer.effect(
 *   TelegramClient.TelegramClient,
 *   TelegramClient.make({ token: "T" })
 * ).pipe(Layer.provide(FetchHttpClient.layer))
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = (
  options: MakeOptions
): Effect.Effect<TelegramClientService, never, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient
    const token = typeof options.token === "string"
      ? options.token
      : Redacted.value(options.token)
    const origin = options.apiBaseUrl ?? "https://api.telegram.org"
    const baseUrl = `${origin}/bot${token}`
    const isLocalServer = options.apiBaseUrl !== undefined

    const transport = (method: string) =>
      (cause: unknown): TelegramError.TelegramError =>
        new TelegramError.TransportError({ method, cause })

    // The single transport seam every generated method flows through. A payload
    // carrying an uploaded `InputFile` switches from JSON to multipart/form-data.
    const call: GeneratedClient.Call = (method, paramsSchema, resultSchema, params) =>
      Effect.gen(function* () {
        const encoded = paramsSchema === null
          ? {}
          : yield* Schema.encodeUnknownEffect(paramsSchema)(params).pipe(
            Effect.mapError(transport(method))
          )
        const body = yield* Multipart.prepare(encoded)

        const base = HttpClientRequest.post(`${baseUrl}/${method}`, { acceptJson: true })
        const httpRequest = body._tag === "FormData"
          ? base.pipe(HttpClientRequest.bodyFormData(body.formData))
          : base.pipe(HttpClientRequest.bodyJsonUnsafe(body.json))

        const response = yield* httpClient
          .execute(httpRequest)
          .pipe(Effect.mapError(transport(method)))
        const json = yield* response.json.pipe(Effect.mapError(transport(method)))
        const envelope = yield* decodeResponse(json).pipe(Effect.mapError(transport(method)))

        if (!envelope.ok) {
          return yield* Effect.fail(TelegramError.fromResponse(method, envelope))
        }
        return yield* Schema.decodeUnknownEffect(resultSchema)(envelope.result).pipe(
          Effect.mapError(transport(method))
        )
      })

    const methods = GeneratedClient.makeMethods(call)

    // Resolve a file_id/File to its file_path, calling getFile only when needed.
    const getFilePath = (
      file: string | BotApi.File
    ): Effect.Effect<string, TelegramError.TelegramError> => {
      if (typeof file !== "string" && file.filePath !== undefined) {
        return Effect.succeed(file.filePath)
      }
      const fileId = typeof file === "string" ? file : file.fileId
      return methods.getFile({ fileId }).pipe(
        Effect.flatMap((resolved) =>
          resolved.filePath !== undefined
            ? Effect.succeed(resolved.filePath)
            : Effect.fail(transport("getFile")(new Error("Bot API returned no file_path")))
        )
      )
    }

    const getFileUrl = (file: string | BotApi.File): Effect.Effect<string, TelegramError.TelegramError> =>
      Effect.map(getFilePath(file), (filePath) => `${origin}/file/bot${token}/${filePath}`)

    const downloadFile = (
      file: string | BotApi.File
    ): Stream.Stream<Uint8Array, TelegramError.TelegramError> =>
      Stream.unwrap(
        Effect.map(getFilePath(file), (filePath) => {
          // A local Bot API server hands back an absolute path to read from disk.
          if (isLocalServer && NodePath.isAbsolute(filePath)) {
            return Stream.unwrap(
              Effect.map(
                Effect.promise(() => NodeFs.openAsBlob(filePath)),
                (blob) =>
                  Stream.fromReadableStream<Uint8Array, TelegramError.TelegramError>({
                    evaluate: () => blob.stream(),
                    onError: transport("download")
                  })
              )
            )
          }
          return HttpClientResponse.stream(httpClient.get(`${origin}/file/bot${token}/${filePath}`)).pipe(
            Stream.mapError(transport("download"))
          )
        })
      )

    return { ...methods, getFileUrl, downloadFile }
  })

/**
 * A `Layer` providing {@link TelegramClient} from an explicit token. Wire an
 * `HttpClient` (e.g. `FetchHttpClient.layer`) underneath.
 *
 * @example
 * import { TelegramClient } from "@fibergram/core/client"
 * import { Layer } from "effect"
 * import { FetchHttpClient } from "effect/unstable/http"
 *
 * const layer = TelegramClient.layerToken({ token: "T" })
 *   .pipe(Layer.provide(FetchHttpClient.layer))
 *
 * @category layers
 * @since 0.1.0
 */
export const layerToken = (
  options: MakeOptions
): Layer.Layer<TelegramClient, never, HttpClient.HttpClient> =>
  Layer.effect(TelegramClient, make(options))

/**
 * A `Layer` providing {@link TelegramClient}, reading the bot token from the
 * `BOT_TOKEN` environment variable via `Config.redacted` (D5).
 * Wire an `HttpClient` underneath.
 *
 * @example
 * import { TelegramClient } from "@fibergram/core/client"
 * import { Layer } from "effect"
 * import { FetchHttpClient } from "effect/unstable/http"
 *
 * const layer = TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
 *
 * @category layers
 * @since 0.1.0
 */
export const layer: Layer.Layer<TelegramClient, Config.ConfigError, HttpClient.HttpClient> =
  Layer.effect(
    TelegramClient,
    Effect.flatMap(Config.redacted("BOT_TOKEN"), (token) => make({ token }))
  )
