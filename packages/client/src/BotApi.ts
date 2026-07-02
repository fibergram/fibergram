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
 * One button of an inline keyboard. `callbackData` is the ≤64-byte payload
 * Telegram echoes back in a {@link CallbackQuery}; fibergram encodes typed values
 * into it via `CallbackData` (design section 5.3).
 *
 * @example
 * import { BotApi } from "@fibergram/client"
 * import { Schema } from "effect"
 *
 * const button = Schema.decodeUnknownSync(BotApi.InlineKeyboardButton)({
 *   text: "Vote",
 *   callback_data: "vote:1"
 * })
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineKeyboardButton = Schema.Struct({
  text: Schema.String,
  callbackData: Schema.optionalKey(Schema.String),
  url: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    callbackData: "callback_data"
  })
)

/**
 * Decoded `camelCase` inline keyboard button.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineKeyboardButton = Schema.Schema.Type<typeof InlineKeyboardButton>

/**
 * An inline keyboard: rows of {@link InlineKeyboardButton}. Attach it to
 * `sendMessage`/`editMessageText` via `replyMarkup`.
 *
 * @example
 * import { BotApi } from "@fibergram/client"
 * import { Schema } from "effect"
 *
 * const markup = Schema.decodeUnknownSync(BotApi.InlineKeyboardMarkup)({
 *   inline_keyboard: [[{ text: "Yes", callback_data: "y" }]]
 * })
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineKeyboardMarkup = Schema.Struct({
  inlineKeyboard: Schema.Array(Schema.Array(InlineKeyboardButton))
}).pipe(
  Schema.encodeKeys({
    inlineKeyboard: "inline_keyboard"
  })
)

/**
 * Decoded `camelCase` inline keyboard markup.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineKeyboardMarkup = Schema.Schema.Type<typeof InlineKeyboardMarkup>

/**
 * An incoming callback query - the result of a user tapping an inline button.
 * `data` carries the button's `callbackData` verbatim; fibergram routes on it via
 * `CallbackData` (design section 5.3).
 *
 * @example
 * import { BotApi } from "@fibergram/client"
 * import { Schema } from "effect"
 *
 * const query = Schema.decodeUnknownSync(BotApi.CallbackQuery)({
 *   id: "abc",
 *   from: { id: 1, is_bot: false, first_name: "Ada" },
 *   data: "vote:1"
 * })
 *
 * @category schemas
 * @since 0.1.0
 */
export const CallbackQuery = Schema.Struct({
  id: Schema.String,
  from: User,
  message: Schema.optionalKey(Message),
  data: Schema.optionalKey(Schema.String)
})

/**
 * Decoded `camelCase` callback query.
 *
 * @category models
 * @since 0.1.0
 */
export type CallbackQuery = Schema.Schema.Type<typeof CallbackQuery>

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
  editedMessage: Schema.optionalKey(Message),
  callbackQuery: Schema.optionalKey(CallbackQuery)
}).pipe(
  Schema.encodeKeys({
    updateId: "update_id",
    editedMessage: "edited_message",
    callbackQuery: "callback_query"
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
  replyToMessageId: Schema.optionalKey(Schema.Number),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    replyToMessageId: "reply_to_message_id",
    replyMarkup: "reply_markup"
  })
)

/**
 * `sendMessage` parameters (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendMessageParams = Schema.Schema.Type<typeof SendMessageParams>

/**
 * `editMessageText` request parameters. Edits an existing message in place - the
 * first-class way a dialog updates its "current prompt" instead of spamming new
 * messages (design section 13.6). Encoded to `snake_case` before hitting the API.
 *
 * @example
 * import { BotApi } from "@fibergram/client"
 * import { Schema } from "effect"
 *
 * const encoded = Schema.encodeUnknownSync(BotApi.EditMessageTextParams)({
 *   chatId: 1,
 *   messageId: 10,
 *   text: "edited"
 * })
 *
 * @category schemas
 * @since 0.1.0
 */
export const EditMessageTextParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageId: Schema.Number,
  text: Schema.String,
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageId: "message_id",
    replyMarkup: "reply_markup"
  })
)

/**
 * `editMessageText` parameters (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type EditMessageTextParams = Schema.Schema.Type<typeof EditMessageTextParams>

/**
 * `answerCallbackQuery` request parameters. Acknowledges a tapped inline button
 * (stops the client's loading spinner), optionally with a toast/alert. Encoded to
 * `snake_case` before hitting the API.
 *
 * @example
 * import { BotApi } from "@fibergram/client"
 * import { Schema } from "effect"
 *
 * const encoded = Schema.encodeUnknownSync(BotApi.AnswerCallbackQueryParams)({
 *   callbackQueryId: "abc",
 *   text: "Saved"
 * })
 *
 * @category schemas
 * @since 0.1.0
 */
export const AnswerCallbackQueryParams = Schema.Struct({
  callbackQueryId: Schema.String,
  text: Schema.optionalKey(Schema.String),
  showAlert: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    callbackQueryId: "callback_query_id",
    showAlert: "show_alert"
  })
)

/**
 * `answerCallbackQuery` parameters (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type AnswerCallbackQueryParams = Schema.Schema.Type<typeof AnswerCallbackQueryParams>

/**
 * `sendChatAction` request parameters. Shows a transient status (e.g. `"typing"`)
 * in the chat - the primitive behind `Chat.withTyping` (design section 5.5). Encoded
 * to `snake_case` before hitting the API.
 *
 * @example
 * import { BotApi } from "@fibergram/client"
 * import { Schema } from "effect"
 *
 * const encoded = Schema.encodeUnknownSync(BotApi.SendChatActionParams)({
 *   chatId: 1,
 *   action: "typing"
 * })
 *
 * @category schemas
 * @since 0.1.0
 */
export const SendChatActionParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  action: Schema.String,
  messageThreadId: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageThreadId: "message_thread_id"
  })
)

/**
 * `sendChatAction` parameters (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendChatActionParams = Schema.Schema.Type<typeof SendChatActionParams>
