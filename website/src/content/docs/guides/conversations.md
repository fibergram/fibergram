---
title: Conversations
description: Multi-step wizards as generators, the replay model that makes them durable, and composing them with a router.
sidebar:
  order: 5
---

Asking three questions in a row usually means writing a state machine: a state
enum, a switch on it, a transition per branch, and a bug the first time someone
sends a photo where you expected a number.

A `Coroutine` derives that state machine from the code you would have written if
suspension were free:

```ts
import { Coroutine } from "@fibergram/core"
import { Schema } from "effect"

const Age = Schema.NumberFromString.check(Schema.isBetween({ minimum: 0, maximum: 150 }))

const registration = Coroutine.make("registration", function* (d) {
  const name = yield* d.prompt("What is your name?", Schema.NonEmptyString)
  const age = yield* d.prompt("How old are you?", Age, {
    onInvalid: () => "That is not a plausible age. How old are you?"
  })
  yield* d.reply(`Nice to meet you, ${name} (${age}).`)
  return { name, age }
})
```

Run it like any dialog:

```ts
Dispatcher.run({ updates, dialog: registration })
```

## The DSL

| Operation | What it does |
|---|---|
| `d.prompt(question, schema, options?)` | Ask, **suspend**, resume with the next update's text decoded. `onInvalid` supplies the re-ask message; without it the question repeats. |
| `d.choose(question, choices, options?)` | A one-time reply keyboard of labels; resumes with the tapped choice's stable `id`. Collapses the send-keyboard → prompt → map-label dance into one call. |
| `d.reply(text, options?)` | Send a message as a recorded step — performed once, not on replay. |
| `d.effect(effect)` | Any effect as a recorded step. |
| `d.run(effect, schema)` | The durable **activity**: run once, record the result, and on replay return the recorded value without re-running. |

`d.choose` is worth reaching for whenever a step has a fixed set of answers — the
handler branches on `"window"` rather than on whatever the button label happens
to say in the user's language.

## The replay model

This is the part worth understanding before you write a long wizard.

On every update the generator **restarts from the top**. Prompts already answered
and activities already recorded are served from the persisted log; only the
frontier operation actually runs. It is the Temporal / Effect Workflow model, and
it is what makes a wizard resumable across restarts without you writing a single
transition.

The rule that follows: **code between steps must be deterministic.**

```ts
// ✗ diverges on replay — Date.now() differs every time
const registration = Coroutine.make("bad", function* (d) {
  if (Date.now() % 2 === 0) yield* d.reply("even")
  else yield* d.reply("odd")
})

// ✓ the value is recorded on the first run and replayed thereafter
const registration = Coroutine.make("good", function* (d) {
  const now = yield* d.run(Clock.currentTimeMillis, Schema.Number)
  if (now % 2 === 0) yield* d.reply("even")
  else yield* d.reply("odd")
})
```

Branching on unrecorded non-determinism is caught as a `NonDeterminismError`
**defect** — deliberately loud, because the alternative is silently corrupted
state that only shows up days later.

Two caveats that come with the model:

- **`d.run` is at-least-once.** A crash after running but before the state
  persists re-runs it on recovery. Keep it idempotent.
- **The schema must round-trip losslessly.** The replayed value is
  `decode(encode(a))`, so a `Date` that encodes to a string comes back as a
  string unless the schema says otherwise.

## Composition

Coroutines compose by generator delegation — the child's steps are spliced into
the parent's single log, and the parent resumes with the child's return value:

```ts
function* askAddress(d) {
  const city = yield* d.prompt("City?", Schema.NonEmptyString)
  const street = yield* d.prompt("Street?", Schema.NonEmptyString)
  return { city, street }
}

const booking = Coroutine.make("booking", function* (d) {
  const when = yield* d.prompt("When?", Schema.NonEmptyString)
  const address = yield* askAddress(d) // ← splices in
  yield* d.reply(`Booked for ${when} at ${address.street}, ${address.city}`)
})
```

There is no sub-dialog concept to learn: it is a function call.

## Composing with a router

fibergram runs **one dialog per chat**, so a bot with both stateless commands and
wizards needs an explicit answer to "which conversation is active". `Conversations`
owns that state machine — the analogue of grammY's `Stage` or aiogram's `Scenes`:

```ts
import { Chat, Command, Conversations, Router } from "@fibergram/core"

const help = Command.make("/help", { description: "Help" })
const start = Command.make("/start", { description: "Register" })
const stop = Command.make("/cancel", { description: "Abort" })

const manager = Conversations.make({
  router: Router.make(Router.command(help, () => Chat.reply("help"))),
  scenes: { registration, booking },
  enter: [Conversations.on(start, "registration")],
  cancel: Conversations.cancel(stop, { onCancel: Chat.reply("Cancelled") })
})

Dispatcher.run({ updates, dialog: Conversations.toDialog(manager) })
```

On each update the manager:

1. aborts an active scene on a `cancel` match,
2. delegates to the active scene — its `decide` performs the sends and returns
   the next snapshot; a `done` snapshot returns to `Idle`,
3. from `Idle`, tries each `enter` rule in order (a rule's optional `guard` can
   reject, running `onReject` and staying `Idle`),
4. otherwise hands the update to the router.

Scene names are constrained by `make` to the keys of `scenes`, so a typo is a
compile error. `E` and `R` accumulate from the router *and* every scene, and the
entry and cancel commands are contributed back into `manager.router` — so
`Router.setMyCommands(manager.router)` still syncs the full menu.

### Entry guards

```ts
Conversations.on(book, "booking", {
  guard: isRegistered,
  onReject: Chat.reply("Please /start first")
})
```

## When to write the decider by hand

`Conversations` covers the common shape. Write your own root
[`Dialog`](/concepts/dialogs/#the-decider) over a tagged union when you need
something it does not model — for example, a wizard that can be interrupted by a
specific command mid-flight while preserving partial state. The
[restaurant-booking example](https://github.com/fibergram/fibergram/tree/main/examples/restaurant-booking)
does exactly that.

## Durability

Nothing above mentions persistence. A half-finished wizard survives a redeploy if
— and only if — the `DialogStore` layer is durable:

```ts
Effect.provide([PersistedDialogStore.layer, Dedup.layerMemory])
```

See [Persistence regimes](/concepts/persistence/).
