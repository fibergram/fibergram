/**
 * `Hydrated` - incoming payloads wrapped with `Effect` methods, the inbound
 * mirror of {@link module:SentMessage}. A raw {@link module:BotApi.CallbackQuery} only
 * describes the tap; `Hydrated.callbackQuery` adds `.answer(...)`. Likewise
 * `.answer` for inline/pre-checkout/shipping queries, `.approve()/.decline()` for
 * join requests, and `.reply/.replyTo/.react/...` for an incoming message. The
 * typed matchers in {@link module:Router} hand handlers these hydrated values, so a
 * handler acts on what it received without re-deriving ids - as ordinary values
 * that carry their methods, never by mutating prototypes.
 *
 * Hydration is pure: the methods pull `TelegramClient` only when run, so wrapping
 * adds nothing to a handler's `R`.
 *
 * @since 0.1.0
 */
import { Effect, Option } from "effect"

import { TelegramClient } from "./client/index.js"
import * as SentMessage from "./SentMessage.js"

import type { BotApi, TelegramError } from "./client/index.js"

type Result<A> = Effect.Effect<A, TelegramError.TelegramError, TelegramClient.TelegramClient>

// --- callback query ----------------------------------------------------------

/**
 * A {@link module:BotApi.CallbackQuery} with `.answer(...)` to acknowledge the tap.
 *
 * @category models
 * @since 0.1.0
 */
export interface CallbackQuery extends BotApi.CallbackQuery {
  /** Acknowledge the tap (stops the client spinner), optionally with a toast/alert. */
  readonly answer: (
    options?: { readonly text?: string; readonly showAlert?: boolean }
  ) => Result<boolean>
}

/**
 * Wraps a raw {@link module:BotApi.CallbackQuery}, adding `.answer(...)`.
 *
 * @example
 * import { Hydrated } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = (query: Hydrated.CallbackQuery) =>
 *   Effect.gen(function* () {
 *     yield* query.answer({ text: "Saved" })
 *   })
 *
 * @category constructors
 * @since 0.1.0
 */
export const callbackQuery = (query: BotApi.CallbackQuery): CallbackQuery => ({
  ...query,
  answer: (options) =>
    Effect.flatMap(TelegramClient.TelegramClient, (tg) =>
      tg.answerCallbackQuery({
        callbackQueryId: query.id,
        ...(options?.text !== undefined ? { text: options.text } : {}),
        ...(options?.showAlert !== undefined ? { showAlert: options.showAlert } : {})
      }))
})

// --- inline query ------------------------------------------------------------

/**
 * An {@link module:BotApi.InlineQuery} with `.answer(results)` to reply with results.
 *
 * @category models
 * @since 0.1.0
 */
export interface InlineQuery extends BotApi.InlineQuery {
  /** Answer the inline query with a list of results. */
  readonly answer: (
    results: ReadonlyArray<BotApi.InlineQueryResult>,
    options?: {
      readonly cacheTime?: number
      readonly isPersonal?: boolean
      readonly nextOffset?: string
    }
  ) => Result<boolean>
}

/**
 * Wraps a raw {@link module:BotApi.InlineQuery}, adding `.answer(results)`.
 *
 * @example
 * import { Hydrated, InlineResult } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = (query: Hydrated.InlineQuery) =>
 *   Effect.gen(function* () {
 *     yield* query.answer([InlineResult.article({ id: "1", title: "Hi", message: "Hi" })])
 *   })
 *
 * @category constructors
 * @since 0.1.0
 */
export const inlineQuery = (query: BotApi.InlineQuery): InlineQuery => ({
  ...query,
  answer: (results, options) =>
    Effect.flatMap(TelegramClient.TelegramClient, (tg) =>
      tg.answerInlineQuery({
        inlineQueryId: query.id,
        results,
        ...(options?.cacheTime !== undefined ? { cacheTime: options.cacheTime } : {}),
        ...(options?.isPersonal !== undefined ? { isPersonal: options.isPersonal } : {}),
        ...(options?.nextOffset !== undefined ? { nextOffset: options.nextOffset } : {})
      }))
})

// --- chat join request -------------------------------------------------------

/**
 * A {@link module:BotApi.ChatJoinRequest} with `.approve()/.decline()`.
 *
 * @category models
 * @since 0.1.0
 */
export interface ChatJoinRequest extends BotApi.ChatJoinRequest {
  /** Approve the request to join. */
  readonly approve: () => Result<boolean>
  /** Decline the request to join. */
  readonly decline: () => Result<boolean>
}

/**
 * Wraps a raw {@link module:BotApi.ChatJoinRequest}, adding `.approve()/.decline()`.
 *
 * @example
 * import { Hydrated } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = (request: Hydrated.ChatJoinRequest) =>
 *   Effect.gen(function* () {
 *     yield* request.approve()
 *   })
 *
 * @category constructors
 * @since 0.1.0
 */
export const chatJoinRequest = (request: BotApi.ChatJoinRequest): ChatJoinRequest => {
  const target = { chatId: request.chat.id, userId: request.from.id }
  return {
    ...request,
    approve: () =>
      Effect.flatMap(TelegramClient.TelegramClient, (tg) => tg.approveChatJoinRequest(target)),
    decline: () =>
      Effect.flatMap(TelegramClient.TelegramClient, (tg) => tg.declineChatJoinRequest(target))
  }
}

// --- pre-checkout & shipping queries -----------------------------------------

/**
 * A {@link module:BotApi.PreCheckoutQuery} with `.answer(ok)` to confirm/reject the
 * final checkout step.
 *
 * @category models
 * @since 0.1.0
 */
export interface PreCheckoutQuery extends BotApi.PreCheckoutQuery {
  /** Confirm (`ok: true`) or reject (with an `errorMessage`) the checkout. */
  readonly answer: (ok: boolean, errorMessage?: string) => Result<boolean>
}

/**
 * Wraps a raw {@link module:BotApi.PreCheckoutQuery}, adding `.answer(ok)`.
 *
 * @example
 * import { Hydrated } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = (query: Hydrated.PreCheckoutQuery) =>
 *   Effect.gen(function* () {
 *     yield* query.answer(true)
 *   })
 *
 * @category constructors
 * @since 0.1.0
 */
export const preCheckoutQuery = (query: BotApi.PreCheckoutQuery): PreCheckoutQuery => ({
  ...query,
  answer: (ok, errorMessage) =>
    Effect.flatMap(TelegramClient.TelegramClient, (tg) =>
      tg.answerPreCheckoutQuery({
        preCheckoutQueryId: query.id,
        ok,
        ...(errorMessage !== undefined ? { errorMessage } : {})
      }))
})

/**
 * A {@link module:BotApi.ShippingQuery} with `.answer(ok)` to deliver shipping
 * options (or reject).
 *
 * @category models
 * @since 0.1.0
 */
export interface ShippingQuery extends BotApi.ShippingQuery {
  /** Deliver `shippingOptions` (`ok: true`) or reject with an `errorMessage`. */
  readonly answer: (
    ok: boolean,
    options?: {
      readonly shippingOptions?: ReadonlyArray<BotApi.ShippingOption>
      readonly errorMessage?: string
    }
  ) => Result<boolean>
}

/**
 * Wraps a raw {@link module:BotApi.ShippingQuery}, adding `.answer(ok, options)`.
 *
 * @example
 * import { Hydrated } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = (query: Hydrated.ShippingQuery) =>
 *   Effect.gen(function* () {
 *     yield* query.answer(true, { shippingOptions: [{ id: "std", title: "Standard", prices: [] }] })
 *   })
 *
 * @category constructors
 * @since 0.1.0
 */
export const shippingQuery = (query: BotApi.ShippingQuery): ShippingQuery => ({
  ...query,
  answer: (ok, options) =>
    Effect.flatMap(TelegramClient.TelegramClient, (tg) =>
      tg.answerShippingQuery({
        shippingQueryId: query.id,
        ok,
        ...(options?.shippingOptions !== undefined ? { shippingOptions: options.shippingOptions } : {}),
        ...(options?.errorMessage !== undefined ? { errorMessage: options.errorMessage } : {})
      }))
})

// --- incoming message --------------------------------------------------------

/**
 * An incoming {@link module:BotApi.Message} with `Effect` methods to act on it:
 * `.reply`/`.replyTo` (send back), `.react`, `.delete`, `.forwardTo`, `.copyTo`.
 *
 * @category models
 * @since 0.1.0
 */
export interface IncomingMessage extends BotApi.Message {
  /** Send a new message to this chat, returning the hydrated {@link module:SentMessage.SentMessage}. */
  readonly reply: (text: string) => Result<SentMessage.SentMessage>
  /** Reply quoting this message. */
  readonly replyTo: (text: string) => Result<SentMessage.SentMessage>
  /** React to this message with a single emoji. */
  readonly react: (emoji: string, options?: { readonly isBig?: boolean }) => Result<boolean>
  /** Delete this message. */
  readonly delete: () => Result<boolean>
  /** Forward this message to another chat. */
  readonly forwardTo: (chatId: number | string) => Result<SentMessage.SentMessage>
  /** Copy this message to another chat, returning the new message id. */
  readonly copyTo: (chatId: number | string) => Result<BotApi.MessageId>
}

const threadField = (message: BotApi.Message): { messageThreadId?: number } =>
  message.messageThreadId !== undefined ? { messageThreadId: message.messageThreadId } : {}

/**
 * Wraps a raw incoming {@link module:BotApi.Message} with methods that act on it.
 *
 * @example
 * import { Hydrated } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = (message: Hydrated.IncomingMessage) =>
 *   Effect.gen(function* () {
 *     yield* message.replyTo("got it")
 *   })
 *
 * @category constructors
 * @since 0.1.0
 */
export const message = (source: BotApi.Message): IncomingMessage => {
  const chatId = source.chat.id
  const messageId = source.messageId
  const send = (text: string, quote: boolean): Result<SentMessage.SentMessage> =>
    Effect.flatMap(TelegramClient.TelegramClient, (tg) =>
      Effect.map(
        tg.sendMessage({
          chatId,
          text,
          ...threadField(source),
          ...(quote ? { replyParameters: { messageId } } : {})
        }),
        SentMessage.make
      ))
  return {
    ...source,
    reply: (text) => send(text, false),
    replyTo: (text) => send(text, true),
    react: (emoji, options) =>
      Effect.flatMap(TelegramClient.TelegramClient, (tg) =>
        tg.setMessageReaction({
          chatId,
          messageId,
          reaction: [{ type: "emoji", emoji }],
          ...(options?.isBig !== undefined ? { isBig: options.isBig } : {})
        })),
    delete: () =>
      Effect.flatMap(TelegramClient.TelegramClient, (tg) => tg.deleteMessage({ chatId, messageId })),
    forwardTo: (toChatId) =>
      Effect.flatMap(TelegramClient.TelegramClient, (tg) =>
        Effect.map(tg.forwardMessage({ chatId: toChatId, fromChatId: chatId, messageId }), SentMessage.make)),
    copyTo: (toChatId) =>
      Effect.flatMap(TelegramClient.TelegramClient, (tg) =>
        tg.copyMessage({ chatId: toChatId, fromChatId: chatId, messageId }))
  }
}

// --- message reaction --------------------------------------------------------

const emojiOf = (reaction: BotApi.ReactionType): Option.Option<string> =>
  reaction.type === "emoji" ? Option.some(reaction.emoji) : Option.none()

const keyOf = (reaction: BotApi.ReactionType): string =>
  reaction.type === "emoji"
    ? `emoji:${reaction.emoji}`
    : (reaction.type === "custom_emoji"
      ? `custom:${reaction.customEmojiId}`
      : "paid")

/**
 * A {@link module:BotApi.MessageReactionUpdated} with the computed diff: the
 * reactions `added` and `removed` between the old and new lists, plus their emoji
 * shortcuts.
 *
 * @category models
 * @since 0.1.0
 */
export interface MessageReaction extends BotApi.MessageReactionUpdated {
  /** Reactions present in `newReaction` but not `oldReaction`. */
  readonly added: ReadonlyArray<BotApi.ReactionType>
  /** Reactions present in `oldReaction` but not `newReaction`. */
  readonly removed: ReadonlyArray<BotApi.ReactionType>
  /** The plain emoji among {@link added}. */
  readonly emojiAdded: ReadonlyArray<string>
  /** The plain emoji among {@link removed}. */
  readonly emojiRemoved: ReadonlyArray<string>
}

/**
 * Wraps a raw {@link module:BotApi.MessageReactionUpdated}, computing the
 * added/removed diff so a handler need not compare the two lists by hand.
 *
 * @example
 * import { Hydrated } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = (reaction: Hydrated.MessageReaction) =>
 *   Effect.log(`added ${reaction.emojiAdded.join(",")}`)
 *
 * @category constructors
 * @since 0.1.0
 */
export const messageReaction = (reaction: BotApi.MessageReactionUpdated): MessageReaction => {
  const oldKeys = new Set(reaction.oldReaction.map(keyOf))
  const newKeys = new Set(reaction.newReaction.map(keyOf))
  const added = reaction.newReaction.filter((r) => !oldKeys.has(keyOf(r)))
  const removed = reaction.oldReaction.filter((r) => !newKeys.has(keyOf(r)))
  return {
    ...reaction,
    added,
    removed,
    emojiAdded: added.flatMap((r) => Option.toArray(emojiOf(r))),
    emojiRemoved: removed.flatMap((r) => Option.toArray(emojiOf(r)))
  }
}
