/**
 * `TestTelegram` - a recording `TelegramClient` double that runs the whole bot
 * **without a network**. Every
 * outbound Bot API call is captured, so a test asserts *"the handler sent X"*
 * instead of intercepting HTTP; each call gets a plausible canned response so
 * handler code (e.g. `Chat.editLast`, which reads back a `messageId`) keeps
 * working.
 *
 * It is the `Layer.mock(TelegramClient)` of the design: provide
 * {@link TestTelegram.layer} at the edge and no method ever reaches
 * `api.telegram.org`.
 *
 * @since 0.1.0
 */
import { Effect, Layer, Ref, Stream } from "effect"

import { TelegramClient } from "@fibergram/client"

import type { BotApi} from "@fibergram/client";


/**
 * One captured outbound call: the Bot API `method` name and the `params` the
 * handler passed (in `camelCase`, exactly as written - the recorder sits *above*
 * the `snake_case` edge, so assertions read like the handler code).
 *
 * @category models
 * @since 0.1.0
 */
export interface RecordedCall {
  readonly method: string
  readonly params: unknown
}

/**
 * Bot API methods that return a single `Message`. The default responder
 * synthesises a plausible `Message` for these so `Chat.reply`/`Chat.editLast` and
 * the coroutine DSL have a `messageId` to read back; every other method defaults
 * to `true`. Override anything else via {@link MakeOptions.respond}.
 */
const MESSAGE_METHODS: ReadonlySet<string> = new Set([
  "sendMessage",
  "sendPhoto",
  "sendAudio",
  "sendDocument",
  "sendVideo",
  "sendAnimation",
  "sendVoice",
  "sendVideoNote",
  "sendSticker",
  "sendLocation",
  "sendVenue",
  "sendContact",
  "sendDice",
  "sendPoll",
  "sendGame",
  "sendInvoice",
  "forwardMessage",
  "editMessageText",
  "editMessageCaption",
  "editMessageMedia",
  "editMessageReplyMarkup",
  "editMessageLiveLocation",
  "stopMessageLiveLocation"
])

const synthMessage = (fallbackMessageId: number, params: unknown): BotApi.Message => {
  const p = (params ?? {}) as {
    readonly chatId?: number | string
    readonly text?: string
    readonly messageId?: number
  }
  const chatId = typeof p.chatId === "number" ? p.chatId : Number(p.chatId ?? 0)
  return {
    messageId: p.messageId ?? fallbackMessageId,
    date: 0,
    chat: { id: chatId, type: "private" },
    ...(p.text !== undefined ? { text: p.text } : {})
  }
}

const defaultResult = (
  method: string,
  params: unknown,
  nextMessageId: Effect.Effect<number>
): Effect.Effect<unknown> => {
  // No network: long polling yields nothing, so tests feed synthetic updates.
  if (method === "getUpdates") return Effect.succeed<ReadonlyArray<BotApi.Update>>([])
  if (method === "sendMediaGroup") {
    const media = (params as { readonly media?: ReadonlyArray<unknown> }).media ?? [null]
    return Effect.forEach(media, () => Effect.map(nextMessageId, (id) => synthMessage(id, params)))
  }
  // `getFileUrl` resolves to a plausible download URL for whichever file it was given.
  if (method === "getFileUrl") {
    const p = params as string | { readonly filePath?: string; readonly fileId?: string }
    const key = typeof p === "string" ? p : (p.filePath ?? p.fileId ?? "file")
    return Effect.succeed(`https://api.telegram.org/file/bottest/${key}`)
  }
  if (MESSAGE_METHODS.has(method)) {
    return Effect.map(nextMessageId, (id) => synthMessage(id, params))
  }
  return Effect.succeed(true)
}

/**
 * Options for {@link make}/{@link makeWith}.
 *
 * @category models
 * @since 0.1.0
 */
export interface MakeOptions {
  /**
   * Override the canned response for specific methods. Return a non-`undefined`
   * value to answer `method` with it; return `undefined` to fall back to the
   * default (a synthetic `Message` for message-returning methods, `true`
   * otherwise). Use it when a handler inspects a richer result, e.g. `getMe`.
   */
  readonly respond?: (method: string, params: unknown) => unknown
  /**
   * The bytes `downloadFile` streams back for a given file argument. Defaults to a
   * small canned chunk so a handler that reads an incoming file keeps working.
   */
  readonly download?: (file: unknown) => Uint8Array
}

/**
 * A live recording double: the `layer` to provide, plus accessors that read back
 * what the handler sent. Every accessor is an `Effect` so it composes inside a
 * test without extra ceremony.
 *
 * @category models
 * @since 0.1.0
 */
export interface TestTelegram {
  /** Provide this at the edge in place of `TelegramClient.layer`. */
  readonly layer: Layer.Layer<TelegramClient.TelegramClient>
  /** Every captured call, in the order the handler made them. */
  readonly calls: Effect.Effect<ReadonlyArray<RecordedCall>>
  /** The params of every call to `method`, in order. */
  readonly callsTo: (method: string) => Effect.Effect<ReadonlyArray<unknown>>
  /** Sugar for `callsTo("sendMessage")`, typed to the send params. */
  readonly sent: Effect.Effect<ReadonlyArray<BotApi.SendMessageParams>>
  /** Sugar for `callsTo("editMessageText")`. */
  readonly edited: Effect.Effect<ReadonlyArray<BotApi.EditMessageTextParams>>
  /** Sugar for `callsTo("sendChatAction")` (e.g. `Chat.withTyping` indicators). */
  readonly actions: Effect.Effect<ReadonlyArray<BotApi.SendChatActionParams>>
  /** Sugar for `callsTo("answerCallbackQuery")`. */
  readonly answered: Effect.Effect<ReadonlyArray<BotApi.AnswerCallbackQueryParams>>
  /** Forget every recorded call (e.g. between phases of a scenario). */
  readonly clear: Effect.Effect<void>
}

/**
 * Builds a {@link TestTelegram} with a custom responder. Prefer {@link make} when
 * the defaults suffice.
 *
 * @example
 * import { TestTelegram } from "@fibergram/testing"
 * import { TelegramClient } from "@fibergram/client"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const tg = yield* TestTelegram.makeWith({
 *     respond: (method) =>
 *       method === "getMe"
 *         ? { id: 42, isBot: true, firstName: "TestBot" }
 *         : undefined
 *   })
 *   yield* Effect.gen(function* () {
 *     const client = yield* TelegramClient.TelegramClient
 *     yield* client.sendMessage({ chatId: 1, text: "hi" })
 *   }).pipe(Effect.provide(tg.layer))
 *   return yield* tg.sent
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const makeWith = (options?: MakeOptions): Effect.Effect<TestTelegram> =>
  Effect.gen(function* () {
    const log = yield* Ref.make<ReadonlyArray<RecordedCall>>([])
    const counter = yield* Ref.make(1000)
    const nextMessageId = Ref.updateAndGet(counter, (n) => n + 1)

    const service = new Proxy(
      {},
      {
        get(_target, prop) {
          if (typeof prop !== "string") return
          const record = (params: unknown) => Ref.update(log, (all) => [...all, { method: prop, params }])
          // `downloadFile` returns a byte `Stream`, not an `Effect`, so it is handled apart.
          if (prop === "downloadFile") {
            return (params: unknown): Stream.Stream<Uint8Array> =>
              Stream.unwrap(
                Effect.as(
                  record(params),
                  Stream.make(options?.download?.(params) ?? Uint8Array.of(102, 105, 108, 101))
                )
              )
          }
          return (params: unknown): Effect.Effect<unknown> =>
            Effect.flatMap(record(params), () => {
              const overridden = options?.respond?.(prop, params)
              return overridden !== undefined
                ? Effect.succeed(overridden)
                : defaultResult(prop, params, nextMessageId)
            })
        }
      }
    ) as unknown as TelegramClient.TelegramClientService

    const callsTo = (method: string): Effect.Effect<ReadonlyArray<unknown>> =>
      Effect.map(Ref.get(log), (all) => all.filter((c) => c.method === method).map((c) => c.params))

    return {
      layer: Layer.succeed(TelegramClient.TelegramClient, service),
      calls: Ref.get(log),
      callsTo,
      sent: callsTo("sendMessage") as Effect.Effect<ReadonlyArray<BotApi.SendMessageParams>>,
      edited: callsTo("editMessageText") as Effect.Effect<ReadonlyArray<BotApi.EditMessageTextParams>>,
      actions: callsTo("sendChatAction") as Effect.Effect<ReadonlyArray<BotApi.SendChatActionParams>>,
      answered: callsTo("answerCallbackQuery") as Effect.Effect<
        ReadonlyArray<BotApi.AnswerCallbackQueryParams>
      >,
      clear: Ref.set(log, [])
    }
  })

/**
 * Builds a {@link TestTelegram} with sensible defaults - message-returning methods
 * answer with a synthetic `Message` (auto-incrementing `messageId`), everything
 * else answers `true`, and `getUpdates` yields nothing.
 *
 * @example
 * import { TestTelegram } from "@fibergram/testing"
 * import { Chat } from "@fibergram/core"
 * import { UpdateContext } from "@fibergram/core"
 * import { Effect, Option, Ref } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const tg = yield* TestTelegram.make
 *   const lastSent = yield* Ref.make(Option.none<number>())
 *   const env = {
 *     chatId: 1,
 *     threadId: Option.none(),
 *     fromId: Option.none(),
 *     update: { updateId: 1 },
 *     lastSent
 *   }
 *   yield* Chat.reply("hello").pipe(UpdateContext.provide(env), Effect.provide(tg.layer))
 *   return yield* tg.sent
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const make: Effect.Effect<TestTelegram> = makeWith()
