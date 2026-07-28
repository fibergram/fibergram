---
title: Your first bot
description: From an echo bot to a routed, multi-step bot in four steps.
sidebar:
  order: 3
---

We will build up in four steps: echo → commands → callback buttons → a wizard.
Each step is a complete, runnable program.

## 1. Echo

```ts
import { Chat, Dedup, Dialog, DialogStore, Dispatcher } from "@fibergram/core"
import { TelegramClient } from "@fibergram/core/client"
import { Polling } from "@fibergram/core/polling"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

const echo = Dialog.stateless({
  onUpdate: (update) =>
    Effect.gen(function* () {
      const text = update.message?.text
      if (text !== undefined) yield* Chat.reply(text)
    })
})

const program = Effect.gen(function* () {
  const updates = yield* Polling.make()
  yield* Dispatcher.run({ updates, dialog: echo })
}).pipe(
  Effect.scoped,
  Effect.provide([
    DialogStore.layerMemory,
    Dedup.layerMemory,
    TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
  ])
)

Effect.runFork(program)
```

Four things are happening:

- **`Polling.make()`** forks a background poller into the ambient `Scope` and
  returns a `Stream<Update>`. It never dies: `retry_after` is honoured, other
  failures are logged and retried.
- **`Dialog.stateless`** is the sugar for "this dialog has no state" — see
  [Dialogs](/concepts/dialogs/) for the full decider underneath.
- **`Chat.reply`** knows which chat to answer because the dispatcher stamped the
  ambient update context before running your handler. No `ctx` was passed in.
- **`Effect.provide([...])`** is the only wiring point. `DialogStore.layerMemory`
  and `Dedup.layerMemory` choose the *in-memory* persistence regime; swapping
  them for [`@fibergram/durable`](/guides/durable/) is the only change needed to
  survive restarts.

`Effect.scoped` matters: the polling fiber is owned by that scope, so shutting
the program down shuts the poller down with it.

## 2. Commands with typed arguments

A command is a `Schema` over its arguments — parsing and validation happen before
your handler runs:

```ts
import { Chat, Command, Router } from "@fibergram/core"
import { Schema } from "effect"

const start = Command.make("/start", { description: "Say hello" })

const setAge = Command.make("/setage", Schema.Struct({ age: Schema.NumberFromString }), {
  description: "Set your age"
})

const router = Router.make(
  Router.command(start, () => Chat.reply("Hello!")),
  Router.command(setAge, ({ age }) => Chat.reply(`You are ${age}`))
)
```

`age` is a `number` inside the handler. A user typing `/setage banana` never
reaches it.

A router becomes a dialog like any other:

```ts
import { Dispatcher, Router } from "@fibergram/core"

const program = Effect.gen(function* () {
  const updates = yield* Polling.make()
  yield* Dispatcher.run({ updates, dialog: Router.toDialog(router) })
})
```

Two derived niceties come for free:

```ts
Router.allowedUpdates(router) // the `allowed_updates` set implied by your routes
Router.setMyCommands(router) // syncs the bot's command menu from the descriptions
```

Neither is a list you maintain by hand — both are computed from the routes you
actually mounted. See [Commands](/guides/commands/).

## 3. Buttons with typed payloads

Telegram gives you 64 bytes of `callback_data`. `CallbackData.make` turns those
bytes into a typed codec:

```ts
import { CallbackData, Chat, Router } from "@fibergram/core"
import { InlineKeyboard } from "@fibergram/core/ui"
import { Effect, Schema } from "effect"

const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number }))

const ask = Effect.gen(function* () {
  const keyboard = InlineKeyboard.empty
    .data("👍", Vote, { id: 1 })
    .data("👎", Vote, { id: 2 })

  yield* Chat.reply("Vote:", { replyMarkup: yield* InlineKeyboard.build(keyboard) })
})

const router = Router.make(
  Router.callback(Vote, ({ id }) => Chat.answerCallback({ text: `Voted ${id}` }))
)
```

The 64-byte budget is enforced in the type system's neighbourhood: `encode`
fails with `CallbackDataTooLong` rather than silently truncating. See
[Callback data](/guides/callback-data/).

## 4. A multi-step wizard

Hand-written state machines are the usual way to ask three questions in a row.
A `Coroutine` derives the state machine from a generator instead:

```ts
import { Coroutine } from "@fibergram/core"
import { Schema } from "effect"

const Age = Schema.NumberFromString.check(Schema.isBetween({ minimum: 0, maximum: 150 }))

const registration = Coroutine.make("registration", function* (d) {
  const name = yield* d.prompt("What is your name?", Schema.NonEmptyString)
  const age = yield* d.prompt("How old are you?", Age, {
    onInvalid: () => "That is not a plausible age. How old are you?"
  })
  yield* d.reply(`Nice to meet you, ${name} (${age}).`)
  return { name, age }
})
```

Every `d.prompt` is a suspension point: the coroutine asks, stops, and resumes on
the next update with a decoded answer. Feed it to the dispatcher exactly like any
other dialog:

```ts
Dispatcher.run({ updates, dialog: registration })
```

Whether a half-finished registration survives a redeploy is decided by the
`DialogStore` layer you provide — not by anything in the code above. That is the
central idea, and it is spelled out in [Dialogs](/concepts/dialogs/) and
[Persistence regimes](/concepts/persistence/).

## Putting it together

Real bots compose a `Router` with wizards. Because `Coroutine` is text-only and
fibergram runs **one dialog per chat**, the composition is explicit: a small root
dialog holds "which conversation is active" and delegates. The
[restaurant-booking example](https://github.com/fibergram/fibergram/tree/main/examples/restaurant-booking)
is a complete bot built exactly that way — wizards, a paginated inline menu, two
locales, and a filesystem-backed durable store.

## Next steps

- [Project structure](/getting-started/project-structure/) — how to lay out a
  bot that grows past one file.
- [Routing](/concepts/routing/) — every route constructor and how `E`/`R`
  accumulate across them.
- [Testing](/guides/testing/) — assert on what your bot sent, with no network.
