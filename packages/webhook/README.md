# @fibergram/webhook

Webhook ingestion for [fibergram](https://github.com/fibergram/fibergram) bots. Turns incoming Telegram webhook requests into the same `Stream<Update>` that long polling produces — the dispatcher never knows which transport delivered an update.

```bash
pnpm add @fibergram/webhook @fibergram/core effect
```

## Usage

### Effect-native / web-standard

`Webhook.make` builds a webhook that owns a bounded in-memory queue. It exposes two entrypoints: `handle` (web-standard `Request → Promise<Response>`, for serverless, Bun, workerd, Hono) and `httpApp` (for `@effect/platform` HTTP servers).

```ts
import { Webhook } from "@fibergram/webhook"
import { Dispatcher, Dialog, DialogStore, Dedup } from "@fibergram/core"
import { TelegramClient } from "@fibergram/core/client"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

const echo = Dialog.stateless({ onUpdate: () => Effect.void })

const program = Effect.gen(function* () {
  const webhook = yield* Webhook.make({ secretToken: "s3cret" })
  yield* Effect.forkScoped(
    Dispatcher.run({ updates: webhook.updates, dialog: echo })
  )
  // Serverless / Bun / workerd / Hono speak web `Request` already:
  //   export default { fetch: (request) => webhook.handle(request) }
}).pipe(
  Effect.scoped,
  Effect.provide([
    DialogStore.layerMemory,
    Dedup.layerMemory,
    TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
  ])
)
```

### Express

```ts
import { Express, Webhook } from "@fibergram/webhook"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const webhook = yield* Webhook.make({ secretToken: "s3cret" })
  const handler = Express.middleware(webhook)
  // app.post("/webhook", express.json(), handler)
  return handler
})
```

### Fastify

```ts
import { Fastify, Webhook } from "@fibergram/webhook"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const webhook = yield* Webhook.make({ secretToken: "s3cret" })
  const handler = Fastify.handler(webhook)
  // app.post("/webhook", handler)
  return handler
})
```

## API

| Export | Subpath | What it is |
|---|---|---|
| `Webhook.make(options?)` | `@fibergram/webhook` | `Effect<Webhook, never, Scope>` — queue + `updates` stream + `handle` + `httpApp` |
| `Webhook.secretTokenHeader` | `@fibergram/webhook` | The `"x-telegram-bot-api-secret-token"` header constant |
| `Express.middleware(webhook)` | `@fibergram/webhook/express` | Express 5 `RequestHandler` |
| `Fastify.handler(webhook)` | `@fibergram/webhook/fastify` | Fastify 5 `RouteHandlerMethod` |

`MakeOptions`:

- `secretToken?: string | Redacted<string>` — must match the token passed to Telegram's `setWebhook`. Validated with a constant-time comparison; mismatch → `401`.
- `capacity?: number` — bounded queue size, default `1024`. A full queue blocks before answering `200`, so Telegram retries instead of updates being dropped.
- `persist?: (update) => Effect<void, unknown>` — durable-ack hook: persist → offer → `200`; a failed persist answers `500` so Telegram re-delivers (dedup by `updateId` downstream).

## Tech facts

- **Transport-agnostic ingestion.** `webhook.updates` is `Stream.fromQueue` over the same bounded `Queue<Update>` shape polling uses — wire it into `Dispatcher.run({ updates, dialog })` exactly like `@fibergram/core/polling`, and swap transports without touching handler code.
- **Status semantics.** Bad/absent secret token → `401`; authenticated but malformed body → logged and `200` (dropped, avoids a retry storm); failed `persist` → `500` (re-delivery); accepted → `200`.
- **Adapters are types-only.** `express` (`^5`) and `fastify` (`^5`) are optional peer dependencies imported for types only — they add nothing to your runtime unless you already use them. Runtime deps are just `effect` and `@fibergram/core`.
- **Observability.** Ingestion is traced under the `fibergram.webhook` span (no-op when no tracer is provided).
- ESM-only; subpath exports: `.`, `./express`, `./fastify`.
