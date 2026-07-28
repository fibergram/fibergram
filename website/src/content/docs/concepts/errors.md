---
title: Errors
description: The TelegramError tagged union, retry that honours retry_after, and what happens when a handler fails.
sidebar:
  order: 4
---

## A union, not a base class

Every call through `TelegramClient` fails with exactly one union:

```ts
type TelegramError =
  | RateLimited // { method, retryAfter: Duration }
  | BotBlocked // { method }
  | MessageNotModified // { method }
  | ChatMigrated // { method, newChatId }
  | Forbidden // { method, description }
  | BadRequest // { method, description, errorCode }
  | TransportError // { method, cause } — network or decode failure
```

Each member is a `Data.TaggedError`, so `catchTag` narrows precisely:

```ts
import { Chat } from "@fibergram/core"
import { Effect } from "effect"

const safeEdit = Chat.editLast("Updated").pipe(
  // Editing to identical text is normal, not exceptional.
  Effect.catchTag("MessageNotModified", () => Effect.void),
  Effect.catchTag("BotBlocked", () => markUserInactive)
)
```

`TelegramError.fromResponse(method, envelope)` is where Bot API responses become
union members: `429` with `retry_after` → `RateLimited`, `migrate_to_chat_id` →
`ChatMigrated`, `"message is not modified"` → `MessageNotModified`, `403` →
`BotBlocked` or `Forbidden`, everything else → `BadRequest`.

:::tip[Why a union and not a class hierarchy]
An error hierarchy makes you write `instanceof` chains the compiler cannot check
for exhaustiveness, and it invites a catch-all base class that swallows cases
nobody thought about. A union with tags means the compiler tells you when you
have not handled `ChatMigrated`.
:::

## Your errors are yours

The framework never wraps, swallows, or re-tags a domain error. If your
repository fails with `UserNotFound`, that is what appears in the handler's `E`,
alongside `TelegramError` if the handler also talks to Telegram:

```ts
const handler: Effect.Effect<void, UserNotFound | TelegramError, UserRepo | TelegramClient>
```

`E` accumulates as a union across routes exactly as `R` does, so the finished
bot's error channel is an honest list of everything that can go wrong.

## Retry with Telegram's semantics

Blind exponential backoff is the wrong answer to a `429` — Telegram tells you how
long to wait:

```ts
import { Retry } from "@fibergram/core"

const send = Retry.retryRateLimited(Chat.reply("hi"), { maxAttempts: 3 })
```

`retryRateLimited` reads `retryAfter` off the `RateLimited` error and sleeps for
exactly that long. Every other error fails immediately — a `BadRequest` will not
become a `BadRequest` three times. Each caught `RateLimited` increments the
`Telemetry.rateLimitHits` metric.

Because the sleep goes through Effect's `Clock`, `TestClock` drives it: rate-limit
handling is testable without waiting.

For a bot-wide policy applied to every outbound call, use a
[transform](/guides/transforms/) instead of wrapping call sites:

```ts
TelegramClient.transformed(Transform.throttle(), Transform.autoRetry())
```

`throttle` paces under Telegram's published flood limits (30/s global, 1/s per
chat, 20/min per group); `autoRetry` transparently retries `429`s honouring
`retry_after`.

## When a handler fails anyway

The `EntityManager` supervises the address boundary with `Effect.catchCause`.
This is deliberate:

- **One chat's crash does not take the bot down.** The failing update's fiber
  dies; every other address keeps draining its mailbox.
- **The whole `Cause` is preserved** — defects and interrupts included, not just
  the `Error`.
- The `onDefect: (address, Cause<E>) => Effect<void>` hook lets you report it;
  the default is `Effect.logError`.

```ts
Dispatcher.run({
  updates,
  dialog,
  onDefect: (address, cause) => reportToSentry(address, cause)
})
```

Because logs are auto-annotated with `chatId` and `updateId` at the dispatch
boundary (see [Observability](/guides/observability/)), the failure arrives with
the context needed to find it.

## Failure model of the ports

The persistence ports (`DialogStore`, `Dedup`, `CallbackStore`) declare `never`
in their error channel. Store and serialisation failures therefore become
**defects**, not typed errors. This is a decision, not an oversight: a handler
should not have to `catchTag` on "the database might be down" at every state
read. Defects surface through the same address-boundary supervisor — one bad
update drops one turn, and the hook reports it.
