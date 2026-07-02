---

title: Chat.ts
nav_order: 2
parent: Modules
---

## Chat overview

`Chat` - the ctx-less ergonomics layer (design section 5.1, section 11.2). Free
accessor functions that read the ambient {@link module:UpdateContext} the
dispatcher stamped for the current update, so a handler writes `Chat.reply("hi")`
instead of digging `chatId` out of a context object.

These are deliberately thin: they only add `TelegramClient` to a handler's `R`
(never an ambient "chat" tag), and they never grow into a god-object - each
function does exactly one Bot API call against the current chat.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [accessors](#accessors)
  - [chatId](#chatid)
  - [from](#from)
  - [thread](#thread)
- [combinators](#combinators)
  - [answerCallback](#answercallback)
  - [editLast](#editlast)
  - [reply](#reply)
  - [withTyping](#withtyping)
- [models](#models)
  - [AnswerOptions (interface)](#answeroptions-interface)
  - [EditOptions (interface)](#editoptions-interface)
  - [ReplyOptions (interface)](#replyoptions-interface)

---

# accessors

## chatId

The chat id of the update being handled.

**Signature**

```ts
export declare const chatId: Effect.Effect<number, never, never>
```

**Example**

```ts
import { Chat } from "@fibergram/core"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const id = yield* Chat.chatId
  return id
})
```

Added in v0.1.0

## from

The sender of the current update (from a message, edited message or callback
query), if any.

**Signature**

```ts
export declare const from: Effect.Effect<
  Option.Option<{
    readonly id: number
    readonly isBot: boolean
    readonly firstName: string
    readonly lastName?: string | undefined
    readonly username?: string | undefined
  }>,
  never,
  never
>
```

**Example**

```ts
import { Chat } from "@fibergram/core"
import { Effect, Option } from "effect"

const program = Effect.gen(function* () {
  const from = yield* Chat.from
  return Option.map(from, (user) => user.firstName)
})
```

Added in v0.1.0

## thread

The Forum Topic thread of the current update, if any (design section 4.1).

**Signature**

```ts
export declare const thread: Effect.Effect<Option.Option<number>, never, never>
```

**Example**

```ts
import { Chat } from "@fibergram/core"
import { Effect, Option } from "effect"

const program = Effect.gen(function* () {
  const thread = yield* Chat.thread
  return Option.getOrElse(thread, () => 0)
})
```

Added in v0.1.0

# combinators

## answerCallback

Acknowledges the inline-button tap that produced the current update (stops the
client's spinner). Fails as a defect if the current update is not a callback
query.

**Signature**

```ts
export declare const answerCallback: (
  options?: AnswerOptions
) => Effect.Effect<boolean, TelegramError.TelegramError, TelegramClient.TelegramClient>
```

**Example**

```ts
import { Chat } from "@fibergram/core"
import { Effect } from "effect"

const handler = Effect.gen(function* () {
  yield* Chat.answerCallback({ text: "Saved" })
})
```

Added in v0.1.0

## editLast

Edits the last message this handler sent in the current turn, instead of
spamming a new one (design section 13.6). Falls back to a fresh {@link reply}
when nothing has been sent yet.

**Signature**

```ts
export declare const editLast: (
  text: string,
  options?: EditOptions
) => Effect.Effect<BotApi.Message, TelegramError.TelegramError, TelegramClient.TelegramClient>
```

**Example**

```ts
import { Chat } from "@fibergram/core"
import { Effect } from "effect"

const handler = Effect.gen(function* () {
  yield* Chat.reply("Loading...")
  yield* Chat.editLast("Done")
})
```

Added in v0.1.0

## reply

Sends a message to the current chat (threaded when the update is threaded), and
remembers its id so a later {@link editLast} can target it.

**Signature**

```ts
export declare const reply: (
  text: string,
  options?: ReplyOptions
) => Effect.Effect<BotApi.Message, TelegramError.TelegramError, TelegramClient.TelegramClient>
```

**Example**

```ts
import { Chat } from "@fibergram/core"
import { Effect } from "effect"

const handler = Effect.gen(function* () {
  yield* Chat.reply("Hello!")
})
```

Added in v0.1.0

## withTyping

Runs `effect` while a `"typing…"` indicator shows in the current chat, cleared
automatically when it finishes - a textbook `Scope`/`acquireRelease` (design
section 5.5). Telegram expires the indicator after ~5s, so it is refreshed every
4s; errors from the refresh are ignored so they never fail the wrapped work.

**Signature**

```ts
export declare const withTyping: <A, E, R>(
  effect: Effect.Effect<A, E, R>
) => Effect.Effect<A, E, R | TelegramClient.TelegramClient>
```

**Example**

```ts
import { Chat } from "@fibergram/core"
import { Effect } from "effect"

const slow = Chat.withTyping(
  Effect.gen(function* () {
    yield* Effect.sleep("2 seconds")
    yield* Chat.reply("Done")
  })
)
```

Added in v0.1.0

# models

## AnswerOptions (interface)

Options for {@link answerCallback}.

**Signature**

```ts
export interface AnswerOptions {
  /** Toast text shown to the user. */
  readonly text?: string
  /** Show it as a modal alert rather than a toast. */
  readonly showAlert?: boolean
}
```

Added in v0.1.0

## EditOptions (interface)

Options for {@link editLast}.

**Signature**

```ts
export interface EditOptions {
  /** Replace the inline keyboard. */
  readonly replyMarkup?: BotApi.InlineKeyboardMarkup
}
```

Added in v0.1.0

## ReplyOptions (interface)

Options for {@link reply}.

**Signature**

```ts
export interface ReplyOptions {
  /** Attach an inline keyboard (e.g. `CallbackData`-encoded buttons). */
  readonly replyMarkup?: BotApi.InlineKeyboardMarkup
  /** Reply to a specific message id. */
  readonly replyToMessageId?: number
}
```

Added in v0.1.0
