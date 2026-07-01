---

title: DialogStore.ts
nav_order: 5
parent: Modules
---

## DialogStore overview

`DialogStore` - the persistence port for folded dialog state, keyed by
{@link module:DialogAddress.toKey}. This ships the in-memory backend; the
durable backend (event-sourced, passivating) lands behind the same port
later (design section 6, section 8).

State is stored as `unknown`: the {@link module:EntityManager.EntityManager}
owns the `Dialog` and therefore the concrete `State` type. A typed, schema-
migrated store is a later milestone.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [layers](#layers)
  - [layerMemory](#layermemory)
- [models](#models)
  - [DialogStoreService (interface)](#dialogstoreservice-interface)
- [services](#services)
  - [DialogStore (class)](#dialogstore-class)

---

# layers

## layerMemory

An in-memory {@link DialogStore} backed by a `Ref<HashMap>`. State is lost on
restart - good for tests and stateless/short dialogs, not for durable
sessions.

**Signature**

```ts
export declare const layerMemory: Layer.Layer<DialogStore, never, never>
```

**Example**

```ts
import { DialogStore } from "@fibergram/core"
import { Layer } from "effect"

const layer: Layer.Layer<DialogStore.DialogStore> = DialogStore.layerMemory
```

Added in v0.1.0

# models

## DialogStoreService (interface)

The persistence port: load and save the folded state for a dialog address key.

**Signature**

```ts
export interface DialogStoreService {
  readonly load: (key: string) => Effect.Effect<Option.Option<unknown>>
  readonly save: (key: string, state: unknown) => Effect.Effect<void>
}
```

Added in v0.1.0

# services

## DialogStore (class)

The `DialogStore` service tag.

**Signature**

```ts
export declare class DialogStore
```

**Example**

```ts
import { DialogStore } from "@fibergram/core"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const store = yield* DialogStore.DialogStore
  yield* store.save("default:1::", { count: 1 })
})
```

Added in v0.1.0
