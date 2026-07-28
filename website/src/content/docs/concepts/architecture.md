---
title: Architecture
description: How fibergram is layered, why the package split is drawn where it is, and where the Effect v4 beta risk is quarantined.
sidebar:
  order: 1
---

## The design principle

fibergram does not build a parallel universe on top of Effect. Where Effect
already has an answer, that answer is the API:

| Concern | Effect's answer | What fibergram does |
|---|---|---|
| Dependencies | `Layer` + `Context.Service` | Ports (`DialogStore`, `Dedup`, `TelegramClient`) are services; you provide layers. |
| Errors | typed `E` channel | `TelegramError` is a tagged union in `E`; your errors pass through untouched. |
| Concurrency | fibers + `Scope` | One long-lived fiber per dialog address, forked into the ambient scope. |
| Streaming | `Stream` | Ingestion produces `Stream<Update>`; the dispatcher drains it. |
| Validation | `Schema` | Every I/O edge — updates, command args, callback payloads, persisted state. |
| Time | `Clock` | Every delay and timeout, so `TestClock` drives them in tests. |

There is no middleware chain, no plugin registry, no context object. Composition
is Effect composition.

## The runtime, top to bottom

```
 transport                dispatch                       your code
┌──────────────┐   ┌──────────────────────────┐   ┌────────────────────┐
│ Polling      │   │ Dedup (updateId)         │   │ Dialog / Coroutine │
│   or         │──▶│ KeyExtractor → address   │──▶│ Router routes      │
│ Webhook      │   │ EntityManager mailboxes  │   │ Chat.* accessors   │
└──────────────┘   └──────────────────────────┘   └────────────────────┘
   Queue<Update>       one fiber per address           Effect<A, E, R>
```

1. A transport produces into a bounded `Queue<Update>` and exposes
   `Stream.fromQueue` over it. Polling and webhook are interchangeable here —
   see [Ingestion](/concepts/ingestion/).
2. `Dispatcher.run` drains that stream **sequentially** — this is where receive
   ordering comes from.
3. Each update is deduplicated by `updateId`, then mapped to a
   [`DialogAddress`](/concepts/dialogs/#the-address) by a pluggable key extractor.
4. The `EntityManager` keeps a `HashMap<key, Queue<Update>>` and **one
   long-lived fiber per address**, draining its own FIFO queue. Ordering is
   guaranteed within an address; different addresses run concurrently.
5. Before running your handler, the dispatcher stamps the ambient
   [update context](/concepts/no-ctx/) and the telemetry span, then runs the
   dialog's `decide`.

The full concurrency contract is: **one mailbox per address, one fiber per
mailbox, atomic dedup, and a per-address latch that survives passivation** so an
evict-versus-send race cannot lose an update.

## Package layout

The split is drawn by **real beta risk and release cadence**, not by concept.
Low-risk perimeter code lives *inside* `@fibergram/core` as subpath modules,
mirroring how `effect` itself ships one package with many modules:

| Package / subpath | Responsibility | v4 risk |
|---|---|---|
| `@fibergram/core` | `Dialog`, decider, `Decision`, `EntityManager`, key extractor, `Router`, `Chat`, typed errors, `CallbackData`, `Session` | low |
| `@fibergram/core/client` | `TelegramClient` (Tag + Layer over `HttpClient`), Bot API schemas, `InputFile`, `Transform` | low |
| `@fibergram/core/polling` | long polling + offset management | low |
| `@fibergram/core/testing` | `TestTelegram`, synthetic updates | low |
| `@fibergram/core/ui` | keyboards, `Fmt` entity formatting, typed `Emoji`, `Reaction` | low |
| `@fibergram/webhook` | HTTP ingestion + secret-token validation, Express/Fastify adapters | medium |
| `@fibergram/durable` | persisted dialogs, durable timers, passivation | **high** |
| `@fibergram/menu` | stateful inline menus over `CallbackData` + `DialogStore` | low |
| `@fibergram/i18n` | Fluent translator with an ambient locale | low |
| `@fibergram/chat-members` | membership cache over a `KeyValueStore` | medium |

Dependency direction is strictly one-way: everything builds on
`@fibergram/core`, and `core` depends on nothing but `effect`.

:::note[Why isn't `client` its own package?]
It was, originally. "One package per concept" cost six sets of tsconfig, eslint,
docgen, and changeset scaffolding and bought nothing: `client`, `polling`,
`testing`, and `ui` are low-risk code that releases in lockstep with the core.
Isolation was kept exactly where it earns its keep — around `durable`.
:::

## The volatile perimeter

Effect v4 is in beta. The **model** — `Effect`, `Layer`, `Schema`, `Stream` — is
stable and essentially unchanged from v3. What moves week to week is the
perimeter: `@effect/platform` dissolved into `effect/unstable/http`, `FiberRef`
was removed in favour of `Context.Reference`, and the persistence, workflow, and
cluster modules are still being shaped.

fibergram's response is structural:

- **`effect` is pinned to an exact beta version.** No caret. Upgrades are
  deliberate, one changelog at a time.
- **`core` never imports `effect/unstable/persistence`.** It defines its own
  ports (`DialogStore`, `Dedup`, `CallbackStore`) with in-memory implementations.
- **`@fibergram/durable` absorbs the churn.** It implements those same ports over
  `KeyValueStore` and carries the highest beta risk in the monorepo by design, so
  `core` stays publishable and useful while it moves.
- **`@fibergram/chat-members` is a separate package** for exactly this reason: it
  needs the persistence perimeter that `core` refuses to touch.

If Effect's cluster story lands somewhere unexpected, one package changes.

## What this buys you

The recurring payoff is that **behavioural decisions become wiring decisions**:

```ts
Effect.provide([
  DialogStore.layerMemory, //  ← in-memory, or PersistedDialogStore.layer
  Dedup.layerMemory,
  TelegramClient.layer //      ← real client, or tg.layer from TestTelegram
])
```

Persistence regime, transport, retry policy, flood-limit pacing, and the entire
test double are all chosen here. No handler above this line changes when any of
them does.
