/**
 * `Filter` - predicates over an update and the boolean combinators to compose
 * them. Not a string query language, just ordinary `(update) => boolean`
 * functions closed under {@link and}/{@link or}/{@link not}, ready to drop into
 * {@link module:Router.when}.
 *
 * @since 0.1.0
 */
import { Option } from "effect"

import * as DialogAddress from "./DialogAddress.js"
import * as Message from "./Message.js"

import type { BotApi } from "@fibergram/client"

/**
 * A predicate over an update - the shape {@link module:Router.when} consumes.
 *
 * @category models
 * @since 0.1.0
 */
export type Filter = (update: BotApi.Update) => boolean

/**
 * True when every filter matches (empty list ⇒ always true).
 *
 * @example
 * import { Filter } from "@fibergram/core"
 *
 * const adminText = Filter.and(Filter.isText, Filter.fromUser(42))
 *
 * @category combinators
 * @since 0.1.0
 */
export const and = (...filters: ReadonlyArray<Filter>): Filter =>
  (update) => filters.every((f) => f(update))

/**
 * True when any filter matches (empty list ⇒ always false).
 *
 * @example
 * import { Filter } from "@fibergram/core"
 *
 * const help = Filter.or(Filter.textEquals("help"), Filter.textEquals("?"))
 *
 * @category combinators
 * @since 0.1.0
 */
export const or = (...filters: ReadonlyArray<Filter>): Filter =>
  (update) => filters.some((f) => f(update))

/**
 * Negates a filter.
 *
 * @example
 * import { Filter } from "@fibergram/core"
 *
 * const notCommand = Filter.not(Filter.isCommand)
 *
 * @category combinators
 * @since 0.1.0
 */
export const not = (filter: Filter): Filter => (update) => !filter(update)

// --- content filters ---------------------------------------------------------

/**
 * True when the update carries a message with text or caption.
 *
 * @example
 * import { Filter } from "@fibergram/core"
 *
 * const f = Filter.isText
 *
 * @category filters
 * @since 0.1.0
 */
export const isText: Filter = (update) => Option.isSome(Message.text(update))

/**
 * True when the message text is a bot command (starts with `/`).
 *
 * @example
 * import { Filter } from "@fibergram/core"
 *
 * const f = Filter.isCommand
 *
 * @category filters
 * @since 0.1.0
 */
export const isCommand: Filter = (update) =>
  Option.match(Message.text(update), { onNone: () => false, onSome: (t) => t.startsWith("/") })

/**
 * True when the text equals `value` exactly.
 *
 * @example
 * import { Filter } from "@fibergram/core"
 *
 * const f = Filter.textEquals("ping")
 *
 * @category filters
 * @since 0.1.0
 */
export const textEquals = (value: string): Filter => (update) =>
  Option.match(Message.text(update), { onNone: () => false, onSome: (t) => t === value })

/**
 * True when the text starts with `prefix`.
 *
 * @example
 * import { Filter } from "@fibergram/core"
 *
 * const f = Filter.textStartsWith("!")
 *
 * @category filters
 * @since 0.1.0
 */
export const textStartsWith = (prefix: string): Filter => (update) =>
  Option.match(Message.text(update), { onNone: () => false, onSome: (t) => t.startsWith(prefix) })

/**
 * True when the message carries an entity of type `kind` (`"url"`, `"email"`, ...).
 *
 * @example
 * import { Filter } from "@fibergram/core"
 *
 * const f = Filter.hasEntity("url")
 *
 * @category filters
 * @since 0.1.0
 */
export const hasEntity = (kind: string): Filter => (update) =>
  Option.match(Message.of(update), {
    onNone: () => false,
    onSome: (message) => Message.entitiesOfType(message, kind).length > 0
  })

// --- origin filters ----------------------------------------------------------

/**
 * True when the update's sender is `userId`.
 *
 * @example
 * import { Filter } from "@fibergram/core"
 *
 * const f = Filter.fromUser(42)
 *
 * @category filters
 * @since 0.1.0
 */
export const fromUser = (userId: number): Filter => (update) =>
  Option.match(DialogAddress.identityOf(update), {
    onNone: () => false,
    onSome: (id) => id.fromId === userId
  })

/**
 * True when the update's sender is one of `userIds`.
 *
 * @example
 * import { Filter } from "@fibergram/core"
 *
 * const f = Filter.fromUsers([1, 2, 3])
 *
 * @category filters
 * @since 0.1.0
 */
export const fromUsers = (userIds: ReadonlyArray<number>): Filter => {
  const set = new Set(userIds)
  return (update) =>
    Option.match(DialogAddress.identityOf(update), {
      onNone: () => false,
      onSome: (id) => id.fromId !== undefined && set.has(id.fromId)
    })
}

/**
 * True when the update is addressed to chat `chatId`.
 *
 * @example
 * import { Filter } from "@fibergram/core"
 *
 * const f = Filter.inChat(-100123)
 *
 * @category filters
 * @since 0.1.0
 */
export const inChat = (chatId: number): Filter => (update) =>
  Option.match(DialogAddress.chatIdOf(update), {
    onNone: () => false,
    onSome: (id) => id === chatId
  })

/**
 * True when the message's chat is of type `kind` (`"private"`, `"group"`,
 * `"supergroup"`, `"channel"`).
 *
 * @example
 * import { Filter } from "@fibergram/core"
 *
 * const f = Filter.chatType("private")
 *
 * @category filters
 * @since 0.1.0
 */
export const chatType = (kind: BotApi.Chat["type"]): Filter => (update) =>
  Option.match(Message.of(update), {
    onNone: () => false,
    onSome: (message) => message.chat.type === kind
  })

/**
 * True for private (1:1) chats.
 *
 * @example
 * import { Filter } from "@fibergram/core"
 *
 * const f = Filter.isPrivate
 *
 * @category filters
 * @since 0.1.0
 */
export const isPrivate: Filter = chatType("private")

/**
 * True for group and supergroup chats.
 *
 * @example
 * import { Filter } from "@fibergram/core"
 *
 * const f = Filter.isGroup
 *
 * @category filters
 * @since 0.1.0
 */
export const isGroup: Filter = or(chatType("group"), chatType("supergroup"))
