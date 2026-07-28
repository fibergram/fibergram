---
title: Observability
description: Logs, traces, and metrics that are on by default — and how to export them.
sidebar:
  order: 14
---

There is nothing to enable. A bot built with `Dispatcher.run` is instrumented out
of the box, and all three mechanisms are ambient in Effect — they add **nothing**
to a handler's `R`.

## Annotated logs

Every update's handling runs inside `Effect.annotateLogs({ chatId, updateId })`,
so any `Effect.log` a handler emits already carries the update it ran for:

```ts
const handler = Effect.gen(function* () {
  yield* Effect.log("processing booking") // arrives with chatId + updateId attached
})
```

That includes failures reported by the address-boundary supervisor, which is what
makes a production error report actionable — see
[Errors](/concepts/errors/#when-a-handler-fails-anyway).

## Traces

| Span | Covers |
|---|---|
| `fibergram.update` | load → decide → effects → save, with `telegram.chatId`, `telegram.updateId`, and `fibergram.dialog.kind` |
| `fibergram.webhook` | webhook ingestion, with the HTTP status |
| `telegram.<method>` | one outbound Bot API call (with [`Transform.logging`](/guides/transforms/#logging)) |

Because polling and webhooks feed the same dispatcher, `fibergram.update` covers
either transport with no extra wiring.

Spans flow to whatever `Tracer` layer is provided at the edge. With none, they
are no-ops — the instrumentation costs nothing until you export it:

```ts
Effect.provide([
  otelTracerLayer, // any OpenTelemetry Tracer layer
  DialogStore.layerMemory,
  Dedup.layerMemory,
  TelegramClient.layer
])
```

## Metrics

| Metric | Kind | What it counts |
|---|---|---|
| `Telemetry.updatesTotal` | counter | updates handled |
| `Telemetry.dialogDuration` | timer | how long each took |
| `Telemetry.rateLimitHits` | counter | `429`s caught by `Retry` |
| `fibergram_api_calls_total` | counter | outbound calls (with `Transform.metrics`) |
| `fibergram_api_errors_total` | counter | outbound failures |
| `fibergram_api_call_duration` | histogram | outbound latency |

They are plain `Metric` values, so you can read one live:

```ts
const total = yield * Metric.value(Telemetry.updatesTotal)
```

…or export the whole registry with `Metric.snapshot`.

`dialogDuration` is measured from `Clock.currentTimeMillis` through
`Effect.onExit`, which means it is **virtual under `TestClock`** — latency
assertions in tests are deterministic.

## Instrumenting your own steps

These are defaults, not a ceiling. Layer your own spans and metrics on top
normally:

```ts
const handler = Effect.gen(function* () {
  const booking = yield* createBooking.pipe(Effect.withSpan("app.createBooking"))
  yield* Chat.reply(`Booked #${booking.id}`)
})
```

Your span nests inside `fibergram.update`, so a trace shows the update boundary,
your work, and the outbound sends in one tree.

## What to watch in production

- **`rateLimitHits` climbing** means you are hitting flood limits. Add
  [`Transform.throttle()`](/guides/transforms/#throttleoptions) rather than
  raising retry counts.
- **`dialogDuration` p99 growing** on a durable backend usually means store
  latency, not handler work — the store read and write are inside the span.
- **`fibergram_api_errors_total` by itself is not alarming**: `BotBlocked` is a
  normal outcome for a broadcast. Split the alert by error tag.
- **Polling silently idle** is the one thing metrics will not tell you, because
  the poll loop never dies. Alert on `updatesTotal` *stopping*, not on errors.
