/**
 * `Updates` - factories for synthetic `Update`s to feed a bot in tests (design
 * section 5.6). Instead of hand-writing nested Bot API JSON, build a text,
 * command or callback update from a few fields and stream it into
 * `Dispatcher.run` - no network, no live Telegram.
 *
 * @since 0.1.0
 */
import { Stream } from "effect"

import type { BotApi } from "@fibergram/client"

const tester = (fromId: number): BotApi.User => ({
  id: fromId,
  isBot: false,
  firstName: "Tester"
})

/**
 * Options for {@link text}.
 *
 * @category models
 * @since 0.1.0
 */
export interface TextOptions {
  readonly updateId: number
  readonly chatId: number
  readonly text: string
  /** Sender id; when set, populates `message.from`. */
  readonly fromId?: number
}

/**
 * A plain text-message update.
 *
 * @example
 * import { Updates } from "@fibergram/testing"
 *
 * const update = Updates.text({ updateId: 1, chatId: 100, text: "hi" })
 *
 * @category constructors
 * @since 0.1.0
 */
export const text = (options: TextOptions): BotApi.Update => ({
  updateId: options.updateId,
  message: {
    messageId: options.updateId,
    date: 0,
    chat: { id: options.chatId, type: "private" },
    text: options.text,
    ...(options.fromId !== undefined ? { from: tester(options.fromId) } : {})
  }
})

/**
 * Options for {@link command}.
 *
 * @category models
 * @since 0.1.0
 */
export interface CommandOptions {
  readonly updateId: number
  readonly chatId: number
  /** The command including its leading slash, e.g. `"/start"`. */
  readonly command: string
  /** Raw argument tokens appended after the command. */
  readonly args?: string
  readonly fromId?: number
}

/**
 * A `/command` update - a text message carrying a `bot_command` entity at offset
 * `0`, exactly as Telegram delivers it.
 *
 * @example
 * import { Updates } from "@fibergram/testing"
 *
 * const update = Updates.command({
 *   updateId: 1,
 *   chatId: 100,
 *   command: "/echo",
 *   args: "hello world"
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const command = (options: CommandOptions): BotApi.Update => {
  const body = options.args !== undefined ? `${options.command} ${options.args}` : options.command
  return {
    updateId: options.updateId,
    message: {
      messageId: options.updateId,
      date: 0,
      chat: { id: options.chatId, type: "private" },
      text: body,
      entities: [{ type: "bot_command", offset: 0, length: options.command.length }],
      ...(options.fromId !== undefined ? { from: tester(options.fromId) } : {})
    }
  }
}

/**
 * Options for {@link callback}.
 *
 * @category models
 * @since 0.1.0
 */
export interface CallbackOptions {
  readonly updateId: number
  readonly chatId: number
  readonly fromId: number
  /** The button's `callback_data` payload. */
  readonly data: string
  /** The message the inline keyboard is attached to; defaults to `updateId`. */
  readonly messageId?: number
}

/**
 * An inline-button tap (`callback_query`) update.
 *
 * @example
 * import { Updates } from "@fibergram/testing"
 *
 * const update = Updates.callback({
 *   updateId: 1,
 *   chatId: 100,
 *   fromId: 42,
 *   data: "confirm:yes"
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const callback = (options: CallbackOptions): BotApi.Update => ({
  updateId: options.updateId,
  callbackQuery: {
    id: `cb-${options.updateId}`,
    from: tester(options.fromId),
    chatInstance: `ci-${options.chatId}`,
    message: {
      messageId: options.messageId ?? options.updateId,
      date: 0,
      chat: { id: options.chatId, type: "private" }
    },
    data: options.data
  }
})

/**
 * Wraps a list of updates in a `Stream` ready for `Dispatcher.run` - sugar for
 * `Stream.fromIterable`.
 *
 * @example
 * import { Updates } from "@fibergram/testing"
 *
 * const updates = Updates.stream([
 *   Updates.text({ updateId: 1, chatId: 100, text: "a" }),
 *   Updates.text({ updateId: 2, chatId: 100, text: "b" })
 * ])
 *
 * @category constructors
 * @since 0.1.0
 */
export const stream = (updates: ReadonlyArray<BotApi.Update>): Stream.Stream<BotApi.Update> =>
  Stream.fromIterable(updates)
