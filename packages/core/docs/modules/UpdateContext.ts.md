---

title: UpdateContext.ts
nav_order: 15
parent: Modules
---

## UpdateContext overview

`UpdateContext` - the per-update ambient state that dissolves the `ctx`
god-object (design section 5.1). Instead of threading a mutable context object
through handlers, the dispatcher stamps a {@link UpdateEnv} onto a
`Context.Reference` before running the handler; free accessor functions (the
{@link module:Chat} namespace) read it back.

Because {@link current} is a `Context.Reference` with a default, reading it adds
**nothing** to a handler's `R`: `Chat.reply` still only requires
`TelegramClient`, not some ambient tag. The env is scoped to exactly one update
via {@link provide}.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [accessors](#accessors)
  - [env](#env)
- [combinators](#combinators)
  - [provide](#provide)
- [constructors](#constructors)
  - [fromAddress](#fromaddress)
- [models](#models)
  - [UpdateEnv (interface)](#updateenv-interface)
- [references](#references)
  - [current](#current)

---

# accessors

## env

Reads the current {@link UpdateEnv}, failing as a defect if used outside an
update handler. Accessors build on this; handlers usually reach for
{@link module:Chat} instead.

**Signature**

```ts
export declare const env: Effect.Effect<UpdateEnv, never, never>
```

**Example**

```ts
import { UpdateContext } from "@fibergram/core"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const env = yield* UpdateContext.env
  return env.chatId
})
```

Added in v0.1.0

# combinators

## provide

Scopes `env` as the ambient {@link current} for the duration of `effect`. The
dispatcher wraps each handler run with this.

**Signature**

```ts
export declare const provide: (env_: UpdateEnv) => <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>
```

**Example**

```ts
import { UpdateContext, Chat } from "@fibergram/core"
import { Effect, Option, Ref } from "effect"

const program = Effect.gen(function* () {
  const lastSent = yield* Ref.make(Option.none<number>())
  const env = {
    chatId: 1,
    threadId: Option.none(),
    fromId: Option.none(),
    update: { updateId: 1 },
    lastSent
  }
  return yield* Chat.chatId.pipe(UpdateContext.provide(env))
})
```

Added in v0.1.0

# constructors

## fromAddress

Builds a fresh {@link UpdateEnv} for `address`/`update`, allocating the
`lastSent` ref. The dispatcher calls this once per update.

**Signature**

```ts
export declare const fromAddress: (
  address: DialogAddress.DialogAddress,
  update: BotApi.Update
) => Effect.Effect<UpdateEnv>
```

Added in v0.1.0

# models

## UpdateEnv (interface)

The ambient facts about the update currently being handled: where it came from
(`chatId`/`threadId`/`fromId`), the raw `update`, and `lastSent` - the id of
the most recent message the handler sent, so `Chat.editLast` can target it.

**Signature**

```ts
export interface UpdateEnv {
  readonly chatId: number
  readonly threadId: Option.Option<number>
  readonly fromId: Option.Option<number>
  readonly update: BotApi.Update
  /** The id of the last message the handler sent in this turn (for `editLast`). */
  readonly lastSent: Ref.Ref<Option.Option<number>>
}
```

Added in v0.1.0

# references

## current

The ambient reference holding the current {@link UpdateEnv}, or `None` when no
update is being handled (e.g. code called outside the dispatcher). Its default
makes reads requirement-free.

**Signature**

```ts
export declare const current: Context.Reference<Option.Option<UpdateEnv>>
```

Added in v0.1.0
