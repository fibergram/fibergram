# @fibergram/durable

Durable backend for long-lived [fibergram](https://github.com/fibergram/fibergram) dialogs: persisted dialog state, restart-surviving timers, and a passivating dispatch loop. Handler code does not change — durability is a Layer swap, not a rewrite.

This package deliberately isolates the volatile Effect v4-beta persistence perimeter behind fibergram's own ports, so `@fibergram/core` stays free of `effect/unstable/*` churn.

```bash
pnpm add @fibergram/durable @fibergram/core effect
```

## Usage

### Persist dialog state

Swap the in-memory `DialogStore` for a persisted one — everything else stays the same:

```ts
import { DialogStore } from "@fibergram/core"
import { PersistedDialogStore } from "@fibergram/durable"
import { Layer } from "effect"
import { KeyValueStore } from "effect/unstable/persistence"

const durableStore: Layer.Layer<DialogStore.DialogStore> = PersistedDialogStore.layer.pipe(
  Layer.provide(KeyValueStore.layerMemory) // or layerFileSystem / layerSql
)
```

### Restart-surviving timers

`DurableTimer` persists an absolute deadline, so a wake-up scheduled for "3 days from now" survives process restarts — on boot every pending timer is reloaded and re-armed for its remaining delay:

```ts
import { DurableTimer } from "@fibergram/durable"
import { DialogAddress } from "@fibergram/core"
import { Effect } from "effect"

const armNextTurn = (address: DialogAddress.DialogAddress) =>
  Effect.gen(function* () {
    const timer = yield* DurableTimer.DurableTimer
    yield* timer.schedule({ address, key: "next-turn", delay: "3 days" })
  })
```

### Passivating dispatch loop

`PassivatingEntityManager.run` is the durable counterpart of core's `Dispatcher.run`: idle dialogs are evicted from memory after a timeout and transparently rehydrated from the store on their next update:

```ts
import { PassivatingEntityManager, PersistedDialogStore } from "@fibergram/durable"
import { Dialog, Dedup } from "@fibergram/core"
import { Effect, Stream } from "effect"

const echo = Dialog.stateless({ onUpdate: () => Effect.void })

const program = PassivatingEntityManager.run({
  updates: Stream.empty, // your polling/webhook stream
  dialog: echo
}).pipe(Effect.scoped, Effect.provide([PersistedDialogStore.layerMemory, Dedup.layerMemory]))
```

## API

| Module | Exports | What it does |
|---|---|---|
| `PersistedDialogStore` | `layer`, `layerMemory`, `make` | `DialogStore` backend over `KeyValueStore`; snapshots JSON-encoded under `"fibergram:dialog:"` |
| `DurableTimer` | `DurableTimer` tag, `layer`, `make` | `schedule({ address, key, delay })` / `cancel(address, key)`, idempotent by `(address, key)`; `onFire` callback on wake-up |
| `PassivatingEntityManager` | `run`, `make` | Virtual-actor runtime: `send`, `awaitIdle` (test seam), `activeCount`; options `passivateAfter` (default 5 min), `keyExtractor`, `onDefect` |

## Tech facts

- **Layer choice = persistence regime.** A stateless command, a wizard, and a days-long dialog are the same `Dialog` primitive; whether state survives passivation, restarts, or neither is decided entirely by which store Layer you provide.
- **Timers store `dueAt`, not delay.** Overdue timers fire immediately on restart (clamped to zero). Firing is at-least-once — a crash between fire and record removal re-fires, so keep `onFire` idempotent.
- **Test-friendly time.** Timers run off the Effect `Clock`, so they are deterministic under `TestClock`; advance it past `passivateAfter` to force eviction in tests.
- **Cooperative passivation.** Idle eviction is self-triggered (timed queue take) — a running handler is never preemptively interrupted. `layerMemory` survives the passivation cycle but not a real restart; it exists for tests.
- **Failure model.** Store/serialization failures become defects (the core port's error channel is `never`); the entity manager catches the full `Cause` at the address boundary, so one bad update drops one turn without taking the bot down.
- **State must be JSON round-trippable** (true for coroutine snapshots). A schema-migrated store is a later milestone.
- **Beta-risk boundary.** Built on `effect/unstable/persistence`'s `KeyValueStore` (`layerMemory` / `layerFileSystem` / `layerSql`). The `@effect/workflow` / cluster binding is an alternative backend behind the same ports and is kept off the critical path — this package carries the highest Effect v4 beta risk in the monorepo by design, so `core` doesn't have to.
- ESM-only; depends only on `effect` and `@fibergram/core`.
