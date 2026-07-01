---

title: Decision.ts
nav_order: 1
parent: Modules
---

## Decision overview

`Decision` - the output of a dialog handler (design section 4.3). A decision is the
event-sourced "truth layer": a set of `events` that fold into the next state,
plus a set of `effects` (send/edit/...) to run. Keeping the two apart is what
makes the primitive replayable and inspectable down the line (durable, section 13.2).

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [emit](#emit)
  - [empty](#empty)
  - [make](#make)
  - [run](#run)
- [models](#models)
  - [Decision (interface)](#decision-interface)

---

# constructors

## emit

A decision that only emits events (a pure state transition).

**Signature**

```ts
export declare const emit: <Event>(...events: ReadonlyArray<Event>) => Decision<Event>
```

**Example**

```ts
import { Decision } from "@fibergram/core"

const decision = Decision.emit({ _tag: "NameProvided", name: "Ada" })
```

Added in v0.1.0

## empty

A decision that changes nothing - no events, no effects.

**Signature**

```ts
export declare const empty: Decision<never, never, never>
```

**Example**

```ts
import { Decision } from "@fibergram/core"

const noop = Decision.empty
```

Added in v0.1.0

## make

A decision that both emits events and performs effects.

**Signature**

```ts
export declare const make: <Event, E, R>(options: {
  readonly events?: ReadonlyArray<Event>
  readonly effects?: ReadonlyArray<Effect.Effect<void, E, R>>
}) => Decision<Event, E, R>
```

**Example**

```ts
import { Decision } from "@fibergram/core"
import { Effect } from "effect"

const decision = Decision.make({
  events: [{ _tag: "Done" }],
  effects: [Effect.log("done")]
})
```

Added in v0.1.0

## run

A decision that only performs effects (a stateless reply).

**Signature**

```ts
export declare const run: <E, R>(...effects: ReadonlyArray<Effect.Effect<void, E, R>>) => Decision<never, E, R>
```

**Example**

```ts
import { Decision } from "@fibergram/core"
import { Effect } from "effect"

const decision = Decision.run(Effect.log("sent"))
```

Added in v0.1.0

# models

## Decision (interface)

The result of handling one update: `events` deterministically fold into the
next state; `effects` are the observable side effects to perform.

**Signature**

```ts
export interface Decision<out Event, out E = never, out R = never> {
  readonly events: ReadonlyArray<Event>
  readonly effects: ReadonlyArray<Effect.Effect<void, E, R>>
}
```

Added in v0.1.0
