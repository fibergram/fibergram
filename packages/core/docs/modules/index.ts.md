---

title: index.ts
nav_order: 8
parent: Modules
---

## index overview

`@fibergram/core` - the invariant model: dialog addressing, the decider
primitive, the in-memory `EntityManager`, dedup, retry honouring `retry_after`
and the dispatch loop (design section 4, section 5, section 8). This package stays publishable and
useful even while the durable backend absorbs beta churn (section 6).

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [exports](#exports)
  - [From "./Decision.js"](#from-decisionjs)
  - [From "./Dedup.js"](#from-dedupjs)
  - [From "./Dialog.js"](#from-dialogjs)
  - [From "./DialogAddress.js"](#from-dialogaddressjs)
  - [From "./DialogStore.js"](#from-dialogstorejs)
  - [From "./Dispatcher.js"](#from-dispatcherjs)
  - [From "./EntityManager.js"](#from-entitymanagerjs)
  - [From "./Retry.js"](#from-retryjs)

---

# exports

## From "./Decision.js"

The `Decision` type (events + effects) and its constructors.

**Signature**

```ts
export * as Decision from "./Decision.js"
```

Added in v0.1.0

## From "./Dedup.js"

The `Dedup` idempotency port and its in-memory backend.

**Signature**

```ts
export * as Dedup from "./Dedup.js"
```

Added in v0.1.0

## From "./Dialog.js"

The `Dialog` decider primitive and its constructors.

**Signature**

```ts
export * as Dialog from "./Dialog.js"
```

Added in v0.1.0

## From "./DialogAddress.js"

`@fibergram/core` - the invariant model: dialog addressing, the decider
primitive, the in-memory `EntityManager`, dedup, retry honouring `retry_after`
and the dispatch loop (design section 4, section 5, section 8). This package stays publishable and
useful even while the durable backend absorbs beta churn (section 6).

**Signature**

```ts
export * as DialogAddress from "./DialogAddress.js"
```

Added in v0.1.0

## From "./DialogStore.js"

The `DialogStore` persistence port and its in-memory backend.

**Signature**

```ts
export * as DialogStore from "./DialogStore.js"
```

Added in v0.1.0

## From "./Dispatcher.js"

The `Dispatcher` loop over a `Stream<Update>`.

**Signature**

```ts
export * as Dispatcher from "./Dispatcher.js"
```

Added in v0.1.0

## From "./EntityManager.js"

The `EntityManager` virtual-actor runtime.

**Signature**

```ts
export * as EntityManager from "./EntityManager.js"
```

Added in v0.1.0

## From "./Retry.js"

Retry that honours Telegram's `retry_after`.

**Signature**

```ts
export * as Retry from "./Retry.js"
```

Added in v0.1.0
