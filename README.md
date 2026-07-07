# fibergram

Effect-native framework for Telegram bots. A handler is an `Effect<A, E, R>`: typed errors, DI via `Layer`, updates as a `Stream`, multi-step dialogs as suspendable coroutines.

```ts
import { Polling } from "@fibergram/core/polling"
import { Dispatcher, Dialog, DialogStore, Dedup, Chat } from "@fibergram/core"
import { TelegramClient } from "@fibergram/core/client"
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
    TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer)) // token from BOT_TOKEN
  ])
)
```

## Packages

| Package | What it is |
|---|---|
| [`@fibergram/core`](./packages/core) | routing, dialogs, sessions, client, polling, testing, UI helpers |
| [`@fibergram/webhook`](./packages/webhook) | webhook ingestion (web-standard `Request`, Express/Fastify adapters) |
| [`@fibergram/menu`](./packages/menu) | stateful inline menus: submenu/back/pagination, state in `DialogStore` |
| [`@fibergram/durable`](./packages/durable) | persisted dialogs, durable timers, passivation |
| [`@fibergram/chat-members`](./packages/chat-members) | chat-membership cache fed by `chat_member` updates |

Each package README has usage examples — start with [`@fibergram/core`](./packages/core).

## Development

```bash
pnpm install
pnpm build
pnpm test
```
