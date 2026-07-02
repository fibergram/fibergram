/**
 * `Chat` - the ctx-less ergonomics layer (design section 5.1, section 11.2). Free
 * accessor functions that read the ambient {@link module:UpdateContext} the
 * dispatcher stamped for the current update, so a handler writes `Chat.reply("hi")`
 * instead of digging `chatId` out of a context object.
 *
 * These are deliberately thin: they only add `TelegramClient` to a handler's `R`
 * (never an ambient "chat" tag), and they never grow into a god-object - each
 * function does exactly one Bot API call against the current chat.
 *
 * @since 0.1.0
 */
import { Duration, Effect, Fiber, Option, Ref } from "effect"

import { TelegramClient } from "@fibergram/client"

import * as UpdateContext from "./UpdateContext.js"

import type { TelegramError , BotApi} from "@fibergram/client"


/**
 * The chat id of the update being handled.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const id = yield* Chat.chatId
 *   return id
 * })
 *
 * @category accessors
 * @since 0.1.0
 */
export const chatId: Effect.Effect<number> = Effect.map(UpdateContext.env, (env) => env.chatId)

/**
 * The Forum Topic thread of the current update, if any (design section 4.1).
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect, Option } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const thread = yield* Chat.thread
 *   return Option.getOrElse(thread, () => 0)
 * })
 *
 * @category accessors
 * @since 0.1.0
 */
export const thread: Effect.Effect<Option.Option<number>> = Effect.map(
  UpdateContext.env,
  (env) => env.threadId
)

/**
 * The sender of the current update (from a message, edited message or callback
 * query), if any.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect, Option } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const from = yield* Chat.from
 *   return Option.map(from, (user) => user.firstName)
 * })
 *
 * @category accessors
 * @since 0.1.0
 */
export const from: Effect.Effect<Option.Option<BotApi.User>> = Effect.map(
  UpdateContext.env,
  (env) => {
    const update = env.update
    const user = update.message?.from ??
      update.editedMessage?.from ??
      update.callbackQuery?.from
    return Option.fromNullishOr(user)
  }
)

/**
 * Options for {@link reply}.
 *
 * @category models
 * @since 0.1.0
 */
export interface ReplyOptions {
  /** Attach an inline keyboard (e.g. `CallbackData`-encoded buttons). */
  readonly replyMarkup?: BotApi.InlineKeyboardMarkup
  /** Reply to a specific message id. */
  readonly replyToMessageId?: number
}

/**
 * Sends a message to the current chat (threaded when the update is threaded), and
 * remembers its id so a later {@link editLast} can target it.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.reply("Hello!")
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const reply = (
  text: string,
  options?: ReplyOptions
): Effect.Effect<BotApi.Message, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const tg = yield* TelegramClient.TelegramClient
    const message = yield* tg.sendMessage({
      chatId: env.chatId,
      text,
      ...(Option.isSome(env.threadId) ? { messageThreadId: env.threadId.value } : {}),
      ...(options?.replyToMessageId !== undefined
        ? { replyParameters: { messageId: options.replyToMessageId } }
        : {}),
      ...(options?.replyMarkup !== undefined ? { replyMarkup: options.replyMarkup } : {})
    })
    yield* Ref.set(env.lastSent, Option.some(message.messageId))
    return message
  })

/**
 * Options for {@link editLast}.
 *
 * @category models
 * @since 0.1.0
 */
export interface EditOptions {
  /** Replace the inline keyboard. */
  readonly replyMarkup?: BotApi.InlineKeyboardMarkup
}

/**
 * Edits the last message this handler sent in the current turn, instead of
 * spamming a new one (design section 13.6). Falls back to a fresh {@link reply}
 * when nothing has been sent yet.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.reply("Loading...")
 *   yield* Chat.editLast("Done")
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const editLast = (
  text: string,
  options?: EditOptions
): Effect.Effect<BotApi.Message, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const last = yield* Ref.get(env.lastSent)
    if (Option.isNone(last)) {
      return yield* reply(text, options)
    }
    const tg = yield* TelegramClient.TelegramClient
    // `editMessageText` returns `Message | true` per the Bot API - `true` only for
    // inline messages. `editLast` always targets a chat message (chatId + messageId),
    // so the result is always the edited `Message`.
    const edited = yield* tg.editMessageText({
      chatId: env.chatId,
      messageId: last.value,
      text,
      ...(options?.replyMarkup !== undefined ? { replyMarkup: options.replyMarkup } : {})
    })
    return edited as BotApi.Message
  })

/**
 * Options for {@link answerCallback}.
 *
 * @category models
 * @since 0.1.0
 */
export interface AnswerOptions {
  /** Toast text shown to the user. */
  readonly text?: string
  /** Show it as a modal alert rather than a toast. */
  readonly showAlert?: boolean
}

/**
 * Acknowledges the inline-button tap that produced the current update (stops the
 * client's spinner). Fails as a defect if the current update is not a callback
 * query.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.answerCallback({ text: "Saved" })
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const answerCallback = (
  options?: AnswerOptions
): Effect.Effect<boolean, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const query = env.update.callbackQuery
    if (query === undefined) {
      return yield* Effect.die(
        new Error("fibergram: Chat.answerCallback used on a non-callback update")
      )
    }
    const tg = yield* TelegramClient.TelegramClient
    return yield* tg.answerCallbackQuery({
      callbackQueryId: query.id,
      ...(options?.text !== undefined ? { text: options.text } : {}),
      ...(options?.showAlert !== undefined ? { showAlert: options.showAlert } : {})
    })
  })

/**
 * Runs `effect` while a `"typing…"` indicator shows in the current chat, cleared
 * automatically when it finishes - a textbook `Scope`/`acquireRelease` (design
 * section 5.5). Telegram expires the indicator after ~5s, so it is refreshed every
 * 4s; errors from the refresh are ignored so they never fail the wrapped work.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const slow = Chat.withTyping(
 *   Effect.gen(function* () {
 *     yield* Effect.sleep("2 seconds")
 *     yield* Chat.reply("Done")
 *   })
 * )
 *
 * @category combinators
 * @since 0.1.0
 */
export const withTyping = <A, E, R>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R | TelegramClient.TelegramClient> =>
  Effect.scoped(
    Effect.gen(function* () {
      const env = yield* UpdateContext.env
      const tg = yield* TelegramClient.TelegramClient
      // Errors from the indicator must never fail the wrapped work.
      const action = Effect.ignore(
        tg.sendChatAction({
          chatId: env.chatId,
          action: "typing",
          ...(Option.isSome(env.threadId) ? { messageThreadId: env.threadId.value } : {})
        })
      )
      // Show it immediately, then refresh before Telegram's ~5s expiry.
      yield* action
      const refresh = Effect.forever(Effect.andThen(Effect.sleep(Duration.seconds(4)), action))
      yield* Effect.acquireRelease(Effect.forkChild(refresh), (fiber) => Fiber.interrupt(fiber))
      return yield* effect
    })
  )
