---
title: Ingestion
description: Why long polling and webhooks are interchangeable, and what delivery guarantees each one gives.
sidebar:
  order: 6
---

## One contract

Both transports do the same thing: **produce into a bounded `Queue<Update>` and
expose `Stream.fromQueue` over it.** The dispatcher drains that stream and has no
idea which transport filled it.

```ts
// long polling
const updates = yield * Polling.make()

// webhook
const webhook = yield * Webhook.make({ secretToken: "s3cret" })
const updates = webhook.updates

// either one:
yield * Dispatcher.run({ updates, dialog })
```

Commit semantics — the part that *is* transport-specific — stay inside the
transport: an offset for polling, an HTTP status for webhooks. Nothing above the
queue changes.

This is why swapping transports is a one-line change, and why tests can feed
`Updates.stream([...])` into the same dispatcher.

## Long polling

```ts
Polling.make(options?): Effect<Stream<Update>, never, TelegramClient | Scope>
```

It creates the queue, forks the poll loop into the ambient `Scope`, and returns
the stream immediately. The loop calls `getUpdates(offset)`, offers the batch,
then commits `max(updateId) + 1`.

| Option | Default | Notes |
|---|---|---|
| `timeout` | 30 | Long-poll timeout in seconds. |
| `limit` | 100 | Max updates per batch. |
| `allowedUpdates` | — | Pass `Router.allowedUpdates(router)`. |
| `errorBackoff` | 1s | Pause after a non-rate-limit failure. |
| `capacity` | 1024 | Bounded queue; a full queue back-pressures polling. |
| `offsetStore` | — | Persist the offset across restarts. |

**The loop never dies.** A `RateLimited` sleeps for `retryAfter` while holding
the offset; any other failure logs a warning and retries after `errorBackoff`.
There is no state in which the bot silently stops receiving updates.

### Durable offsets

```ts
interface OffsetStore {
  readonly load: Effect<Option<number>> // seeds the offset at startup
  readonly commit: (offset: number) => Effect<void> // after enqueueing a batch
}
```

Without a store, the offset is an in-memory `Ref` — a restart re-reads whatever
Telegram still has queued, which dedup absorbs. With one, the bot resumes exactly
where it left off. A failed commit is logged and does not kill the loop, because
dedup absorbs the overlap either way.

## Webhooks

```ts
const webhook = yield * Webhook.make({ secretToken: "s3cret" })
```

`Webhook` exposes three things:

- `updates` — the same `Stream<Update>` contract,
- `handle(request): Promise<Response>` — web-standard, for serverless, Bun,
  workerd, and Hono,
- `httpApp` — an Effect-native route for `@effect/platform`-style servers.

Both entrypoints run the same transport-neutral decision:

1. **Constant-time compare** of `X-Telegram-Bot-Api-Secret-Token`. Mismatch or
   absence → `401`.
2. **Decode** the body with `Schema`. A malformed body from an *authenticated*
   caller logs a warning and answers `200` — deliberately, so a bad update does
   not trigger a Telegram retry storm.
3. **Offer** to the queue → `200`.

Everything happens inside a `fibergram.webhook` span.

### Fast-ack versus durable-ack

Telegram retries a webhook it did not get a `2xx` for, so heavy work in the HTTP
handler is not an option — offer and acknowledge:

| Mode | Behaviour | Risk |
|---|---|---|
| **fast-ack** (default) | offer → `200` | A crash between `200` and processing loses the update. |
| **durable-ack** (`persist`) | `persist(update)` → offer → `200`; failed persist → `500` | Telegram re-delivers; dedup by `updateId` removes the duplicate. |

```ts
Webhook.make({
  secretToken: "s3cret",
  persist: (update) => appendToLog(update)
})
```

This is a `Layer`-level choice, not a change to any handler.

Practical details, framework adapters, and running many bots on one endpoint:
[Webhooks](/guides/webhooks/).

## Delivery guarantees

Effectively exactly-once processing comes from two independent mechanisms:

1. **A durable offset** (polling) or **Telegram's re-delivery** (webhook) means
   no update is lost.
2. **`Dedup.seen(updateId)`** — a single atomic `Ref.modify` over a `HashSet` —
   means no update is processed twice.

Neither alone is enough; together they are what makes at-least-once delivery
behave as exactly-once.

:::caution[`Dedup.layerMemory` forgets on restart]
The in-memory dedup set does not survive a process restart, so an overlapping
redelivery right after a redeploy can be processed twice. Back it with a durable
store if double-processing is unacceptable for your bot.
:::

## Ordering

The dispatcher drains the input stream **sequentially** — that is where receive
ordering comes from. It then hands each update to the `EntityManager`, which
guarantees ordering *within* an address (one mailbox, one fiber) while running
different addresses concurrently. See
[Architecture](/concepts/architecture/#the-runtime-top-to-bottom).
