---

title: Dedup.ts
nav_order: 2
parent: Modules
---

## Dedup overview

`Dedup` - idempotency by `updateId` (design section 7, section 13.5). Long polling and
webhook both retry on failure, so exactly-once processing is achieved by
dropping updates whose `updateId` has already been seen. This ships the
in-memory backend; a durable event log slots behind the same port later.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [layers](#layers)
  - [layerMemory](#layermemory)
- [models](#models)
  - [DedupService (interface)](#dedupservice-interface)
- [services](#services)
  - [Dedup (class)](#dedup-class)

---

# layers

## layerMemory

An in-memory {@link Dedup} backed by a `Ref<HashSet<number>>`. The check-and-
mark is a single atomic `Ref.modify`, so concurrent dispatch cannot double-
admit the same update.

**Signature**

```ts
export declare const layerMemory: Layer.Layer<Dedup, never, never>
```

**Example**

```ts
import { Dedup } from "@fibergram/core"
import { Layer } from "effect"

const layer: Layer.Layer<Dedup.Dedup> = Dedup.layerMemory
```

Added in v0.1.0

# models

## DedupService (interface)

The dedup port. {@link DedupService.seen} atomically records an `updateId` and
reports whether it is _fresh_ (first time seen) - `true` means "process it".

**Signature**

```ts
export interface DedupService {
  readonly seen: (updateId: number) => Effect.Effect<boolean>
}
```

Added in v0.1.0

# services

## Dedup (class)

The `Dedup` service tag.

**Signature**

```ts
export declare class Dedup
```

**Example**

```ts
import { Dedup } from "@fibergram/core"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const dedup = yield* Dedup.Dedup
  const fresh = yield* dedup.seen(42) // true first time, false after
})
```

Added in v0.1.0
