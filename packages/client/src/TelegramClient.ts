/**
 * `TelegramClient` - a `Context.Service` (Tag + Layer) over the Effect
 * `HttpClient` (design section 6). The volatile HTTP perimeter sits behind this port;
 * the domain talks to the port, never to `fetch` (design section 9).
 *
 * The method surface ({@link TelegramClientService}) is **generated** from the Bot
 * API spec (`./generated/client`) - every Bot API method, fully typed. Only the
 * transport seam (`call`: HTTP request, token, `snake_case` encode/decode, error
 * mapping) is hand-written here. Methods fail with the typed
 * {@link module:TelegramError.TelegramError} union, never with thrown errors.
 *
 * @since 0.1.0
 */
import { Config, Context, Effect, Layer, Redacted, Schema } from "effect"
import { HttpClient, HttpClientRequest } from "effect/unstable/http"

import * as BotApi from "./BotApi.js"
import * as GeneratedClient from "./generated/client.js"
import * as TelegramError from "./TelegramError.js"

const decodeResponse = Schema.decodeUnknownEffect(BotApi.ApiResponse)

/**
 * The service shape: the full Bot API, generated from the spec. Each call is an
 * `Effect` whose only failure channel is the typed Telegram error union.
 *
 * @category models
 * @since 0.1.0
 */
export type TelegramClientService = GeneratedClient.TelegramClientService

/**
 * The `TelegramClient` service tag. `yield*` it inside any handler to reach the
 * Bot API; provide it once at the edge with {@link layer} or {@link layerToken}.
 *
 * @example
 * import { TelegramClient } from "@fibergram/client"
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
export class TelegramClient extends Context.Service<TelegramClient, GeneratedClient.TelegramClientService>()(
  "@fibergram/client/TelegramClient"
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
 * import { TelegramClient } from "@fibergram/client"
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
): Effect.Effect<GeneratedClient.TelegramClientService, never, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient
    const token = typeof options.token === "string"
      ? options.token
      : Redacted.value(options.token)
    const origin = options.apiBaseUrl ?? "https://api.telegram.org"
    const baseUrl = `${origin}/bot${token}`

    const transport = (method: string) =>
      (cause: unknown): TelegramError.TelegramError =>
        new TelegramError.TransportError({ method, cause })

    // The single transport seam every generated method flows through.
    const call: GeneratedClient.Call = (method, paramsSchema, resultSchema, params) =>
      Effect.gen(function* () {
        const body = paramsSchema === null
          ? {}
          : yield* Schema.encodeUnknownEffect(paramsSchema)(params).pipe(
            Effect.mapError(transport(method))
          )

        const httpRequest = HttpClientRequest.post(`${baseUrl}/${method}`, {
          acceptJson: true
        }).pipe(HttpClientRequest.bodyJsonUnsafe(body))

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

    return GeneratedClient.makeMethods(call)
  })

/**
 * A `Layer` providing {@link TelegramClient} from an explicit token. Wire an
 * `HttpClient` (e.g. `FetchHttpClient.layer`) underneath.
 *
 * @example
 * import { TelegramClient } from "@fibergram/client"
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
 * `BOT_TOKEN` environment variable via `Config.redacted` (design section 5.3, D5).
 * Wire an `HttpClient` underneath.
 *
 * @example
 * import { TelegramClient } from "@fibergram/client"
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
