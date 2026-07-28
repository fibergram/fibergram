---
title: Testing
description: Drive a whole bot through synthetic updates and assert on what it sent — with no network and no waiting.
sidebar:
  order: 9
---

A bot is testable exactly to the degree that its transport is a value.
`@fibergram/core/testing` provides two: a recording client double and a
fabricator of incoming updates. No sockets are opened, and `TestClock` drives
every delay.

## The shape of a test

```ts
import { Chat, Dedup, Dialog, DialogStore, Dispatcher } from "@fibergram/core"
import { TestTelegram, Updates } from "@fibergram/core/testing"
import { Effect } from "effect"

const echo = Dialog.stateless({
  onUpdate: (update) =>
    Effect.gen(function* () {
      const text = update.message?.text
      if (text !== undefined) yield* Chat.reply(text)
    })
})

const test = Effect.gen(function* () {
  const tg = yield* TestTelegram.make

  yield* Dispatcher.run({
    updates: Updates.stream([
      Updates.text({ updateId: 1, chatId: 100, text: "hi" }),
      Updates.text({ updateId: 2, chatId: 100, text: "yo" })
    ]),
    dialog: echo
  }).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer]))

  const sent = yield* tg.sent
  // → [{ chatId: 100, text: "hi" }, { chatId: 100, text: "yo" }]
})
```

Note what makes this work: `Updates.stream` is a finite stream, so
`Dispatcher.run` terminates once it is drained. Production ingestion never does.

## Fabricating updates

| Constructor | Produces |
|---|---|
| `Updates.text({ updateId, chatId, text, fromId? })` | a plain message |
| `Updates.command({ updateId, chatId, command, args?, fromId? })` | a message with the `bot_command` entity set correctly |
| `Updates.callback({ updateId, chatId, fromId, data, messageId? })` | a `callback_query` |
| `Updates.stream([...])` | a `Stream` over them |

`Updates.command` matters more than it looks: a command message without the
entity is not a command as far as Telegram — and therefore the router — is
concerned.

## Asserting on what was sent

`TestTelegram` records every call through the single `call` seam that every Bot
API method flows through, so nothing escapes it:

| Accessor | Reads back |
|---|---|
| `tg.calls` | every recorded call, in order |
| `tg.callsTo(method)` | the params of every call to one method |
| `tg.sent` | `sendMessage` params |
| `tg.edited` | `editMessageText` params |
| `tg.actions` | `sendChatAction` params (e.g. typing indicators) |
| `tg.answered` | `answerCallbackQuery` params |
| `tg.clear` | forget everything, between phases of a scenario |

Params come back in **camelCase** — the same shape your handler passed in. The
`snake_case` boundary never leaks into a test.

The default responder synthesises a plausible `Message` for message-sending
methods (with an auto-incrementing `messageId`, so `Chat.editLast` has a target),
`true` for everything else, and `[]` for `getUpdates`.

## Stubbing responses

When a handler branches on what Telegram answered:

```ts
const tg = yield * TestTelegram.makeWith({
  respond: (method, params) => (method === "getMe" ? Option.some({ id: 1, isBot: true }) : Option.none())
})
```

Return `None` to fall through to the default responder.

## Testing a wizard

Drive the steps as a sequence of updates:

```ts
const test = Effect.gen(function* () {
  const tg = yield* TestTelegram.make

  yield* Dispatcher.run({
    updates: Updates.stream([
      Updates.command({ updateId: 1, chatId: 1, command: "/start" }),
      Updates.text({ updateId: 2, chatId: 1, text: "Ada" }),
      Updates.text({ updateId: 3, chatId: 1, text: "36" })
    ]),
    dialog: Conversations.toDialog(manager)
  }).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer]))

  const sent = yield* tg.sent
  // → ["What is your name?", "How old are you?", "Nice to meet you, Ada (36)."]
})
```

Because a coroutine's state goes through the `DialogStore`, this test also
exercises the replay path — swap in `PersistedDialogStore.layerMemory` to test
that a wizard survives passivation.

## Time

Every delay in fibergram goes through Effect's `Clock`:

```ts
import { TestClock } from "effect/testing"

yield * TestClock.adjust("10 minutes") // fires a passivation, a durable timer, a throttle window
```

That includes `Transform.throttle`'s flood-limit pacing, `Retry.retryRateLimited`'s
`retry_after` sleep, and `PassivatingEntityManager`'s idle eviction. Rate-limit
behaviour is testable in milliseconds.

## Determinism

Production ingestion never ends, so there is no natural "the bot is idle" moment.
For tests there is: the entity manager exposes `awaitIdle`, which resolves when
every mailbox has drained. `Dispatcher.run` over a finite stream already waits for
it — reach for `awaitIdle` directly only when you drive the manager yourself.

## With `@effect/vitest`

```ts
import { it } from "@effect/vitest"

it.effect("echoes", () =>
  Effect.gen(function* () {
    const tg = yield* TestTelegram.make
    // …
    expect(yield* tg.sent).toEqual([{ chatId: 100, text: "hi" }])
  })
)
```

`it.effect` runs the effect with a `TestClock` already installed, which is what
the fibergram repository itself uses across its own suite.
