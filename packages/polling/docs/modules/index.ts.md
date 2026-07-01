---

title: index.ts
nav_order: 1
parent: Modules
---

## index overview

`@fibergram/polling` - long-polling ingestion. A producer into the shared
`Queue<Update>` the dispatcher drains (design section 7); it depends only on
`@fibergram/client`, never on the dialog engine.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [exports](#exports)
  - [From "./Polling.js"](#from-pollingjs)

---

# exports

## From "./Polling.js"

`@fibergram/polling` - long-polling ingestion. A producer into the shared
`Queue<Update>` the dispatcher drains (design section 7); it depends only on
`@fibergram/client`, never on the dialog engine.

**Signature**

```ts
export * as Polling from "./Polling.js"
```

Added in v0.1.0
