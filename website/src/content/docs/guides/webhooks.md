---
title: Webhooks
description: Web-standard webhook ingestion, framework adapters, and running many bots on one endpoint.
sidebar:
  order: 10
---

```bash
pnpm add @fibergram/webhook
```

A webhook is just another producer into the same `Queue<Update>` long polling
fills — see [Ingestion](/concepts/ingestion/). Nothing above the queue changes.

## Web-standard

```ts
import { Dedup, Dialog, DialogStore, Dispatcher } from "@fibergram/core"
import { TelegramClient } from "@fibergram/core/client"
import { Webhook } from "@fibergram/webhook"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

const program = Effect.gen(function* () {
  const webhook = yield* Webhook.make({ secretToken: "s3cret" })
  yield* Effect.forkScoped(Dispatcher.run({ updates: webhook.updates, dialog }))

  // Serverless, Bun, workerd, and Hono speak web `Request` already:
  //   export default { fetch: (request) => webhook.handle(request) }
  return webhook
}).pipe(
  Effect.scoped,
  Effect.provide([
    DialogStore.layerMemory,
    Dedup.layerMemory,
    TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
  ])
)
```

`webhook.handle` closes over the in-memory queue and runs on the default runtime —
no Effect machinery leaks out of it, which is what makes it droppable into any
imperative host.

## Effect-native

For `@effect/platform`-style servers, `httpApp` is a first-class route with
spans and `R` flowing through:

```ts
HttpRouter.add("POST", "/webhook", webhook.httpApp)
```

## Express and Fastify

```ts
import { Express, Webhook } from "@fibergram/webhook"

const handler = Express.middleware(webhook)
// app.post("/webhook", express.json(), handler)
```

```ts
import { Fastify, Webhook } from "@fibergram/webhook"

const handler = Fastify.handler(webhook)
// app.post("/webhook", handler)
```

Both adapters only rebuild a web `Request` from the framework's request object —
all validation and decoding happens behind `handle`. `express` and `fastify` are
optional peer dependencies imported **for types only**, so they add nothing to
your runtime unless you already use them.

## Options

| Option | Default | What it does |
|---|---|---|
| `secretToken` | — | Must match what you passed to `setWebhook`. Compared in constant time; a mismatch is `401`. |
| `capacity` | 1024 | Bounded queue. A full queue blocks *before* answering `200`, so Telegram retries rather than updates being dropped. |
| `persist` | — | Durable-ack hook: persist → offer → `200`. A failed persist answers `500`. |

## Status semantics

| Situation | Status | Why |
|---|---|---|
| Bad or absent secret token | `401` | Spoofed request. |
| Authenticated but malformed body | `200` | Logged and dropped — a `4xx` here would trigger a retry storm for an update that will never parse. |
| `persist` failed | `500` | Telegram re-delivers; dedup by `updateId` removes the duplicate. |
| Accepted | `200` | Offered to the queue. |

## Set the webhook

fibergram does not call `setWebhook` for you — it is a deployment step, not a
runtime one:

```ts
const tg = yield * TelegramClient.TelegramClient
yield *
  tg.setWebhook({
    url: "https://example.com/webhook",
    secretToken: "s3cret",
    allowedUpdates: Router.allowedUpdates(router)
  })
```

Use the same `allowedUpdates` you derived for the router — see
[Routing](/concepts/routing/#derived-from-the-routes-you-mounted).

:::caution[Polling and webhooks are exclusive]
Telegram refuses `getUpdates` while a webhook is set. Call `deleteWebhook`
before switching back to polling in development.
:::

## Many bots, one endpoint

`Multibot` is the analogue of grammY's `TokenBasedRequestHandler`. Each bot keeps
its own `Webhook` (queue and dispatcher); requests are routed by a key in the
path, so point each bot's `setWebhook` at `https://host/webhook/<token>`:

```ts
import { Multibot, Webhook } from "@fibergram/webhook"

const program = Effect.gen(function* () {
  const alice = yield* Webhook.make({ secretToken: "alice-secret" })
  const bob = yield* Webhook.make({ secretToken: "bob-secret" })
  yield* Effect.forkScoped(Dispatcher.run({ updates: alice.updates, dialog: aliceBot }))
  yield* Effect.forkScoped(Dispatcher.run({ updates: bob.updates, dialog: bobBot }))

  return Multibot.fromMap(
    new Map([
      ["alice-token", alice],
      ["bob-token", bob]
    ])
  )
})
```

An unknown key answers `404`; otherwise the resolved bot's own status flows
through. Use `Multibot.make({ resolve })` with a
`(key) => Effect<Option<Webhook>>` resolver when bots come and go at runtime;
`fromMap` is the fixed-registry shortcut. Both expose the same `handle` / `httpApp`
pair as a single `Webhook`, and `Multibot` owns nothing — the `Webhook`s live in
the caller's scope.

The default key extractor is the last path segment, and it works with both an
absolute web `Request.url` and a bare-path `HttpServerRequest.url`.

## Observability

Ingestion is traced under a `fibergram.webhook` span carrying the HTTP status —
a no-op when no tracer is provided. See [Observability](/guides/observability/).
