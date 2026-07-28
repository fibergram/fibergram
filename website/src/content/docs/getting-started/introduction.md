---
title: Introduction
description: What fibergram is, what it deliberately is not, and who it is for.
sidebar:
  order: 1
---

fibergram is an **Effect-native framework for Telegram bots**. A handler is not a
callback that receives a context object — it is an `Effect<A, E, R>`:

```ts
import { Chat } from "@fibergram/core"
import { Effect } from "effect"

const handler = Effect.gen(function* () {
  const user = yield* UserRepo // a requirement, tracked in R
  yield* Chat.reply(`Hello, ${user.name}`) // may fail with TelegramError, tracked in E
})
```

Everything else follows from that one decision:

| Effect concept | What it means for your bot |
|---|---|
| `R` — requirements | Your repositories, config, and clients are services. No `ctx.session`, no middleware that mutates a bag. |
| `E` — typed errors | `RateLimited`, `BotBlocked`, `MessageNotModified` are values in the type, not strings you `instanceof`. |
| `Layer` | Persistence, transport, and test doubles are swapped by wiring, not by rewriting handlers. |
| `Stream` | Long polling and webhooks are both producers into one queue; the dispatcher never learns which. |
| `Schema` | Command arguments, callback payloads, and Bot API responses are decoded and validated at the edge. |

## What it is not

fibergram does not try to be a nicer set of Bot API types — those are generated
mechanically from the [official spec](https://core.telegram.org/bots/api) and are
the least interesting part of the project. The differentiator is the **runtime
integration with Effect**.

It also deliberately leaves things out:

- **No middleware chain.** Composition is `Effect` composition; cross-cutting
  concerns are `Layer`s and [transforms](/guides/transforms/).
- **No `ctx` object.** See [Life without `ctx`](/concepts/no-ctx/) for what
  replaces it and why.
- **No widget engine.** The highest-level primitive is the
  [coroutine](/guides/conversations/); inline menus are a
  [separate package](/guides/menus/) built on top of it.
- **No MTProto.** This is a Bot API framework.

## Who it is for

You will be at home if you already write Effect, or if you are willing to: the
framework does not hide Effect behind a facade, and the docs assume `Effect.gen`,
`Layer`, and `Schema` are familiar. If they are not, the
[Effect documentation](https://effect.website) is the prerequisite, not this site.

Coming from another framework:

| If you know… | The closest analogue here |
|---|---|
| grammY's `bot.command("start", handler)` | `Router.command(Command.make("/start"), handler)` |
| grammY's `ctx.reply` | `Chat.reply` — a free function reading ambient update state |
| grammY's `@grammyjs/menu` | [`@fibergram/menu`](/guides/menus/) |
| grammY's `@grammyjs/i18n` | [`@fibergram/i18n`](/guides/i18n/) |
| aiogram's FSM / `StatesGroup` | [`Coroutine`](/guides/conversations/) — the state machine is derived, not declared |
| aiogram's middleware | `Layer` for dependencies, [`Transform`](/guides/transforms/) for outbound calls |

## Project status

Every milestone through feature parity with grammY and aiogram is implemented.
What remains is release infrastructure and this documentation site. The
constraint that shapes everything: fibergram targets **Effect v4**, currently in
beta and [pinned to an exact version](/concepts/architecture/#the-volatile-perimeter).

Ready? [Install it](/getting-started/installation/).
