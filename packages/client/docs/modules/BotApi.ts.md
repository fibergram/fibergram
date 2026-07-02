---

title: BotApi.ts
nav_order: 1
parent: Modules
---

## BotApi overview

Bot API edge schemas - the **only** place `snake_case` is allowed (design section 5.3).

Each schema's decoded `Type` is `camelCase`; its `Encoded` representation is
the raw `snake_case` shape Telegram speaks, wired via {@link Schema.encodeKeys}.
Decoding maps `snake_case -> camelCase`; encoding maps back. Everything
downstream of this module is `camelCase` only.

Decoding is lenient by design: unknown fields are dropped rather than
rejected, so a new Bot API field never breaks the library.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [models](#models)
  - [AnswerCallbackQueryParams (type alias)](#answercallbackqueryparams-type-alias)
  - [ApiResponse (type alias)](#apiresponse-type-alias)
  - [CallbackQuery (type alias)](#callbackquery-type-alias)
  - [Chat (type alias)](#chat-type-alias)
  - [EditMessageTextParams (type alias)](#editmessagetextparams-type-alias)
  - [GetUpdatesParams (type alias)](#getupdatesparams-type-alias)
  - [InlineKeyboardButton (type alias)](#inlinekeyboardbutton-type-alias)
  - [InlineKeyboardMarkup (type alias)](#inlinekeyboardmarkup-type-alias)
  - [Message (type alias)](#message-type-alias)
  - [ResponseParameters (type alias)](#responseparameters-type-alias)
  - [SendChatActionParams (type alias)](#sendchatactionparams-type-alias)
  - [SendMessageParams (type alias)](#sendmessageparams-type-alias)
  - [Update (type alias)](#update-type-alias)
  - [User (type alias)](#user-type-alias)
- [schemas](#schemas)
  - [AnswerCallbackQueryParams](#answercallbackqueryparams)
  - [ApiResponse](#apiresponse)
  - [CallbackQuery](#callbackquery)
  - [Chat](#chat)
  - [EditMessageTextParams](#editmessagetextparams)
  - [GetUpdatesParams](#getupdatesparams)
  - [InlineKeyboardButton](#inlinekeyboardbutton)
  - [InlineKeyboardMarkup](#inlinekeyboardmarkup)
  - [Message](#message)
  - [ResponseParameters](#responseparameters)
  - [SendChatActionParams](#sendchatactionparams)
  - [SendMessageParams](#sendmessageparams)
  - [Update](#update)
  - [User](#user)

---

# models

## AnswerCallbackQueryParams (type alias)

`answerCallbackQuery` parameters (`camelCase`).

**Signature**

```ts
export type AnswerCallbackQueryParams = Schema.Schema.Type<typeof AnswerCallbackQueryParams>
```

Added in v0.1.0

## ApiResponse (type alias)

Decoded response envelope.

**Signature**

```ts
export type ApiResponse = Schema.Schema.Type<typeof ApiResponse>
```

Added in v0.1.0

## CallbackQuery (type alias)

Decoded `camelCase` callback query.

**Signature**

```ts
export type CallbackQuery = Schema.Schema.Type<typeof CallbackQuery>
```

Added in v0.1.0

## Chat (type alias)

Decoded `camelCase` chat.

**Signature**

```ts
export type Chat = Schema.Schema.Type<typeof Chat>
```

Added in v0.1.0

## EditMessageTextParams (type alias)

`editMessageText` parameters (`camelCase`).

**Signature**

```ts
export type EditMessageTextParams = Schema.Schema.Type<typeof EditMessageTextParams>
```

Added in v0.1.0

## GetUpdatesParams (type alias)

`getUpdates` parameters (`camelCase`).

**Signature**

```ts
export type GetUpdatesParams = Schema.Schema.Type<typeof GetUpdatesParams>
```

Added in v0.1.0

## InlineKeyboardButton (type alias)

Decoded `camelCase` inline keyboard button.

**Signature**

```ts
export type InlineKeyboardButton = Schema.Schema.Type<typeof InlineKeyboardButton>
```

Added in v0.1.0

## InlineKeyboardMarkup (type alias)

Decoded `camelCase` inline keyboard markup.

**Signature**

```ts
export type InlineKeyboardMarkup = Schema.Schema.Type<typeof InlineKeyboardMarkup>
```

Added in v0.1.0

## Message (type alias)

Decoded `camelCase` message.

**Signature**

```ts
export type Message = Schema.Schema.Type<typeof Message>
```

Added in v0.1.0

## ResponseParameters (type alias)

Decoded response parameters.

**Signature**

```ts
export type ResponseParameters = Schema.Schema.Type<typeof ResponseParameters>
```

Added in v0.1.0

## SendChatActionParams (type alias)

`sendChatAction` parameters (`camelCase`).

**Signature**

```ts
export type SendChatActionParams = Schema.Schema.Type<typeof SendChatActionParams>
```

Added in v0.1.0

## SendMessageParams (type alias)

`sendMessage` parameters (`camelCase`).

**Signature**

```ts
export type SendMessageParams = Schema.Schema.Type<typeof SendMessageParams>
```

Added in v0.1.0

## Update (type alias)

Decoded `camelCase` update.

**Signature**

```ts
export type Update = Schema.Schema.Type<typeof Update>
```

Added in v0.1.0

## User (type alias)

Decoded `camelCase` Telegram user.

**Signature**

```ts
export type User = Schema.Schema.Type<typeof User>
```

Added in v0.1.0

# schemas

## AnswerCallbackQueryParams

`answerCallbackQuery` request parameters. Acknowledges a tapped inline button
(stops the client's loading spinner), optionally with a toast/alert. Encoded to
`snake_case` before hitting the API.

**Signature**

```ts
export declare const AnswerCallbackQueryParams: Schema.encodeKeys<
  Schema.Struct<{
    readonly callbackQueryId: Schema.String
    readonly text: Schema.optionalKey<Schema.String>
    readonly showAlert: Schema.optionalKey<Schema.Boolean>
  }>,
  { readonly callbackQueryId: "callback_query_id"; readonly showAlert: "show_alert" }
>
```

**Example**

```ts
import { BotApi } from "@fibergram/client"
import { Schema } from "effect"

const encoded = Schema.encodeUnknownSync(BotApi.AnswerCallbackQueryParams)({
  callbackQueryId: "abc",
  text: "Saved"
})
```

Added in v0.1.0

## ApiResponse

The Bot API response envelope. `result` is left as `unknown` and decoded by
the caller against the specific method result schema on success; on failure
the error fields feed {@link module:TelegramError.fromResponse}.

**Signature**

```ts
export declare const ApiResponse: Schema.encodeKeys<
  Schema.Struct<{
    readonly ok: Schema.Boolean
    readonly result: Schema.optionalKey<Schema.Unknown>
    readonly errorCode: Schema.optionalKey<Schema.Number>
    readonly description: Schema.optionalKey<Schema.String>
    readonly parameters: Schema.optionalKey<
      Schema.encodeKeys<
        Schema.Struct<{
          readonly retryAfter: Schema.optionalKey<Schema.Number>
          readonly migrateToChatId: Schema.optionalKey<Schema.Number>
        }>,
        { readonly retryAfter: "retry_after"; readonly migrateToChatId: "migrate_to_chat_id" }
      >
    >
  }>,
  { readonly errorCode: "error_code" }
>
```

**Example**

```ts
import { BotApi } from "@fibergram/client"
import { Schema } from "effect"

const envelope = Schema.decodeUnknownSync(BotApi.ApiResponse)({ ok: true, result: [] })
```

Added in v0.1.0

## CallbackQuery

An incoming callback query - the result of a user tapping an inline button.
`data` carries the button's `callbackData` verbatim; fibergram routes on it via
`CallbackData` (design section 5.3).

**Signature**

```ts
export declare const CallbackQuery: Schema.Struct<{
  readonly id: Schema.String
  readonly from: Schema.encodeKeys<
    Schema.Struct<{
      readonly id: Schema.Number
      readonly isBot: Schema.Boolean
      readonly firstName: Schema.String
      readonly lastName: Schema.optionalKey<Schema.String>
      readonly username: Schema.optionalKey<Schema.String>
    }>,
    { readonly isBot: "is_bot"; readonly firstName: "first_name"; readonly lastName: "last_name" }
  >
  readonly message: Schema.optionalKey<
    Schema.encodeKeys<
      Schema.Struct<{
        readonly messageId: Schema.Number
        readonly date: Schema.Number
        readonly chat: Schema.Struct<{
          readonly id: Schema.Number
          readonly type: Schema.String
          readonly title: Schema.optionalKey<Schema.String>
          readonly username: Schema.optionalKey<Schema.String>
        }>
        readonly from: Schema.optionalKey<
          Schema.encodeKeys<
            Schema.Struct<{
              readonly id: Schema.Number
              readonly isBot: Schema.Boolean
              readonly firstName: Schema.String
              readonly lastName: Schema.optionalKey<Schema.String>
              readonly username: Schema.optionalKey<Schema.String>
            }>,
            { readonly isBot: "is_bot"; readonly firstName: "first_name"; readonly lastName: "last_name" }
          >
        >
        readonly text: Schema.optionalKey<Schema.String>
        readonly messageThreadId: Schema.optionalKey<Schema.Number>
      }>,
      { readonly messageId: "message_id"; readonly messageThreadId: "message_thread_id" }
    >
  >
  readonly data: Schema.optionalKey<Schema.String>
}>
```

**Example**

```ts
import { BotApi } from "@fibergram/client"
import { Schema } from "effect"

const query = Schema.decodeUnknownSync(BotApi.CallbackQuery)({
  id: "abc",
  from: { id: 1, is_bot: false, first_name: "Ada" },
  data: "vote:1"
})
```

Added in v0.1.0

## Chat

A chat (private, group, supergroup or channel).

**Signature**

```ts
export declare const Chat: Schema.Struct<{
  readonly id: Schema.Number
  readonly type: Schema.String
  readonly title: Schema.optionalKey<Schema.String>
  readonly username: Schema.optionalKey<Schema.String>
}>
```

**Example**

```ts
import { BotApi } from "@fibergram/client"
import { Schema } from "effect"

const chat = Schema.decodeUnknownSync(BotApi.Chat)({ id: 42, type: "private" })
```

Added in v0.1.0

## EditMessageTextParams

`editMessageText` request parameters. Edits an existing message in place - the
first-class way a dialog updates its "current prompt" instead of spamming new
messages (design section 13.6). Encoded to `snake_case` before hitting the API.

**Signature**

```ts
export declare const EditMessageTextParams: Schema.encodeKeys<
  Schema.Struct<{
    readonly chatId: Schema.Union<readonly [Schema.Number, Schema.String]>
    readonly messageId: Schema.Number
    readonly text: Schema.String
    readonly replyMarkup: Schema.optionalKey<
      Schema.encodeKeys<
        Schema.Struct<{
          readonly inlineKeyboard: Schema.$Array<
            Schema.$Array<
              Schema.encodeKeys<
                Schema.Struct<{
                  readonly text: Schema.String
                  readonly callbackData: Schema.optionalKey<Schema.String>
                  readonly url: Schema.optionalKey<Schema.String>
                }>,
                { readonly callbackData: "callback_data" }
              >
            >
          >
        }>,
        { readonly inlineKeyboard: "inline_keyboard" }
      >
    >
  }>,
  { readonly chatId: "chat_id"; readonly messageId: "message_id"; readonly replyMarkup: "reply_markup" }
>
```

**Example**

```ts
import { BotApi } from "@fibergram/client"
import { Schema } from "effect"

const encoded = Schema.encodeUnknownSync(BotApi.EditMessageTextParams)({
  chatId: 1,
  messageId: 10,
  text: "edited"
})
```

Added in v0.1.0

## GetUpdatesParams

`getUpdates` request parameters. Encoded to `snake_case` before hitting the API.

**Signature**

```ts
export declare const GetUpdatesParams: Schema.encodeKeys<
  Schema.Struct<{
    readonly offset: Schema.optionalKey<Schema.Number>
    readonly limit: Schema.optionalKey<Schema.Number>
    readonly timeout: Schema.optionalKey<Schema.Number>
    readonly allowedUpdates: Schema.optionalKey<Schema.$Array<Schema.String>>
  }>,
  { readonly allowedUpdates: "allowed_updates" }
>
```

Added in v0.1.0

## InlineKeyboardButton

One button of an inline keyboard. `callbackData` is the ≤64-byte payload
Telegram echoes back in a {@link CallbackQuery}; fibergram encodes typed values
into it via `CallbackData` (design section 5.3).

**Signature**

```ts
export declare const InlineKeyboardButton: Schema.encodeKeys<
  Schema.Struct<{
    readonly text: Schema.String
    readonly callbackData: Schema.optionalKey<Schema.String>
    readonly url: Schema.optionalKey<Schema.String>
  }>,
  { readonly callbackData: "callback_data" }
>
```

**Example**

```ts
import { BotApi } from "@fibergram/client"
import { Schema } from "effect"

const button = Schema.decodeUnknownSync(BotApi.InlineKeyboardButton)({
  text: "Vote",
  callback_data: "vote:1"
})
```

Added in v0.1.0

## InlineKeyboardMarkup

An inline keyboard: rows of {@link InlineKeyboardButton}. Attach it to
`sendMessage`/`editMessageText` via `replyMarkup`.

**Signature**

```ts
export declare const InlineKeyboardMarkup: Schema.encodeKeys<
  Schema.Struct<{
    readonly inlineKeyboard: Schema.$Array<
      Schema.$Array<
        Schema.encodeKeys<
          Schema.Struct<{
            readonly text: Schema.String
            readonly callbackData: Schema.optionalKey<Schema.String>
            readonly url: Schema.optionalKey<Schema.String>
          }>,
          { readonly callbackData: "callback_data" }
        >
      >
    >
  }>,
  { readonly inlineKeyboard: "inline_keyboard" }
>
```

**Example**

```ts
import { BotApi } from "@fibergram/client"
import { Schema } from "effect"

const markup = Schema.decodeUnknownSync(BotApi.InlineKeyboardMarkup)({
  inline_keyboard: [[{ text: "Yes", callback_data: "y" }]]
})
```

Added in v0.1.0

## Message

A message. `messageThreadId` carries Forum Topic sharding (design section 4.1).

**Signature**

```ts
export declare const Message: Schema.encodeKeys<
  Schema.Struct<{
    readonly messageId: Schema.Number
    readonly date: Schema.Number
    readonly chat: Schema.Struct<{
      readonly id: Schema.Number
      readonly type: Schema.String
      readonly title: Schema.optionalKey<Schema.String>
      readonly username: Schema.optionalKey<Schema.String>
    }>
    readonly from: Schema.optionalKey<
      Schema.encodeKeys<
        Schema.Struct<{
          readonly id: Schema.Number
          readonly isBot: Schema.Boolean
          readonly firstName: Schema.String
          readonly lastName: Schema.optionalKey<Schema.String>
          readonly username: Schema.optionalKey<Schema.String>
        }>,
        { readonly isBot: "is_bot"; readonly firstName: "first_name"; readonly lastName: "last_name" }
      >
    >
    readonly text: Schema.optionalKey<Schema.String>
    readonly messageThreadId: Schema.optionalKey<Schema.Number>
  }>,
  { readonly messageId: "message_id"; readonly messageThreadId: "message_thread_id" }
>
```

**Example**

```ts
import { BotApi } from "@fibergram/client"
import { Schema } from "effect"

const message = Schema.decodeUnknownSync(BotApi.Message)({
  message_id: 10,
  date: 0,
  chat: { id: 1, type: "private" },
  text: "hi"
})
```

Added in v0.1.0

## ResponseParameters

`parameters` block of a failed Bot API response - carries `retry_after`
(rate limiting) and `migrate_to_chat_id` (supergroup migration).

**Signature**

```ts
export declare const ResponseParameters: Schema.encodeKeys<
  Schema.Struct<{
    readonly retryAfter: Schema.optionalKey<Schema.Number>
    readonly migrateToChatId: Schema.optionalKey<Schema.Number>
  }>,
  { readonly retryAfter: "retry_after"; readonly migrateToChatId: "migrate_to_chat_id" }
>
```

Added in v0.1.0

## SendChatActionParams

`sendChatAction` request parameters. Shows a transient status (e.g. `"typing"`)
in the chat - the primitive behind `Chat.withTyping` (design section 5.5). Encoded
to `snake_case` before hitting the API.

**Signature**

```ts
export declare const SendChatActionParams: Schema.encodeKeys<
  Schema.Struct<{
    readonly chatId: Schema.Union<readonly [Schema.Number, Schema.String]>
    readonly action: Schema.String
    readonly messageThreadId: Schema.optionalKey<Schema.Number>
  }>,
  { readonly chatId: "chat_id"; readonly messageThreadId: "message_thread_id" }
>
```

**Example**

```ts
import { BotApi } from "@fibergram/client"
import { Schema } from "effect"

const encoded = Schema.encodeUnknownSync(BotApi.SendChatActionParams)({
  chatId: 1,
  action: "typing"
})
```

Added in v0.1.0

## SendMessageParams

`sendMessage` request parameters. Encoded to `snake_case` before hitting the API.

**Signature**

```ts
export declare const SendMessageParams: Schema.encodeKeys<
  Schema.Struct<{
    readonly chatId: Schema.Union<readonly [Schema.Number, Schema.String]>
    readonly text: Schema.String
    readonly messageThreadId: Schema.optionalKey<Schema.Number>
    readonly replyToMessageId: Schema.optionalKey<Schema.Number>
    readonly replyMarkup: Schema.optionalKey<
      Schema.encodeKeys<
        Schema.Struct<{
          readonly inlineKeyboard: Schema.$Array<
            Schema.$Array<
              Schema.encodeKeys<
                Schema.Struct<{
                  readonly text: Schema.String
                  readonly callbackData: Schema.optionalKey<Schema.String>
                  readonly url: Schema.optionalKey<Schema.String>
                }>,
                { readonly callbackData: "callback_data" }
              >
            >
          >
        }>,
        { readonly inlineKeyboard: "inline_keyboard" }
      >
    >
  }>,
  {
    readonly chatId: "chat_id"
    readonly messageThreadId: "message_thread_id"
    readonly replyToMessageId: "reply_to_message_id"
    readonly replyMarkup: "reply_markup"
  }
>
```

Added in v0.1.0

## Update

A single incoming update. Only the fields the dispatcher routes on are
modelled; unknown fields decode away silently (forward compatibility, section 5.3).

**Signature**

```ts
export declare const Update: Schema.encodeKeys<
  Schema.Struct<{
    readonly updateId: Schema.Number
    readonly message: Schema.optionalKey<
      Schema.encodeKeys<
        Schema.Struct<{
          readonly messageId: Schema.Number
          readonly date: Schema.Number
          readonly chat: Schema.Struct<{
            readonly id: Schema.Number
            readonly type: Schema.String
            readonly title: Schema.optionalKey<Schema.String>
            readonly username: Schema.optionalKey<Schema.String>
          }>
          readonly from: Schema.optionalKey<
            Schema.encodeKeys<
              Schema.Struct<{
                readonly id: Schema.Number
                readonly isBot: Schema.Boolean
                readonly firstName: Schema.String
                readonly lastName: Schema.optionalKey<Schema.String>
                readonly username: Schema.optionalKey<Schema.String>
              }>,
              { readonly isBot: "is_bot"; readonly firstName: "first_name"; readonly lastName: "last_name" }
            >
          >
          readonly text: Schema.optionalKey<Schema.String>
          readonly messageThreadId: Schema.optionalKey<Schema.Number>
        }>,
        { readonly messageId: "message_id"; readonly messageThreadId: "message_thread_id" }
      >
    >
    readonly editedMessage: Schema.optionalKey<
      Schema.encodeKeys<
        Schema.Struct<{
          readonly messageId: Schema.Number
          readonly date: Schema.Number
          readonly chat: Schema.Struct<{
            readonly id: Schema.Number
            readonly type: Schema.String
            readonly title: Schema.optionalKey<Schema.String>
            readonly username: Schema.optionalKey<Schema.String>
          }>
          readonly from: Schema.optionalKey<
            Schema.encodeKeys<
              Schema.Struct<{
                readonly id: Schema.Number
                readonly isBot: Schema.Boolean
                readonly firstName: Schema.String
                readonly lastName: Schema.optionalKey<Schema.String>
                readonly username: Schema.optionalKey<Schema.String>
              }>,
              { readonly isBot: "is_bot"; readonly firstName: "first_name"; readonly lastName: "last_name" }
            >
          >
          readonly text: Schema.optionalKey<Schema.String>
          readonly messageThreadId: Schema.optionalKey<Schema.Number>
        }>,
        { readonly messageId: "message_id"; readonly messageThreadId: "message_thread_id" }
      >
    >
    readonly callbackQuery: Schema.optionalKey<
      Schema.Struct<{
        readonly id: Schema.String
        readonly from: Schema.encodeKeys<
          Schema.Struct<{
            readonly id: Schema.Number
            readonly isBot: Schema.Boolean
            readonly firstName: Schema.String
            readonly lastName: Schema.optionalKey<Schema.String>
            readonly username: Schema.optionalKey<Schema.String>
          }>,
          { readonly isBot: "is_bot"; readonly firstName: "first_name"; readonly lastName: "last_name" }
        >
        readonly message: Schema.optionalKey<
          Schema.encodeKeys<
            Schema.Struct<{
              readonly messageId: Schema.Number
              readonly date: Schema.Number
              readonly chat: Schema.Struct<{
                readonly id: Schema.Number
                readonly type: Schema.String
                readonly title: Schema.optionalKey<Schema.String>
                readonly username: Schema.optionalKey<Schema.String>
              }>
              readonly from: Schema.optionalKey<
                Schema.encodeKeys<
                  Schema.Struct<{
                    readonly id: Schema.Number
                    readonly isBot: Schema.Boolean
                    readonly firstName: Schema.String
                    readonly lastName: Schema.optionalKey<Schema.String>
                    readonly username: Schema.optionalKey<Schema.String>
                  }>,
                  { readonly isBot: "is_bot"; readonly firstName: "first_name"; readonly lastName: "last_name" }
                >
              >
              readonly text: Schema.optionalKey<Schema.String>
              readonly messageThreadId: Schema.optionalKey<Schema.Number>
            }>,
            { readonly messageId: "message_id"; readonly messageThreadId: "message_thread_id" }
          >
        >
        readonly data: Schema.optionalKey<Schema.String>
      }>
    >
  }>,
  { readonly updateId: "update_id"; readonly editedMessage: "edited_message"; readonly callbackQuery: "callback_query" }
>
```

**Example**

```ts
import { BotApi } from "@fibergram/client"
import { Schema } from "effect"

const update = Schema.decodeUnknownSync(BotApi.Update)({
  update_id: 100,
  message: { message_id: 1, date: 0, chat: { id: 1, type: "private" }, text: "hi" }
})
```

Added in v0.1.0

## User

A Telegram user or bot.

**Signature**

```ts
export declare const User: Schema.encodeKeys<
  Schema.Struct<{
    readonly id: Schema.Number
    readonly isBot: Schema.Boolean
    readonly firstName: Schema.String
    readonly lastName: Schema.optionalKey<Schema.String>
    readonly username: Schema.optionalKey<Schema.String>
  }>,
  { readonly isBot: "is_bot"; readonly firstName: "first_name"; readonly lastName: "last_name" }
>
```

**Example**

```ts
import { BotApi } from "@fibergram/client"
import { Schema } from "effect"

const decode = Schema.decodeUnknownSync(BotApi.User)
const user = decode({ id: 1, is_bot: false, first_name: "Ada" })
```

Added in v0.1.0
