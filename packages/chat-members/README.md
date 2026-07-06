# @fibergram/chat-members

Chat-membership cache for [fibergram](https://github.com/fibergram/fibergram) bots, fed by `chat_member` updates and stored behind a `KeyValueStore` port. The Effect-native analogue of grammY's `@grammyjs/chat-members`: keep track of who is in which chat without calling `getChatMember` on every check.

```bash
pnpm add @fibergram/chat-members @fibergram/core effect
```

## Usage

### Feed the cache from updates

`ChatMembers.route` folds every `chat_member` update into the store. Mounting it also gets `chat_member` into your `allowed_updates` — the subscription is derived, not hand-written:

```ts
import { ChatMembers } from "@fibergram/chat-members"
import { Router } from "@fibergram/core"

const router = Router.make(ChatMembers.route)
// ["chat_member"] — derived from the route's kinds
const allowed = Router.allowedUpdates(router)
```

### Query membership

```ts
import { ChatMembers } from "@fibergram/chat-members"
import { Effect, Option } from "effect"

const program = Effect.gen(function* () {
  const members = yield* ChatMembers.ChatMembers
  const cached = yield* members.get(-100, 42)
  return Option.isSome(cached)
}).pipe(Effect.provide(ChatMembers.layerMemory))
```

### Pick a storage backend

`ChatMembers.layer` uses whatever `KeyValueStore` is in context — memory, filesystem, or SQL is purely a Layer choice:

```ts
import { ChatMembers } from "@fibergram/chat-members"
import { Layer } from "effect"
import { KeyValueStore } from "effect/unstable/persistence"

const members: Layer.Layer<ChatMembers.ChatMembers> = ChatMembers.layer.pipe(
  Layer.provide(KeyValueStore.layerMemory)
)
```

## API

| Export | What it is |
|---|---|
| `ChatMembers.ChatMembers` | `Context.Service` tag for the cache service |
| `ChatMembers.route` | `Router.Route` that ingests `chat_member` updates into the store |
| `ChatMembers.layer` | `Layer<ChatMembers, never, KeyValueStore>` — bring your own store |
| `ChatMembers.layerMemory` | Self-contained in-memory layer (tests, prototypes) |
| `ChatMembers.make(kvs)` | Plain constructor over a `KeyValueStore` |

Service methods:

- `get(chatId, userId)` — pure cache lookup, `Effect<Option<BotApi.ChatMember>>`. Absence means "never seen"; `"left"`/`"kicked"` states are cached values, not absences.
- `set(chatId, userId, member)` — overwrite cached membership.
- `resolve(chatId, userId)` — cache-or-fetch: on a miss it calls `getChatMember` once, writes the answer back, and serves from cache thereafter. Needs `TelegramClient` in `R`, fails with `TelegramError`.

## Tech facts

- **`chat_member` is not in Telegram's default update set** — you must request it in `allowed_updates`. With `ChatMembers.route` mounted, `Router.allowedUpdates` includes it automatically.
- **Write-back semantics.** Route-cached memberships are preferred (zero API calls); `resolve` performs exactly one `getChatMember` per cold `(chatId, userId)` pair.
- **Storage.** Uses `effect/unstable/persistence`'s `KeyValueStore` — the same port `@fibergram/durable` uses for dialog snapshots. Keys are namespaced under `"fibergram:chatMembers:"` as `` `${chatId}:${userId}` ``; values are decoded camelCase `BotApi.ChatMember`, JSON-encoded.
- **Failure model.** Store and JSON (de)serialization failures become defects (`Effect.orDie`), mirroring the `DialogStore` port contract — the service's own error channel stays clean.
- ESM-only; depends only on `effect` and `@fibergram/core`.
