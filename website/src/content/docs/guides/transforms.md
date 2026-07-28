---
title: Transforms
description: Interceptors on outbound Bot API calls — defaults, flood-limit pacing, automatic retry, and your own.
sidebar:
  order: 13
---

Every Bot API method flows through a single `call` seam. A **transform** wraps
that seam, so bot-wide behaviour is configured once at the edge instead of at
every call site.

```ts
import { TelegramClient, Transform } from "@fibergram/core/client"
import { Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

const layer = TelegramClient.transformed(
  Transform.defaults({ parseMode: "HTML" }),
  Transform.throttle(),
  Transform.autoRetry(),
  Transform.logging,
  Transform.metrics
).pipe(Layer.provide(FetchHttpClient.layer))
```

Transforms compose left-to-right: the first listed is outermost.

## The built-ins

### `defaults(values)`

Injects bot-wide fields into every call — but only where the method's params
schema actually declares them, and only when the caller omitted them:

```ts
Transform.defaults({ parseMode: "HTML" })
```

`parseMode` reaches `sendMessage` and is silently skipped for `getMe`. An
explicit `parseMode` at a call site is never overridden.

:::tip
If you are reaching for `parseMode` at all, consider [`Fmt`](/guides/keyboards-and-formatting/#formatting-without-parse_mode)
instead — entity trees need no escaping and cannot be broken by user input.
:::

### `throttle(options?)`

Paces outbound calls under Telegram's published flood limits: 30 messages/second
globally, 1/second per chat, 20/minute per group. Override any of them with
`global`, `perChat`, `group`.

Pacing is driven by `Effect.sleep`, so `TestClock` controls it — you can test
that a broadcast respects the limits without waiting for real seconds to pass.

### `autoRetry(options?)`

Transparently retries `429`s honouring `retry_after`. Options: `maxAttempts`,
`maxDelay`.

This is the bot-wide counterpart of [`Retry.retryRateLimited`](/concepts/errors/#retry-with-telegrams-semantics),
which you apply to one effect. Use the transform for the general policy and the
combinator when one specific call needs different treatment.

### `logging`

Opens a `telegram.<method>` span per call and logs calls and failures, wiring
outbound traffic into the ambient `Tracer` and `Logger`. A no-op when neither is
provided.

### `metrics`

Records `fibergram_api_calls_total`, `fibergram_api_errors_total`, and the
`fibergram_api_call_duration` histogram. Read them with `Metric.value` against
the same names. See [Observability](/guides/observability/).

## Writing your own

`Transform.make` takes a function over the transport call:

```ts
import { Transform } from "@fibergram/core/client"
import { Effect } from "effect"

const trace = Transform.make(
  (next) => (method, paramsSchema, resultSchema, params) =>
    Effect.tap(next(method, paramsSchema, resultSchema, params), () => Effect.log(`called ${method}`))
)
```

The `method` and `params` types come straight from the generated schemas, so a
transform can inspect and rewrite typed params rather than an untyped bag.

Useful shapes to build this way:

- **Per-chat quotas** beyond what `throttle` models.
- **Redaction** of user content before it reaches your logger.
- **Recording** to a fixture file for replay in tests.
- **Feature flags** that turn a send into a no-op in staging.

`Transform.identity`, `Transform.compose`, and `Transform.applyAll` compose them.

## Why this and not middleware

An outbound interceptor is a genuinely cross-cutting concern, and this is the one
place fibergram accepts one. The difference from a general middleware chain is
that it is **scoped to a single seam** — a transform can only observe and alter
Bot API calls. It cannot inject services, mutate a context object, or change
which handler runs, so it cannot become the place where behaviour hides.

Its inbound counterpart is not a transform at all, but a
[router option](/concepts/routing/#inbound-rate-limiting) — `rateLimit` on
`toDialog`.

## Testing

[`TestTelegram`](/guides/testing/) is itself built on this seam, which is why it
captures *every* call with no per-method stubbing. A transform under test can be
composed over the double the same way it is composed over the real client.
