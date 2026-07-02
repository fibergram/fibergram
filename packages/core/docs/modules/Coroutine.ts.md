---

title: Coroutine.ts
nav_order: 4
parent: Modules
---

## Coroutine overview

`Coroutine` - the ergonomic DSL that elaborates into the `Dialog` decider
(design section 4.3, D2). A wizard reads top-to-bottom as a generator:

```ts
Coroutine.make("registration", function* (d) {
  const name = yield* d.prompt("Name?", Schema.NonEmptyString)
  const age = yield* d.prompt("Age?", Schema.NumberFromString)
  yield* d.reply(`Ok, ${name}, ${age}`)
})
```

Each `prompt` is an **atomic step boundary**: the coroutine sends its question,
suspends until the next update, and resumes with the decoded answer. The driver
is **replay-based** (the Temporal/Effect-Workflow model, section 13.2): on every
update it re-runs the generator from the top, feeding already-answered prompts
from persisted state and performing each side effect exactly once, **in program
order** (a `reply` before a `run` sends before the activity runs).

Keep the code between prompts deterministic. `if`/`while`/`for` are ordinary
control flow and work as long as every branch condition is a pure function of
persisted data (prior `prompt` answers, `run` results). To branch on
non-deterministic or external data - the clock, a random roll, a DB read -
fetch it through `d.run`, which records the result so replay is deterministic.
A branch on inline non-deterministic data diverges on replay and is caught as a
{@link NonDeterminismError} rather than silently corrupting state.

**Composition.** A coroutine body is a plain generator, so one composes into
another by generator delegation - `const r = yield* childBody(d)` runs the
child's steps inline in the parent's single log and resumes the parent with the
child's `return` value. Standalone, the same value surfaces as {@link State.result}
once the coroutine is `done`.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [errors](#errors)
  - [NonDeterminismError (class)](#nondeterminismerror-class)
- [models](#models)
  - [Dsl (interface)](#dsl-interface)
  - [PromptOptions (interface)](#promptoptions-interface)
  - [State (interface)](#state-interface)

---

# constructors

## make

Elaborates a coroutine `program` into a {@link module:Dialog.Dialog}. The
result is an ordinary decider - interoperable with hand-written dialogs and
runnable on any backend (design section 4.3).

**Signature**

```ts
export declare const make: <A = void, E = TelegramError.TelegramError, R = TelegramClient.TelegramClient>(
  kind: string,
  program: (d: Dsl<E, R>) => Generator<Op<E, R>, A, any>
) => Dialog<State<A>, State<A>, E, R>
```

**Example**

```ts
import { Coroutine } from "@fibergram/core"
import { Schema } from "effect"

const registration = Coroutine.make("registration", function* (d) {
  const name = yield* d.prompt("Name?", Schema.NonEmptyString)
  const age = yield* d.prompt("Age?", Schema.NumberFromString)
  yield* d.reply(`Ok, ${name}, ${age}`)
})
```

Added in v0.1.0

# errors

## NonDeterminismError (class)

Raised as a **defect** when a replay diverges from the persisted log: the
generator yielded a different step than the one recorded at `position`, or it
finished before consuming every recorded step (design section 13.2). This is
the workflow-determinism footgun made loud - a non-deterministic branch (an
`if` on `Date.now()`, `Math.random()`, or an inline external read) takes a
different path on replay, and instead of silently feeding the wrong value into
a later step, the driver dies here. Fetch non-deterministic data through
{@link Dsl.run} so its result is recorded and replayed instead.

**Signature**

```ts
export declare class NonDeterminismError
```

Added in v0.1.0

# models

## Dsl (interface)

The coroutine's toolbox, passed to the generator.

**Signature**

```ts
export interface Dsl<E, R> {
  /** Ask `question`, suspend, and resume with the next update's text decoded by `schema`. */
  readonly prompt: <A, I>(question: string, schema: Schema.Codec<A, I>, options?: PromptOptions) => Suspend<A>
  /** Send a message to the current chat as a recorded step (performed once). */
  readonly reply: (text: string, options?: Chat.ReplyOptions) => Suspend<void>
  /** Perform an arbitrary effect as a recorded step (performed once, not on replay). */
  readonly effect: (effect: Effect.Effect<void, E, R>) => Suspend<void>
  /**
   * The durable **activity**: run `effect` once at the frontier, record its
   * result (encoded through `schema`) in the log, and on replay resume with the
   * recorded value **without** re-running it. This is the only primitive besides
   * {@link prompt} that persists a value, so it is how you get non-deterministic
   * or external data (a DB read, the clock, a random roll) into a later `if`
   * without diverging on replay. Unlike `prompt`, it does not wait for the next
   * update - it resolves within the same turn.
   *
   * Effects run in program order - a `run` interleaves with surrounding
   * {@link reply}/{@link effect} exactly as written. One caveat mirrors any
   * workflow activity: it is at-least-once (a crash after running but before the
   * state persists re-runs it on recovery), so keep it idempotent. The `schema`
   * must round-trip losslessly - the replayed value is `decode(encode(a))`.
   */
  readonly run: <A, I>(effect: Effect.Effect<A, E, R>, schema: Schema.Codec<A, I>) => Suspend<A>
}
```

Added in v0.1.0

## PromptOptions (interface)

Options for {@link Dsl.prompt}.

**Signature**

```ts
export interface PromptOptions {
  /** Message to re-send when the answer fails to decode; defaults to the question. */
  readonly onInvalid?: (input: string | undefined) => string
}
```

Added in v0.1.0

## State (interface)

The persisted state of a running coroutine: the log of completed steps
(answered prompts, performed effects and recorded activity results), whether
the pending prompt's question has already been asked, whether the coroutine has
returned, and - once it has - its `result` (the generator's `return` value).
`result` is what a parent reads when it composes a sub-coroutine and awaits its
outcome (design section 4.3).

**Signature**

```ts
export interface State<out A = unknown> {
  readonly log: ReadonlyArray<LogEntry>
  readonly asked: boolean
  readonly done: boolean
  /** The generator's return value, present exactly when `done` is `true`. */
  readonly result: Option.Option<A>
}
```

Added in v0.1.0
