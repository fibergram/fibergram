---
title: Dialogs
description: The addressable-entity primitive — one abstraction for stateless commands, wizards, and days-long conversations.
sidebar:
  order: 2
---

## The reframe

Three scenarios that most frameworks treat as three different features:

| Scenario | Fiber | State |
|---|---|---|
| A stateless command | ephemeral, lives for one update | none |
| A wizard (minutes) | suspended, hot in memory | checkpointed snapshot |
| An RPG turn loop (days) | passivated between updates | durable |

They differ in **persistence policy**, not in nature. So fibergram has one
primitive — a **virtual actor**:

- a stable **address**,
- a **mailbox** (ordering within the address, concurrency between addresses),
- **persistent state**,
- a handler that can **suspend until the next update**.

Which of the three rows above you get is decided by the backing `Layer`, not by
the handler. That is the single most important idea in the framework.

## The address

```ts
interface DialogAddress {
  readonly chatId: number
  readonly threadId?: number // forum topics
  readonly fromId?: number // per-user rather than per-chat dialogs
  readonly kind: string // "registration", "combat", …
}
```

`DialogAddress.toKey` serialises this to `` `${kind}:${chatId}:${threadId}:${fromId}` ``.
That string *is* the mailbox identity: updates with the same key are processed in
order, on one fiber; different keys run concurrently.

The extractor is pluggable, because different bots need different address shapes:

```ts
type KeyExtractor = (update: Update) => Option<DialogAddress>
```

Built in:

| Extractor | Address shape | Use it when |
|---|---|---|
| `DialogAddress.byUpdate(kind)` | chat + thread, **total** over every update kind | The dispatcher default. Chatless updates address by sender, so `Router.on("inlineQuery")`, `Router.reaction`, and `Router.chatMember` actually receive theirs. |
| `DialogAddress.byChat(kind)` | chat + thread | One conversation per chat, message-bearing updates only. |
| `DialogAddress.byUser(kind)` | chat + sender | Every group member gets an independent conversation. |

Returning `Option.none()` drops the update. Pass your own to
`Dispatcher.run({ keyExtractor })`.

## The decider

Underneath every dialog is an event-sourced decider — inspectable, replayable,
and the layer that durability is built on:

```ts
type Handler<State, Event, E, R> = (
  state: State,
  update: Update
) => Effect<Decision<Event, E, R>, E, R>

interface Decision<out Event, out E = never, out R = never> {
  readonly events: ReadonlyArray<Event> // committed → folded into the next state
  readonly effects: ReadonlyArray<Effect<void, E, R>> // sends, edits, …
}

interface Dialog<State, Event, E, R> {
  readonly kind: string
  readonly initialState: State
  readonly reduce: (state: State, event: Event) => State
  readonly decide: Handler<State, Event, E, R>
}
```

The separation matters: **`events` change state, `effects` touch the world.** A
replaying dialog folds the events and does not re-run the effects.

```ts
import { Chat, Decision, Dialog } from "@fibergram/core"
import { Effect } from "effect"

type State = { readonly count: number }
type Event = { readonly _tag: "Ticked" }

// `E` and `R` are inferred from the effects the decision carries —
// here `TelegramError` and `TelegramClient`, contributed by `Chat.reply`.
const counter = Dialog.make({
  kind: "counter",
  initialState: { count: 0 },
  reduce: (state, _event) => ({ count: state.count + 1 }),
  decide: (state, update) =>
    Effect.succeed(
      update.message === undefined
        ? Decision.empty
        : Decision.make({
            events: [{ _tag: "Ticked" }],
            effects: [Effect.asVoid(Chat.reply(`Message #${state.count + 1}`))]
          })
    )
})
```

`Decision` constructors: `empty`, `run(...effects)`, `emit(...events)`, and
`make({ events?, effects? })`.

### The stateless shorthand

Most handlers have no state. `Dialog.stateless` is sugar whose `decide` returns
`Decision.run(onUpdate(update))`:

```ts
const echo = Dialog.stateless({
  onUpdate: (update) =>
    Effect.gen(function* () {
      const text = update.message?.text
      if (text !== undefined) yield* Chat.reply(text)
    })
})
```

## The ergonomic layer: coroutines

Writing a decider by hand for "ask three questions" is tedious. A `Coroutine` is
a generator that elaborates *into* a decider:

```ts
import { Coroutine } from "@fibergram/core"
import { Schema } from "effect"

const registration = Coroutine.make("registration", function* (d) {
  const name = yield* d.prompt("Name?", Schema.NonEmptyString)
  const age = yield* d.prompt("Age?", Schema.NumberFromString)
  yield* d.reply(`Ok, ${name}, ${age}`)
  return { name, age }
})
```

Each `prompt` is an **atomic step boundary**: ask, suspend, resume on the next
update with a decoded answer. The driver is **replay-based** (the Temporal /
Effect Workflow model): on every update the generator restarts from the top,
already-answered prompts and recorded activity results are served from the
persisted log, and only the frontier effect runs — exactly once, in program
order.

The consequence is a rule: **code between steps must be deterministic.**
Branching on an unrecorded clock read or random value will diverge on replay, and
fibergram catches that as a `NonDeterminismError` defect rather than silently
corrupting state. Pull non-deterministic data in through `d.run(effect, schema)`,
which records its result.

Full DSL and composition rules: [Conversations](/guides/conversations/).

## Both are the same thing

A coroutine is a `Dialog` whose `reduce` has snapshot semantics — the emitted
event *is* the next state. So deciders and coroutines interoperate: a root
decider can delegate to a coroutine and take its snapshot back, which is exactly
what [`Conversations`](/guides/conversations/#composing-with-a-router) does to
run a router alongside N named wizards.

## One dialog per address

`Dispatcher.run({ updates, dialog })` runs **one** dialog. A bot that needs both
a command router and stateful wizards composes them into a single dialog — it
does not register two. Use `Conversations` for the common shape, or write the
root decider yourself when you need finer control.

## Where the regime is chosen

Nothing above mentioned persistence. That is the point:

```ts
// hot in memory, gone on restart
Effect.provide([DialogStore.layerMemory, Dedup.layerMemory])

// survives restarts; idle dialogs evicted and rehydrated on demand
Effect.provide([PersistedDialogStore.layer, Dedup.layerMemory])
```

See [Persistence regimes](/concepts/persistence/) for what each one guarantees.
