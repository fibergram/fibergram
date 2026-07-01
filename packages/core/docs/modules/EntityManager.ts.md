---

title: EntityManager.ts
nav_order: 7
parent: Modules
---

## EntityManager overview

`EntityManager` - the virtual-actor runtime (design section 4.1, section 8). It routes each
update to its dialog address, guarantees **one mailbox per address** (ordering
within an address), runs address mailboxes on independent fibers (concurrency
between addresses), and wraps each address in `catchCause` so **a crash in one
chat never takes down another**.

The in-memory manager keeps every address hot. Idle passivation + rehydrate
is a durable-backend concern.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [EntityManager (interface)](#entitymanager-interface)
  - [MakeOptions (interface)](#makeoptions-interface)

---

# constructors

## make

Builds an {@link EntityManager} for a single dialog. Requires the dialog's own
requirements `R` (captured once and provided to every address fiber), a
{@link DialogStore}, a {@link Dedup} and a `Scope` that owns the address fibers.

**Signature**

```ts
export declare const make: <State, Event, E, R>(
  options: MakeOptions<State, Event, E, R>
) => Effect.Effect<EntityManager, never, R | DialogStore | Dedup | Scope.Scope>
```

**Example**

```ts
import { EntityManager, Dialog, DialogStore, Dedup } from "@fibergram/core"
import { Effect } from "effect"

const echo = Dialog.stateless({ onUpdate: () => Effect.void })

const program = Effect.gen(function* () {
  const manager = yield* EntityManager.make({ dialog: echo })
  return manager
}).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory]))
```

Added in v0.1.0

# models

## EntityManager (interface)

The manager's public surface: hand it an update and it routes, dedups, orders
and supervises. `send` is intended to be driven sequentially by one dispatcher
(design section 7); ordering within an address depends on that.

**Signature**

```ts
export interface EntityManager {
  readonly send: (update: BotApi.Update) => Effect.Effect<void>
  /**
   * Completes once every accepted update has been fully processed. In
   * production the ingestion stream never ends, so this is mainly a test seam
   * for asserting on effects after feeding a finite batch (design section 5.6).
   */
  readonly awaitIdle: Effect.Effect<void>
}
```

Added in v0.1.0

## MakeOptions (interface)

Options for {@link make}.

**Signature**

```ts
export interface MakeOptions<State, Event, E, R> {
  readonly dialog: Dialog<State, Event, E, R>
  /** Address extractor; defaults to per-chat, namespaced by the dialog's `kind`. */
  readonly keyExtractor?: DialogAddress.KeyExtractor
  /** Per-address failure hook; defaults to logging the cause and carrying on. */
  readonly onDefect?: (address: DialogAddress.DialogAddress, cause: Cause.Cause<E>) => Effect.Effect<void>
}
```

Added in v0.1.0
