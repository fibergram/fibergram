---

title: Router.ts
nav_order: 14
parent: Modules
---

## Router overview

`Router` - the update-routing layer (design section 11.1). It resolves the
open question of _how_ to shape the routing API by taking both sides:

- a **handler-style core** ({@link Route} + {@link Router}), where a route is a
  plain value pairing a matcher with an `Effect` handler, composed with the
  full flexibility of `HttpRouter`; and
- **declarative sugar** on top - {@link command} and {@link callback} consume
  the Schema-carrying {@link module:Command.Command}/{@link module:CallbackData.Codec}
  declarations and _auto-insert_ the `Schema.decode` step, so args and payloads
  arrive already typed (the `HttpApi` feel), while desugaring into the very
  same `Route`.

The hard part (design section 11.3) is **requirement accumulation**: a router
built from a heterogeneous list of routes must accumulate every route's `R`
(and `E`) at the type level - exactly as `HttpApi` accumulates requirements -
so the finished bot exposes one precise union and is satisfied by one `Layer`
at the edge. Here that falls out of `Route` being covariant in `E`/`R`: each
{@link add}/{@link make} widens both channels by union, never collapsing to
`any`.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [add](#add)
  - [concat](#concat)
  - [toHandler](#tohandler)
- [constructors](#constructors)
  - [callback](#callback)
  - [command](#command)
  - [empty](#empty)
  - [make](#make)
  - [route](#route)
  - [when](#when)
- [conversions](#conversions)
  - [toDialog](#todialog)
- [models](#models)
  - [Route (interface)](#route-interface)
  - [Router (interface)](#router-interface)
  - [ToDialogOptions (interface)](#todialogoptions-interface)
- [type-level](#type-level)
  - [Context (type alias)](#context-type-alias)
  - [Error (type alias)](#error-type-alias)

---

# combinators

## add

Appends `route` to `self`, **widening** both channels by union. This is the
accumulator at the heart of the §11.3 PoC: chaining routes with different
requirements grows one precise `R` union with no `any` in sight.

**Signature**

```ts
export declare const add: <E2, R2>(route_: Route<E2, R2>) => <E, R>(self: Router<E, R>) => Router<E | E2, R | R2>
```

**Example**

```ts
import { Router, Chat } from "@fibergram/core"

const router = Router.empty.pipe(
  Router.add(
    Router.when(
      (u) => u.message?.text === "/a",
      () => Chat.reply("a")
    )
  ),
  Router.add(
    Router.when(
      (u) => u.message?.text === "/b",
      () => Chat.reply("b")
    )
  )
)
```

Added in v0.1.0

## concat

Concatenates two routers, unioning their channels. Lets you build sub-routers
(per feature, per module) and glue them at the edge.

**Signature**

```ts
export declare const concat: <E2, R2>(other: Router<E2, R2>) => <E, R>(self: Router<E, R>) => Router<E | E2, R | R2>
```

**Example**

```ts
import { Router, Chat } from "@fibergram/core"

const admin = Router.make(
  Router.when(
    (u) => u.message?.text === "/ban",
    () => Chat.reply("banned")
  )
)
const user = Router.make(
  Router.when(
    (u) => u.message?.text === "/help",
    () => Chat.reply("help")
  )
)

const router = user.pipe(Router.concat(admin))
```

Added in v0.1.0

## toHandler

Resolves `update` to the first matching route's handler, falling back to
`fallback` (or a no-op) when nothing matches. Routes are tried in insertion
order - first match wins.

**Signature**

```ts
export declare const toHandler: <E, R>(
  router: Router<E, R>,
  options?: ToDialogOptions<E, R>
) => (update: BotApi.Update) => Effect.Effect<void, E, R>
```

**Example**

```ts
import { Router, Chat } from "@fibergram/core"
import { Effect } from "effect"

const router = Router.make(
  Router.when(
    (u) => u.message?.text === "/hi",
    () => Chat.reply("hi")
  )
)

const program = Effect.gen(function* () {
  yield* Router.toHandler(router)({ updateId: 1 })
})
```

Added in v0.1.0

# constructors

## callback

Declarative sugar for an inline-button tap. Consumes a
{@link module:CallbackData.Codec} (which carries the payload `Schema`) and
calls `handler` with the _already-decoded_ value - the decode step is inserted
for you, so its `CallbackDataMalformed` shows up in the route's `E`, and the
route only applies to callback queries this codec produced.

**Signature**

```ts
export declare const callback: <A, E, R>(
  codec: CallbackData.Codec<A>,
  handler: (value: A) => Effect.Effect<void, E, R>
) => Route<E | CallbackData.CallbackDataMalformed, R>
```

**Example**

```ts
import { Router, CallbackData, Chat } from "@fibergram/core"
import { Schema } from "effect"

const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number }))

const route = Router.callback(Vote, ({ id }) => Chat.answerCallback({ text: `voted ${id}` }))
```

Added in v0.1.0

## command

Declarative sugar for a slash command. Consumes a {@link module:Command.Command}
declaration (which carries the args `Schema`) and calls `handler` with the
_already-decoded_ args - the `Schema.decode` step is inserted for you, so its
`CommandArgsError` shows up in the route's `E` automatically.

**Signature**

```ts
export declare const command: <Args, E, R>(
  command_: Command.Command<Args>,
  handler: (args: Args) => Effect.Effect<void, E, R>
) => Route<E | Command.CommandArgsError, R>
```

**Example**

```ts
import { Router, Command, Chat } from "@fibergram/core"
import { Schema } from "effect"

const setAge = Command.make("/setage", Schema.Struct({ age: Schema.NumberFromString }))

const route = Router.command(setAge, ({ age }) => Chat.reply(`age is ${age}`))
```

Added in v0.1.0

## empty

The empty router: matches nothing, requires nothing. The identity for
{@link add}/{@link concat} and the starting point of a piped build.

**Signature**

```ts
export declare const empty: Router<never, never>
```

**Example**

```ts
import { Router } from "@fibergram/core"

const router = Router.empty
```

Added in v0.1.0

## make

Builds a router from routes in one shot, accumulating their `E`/`R` unions.
The variadic sugar over {@link empty} + {@link add}; the type inference proves
the §11.3 accumulation - `make(a, b, c)` has `R = R_a | R_b | R_c`.

**Signature**

```ts
export declare const make: <Routes extends ReadonlyArray<Route<any, any>>>(
  ...routes: Routes
) => Router<Error<Routes[number]>, Context<Routes[number]>>
```

**Example**

```ts
import { Router, Command, CallbackData, Chat } from "@fibergram/core"
import { Schema } from "effect"

const setAge = Command.make("/setage", Schema.Struct({ age: Schema.NumberFromString }))
const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number }))

const router = Router.make(
  Router.command(setAge, ({ age }) => Chat.reply(`age ${age}`)),
  Router.callback(Vote, ({ id }) => Chat.answerCallback({ text: `voted ${id}` }))
)
```

Added in v0.1.0

## route

The lowest-level route constructor: a raw matcher. `match` returns `Some` with
the handler to run when the update is this route's, `None` otherwise. Prefer
{@link when}/{@link command}/{@link callback}; reach for this for bespoke
matching the sugar does not cover.

**Signature**

```ts
export declare const route: <E, R>(
  match: (update: BotApi.Update) => Option.Option<Effect.Effect<void, E, R>>
) => Route<E, R>
```

**Example**

```ts
import { Router } from "@fibergram/core"
import { Effect, Option } from "effect"

const pings = Router.route((update) =>
  update.message?.text === "ping" ? Option.some(Effect.log("pong")) : Option.none()
)
```

Added in v0.1.0

## when

A route guarded by a boolean predicate over the update. The handler receives
the raw update; use it when the decision needs no Schema decoding.

**Signature**

```ts
export declare const when: <E, R>(
  predicate: (update: BotApi.Update) => boolean,
  handler: (update: BotApi.Update) => Effect.Effect<void, E, R>
) => Route<E, R>
```

**Example**

```ts
import { Router, Chat } from "@fibergram/core"

const greet = Router.when(
  (update) => update.message?.text === "/hi",
  () => Chat.reply("hello")
)
```

Added in v0.1.0

# conversions

## toDialog

Turns a router into a stateless {@link module:Dialog.Dialog} the
{@link module:Dispatcher} can run: every update is dispatched to the first
matching route. The dialog carries the router's accumulated `E`/`R`, so the
whole bot is provided by one `Layer` at the edge (design section 5.1).

**Signature**

```ts
export declare const toDialog: <E, R>(
  router: Router<E, R>,
  options?: ToDialogOptions<E, R>
) => Dialog.Dialog<void, never, E, R>
```

**Example**

```ts
import { Router, Dispatcher, DialogStore, Dedup, Chat } from "@fibergram/core"
import { Effect, Stream } from "effect"

const router = Router.make(
  Router.when(
    (u) => u.message?.text === "/hi",
    () => Chat.reply("hi")
  )
)

const program = Dispatcher.run({
  updates: Stream.empty,
  dialog: Router.toDialog(router)
}).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory]))
```

Added in v0.1.0

# models

## Route (interface)

A single route: given an update, either it applies - yielding the handler
`Effect` to run for it - or it does not (`None`). The matcher owns _both_ the
"is this mine?" test and the (possibly decode-carrying) handler it produces,
which is what lets {@link command}/{@link callback} fold Schema decoding into
the effect's `E`.

Covariant in `E` and `R` so that a list of differently-typed routes widens to
their union rather than their (impossible) intersection.

**Signature**

```ts
export interface Route<out E, out R> {
  readonly match: (update: BotApi.Update) => Option.Option<Effect.Effect<void, E, R>>
}
```

Added in v0.1.0

## Router (interface)

An ordered collection of {@link Route}s. Its `E`/`R` are the union of every
contained route's - the type-level accumulation of requirements that keeps the
finished bot satisfiable by a single edge `Layer` (design section 11.3).

**Signature**

```ts
export interface Router<out E, out R> extends Pipeable.Pipeable {
  readonly routes: ReadonlyArray<Route<E, R>>
}
```

Added in v0.1.0

## ToDialogOptions (interface)

Options for {@link toDialog} and {@link toHandler}.

**Signature**

```ts
export interface ToDialogOptions<E, R> {
  /** Address namespace for the resulting dialog (defaults to `"router"`). */
  readonly kind?: string
  /** Handler for updates no route matched; defaults to doing nothing. */
  readonly fallback?: (update: BotApi.Update) => Effect.Effect<void, E, R>
}
```

Added in v0.1.0

# type-level

## Context (type alias)

Extracts the requirement channel of a {@link Route}, distributing over unions.

**Signature**

```ts
export type Context<T> = T extends Route<infer _E, infer R> ? R : never
```

Added in v0.1.0

## Error (type alias)

Extracts the error channel of a {@link Route}, distributing over unions.

**Signature**

```ts
export type Error<T> = T extends Route<infer E, infer _R> ? E : never
```

Added in v0.1.0
