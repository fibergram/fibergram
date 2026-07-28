---
title: Persistence regimes
description: Choosing how much your dialogs remember — by swapping a Layer, not by rewriting handlers.
sidebar:
  order: 7
---

A dialog's memory is a **wiring decision**. The same handler code runs in all
three regimes below; what changes is the array you pass to `Effect.provide`.

## The three regimes

### Ephemeral

```ts
Effect.provide([DialogStore.layerMemory, Dedup.layerMemory])
```

State lives in a `Ref` for as long as the process does. Dialogs stay hot in
memory forever — nothing is evicted, nothing is written down. Correct for
stateless command bots and for tests.

### Hot but persisted

```ts
import { PersistedDialogStore } from "@fibergram/durable"
import { KeyValueStore } from "effect/unstable/persistence"

Effect.provide([
  PersistedDialogStore.layer.pipe(Layer.provide(KeyValueStore.layerFileSystem("./.data"))),
  Dedup.layerMemory
])
```

Every state transition is snapshotted, JSON-encoded, under the
`"fibergram:dialog:"` prefix. A half-finished wizard survives a redeploy. Dialogs
are still held in memory between updates, so a bot with a million chats holds a
million entries.

### Passivated

```ts
import { PassivatingEntityManager, PersistedDialogStore } from "@fibergram/durable"

PassivatingEntityManager.run({ updates, dialog }).pipe(
  Effect.scoped,
  Effect.provide([PersistedDialogStore.layer, Dedup.layerMemory])
)
```

`PassivatingEntityManager.run` replaces `Dispatcher.run`. Idle dialogs are
evicted from memory after `passivateAfter` (default 5 minutes) and transparently
rehydrated from the store on their next update. This is the regime for
long-running conversations at scale — a days-long RPG turn loop costs nothing
between turns.

## What each one guarantees

| | Ephemeral | Persisted | Passivated |
|---|---|---|---|
| Survives a handler failure | ✅ | ✅ | ✅ |
| Survives a restart | ❌ | ✅ | ✅ |
| Bounded memory with many dialogs | ❌ | ❌ | ✅ |
| Ordering within a chat | ✅ | ✅ | ✅ |
| Extra latency on a cold update | — | — | one store read |

## How passivation stays correct

Eviction and delivery race by nature. Two mechanisms remove the race:

- **Cooperative eviction.** The address fiber measures its own idleness with
  `Effect.timeoutOption(Queue.take, passivateAfter)` and removes *itself* from
  the hot set when its queue is empty. A running handler is never preempted.
- **A per-address latch that eviction never clears.** `send` and self-eviction
  take the same `Semaphore` before touching the mailbox entry, so the two
  serialise and an update arriving mid-rehydration is not lost.

Eviction frees the fiber, not the state — the state was already in the store.

## Durable timers

`Effect.sleep` is the wrong tool for "remind them in three days": the fiber dies
with the process. `DurableTimer` persists an absolute deadline instead:

```ts
import { DurableTimer } from "@fibergram/durable"

const armNextTurn = (address: DialogAddress.DialogAddress) =>
  Effect.gen(function* () {
    const timer = yield* DurableTimer.DurableTimer
    yield* timer.schedule({ address, key: "next-turn", delay: "3 days" })
  })
```

On boot every pending timer is reloaded and re-armed for its *remaining* delay;
overdue timers fire immediately. Scheduling is idempotent by `(address, key)`.

:::caution[Firing is at-least-once]
A crash between firing and removing the record re-fires the timer. Keep `onFire`
idempotent.
:::

## Constraints worth knowing before you commit

- **State must be JSON round-trippable.** True for coroutine snapshots; check it
  for hand-written deciders. A `Date`, a `Map`, or a class instance will not
  survive the round trip untouched.
- **No schema migrations yet.** A store written by an older version of your
  dialog's state type is read back as-is. Version your state shape yourself if
  you plan to change it.
- **Store failures are defects.** The `DialogStore` port's error channel is
  `never`, so a write failure surfaces through the address-boundary supervisor
  rather than as a typed error your handler must catch. See
  [Errors](/concepts/errors/#failure-model-of-the-ports).
- **Coroutines replay.** In a durable regime the generator re-runs from the top
  on every update. That is what makes it resumable, and it is why non-deterministic
  values must come in through `d.run`. See [Conversations](/guides/conversations/).

## Backends

`PersistedDialogStore` is written against `KeyValueStore` from
`effect/unstable/persistence`, so the storage choice is a further layer down:

```ts
KeyValueStore.layerMemory //          tests
KeyValueStore.layerFileSystem(dir) // single-node bots
KeyValueStore.layerSql //             anything real
```

The same `KeyValueStore` also backs [`@fibergram/chat-members`](/guides/chat-members/)
and, in the [restaurant-booking example](https://github.com/fibergram/fibergram/tree/main/examples/restaurant-booking),
the application's own repositories — one storage decision for the whole bot.

:::note[This is the high-risk package]
`@fibergram/durable` is deliberately the only package touching Effect v4's
persistence perimeter, which is still moving. That is the trade that keeps
`@fibergram/core` stable — see [the volatile perimeter](/concepts/architecture/#the-volatile-perimeter).
:::
