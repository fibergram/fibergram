/**
 * Bot API edge schemas - the **only** place `snake_case` is allowed (design section 5.3).
 *
 * Each schema's decoded `Type` is `camelCase`; its `Encoded` representation is
 * the raw `snake_case` shape Telegram speaks, wired via {@link Schema.encodeKeys}.
 * Decoding maps `snake_case -> camelCase`; encoding maps back. Everything
 * downstream of this module is `camelCase` only.
 *
 * Decoding is lenient by design: unknown fields are dropped rather than
 * rejected, so a new Bot API field never breaks the library.
 *
 * @since 0.1.0
 */
import { Schema } from "effect"

/**
 * A Telegram user or bot.
 *
 * @example
 * import { BotApi } from "@fibergram/client"
 * import { Schema } from "effect"
 *
 * const decode = Schema.decodeUnknownSync(BotApi.User)
 * const user = decode({ id: 1, is_bot: false, first_name: "Ada" })
 *
 * @category schemas
 * @since 0.1.0
 */
export const User = Schema.Struct({
  id: Schema.Number,
  isBot: Schema.Boolean,
  firstName: Schema.String,
  lastName: Schema.optionalKey(Schema.String),
  username: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    isBot: "is_bot",
    firstName: "first_name",
    lastName: "last_name"
  })
)

/**
 * Decoded `camelCase` Telegram user.
 *
 * @category models
 * @since 0.1.0
 */
export type User = Schema.Schema.Type<typeof User>

/**
 * A chat (private, group, supergroup or channel).
 *
 * @example
 * import { BotApi } from "@fibergram/client"
 * import { Schema } from "effect"
 *
 * const chat = Schema.decodeUnknownSync(BotApi.Chat)({ id: 42, type: "private" })
 *
 * @category schemas
 * @since 0.1.0
 */
export const Chat = Schema.Struct({
  id: Schema.Number,
  type: Schema.String,
  title: Schema.optionalKey(Schema.String),
  username: Schema.optionalKey(Schema.String)
})

/**
 * Decoded `camelCase` chat.
 *
 * @category models
 * @since 0.1.0
 */
export type Chat = Schema.Schema.Type<typeof Chat>

/**
 * A message. `messageThreadId` carries Forum Topic sharding (design section 4.1).
 *
 * @example
 * import { BotApi } from "@fibergram/client"
 * import { Schema } from "effect"
 *
 * const message = Schema.decodeUnknownSync(BotApi.Message)({
 *   message_id: 10,
 *   date: 0,
 *   chat: { id: 1, type: "private" },
 *   text: "hi"
 * })
 *
 * @category schemas
 * @since 0.1.0
 */
export const Message = Schema.Struct({
  messageId: Schema.Number,
  date: Schema.Number,
  chat: Chat,
  from: Schema.optionalKey(User),
  text: Schema.optionalKey(Schema.String),
  messageThreadId: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    messageId: "message_id",
    messageThreadId: "message_thread_id"
  })
)

/**
 * Decoded `camelCase` message.
 *
 * @category models
 * @since 0.1.0
 */
export type Message = Schema.Schema.Type<typeof Message>

/**
 * A single incoming update. Only the fields the dispatcher routes on are
 * modelled; unknown fields decode away silently (forward compatibility, section 5.3).
 *
 * @example
 * import { BotApi } from "@fibergram/client"
 * import { Schema } from "effect"
 *
 * const update = Schema.decodeUnknownSync(BotApi.Update)({
 *   update_id: 100,
 *   message: { message_id: 1, date: 0, chat: { id: 1, type: "private" }, text: "hi" }
 * })
 *
 * @category schemas
 * @since 0.1.0
 */
export const Update = Schema.Struct({
  updateId: Schema.Number,
  message: Schema.optionalKey(Message),
  editedMessage: Schema.optionalKey(Message)
}).pipe(
  Schema.encodeKeys({
    updateId: "update_id",
    editedMessage: "edited_message"
  })
)

/**
 * Decoded `camelCase` update.
 *
 * @category models
 * @since 0.1.0
 */
export type Update = Schema.Schema.Type<typeof Update>

/**
 * `parameters` block of a failed Bot API response - carries `retry_after`
 * (rate limiting) and `migrate_to_chat_id` (supergroup migration).
 *
 * @category schemas
 * @since 0.1.0
 */
export const ResponseParameters = Schema.Struct({
  retryAfter: Schema.optionalKey(Schema.Number),
  migrateToChatId: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    retryAfter: "retry_after",
    migrateToChatId: "migrate_to_chat_id"
  })
)

/**
 * Decoded response parameters.
 *
 * @category models
 * @since 0.1.0
 */
export type ResponseParameters = Schema.Schema.Type<typeof ResponseParameters>

/**
 * The Bot API response envelope. `result` is left as `unknown` and decoded by
 * the caller against the specific method result schema on success; on failure
 * the error fields feed {@link module:TelegramError.fromResponse}.
 *
 * @example
 * import { BotApi } from "@fibergram/client"
 * import { Schema } from "effect"
 *
 * const envelope = Schema.decodeUnknownSync(BotApi.ApiResponse)({ ok: true, result: [] })
 *
 * @category schemas
 * @since 0.1.0
 */
export const ApiResponse = Schema.Struct({
  ok: Schema.Boolean,
  result: Schema.optionalKey(Schema.Unknown),
  errorCode: Schema.optionalKey(Schema.Number),
  description: Schema.optionalKey(Schema.String),
  parameters: Schema.optionalKey(ResponseParameters)
}).pipe(
  Schema.encodeKeys({
    errorCode: "error_code"
  })
)

/**
 * Decoded response envelope.
 *
 * @category models
 * @since 0.1.0
 */
export type ApiResponse = Schema.Schema.Type<typeof ApiResponse>

/**
 * `getUpdates` request parameters. Encoded to `snake_case` before hitting the API.
 *
 * @category schemas
 * @since 0.1.0
 */
export const GetUpdatesParams = Schema.Struct({
  offset: Schema.optionalKey(Schema.Number),
  limit: Schema.optionalKey(Schema.Number),
  timeout: Schema.optionalKey(Schema.Number),
  allowedUpdates: Schema.optionalKey(Schema.Array(Schema.String))
}).pipe(
  Schema.encodeKeys({
    allowedUpdates: "allowed_updates"
  })
)

/**
 * `getUpdates` parameters (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetUpdatesParams = Schema.Schema.Type<typeof GetUpdatesParams>

/**
 * `sendMessage` request parameters. Encoded to `snake_case` before hitting the API.
 *
 * @category schemas
 * @since 0.1.0
 */
export const SendMessageParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  text: Schema.String,
  messageThreadId: Schema.optionalKey(Schema.Number),
  replyToMessageId: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    replyToMessageId: "reply_to_message_id"
  })
)

/**
 * `sendMessage` parameters (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendMessageParams = Schema.Schema.Type<typeof SendMessageParams>
