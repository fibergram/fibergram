---
title: Life without `ctx`
description: What replaces the context object — ambient update state in a Context.Reference, and requirements in the R channel.
sidebar:
  order: 3
---

Every Telegram framework hands your handler a context object:

```ts
// the shape fibergram does not have
bot.command("start", async (ctx) => {
  await ctx.reply("hi")
  ctx.session.step = "name"
  const user = ctx.db.users.find(ctx.from.id)
})
```

That object is doing three unrelated jobs at once: it carries **per-update
facts** (who sent what, in which chat), it is the **API surface** (`ctx.reply`),
and it is a **service locator** (`ctx.db`, patched in by middleware). Fusing them
is what makes `ctx` grow without bound and makes its type a lie — whether
`ctx.session` exists depends on middleware ordering the compiler cannot see.

fibergram splits the three jobs apart.

## 1. Per-update facts: an ambient reference

The dispatcher stamps a small record before running your handler, for exactly
one update:

```ts
interface UpdateEnv {
  readonly chatId: number
  readonly threadId: Option<number>
  readonly fromId: Option<number>
  readonly update: Update
  readonly lastSent: Ref<Option<number>> // target for editLast
}
```

It lives in `UpdateContext.current`, a **`Context.Reference` with a default**.
(Effect v4 has no `FiberRef`; `Context.Reference` is the ambient-state
mechanism.) The default is what makes this ergonomic: reading it **adds nothing
to your handler's `R`**.

## 2. The API surface: free accessor functions

```ts
import { Chat } from "@fibergram/core"

Chat.reply(text, options?)      // knows chatId/threadId; records messageId in lastSent
Chat.editLast(text, options?)   // edits the last message sent; falls back to reply
Chat.answerCallback(options?)   // acks an inline-button tap
Chat.chatId                     // Effect<number>
Chat.thread                     // Effect<Option<number>>
Chat.from                       // Effect<Option<User>>
Chat.withTyping(effect)         // typing indicator for the duration of `effect`
```

These are deliberately thin. Each one requires **only `TelegramClient`** — never
an ambient "chat" tag — and makes exactly one Bot API call. There is no
inheritance, no plugin surface, and nothing to grow a `ctx.session` on: the
design constraint is that `Chat` must not become a god-object through the back
door.

```ts
const handler = Effect.gen(function* () {
  yield* Chat.reply("Working…")
  yield* Chat.withTyping(doSomethingSlow)
  yield* Chat.editLast("Done.")
})
```

`Chat.withTyping` is a textbook `acquireRelease`: it sends `sendChatAction`
immediately, forks a child fiber that refreshes the indicator every four seconds
(ahead of Telegram's ~5s expiry), and interrupts it when the wrapped effect
finishes — success or failure.

## 3. Dependencies: the `R` channel

Everything else is a service you ask for:

```ts
const handler = Effect.gen(function* () {
  const repo = yield* UserRepo // adds UserRepo to R
  const id = yield* Chat.chatId // adds nothing (ambient); Chat.reply adds TelegramClient
  const user = yield* repo.byId(id)
  yield* Chat.reply(user.name)
})
```

`R` accumulates up through routes and the router into the whole bot, and one
`Layer` at the edge satisfies it. If you forget to provide `UserRepo`, the
program does not compile — as opposed to `ctx.db` being `undefined` at 3am
because a middleware was registered in the wrong order.

The `EntityManager` captures that context once (`Effect.context<R>()`) and
replays it into every per-address fiber, so services are resolved once, not per
update.

## Outside a handler

The ambient reference has a default of `None`, so `Chat.*` used outside a
dispatch cycle fails predictably rather than reading someone else's chat. When
you need to act on a specific chat from a cron job or an HTTP endpoint, use the
client directly:

```ts
const notify = Effect.gen(function* () {
  const tg = yield* TelegramClient.TelegramClient
  yield* tg.sendMessage({ chatId: 12345, text: "Nightly report ready" })
})
```

The same split shows up in [`Session`](/guides/sessions/), which offers ambient
`get`/`set`/`update` for handlers and explicit `getAt`/`setAt`/`updateAt` for
everywhere else, and in [`@fibergram/i18n`](/guides/i18n/), whose `t` resolves an
ambient locale but can be pinned with `I18n.withLocale`.

## What you give up

Honestly: discoverability. `ctx.` in an editor lists everything a framework can
do; `Chat.` lists eight functions and you have to know that repositories come
from `yield*`. That is the trade — a smaller, honest surface in exchange for a
worse autocomplete-driven first hour.
