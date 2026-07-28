---
title: Project structure
description: How to lay out a fibergram bot that grows past a single file.
sidebar:
  order: 4
---

A bot that fits in one file should stay in one file. Once it does not, the shape
that holds up is driven by Effect, not by fibergram: **services at the bottom,
handlers in the middle, one wiring module at the top**.

## The layout

This is the structure of the
[restaurant-booking example](https://github.com/fibergram/fibergram/tree/main/examples/restaurant-booking),
a complete bot with wizards, a paginated menu, two locales, and durable storage:

```
src/
  config.ts        app configuration as a service (Config.* at the edge)
  storage.ts       the KeyValueStore backing everything durable
  domain.ts        models + repositories — Effect services over the store
  i18n.ts          loads locales/*.ftl and builds the translator
  wizard.ts        shared coroutine helpers
  registration.ts  /start wizard
  booking.ts       /book wizard
  menu.ts          the inline menu
  commands.ts      stateless commands and callbacks
  app.ts           the root dialog: composes the Router with the wizards
  main.ts          layer wiring + ingestion
locales/
  en.ftl, ru.ftl
```

The rule that makes this work: **everything below `main.ts` is a value, not a
program**. `registration.ts` exports a coroutine; `domain.ts` exports service
tags and layers; `menu.ts` exports a menu. Nothing runs, nothing reads an
environment variable, nothing opens a connection. `main.ts` is the only module
that knows the bot is real.

## Services, not imports

A handler asks for what it needs through `R`:

```ts
// domain.ts
import { Context, Effect, Layer, Option } from "effect"

export interface UserRepoService {
  readonly byId: (id: number) => Effect.Effect<Option.Option<User>>
  readonly save: (user: User) => Effect.Effect<void>
}

export class UserRepo extends Context.Service<UserRepo, UserRepoService>()("app/UserRepo") {}

export const layerUserRepo: Layer.Layer<UserRepo> = Layer.effect(UserRepo, /* … */)
```

That is the same `Context.Service` shape fibergram uses for its own ports —
`DialogStore`, `Dedup`, `TelegramClient` are all declared this way.

```ts
// commands.ts — no imports of the implementation, no globals
import { Chat, Router, Command } from "@fibergram/core"
import { Effect } from "effect"
import { UserRepo } from "./domain.js"

export const whoami = Router.command(Command.make("/whoami"), () =>
  Effect.gen(function* () {
    const repo = yield* UserRepo
    const id = yield* Chat.chatId
    const user = yield* repo.byId(id)
    yield* Chat.reply(Option.match(user, { onNone: () => "Not registered", onSome: (u) => u.name }))
  })
)
```

`Router.make(whoami, …)` accumulates `UserRepo` into the router's `R`. The
compiler will not let `main.ts` run the bot until that requirement is satisfied —
that is the whole dependency-injection story, and there is no container.

## One wiring module

```ts
// main.ts
import { Dedup, DialogStore, Dispatcher, Router } from "@fibergram/core"
import { TelegramClient } from "@fibergram/core/client"
import { Polling } from "@fibergram/core/polling"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import { router } from "./app.js"
import { layerUserRepo } from "./domain.js"

const program = Effect.gen(function* () {
  const updates = yield* Polling.make({
    allowedUpdates: Router.allowedUpdates(router)
  })
  yield* Router.setMyCommands(router)
  yield* Dispatcher.run({ updates, dialog: Router.toDialog(router) })
}).pipe(
  Effect.scoped,
  Effect.provide([
    layerUserRepo,
    DialogStore.layerMemory,
    Dedup.layerMemory,
    TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
  ])
)

Effect.runFork(program)
```

Every decision that distinguishes *development* from *production* lives in that
one `Effect.provide` array:

| Swap | From | To |
|---|---|---|
| Transport | `Polling.make()` | [`Webhook.make()`](/guides/webhooks/) |
| Dialog persistence | `DialogStore.layerMemory` | [`PersistedDialogStore.layer`](/guides/durable/) |
| Telegram client | `TelegramClient.layer` | [`TestTelegram`](/guides/testing/) |
| Outbound behaviour | `TelegramClient.layer` | [`TelegramClient.transformed(…)`](/guides/transforms/) |

## One dialog per chat

fibergram dispatches **one dialog per address**, so a bot with both a router and
stateful wizards needs an explicit answer to "which conversation is active". Two
options:

1. **[`Conversations`](/guides/conversations/#composing-with-a-router)** — the
   built-in composition of a router with named scenes. Start here.
2. **A hand-written root dialog** over a small tagged union
   (`Idle | Registration | Booking`) whose `decide` delegates to the active
   wizard and falls back to the router. More code, total control — this is what
   the restaurant-booking example does, because it needs `/cancel` to abort a
   wizard mid-flight.

Both are ordinary `Dialog`s; see [Dialogs](/concepts/dialogs/).

## Testing alongside

Because nothing below `main.ts` runs on import, tests provide a different edge
layer and drive synthetic updates through the same dialog:

```ts
// test/commands.test.ts
import { Dedup, DialogStore, Dispatcher, Router } from "@fibergram/core"
import { TestTelegram, Updates } from "@fibergram/core/testing"
import { Effect } from "effect"
import { router } from "../src/app.js"

const run = Effect.gen(function* () {
  const tg = yield* TestTelegram.make
  yield* Dispatcher.run({
    updates: Updates.stream([Updates.command({ updateId: 1, chatId: 1, command: "/whoami" })]),
    dialog: Router.toDialog(router)
  }).pipe(
    Effect.scoped,
    Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer, layerUserRepo])
  )
  return tg.sent
})
```

More in [Testing](/guides/testing/).
