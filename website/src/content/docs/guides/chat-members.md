---
title: Chat members
description: A membership cache fed by chat_member updates, so you stop calling getChatMember on every check.
sidebar:
  order: 12
---

```bash
pnpm add @fibergram/chat-members
```

The Effect-native analogue of grammY's `@grammyjs/chat-members`: track who is in
which chat without a `getChatMember` call per check.

## Feed the cache

```ts
import { ChatMembers } from "@fibergram/chat-members"
import { Router } from "@fibergram/core"

const router = Router.make(ChatMembers.route)
const allowed = Router.allowedUpdates(router) // → ["chat_member"]
```

`ChatMembers.route` folds every `chat_member` update into the store.

:::caution[`chat_member` is not in Telegram's default update set]
A bot that does not request it receives **no** membership updates and the cache
stays empty forever, silently. Mounting the route puts it in the derived
`allowedUpdates` list — pass that to `Polling.make` or `setWebhook` and the
problem disappears. See [Routing](/concepts/routing/#derived-from-the-routes-you-mounted).
:::

## Query it

```ts
import { ChatMembers } from "@fibergram/chat-members"
import { Effect, Option } from "effect"

const program = Effect.gen(function* () {
  const members = yield* ChatMembers.ChatMembers
  const cached = yield* members.get(-100, 42)
  return Option.isSome(cached)
}).pipe(Effect.provide(ChatMembers.layerMemory))
```

| Method | Behaviour |
|---|---|
| `get(chatId, userId)` | Pure cache lookup → `Effect<Option<ChatMember>>`. `None` means "never seen". |
| `set(chatId, userId, member)` | Overwrite cached membership. |
| `resolve(chatId, userId)` | Cache-or-fetch: on a miss, one `getChatMember`, written back, served from cache thereafter. Needs `TelegramClient`; fails with `TelegramError`. |

Note the distinction `get` makes: `"left"` and `"kicked"` are **cached values**,
not absences. `None` means the cache has never seen this pair — which is why
`resolve` exists.

## Pick a backend

```ts
import { ChatMembers } from "@fibergram/chat-members"
import { Layer } from "effect"
import { KeyValueStore } from "effect/unstable/persistence"

const members: Layer.Layer<ChatMembers.ChatMembers> = ChatMembers.layer.pipe(
  Layer.provide(KeyValueStore.layerMemory)
)
```

`ChatMembers.layer` uses whatever `KeyValueStore` is in context — the same port
[`@fibergram/durable`](/guides/durable/) uses for dialog snapshots, so one storage
decision covers both. `ChatMembers.layerMemory` is the self-contained variant for
tests and prototypes.

Keys are namespaced under `"fibergram:chatMembers:"` as `` `${chatId}:${userId}` ``;
values are camelCase `BotApi.ChatMember`, JSON-encoded.

## Failure model

Store and serialisation failures become defects (`Effect.orDie`), mirroring the
`DialogStore` port contract — the service's own error channel stays clean. Only
`resolve` has a typed error, and it is `TelegramError` from the one API call it
may make.
