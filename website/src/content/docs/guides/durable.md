---
title: Durability
description: Persisted dialog state, restart-surviving timers, and a passivating dispatch loop.
sidebar:
  order: 11
---

```bash
pnpm add @fibergram/durable
```

Handler code does not change when a bot becomes durable — durability is a `Layer`
swap. The conceptual background is [Persistence regimes](/concepts/persistence/);
this page is the mechanics.

## Persist dialog state

```ts
import { DialogStore } from "@fibergram/core"
import { PersistedDialogStore } from "@fibergram/durable"
import { Layer } from "effect"
import { KeyValueStore } from "effect/unstable/persistence"

const durableStore: Layer.Layer<DialogStore.DialogStore> = PersistedDialogStore.layer.pipe(
  Layer.provide(KeyValueStore.layerMemory) // or layerFileSystem / layerSql
)
```

Snapshots are JSON-encoded under the `"fibergram:dialog:"` prefix. Provide this
in place of `DialogStore.layerMemory` and every dialog, [session](/guides/sessions/),
[menu](/guides/menus/), and [locale preference](/guides/i18n/) becomes durable at
once — they all ride the same port.

`PersistedDialogStore.layerMemory` is the self-contained variant: durable across
passivation, not across a real restart. It exists for tests.

## Restart-surviving timers

```ts
import { DialogAddress } from "@fibergram/core"
import { DurableTimer } from "@fibergram/durable"
import { Effect } from "effect"

const armNextTurn = (address: DialogAddress.DialogAddress) =>
  Effect.gen(function* () {
    const timer = yield* DurableTimer.DurableTimer
    yield* timer.schedule({ address, key: "next-turn", delay: "3 days" })
  })
```

`schedule` persists an **absolute deadline**, not a delay. On boot every pending
timer is reloaded and re-armed for its remaining time; overdue timers fire
immediately (clamped to zero). `cancel(address, key)` removes one, and scheduling
is idempotent by `(address, key)` — arming the same wake-up twice is a no-op, not
two wake-ups.

Wake-ups arrive through the `onFire` callback.

:::caution[At-least-once]
A crash between firing and removing the record re-fires the timer. Keep `onFire`
idempotent — it is the same discipline `d.run` needs in a
[coroutine](/guides/conversations/#the-replay-model).
:::

## Passivation

`PassivatingEntityManager.run` is the durable counterpart of `Dispatcher.run`:

```ts
import { Dedup } from "@fibergram/core"
import { PassivatingEntityManager, PersistedDialogStore } from "@fibergram/durable"
import { Effect } from "effect"

const program = PassivatingEntityManager.run({ updates, dialog }).pipe(
  Effect.scoped,
  Effect.provide([PersistedDialogStore.layerMemory, Dedup.layerMemory])
)
```

Idle dialogs are evicted from memory after `passivateAfter` (default 5 minutes)
and rehydrated from the store on their next update. Options: `passivateAfter`,
`keyExtractor`, `onDefect`. Test seams: `awaitIdle` and `activeCount`.

Eviction is **cooperative**: the address fiber measures its own idleness with a
timed `Queue.take` and removes itself when its queue is empty. A running handler
is never preempted. A per-address latch that eviction never clears serialises
evict-versus-send, so an update arriving mid-rehydration is not lost.

## Testing durable behaviour

Everything runs off Effect's `Clock`:

```ts
import { TestClock } from "effect/testing"

yield * TestClock.adjust("10 minutes") // forces eviction, fires timers
```

Assert `activeCount` before and after to prove a dialog was evicted, then send
another update and assert its state came back.

## Backends

`PersistedDialogStore` is written against `KeyValueStore` from
`effect/unstable/persistence`:

| Layer | For |
|---|---|
| `KeyValueStore.layerMemory` | tests |
| `KeyValueStore.layerFileSystem(dir)` | single-node bots |
| `KeyValueStore.layerSql` | anything with more than one node |

`@fibergram/durable` also ships `FileKeyValueStore` for a dependency-free
filesystem backend.

## Constraints

- **State must be JSON round-trippable.** True for coroutine snapshots; verify it
  for hand-written deciders.
- **No schema migrations yet.** State written by an older version of your dialog
  is read back as-is. Version the shape yourself if you plan to change it.
- **Store failures are defects.** The port's error channel is `never`, so a write
  failure surfaces through the address-boundary supervisor rather than as a typed
  error in every handler. One bad update drops one turn; the bot stays up.

:::note[This package carries the beta risk]
`@fibergram/durable` is the only package touching Effect v4's persistence
perimeter, and the `@effect/workflow` / cluster binding is an alternative backend
behind these same ports, kept deliberately off the critical path. That isolation
is what lets `@fibergram/core` stay stable — see
[the volatile perimeter](/concepts/architecture/#the-volatile-perimeter).
:::
