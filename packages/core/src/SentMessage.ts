/**
 * `SentMessage` - a hydrated result value. The Bot API returns a plain
 * {@link module:BotApi.Message}; the send helpers in {@link module:Chat} wrap it in a
 * `SentMessage` that carries the same data **plus** `Effect` methods to act on that
 * exact message (`edit`, `delete`, `pin`, `react`, `forwardTo`, `copyTo`).
 *
 * It is an ordinary value whose methods close over the message's
 * `chat.id`/`message_id`, never a mutated prototype. The methods require
 * `TelegramClient` only when run, so hydration itself is pure and adds nothing to
 * a handler's `R`.
 *
 * @since 0.1.0
 */
import { Effect } from "effect"

import { TelegramClient } from "./client/index.js"

import type { BotApi, TelegramError } from "./client/index.js"

/**
 * Options for {@link SentMessage.edit}.
 *
 * @category models
 * @since 0.1.0
 */
export interface EditOptions {
  /** Replace the inline keyboard. */
  readonly replyMarkup?: BotApi.InlineKeyboardMarkup
  /** Parse mode for the new text (`"MarkdownV2"`, `"HTML"`, ...). */
  readonly parseMode?: string
}

/**
 * A message the bot just sent, hydrated with `Effect` methods that target it.
 *
 * @category models
 * @since 0.1.0
 */
export interface SentMessage extends BotApi.Message {
  /** Edit this message's text. */
  readonly edit: (
    text: string,
    options?: EditOptions
  ) => Effect.Effect<SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient>
  /** Delete this message. */
  readonly delete: () => Effect.Effect<boolean, TelegramError.TelegramError, TelegramClient.TelegramClient>
  /** Pin this message in its chat. */
  readonly pin: (options?: {
    readonly disableNotification?: boolean
  }) => Effect.Effect<boolean, TelegramError.TelegramError, TelegramClient.TelegramClient>
  /** React to this message with a single emoji. */
  readonly react: (
    emoji: string,
    options?: { readonly isBig?: boolean }
  ) => Effect.Effect<boolean, TelegramError.TelegramError, TelegramClient.TelegramClient>
  /** Forward this message to another chat, returning the forwarded (hydrated) message. */
  readonly forwardTo: (
    chatId: number | string
  ) => Effect.Effect<SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient>
  /** Copy this message to another chat (no link back), returning the new message id. */
  readonly copyTo: (
    chatId: number | string
  ) => Effect.Effect<BotApi.MessageId, TelegramError.TelegramError, TelegramClient.TelegramClient>
}

/**
 * Wraps a raw {@link module:BotApi.Message} into a {@link SentMessage}, attaching the
 * `Effect` methods that act on it. Pure - the methods pull `TelegramClient` only
 * when run.
 *
 * @example
 * import { SentMessage } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const sent = SentMessage.make({ messageId: 10, date: 0, chat: { id: 1, type: "private" } })
 *   yield* sent.react("👍")
 *   yield* sent.delete()
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = (message: BotApi.Message): SentMessage => {
  const chatId = message.chat.id
  const messageId = message.messageId
  return {
    ...message,
    edit: (text, options) =>
      Effect.flatMap(TelegramClient.TelegramClient, (tg) =>
        Effect.map(
          tg.editMessageText({
            chatId,
            messageId,
            text,
            ...(options?.replyMarkup !== undefined ? { replyMarkup: options.replyMarkup } : {}),
            ...(options?.parseMode !== undefined ? { parseMode: options.parseMode } : {})
          }),
          (edited) => make(edited as BotApi.Message)
        )),
    delete: () =>
      Effect.flatMap(TelegramClient.TelegramClient, (tg) => tg.deleteMessage({ chatId, messageId })),
    pin: (options) =>
      Effect.flatMap(TelegramClient.TelegramClient, (tg) =>
        tg.pinChatMessage({
          chatId,
          messageId,
          ...(options?.disableNotification !== undefined
            ? { disableNotification: options.disableNotification }
            : {})
        })),
    react: (emoji, options) =>
      Effect.flatMap(TelegramClient.TelegramClient, (tg) =>
        tg.setMessageReaction({
          chatId,
          messageId,
          reaction: [{ type: "emoji", emoji }],
          ...(options?.isBig !== undefined ? { isBig: options.isBig } : {})
        })),
    forwardTo: (toChatId) =>
      Effect.flatMap(TelegramClient.TelegramClient, (tg) =>
        Effect.map(
          tg.forwardMessage({ chatId: toChatId, fromChatId: chatId, messageId }),
          make
        )),
    copyTo: (toChatId) =>
      Effect.flatMap(TelegramClient.TelegramClient, (tg) =>
        tg.copyMessage({ chatId: toChatId, fromChatId: chatId, messageId }))
  }
}
