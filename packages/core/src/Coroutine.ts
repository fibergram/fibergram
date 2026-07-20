/**
 * `Coroutine` - the ergonomic DSL that elaborates into the `Dialog` decider
 * (D2). A wizard reads top-to-bottom as a generator:
 *
 * ```ts
 * Coroutine.make("registration", function* (d) {
 *   const name = yield* d.prompt("Name?", Schema.NonEmptyString)
 *   const age = yield* d.prompt("Age?", Schema.NumberFromString)
 *   yield* d.reply(`Ok, ${name}, ${age}`)
 * })
 * ```
 *
 * Each `prompt` is an **atomic step boundary**: the coroutine sends its question,
 * suspends until the next update, and resumes with the decoded answer. The driver
 * is **replay-based** (the Temporal/Effect-Workflow model): on every
 * update it re-runs the generator from the top, feeding already-answered prompts
 * from persisted state and performing each side effect exactly once, **in program
 * order** (a `reply` before a `run` sends before the activity runs).
 *
 * Keep the code between prompts deterministic. `if`/`while`/`for` are ordinary
 * control flow and work as long as every branch condition is a pure function of
 * persisted data (prior `prompt` answers, `run` results). To branch on
 * non-deterministic or external data - the clock, a random roll, a DB read -
 * fetch it through `d.run`, which records the result so replay is deterministic.
 * A branch on inline non-deterministic data diverges on replay and is caught as a
 * {@link NonDeterminismError} rather than silently corrupting state.
 *
 * **Composition.** A coroutine body is a plain generator, so one composes into
 * another by generator delegation - `const r = yield* childBody(d)` runs the
 * child's steps inline in the parent's single log and resumes the parent with the
 * child's `return` value. Standalone, the same value surfaces as {@link State.result}
 * once the coroutine is `done`.
 *
 * @since 0.1.0
 */
import { Data, Effect, Option, Schema } from "effect"

import * as Chat from "./Chat.js"
import * as Decision from "./Decision.js"
import * as Keyboard from "./ui/Keyboard.js"

import type { BotApi, TelegramClient, TelegramError } from "./client/index.js"
import type { Dialog } from "./Dialog.js"

/** A step recorded in the coroutine's persisted log. */
type LogEntry =
  | { readonly _tag: "answer"; readonly value: unknown }
  | { readonly _tag: "said" }
  | { readonly _tag: "result"; readonly value: unknown }

/**
 * Raised as a **defect** when a replay diverges from the persisted log: the
 * generator yielded a different step than the one recorded at `position`, or it
 * finished before consuming every recorded step. This is
 * the workflow-determinism footgun made loud - a non-deterministic branch (an
 * `if` on `Date.now()`, `Math.random()`, or an inline external read) takes a
 * different path on replay, and instead of silently feeding the wrong value into
 * a later step, the driver dies here. Fetch non-deterministic data through
 * {@link Dsl.run} so its result is recorded and replayed instead.
 *
 * @category errors
 * @since 0.1.0
 */
export class NonDeterminismError extends Data.TaggedError("NonDeterminismError")<{
  readonly kind: string
  readonly position: number
  readonly expected: string
  readonly got: string
}> {}

/**
 * The persisted state of a running coroutine: the log of completed steps
 * (answered prompts, performed effects and recorded activity results), whether
 * the pending prompt's question has already been asked, whether the coroutine has
 * returned, and - once it has - its `result` (the generator's `return` value).
 * `result` is what a parent reads when it composes a sub-coroutine and awaits its
 * outcome.
 *
 * @category models
 * @since 0.1.0
 */
export interface State<out A = unknown> {
  readonly log: ReadonlyArray<LogEntry>
  readonly asked: boolean
  readonly done: boolean
  /** The generator's return value, present exactly when `done` is `true`. */
  readonly result: Option.Option<A>
}

/** One suspension point yielded by the generator. */
type Op<E, R> =
  | {
    readonly _tag: "prompt"
    readonly question: string
    readonly schema: Schema.Codec<any>
    readonly onInvalid: ((input: string | undefined) => string) | undefined
    readonly replyMarkup: Chat.ReplyMarkup | undefined
  }
  | { readonly _tag: "say"; readonly effect: Effect.Effect<void, E, R> }
  | {
    readonly _tag: "run"
    readonly effect: Effect.Effect<any, E, R>
    readonly schema: Schema.Codec<any>
  }

/** A single-yield iterable so `yield* d.prompt(...)` returns the decoded value. */
interface Suspend<A> {
  readonly [Symbol.iterator]: () => Iterator<Op<any, any>, A, any>
}

// A single-yield iterable that resumes the generator with `map(sent)` (identity
// when `map` is omitted). `map` runs on every replay, so it must be a pure
// function of `sent` (e.g. a label→id lookup) to stay deterministic.
const single = <A>(op: Op<any, any>, map?: (sent: unknown) => A): Suspend<A> => ({
  [Symbol.iterator]() {
    let yielded = false
    return {
      next(sent: unknown): IteratorResult<Op<any, any>, A> {
        if (yielded) return { done: true, value: (map ? map(sent) : sent) as A }
        yielded = true
        return { done: false, value: op }
      }
    }
  }
})

/**
 * Options for {@link Dsl.prompt}.
 *
 * @category models
 * @since 0.1.0
 */
export interface PromptOptions {
  /** Message to re-send when the answer fails to decode; defaults to the question. */
  readonly onInvalid?: (input: string | undefined) => string
  /**
   * Reply markup sent with the question - an inline keyboard, a custom reply
   * keyboard, or a keyboard-removal. Re-sent (with the `onInvalid` text) when an
   * answer fails to decode, so a keyboard-backed prompt reappears on a bad tap.
   */
  readonly replyMarkup?: Chat.ReplyMarkup
}

/**
 * A tappable option for {@link Dsl.choose}: the visible `label` (shown on the
 * reply-keyboard button and matched against the user's reply) maps back to a
 * stable `id` the wizard branches on. Keeping the two apart lets button text be
 * localized or renamed without touching the wizard's control flow.
 *
 * @category models
 * @since 0.1.0
 */
export interface Choice<Id extends string> {
  readonly id: Id
  readonly label: string
}

/**
 * Options for {@link Dsl.choose}.
 *
 * @category models
 * @since 0.1.0
 */
export interface ChooseOptions {
  /** Reply-keyboard column count (buttons reflow into rows of this width); default `2`. */
  readonly columns?: number
  /** Message to re-send (with the keyboard) when the reply matches no label; defaults to the question. */
  readonly onInvalid?: (input: string | undefined) => string
}

/**
 * The coroutine's toolbox, passed to the generator.
 *
 * @category models
 * @since 0.1.0
 */
export interface Dsl<E, R> {
  /** Ask `question`, suspend, and resume with the next update's text decoded by `schema`. */
  readonly prompt: <A, I>(
    question: string,
    schema: Schema.Codec<A, I>,
    options?: PromptOptions
  ) => Suspend<A>
  /**
   * A single-choice keyboard step: send `question` with a one-time reply keyboard
   * of the choices' `label`s, suspend, and resume with the tapped choice's `id`.
   * A typed answer that matches a label works too; anything else re-asks (with
   * `onInvalid`). Collapses the send-keyboard-then-prompt-then-map-label dance
   * into one call, so a wizard branches on stable ids without hand-rolling the
   * keyboard.
   */
  readonly choose: <Id extends string>(
    question: string,
    choices: ReadonlyArray<Choice<Id>>,
    options?: ChooseOptions
  ) => Suspend<Id>
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

const initialState: State<never> = { log: [], asked: false, done: false, result: Option.none() }

/**
 * Elaborates a coroutine `program` into a {@link module:Dialog.Dialog}. The
 * result is an ordinary decider - interoperable with hand-written dialogs and
 * runnable on any backend.
 *
 * @example
 * import { Coroutine } from "@fibergram/core"
 * import { Schema } from "effect"
 *
 * const registration = Coroutine.make("registration", function* (d) {
 *   const name = yield* d.prompt("Name?", Schema.NonEmptyString)
 *   const age = yield* d.prompt("Age?", Schema.NumberFromString)
 *   yield* d.reply(`Ok, ${name}, ${age}`)
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = <
  A = void,
  E = TelegramError.TelegramError,
  R = TelegramClient.TelegramClient
>(
  kind: string,
  program: (d: Dsl<E, R>) => Generator<Op<E, R>, A, any>
): Dialog<State<A>, State<A>, E, R> => {
  const dsl: Dsl<E, R> = {
    prompt: (question, schema, options) =>
      single({
        _tag: "prompt",
        question,
        schema: schema as Schema.Codec<any>,
        onInvalid: options?.onInvalid,
        replyMarkup: options?.replyMarkup
      }),
    choose: (question, choices, options) => {
      const labels = choices.map((choice) => choice.label)
      const columns = options?.columns ?? 2
      const keyboard = labels.reduce((kb, label) => kb.text(label), Keyboard.empty)
      const replyMarkup = Keyboard.build(keyboard.adjust(columns).resized().oneTime())
      const idByLabel = new Map(choices.map((choice) => [choice.label, choice.id] as const))
      return single(
        {
          _tag: "prompt",
          question,
          // `Schema.Literals` only admits a known label, so the resumed value is
          // always one of `labels`; the map back to an id cannot miss.
          schema: Schema.Literals(labels) as Schema.Codec<any>,
          onInvalid: options?.onInvalid,
          replyMarkup
        },
        (label) => idByLabel.get(label as string) ?? choices[0]!.id
      )
    },
    reply: (text, options) =>
      single({ _tag: "say", effect: Effect.asVoid(Chat.reply(text, options)) as Effect.Effect<void, E, R> }),
    effect: (effect) => single({ _tag: "say", effect }),
    run: (effect, schema) => single({ _tag: "run", effect, schema: schema as Schema.Codec<any> })
  }

  const ask = (question: string, replyMarkup: Chat.ReplyMarkup | undefined): Effect.Effect<void, E, R> =>
    Effect.asVoid(
      Chat.reply(question, replyMarkup !== undefined ? { replyMarkup } : undefined)
    ) as Effect.Effect<void, E, R>

  // On replay, the op the generator yields must match the step recorded at
  // `position`; a mismatch means the handler took a different path.
  const expectTag = (
    entry: LogEntry | undefined,
    expected: LogEntry["_tag"],
    position: number
  ): Effect.Effect<LogEntry> =>
    entry !== undefined && entry._tag === expected
      ? Effect.succeed(entry)
      : Effect.die(
        new NonDeterminismError({ kind, position, expected, got: entry?._tag ?? "missing" })
      )

  const decodePrompt = (
    schema: Schema.Codec<any>,
    text: string | undefined
  ): Effect.Effect<Option.Option<unknown>> =>
    text === undefined
      ? Effect.succeedNone
      : Effect.option(Schema.decodeUnknownEffect(schema)(text))

  const decide = (
    state: State<A>,
    update: BotApi.Update
  ): Effect.Effect<Decision.Decision<State<A>, E, R>, E, R> =>
    Effect.gen(function* () {
      const generator = program(dsl)
      const log: Array<LogEntry> = [...state.log]
      const boundary = state.log.length // ops before this were persisted; feed them back
      let cursor = 0
      let asked = state.asked
      let step = generator.next()

      while (step.done !== true) {
        const op = step.value

        if (op._tag === "say") {
          if (cursor < boundary) {
            // Replay: this effect already ran; do not run it again.
            yield* expectTag(state.log[cursor], "said", cursor)
            cursor++
            step = generator.next()
            continue
          }
          // Frontier: perform the effect now, in program order, then record it.
          yield* op.effect
          log.push({ _tag: "said" })
          cursor++
          step = generator.next()
          continue
        }

        if (op._tag === "run") {
          if (cursor < boundary) {
            // Replay: feed back the recorded result; do not re-run the activity.
            const entry = yield* expectTag(state.log[cursor], "result", cursor)
            const value = yield* Effect.orDie(
              Schema.decodeUnknownEffect(op.schema)((entry as { value: unknown }).value)
            )
            cursor++
            step = generator.next(value)
            continue
          }
          // Frontier: run the activity once and record its encoded result.
          const value = yield* op.effect
          const encoded = yield* Effect.orDie(Schema.encodeUnknownEffect(op.schema)(value))
          log.push({ _tag: "result", value: encoded })
          cursor++
          step = generator.next(value)
          continue
        }

        // op._tag === "prompt"
        if (cursor < boundary) {
          const entry = yield* expectTag(state.log[cursor], "answer", cursor)
          cursor++
          step = generator.next((entry as { value: unknown }).value)
          continue
        }

        // Live prompt at the frontier.
        if (!asked) {
          // First time here: ask the question (with its keyboard, if any) and
          // suspend without consuming `update`.
          yield* ask(op.question, op.replyMarkup)
          asked = true
          break
        }

        // The question was already asked: `update` is the answer.
        const decoded = yield* decodePrompt(op.schema, update.message?.text)
        if (Option.isNone(decoded)) {
          const message = op.onInvalid ? op.onInvalid(update.message?.text) : op.question
          // Re-ask with the keyboard so a choice step reappears on a bad tap.
          yield* ask(message, op.replyMarkup)
          break // stay suspended at the same prompt
        }
        log.push({ _tag: "answer", value: decoded.value })
        asked = false
        cursor++
        step = generator.next(decoded.value)
      }

      const done = step.done === true
      // The path shrank: the generator returned before consuming every recorded
      // step, so a prior run took a longer path.
      if (done && cursor < boundary) {
        yield* Effect.die(
          new NonDeterminismError({
            kind,
            position: cursor,
            expected: state.log[cursor]?._tag ?? "missing",
            got: "done"
          })
        )
      }
      // Capture the generator's return value once it completes, so a parent that
      // composed this coroutine can read its outcome from `result`.
      const result: Option.Option<A> = step.done === true
        ? Option.some(step.value)
        : Option.none()
      const nextState: State<A> = { log, asked: done ? false : asked, done, result }
      return Decision.make({ events: [nextState] })
    })

  return {
    kind,
    initialState,
    reduce: (_state, event) => event, // snapshot semantics: the event *is* the next state
    decide
  }
}
