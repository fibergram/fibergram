---

title: Dialog.ts
nav_order: 3
parent: Modules
---

## Dialog overview

`Dialog` - the decider primitive (design section 4.3, D2). A dialog is `(state,
update) => Effect<Decision>` plus a pure `reduce` folding emitted events into
the next state. This is the public "bottom": full control, replayable. The
coroutine DSL elaborates _into_ this shape.

The requirement channel `R` stays open: a handler `yield*`s whatever services
it needs (`TelegramClient`, a `UserRepo`, ...), provided once at the edge
(design section 5.1).

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
  - [stateless](#stateless)
- [models](#models)
  - [Dialog (interface)](#dialog-interface)
  - [Handler (type alias)](#handler-type-alias)

---

# constructors

## make

Defines a stateful dialog from an explicit decider.

**Signature**

```ts
export declare const make: <State, Event, E, R>(definition: Dialog<State, Event, E, R>) => Dialog<State, Event, E, R>
```

**Example**

```ts
import { Dialog, Decision } from "@fibergram/core"
import { Effect } from "effect"

type State = { readonly count: number }
type Event = { readonly _tag: "Ticked" }

const counter = Dialog.make<State, Event, never, never>({
  kind: "counter",
  initialState: { count: 0 },
  reduce: (state, event) => (event._tag === "Ticked" ? { count: state.count + 1 } : state),
  decide: (state) => Effect.succeed(Decision.emit({ _tag: "Ticked" as const }))
})
```

Added in v0.1.0

## stateless

Defines a stateless dialog: no persisted state, every update handled the same
way. This is the whole surface an echo/command bot needs.

**Signature**

```ts
export declare const stateless: <E, R>(options: {
  readonly kind?: string
  readonly onUpdate: (update: BotApi.Update) => Effect.Effect<void, E, R>
}) => Dialog<void, never, E, R>
```

**Example**

```ts
import { Dialog } from "@fibergram/core"
import { TelegramClient } from "@fibergram/client"
import { Effect } from "effect"

const echo = Dialog.stateless({
  onUpdate: (update) =>
    Effect.gen(function* () {
      const tg = yield* TelegramClient.TelegramClient
      const message = update.message
      if (message?.text !== undefined) {
        yield* tg.sendMessage({ chatId: message.chat.id, text: message.text })
      }
    })
})
```

Added in v0.1.0

# models

## Dialog (interface)

A dialog definition: its `kind` (address namespace), `initialState`, the pure
`reduce` that folds events into state, and the `decide` handler.

**Signature**

```ts
export interface Dialog<State, Event, E, R> {
  readonly kind: string
  readonly initialState: State
  readonly reduce: (state: State, event: Event) => State
  readonly decide: Handler<State, Event, E, R>
}
```

Added in v0.1.0

## Handler (type alias)

A dialog handler: decide what happens for `update` given the current `state`.

**Signature**

```ts
export type Handler<State, Event, E, R> = (
  state: State,
  update: BotApi.Update
) => Effect.Effect<Decision.Decision<Event, E, R>, E, R>
```

Added in v0.1.0
