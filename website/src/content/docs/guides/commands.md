---
title: Commands
description: Declaring commands with typed arguments, syncing Telegram's menu, and handling typos.
sidebar:
  order: 1
---

## Declare a command

```ts
import { Command } from "@fibergram/core"
import { Schema } from "effect"

const help = Command.make("/help", { description: "Show the command list" })

const setAge = Command.make("/setage", Schema.Struct({ age: Schema.NumberFromString }), {
  description: "Set your age"
})
```

The leading slash is optional. Argument tokens map **positionally** onto the
schema's fields, and `/setage@yourbot 30` works in groups without extra handling.

Mount it:

```ts
import { Chat, Router } from "@fibergram/core"

const router = Router.make(
  Router.command(help, () => Chat.reply("…")),
  Router.command(setAge, ({ age }) => Chat.reply(`You are ${age}`))
)
```

Inside the handler `age` is a `number`. `/setage banana` does not reach it — the
route simply does not match, so no decode error leaks into `E`.

## Sync Telegram's command menu

The descriptions you already wrote are the menu:

```ts
yield * Router.setMyCommands(router)
```

Call it once at startup. There is no second list to keep in sync, and a command
without a `description` is deliberately omitted — that is how you keep admin
commands out of the public menu.

`Router.commands` and `Router.commandGroups` expose the same metadata if you
prefer to render `/help` yourself rather than hard-coding it.

## Handle unknown commands

```ts
const known = Router.make(
  Router.command(help, () => Chat.reply("…")),
  Router.command(setAge, ({ age }) => Chat.reply(`You are ${age}`))
)

const router = known.pipe(
  Router.add(
    Router.commandNotFound(known, ({ command, suggestions }) =>
      Chat.reply(
        suggestions.length > 0
          ? `Unknown /${command}. Did you mean /${suggestions[0]}?`
          : `Unknown /${command}.`
      )
    )
  )
)
```

`commandNotFound` takes the router (or an explicit name list) it should consider
"known", and computes fuzzy suggestions from it. Put it **last** — routes are
tried in order. A *known* command called with bad arguments is not routed here;
it is handled by its own `command` route.

## Guarding a command

Filters compose in front of the handler, so authorisation is not a middleware:

```ts
import { Filter, Router } from "@fibergram/core"

const adminOnly = Router.when(Filter.fromUsers([1, 2, 3]), () => Chat.reply("admin"))
```

Or do it inside the handler, where the failure is typed:

```ts
Router.command(ban, ({ userId }) =>
  Effect.gen(function* () {
    const admins = yield* AdminList
    const from = yield* Chat.from
    if (!admins.has(from?.id)) return yield* Chat.reply("Not allowed")
    yield* doBan(userId)
  })
)
```

## Entering a wizard from a command

Commands that start a multi-step flow are entry rules, not handlers:

```ts
const manager = Conversations.make({
  router,
  scenes: { registration },
  enter: [Conversations.on(start, "registration")],
  cancel: Conversations.cancel(Command.make("/cancel", { description: "Abort" }))
})
```

The entry and cancel commands are contributed back into `manager.router`, so
`setMyCommands` and `allowedUpdates` still see them. See
[Conversations](/guides/conversations/).

## Deep links

`/start` carrying a payload is its own thing — referral codes, invite links,
"open this item". See [Deep linking](/guides/deep-linking/).
