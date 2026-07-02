/**
 * `TelegramClient` - a `Context.Service` (Tag + Layer) over the Effect
 * `HttpClient` (design section 6). The volatile HTTP perimeter sits behind this port;
 * the domain talks to the port, never to `fetch` (design section 9).
 *
 * Methods fail with the typed {@link module:TelegramError.TelegramError} union,
 * never with thrown errors, and the `snake_case <-> camelCase` boundary is fully
 * contained here and in {@link module:BotApi} (design section 5.3).
 *
 * @since 0.1.0
 */
import { Config, Context, Effect, Layer, Redacted, Schema } from "effect"
import { HttpClient, HttpClientRequest } from "effect/unstable/http"
import * as BotApi from "./BotApi.js"
import * as TelegramError from "./TelegramError.js"

const decodeResponse = Schema.decodeUnknownEffect(BotApi.ApiResponse)
const decodeUpdates = Schema.decodeUnknownEffect(Schema.Array(BotApi.Update))
const decodeMessage = Schema.decodeUnknownEffect(BotApi.Message)
const decodeBoolean = Schema.decodeUnknownEffect(Schema.Boolean)
const encodeGetUpdates = Schema.encodeUnknownEffect(BotApi.GetUpdatesParams)
const encodeSendMessage = Schema.encodeUnknownEffect(BotApi.SendMessageParams)
const encodeEditMessageText = Schema.encodeUnknownEffect(BotApi.EditMessageTextParams)
const encodeAnswerCallbackQuery = Schema.encodeUnknownEffect(BotApi.AnswerCallbackQueryParams)
const encodeSendChatAction = Schema.encodeUnknownEffect(BotApi.SendChatActionParams)

/**
 * The service shape: the subset of the Bot API fibergram currently needs. Each
 * call is an `Effect` whose only failure channel is the typed Telegram error
 * union.
 *
 * @category models
 * @since 0.1.0
 */
export interface TelegramClientService {
  readonly getUpdates: (
    params?: BotApi.GetUpdatesParams
  ) => Effect.Effect<ReadonlyArray<BotApi.Update>, TelegramError.TelegramError>
  readonly sendMessage: (
    params: BotApi.SendMessageParams
  ) => Effect.Effect<BotApi.Message, TelegramError.TelegramError>
  readonly editMessageText: (
    params: BotApi.EditMessageTextParams
  ) => Effect.Effect<BotApi.Message, TelegramError.TelegramError>
  readonly answerCallbackQuery: (
    params: BotApi.AnswerCallbackQueryParams
  ) => Effect.Effect<boolean, TelegramError.TelegramError>
  readonly sendChatAction: (
    params: BotApi.SendChatActionParams
  ) => Effect.Effect<boolean, TelegramError.TelegramError>
}

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
export class TelegramClient extends Context.Service<TelegramClient, TelegramClientService>()(
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
): Effect.Effect<TelegramClientService, never, HttpClient.HttpClient> =>
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

    const request = <A>(
      method: string,
      decodeResult: (input: unknown) => Effect.Effect<A, unknown>,
      body: unknown
    ): Effect.Effect<A, TelegramError.TelegramError> =>
      Effect.gen(function* () {
        const httpRequest = HttpClientRequest.post(`${baseUrl}/${method}`, {
          acceptJson: true
        }).pipe(HttpClientRequest.bodyJsonUnsafe(body))

        const response = yield* httpClient
          .execute(httpRequest)
          .pipe(Effect.mapError(transport(method)))
        const json = yield* response.json.pipe(Effect.mapError(transport(method)))
        const envelope = yield* decodeResponse(json).pipe(
          Effect.mapError(transport(method))
        )

        if (!envelope.ok) {
          return yield* Effect.fail(TelegramError.fromResponse(method, envelope))
        }
        return yield* decodeResult(envelope.result).pipe(
          Effect.mapError(transport(method))
        )
      })

    const getUpdates: TelegramClientService["getUpdates"] = (params) =>
      Effect.flatMap(
        encodeGetUpdates(params ?? {}).pipe(Effect.mapError(transport("getUpdates"))),
        (body) => request("getUpdates", decodeUpdates, body)
      )

    const sendMessage: TelegramClientService["sendMessage"] = (params) =>
      Effect.flatMap(
        encodeSendMessage(params).pipe(Effect.mapError(transport("sendMessage"))),
        (body) => request("sendMessage", decodeMessage, body)
      )

    const editMessageText: TelegramClientService["editMessageText"] = (params) =>
      Effect.flatMap(
        encodeEditMessageText(params).pipe(Effect.mapError(transport("editMessageText"))),
        (body) => request("editMessageText", decodeMessage, body)
      )

    const answerCallbackQuery: TelegramClientService["answerCallbackQuery"] = (params) =>
      Effect.flatMap(
        encodeAnswerCallbackQuery(params).pipe(
          Effect.mapError(transport("answerCallbackQuery"))
        ),
        (body) => request("answerCallbackQuery", decodeBoolean, body)
      )

    const sendChatAction: TelegramClientService["sendChatAction"] = (params) =>
      Effect.flatMap(
        encodeSendChatAction(params).pipe(Effect.mapError(transport("sendChatAction"))),
        (body) => request("sendChatAction", decodeBoolean, body)
      )

    return { getUpdates, sendMessage, editMessageText, answerCallbackQuery, sendChatAction }
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
