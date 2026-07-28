---
title: Sessions
description: Per-chat or per-user key-value state, for bots that want "just ctx.session".
sidebar:
  order: 6
---

Sometimes you do not need a dialog — you need a counter, a language preference,
or a "has this user seen the tutorial" flag. `Session` is a typed slot over the
same `DialogStore` port:

```ts
import { Session } from "@fibergram/core"

const counter = Session.make("counter", { initial: 0 })
```

## Inside a handler

`get` / `set` / `update` resolve the address from the ambient update context, so
they need nothing but the `DialogStore` already in the dispatch environment:

```ts
import { Effect } from "effect"

const handler = Effect.gen(function* () {
  const count = yield* counter.update((n) => n + 1)
  yield* Chat.reply(`Seen ${count} messages`)
})
```

## Outside a handler

Broadcasts and admin jobs address explicitly:

```ts
const seen = yield * counter.getAt({ chatId: 555 })
yield * counter.setAt({ chatId: 555 }, 0)
```

Every ambient method has an `At` variant. This is the same split as
[`Chat` versus `TelegramClient`](/concepts/no-ctx/#outside-a-handler).

## Scope

```ts
const language = Session.make("language", { initial: "en", scope: "user" })
```

`scope: "chat"` (the default) keys by chat; `scope: "user"` adds the sender, so
each member of a group has their own value.

## Namespacing

Session keys carry a `session:<name>` kind, so two sessions with different names —
or a session and a dialog living at the same address — never see each other's
state. You do not need to prefix your keys.

## Durability comes from the layer

Sessions are stored through `DialogStore`, so the persistence question is answered
once for the whole bot:

```ts
DialogStore.layerMemory //         gone on restart
PersistedDialogStore.layer //      durable, for free
```

See [Persistence regimes](/concepts/persistence/).

## `update` is load-then-save

Not an atomic read-modify-write. In practice this is fine, because updates for
one address are already serialised by the `EntityManager` mailbox — a session
whose scope matches the key extractor never loses a write.

The case to watch: a **wider** scope than the extractor. A per-chat session under
a per-user extractor is last-writer-wins across concurrent handlers, because two
members of the same group are two different addresses running concurrently.

:::tip[Session or dialog?]
Use a `Session` for state that is *read and written* by otherwise-independent
handlers — preferences, counters, flags. Use a [`Dialog`](/concepts/dialogs/) or
a [coroutine](/guides/conversations/) when the state *is* the conversation, i.e.
when "what happens next" depends on it.
:::
