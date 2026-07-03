
import { it } from "@effect/vitest"
import { Effect, Option, Ref, Schema, Stream } from "effect"
import { describe, expect } from "vitest"

import { Coroutine, Dedup, DialogStore, Dispatcher, UpdateContext } from "@fibergram/core"

import * as TestTelegram from "./TestTelegram.js"

import type { BotApi, TelegramClient, TelegramError } from "@fibergram/client"
import type { Dialog} from "@fibergram/core";

// The registration wizard, written as a coroutine.
const Age = Schema.NumberFromString.check(Schema.isBetween({ minimum: 0, maximum: 150 }))

const registration = Coroutine.make("registration", function* (d) {
  const name = yield* d.prompt("Name?", Schema.NonEmptyString)
  const age = yield* d.prompt("Age?", Age, {
    onInvalid: () => "Age must be a number. Age?"
  })
  yield* d.reply(`Ok, ${name}, ${age}`)
})

const run = (tg: TestTelegram.TestTelegram, updates: ReadonlyArray<BotApi.Update>) =>
  Dispatcher.run({ updates: Stream.fromIterable(updates), dialog: registration }).pipe(
    Effect.scoped,
    Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer])
  )

const runWith = <A>(
  dialog: Dialog.Dialog<
    Coroutine.State<A>,
    Coroutine.State<A>,
    TelegramError.TelegramError,
    TelegramClient.TelegramClient
  >,
  tg: TestTelegram.TestTelegram,
  updates: ReadonlyArray<BotApi.Update>
) =>
  Dispatcher.run({ updates: Stream.fromIterable(updates), dialog }).pipe(
    Effect.scoped,
    Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer])
  )

// Drives one `decide` step directly (no dispatcher), stamping the per-update
// UpdateContext the way EntityManager does so inline `Chat.*` sends resolve.
const decideWith = <A>(
  dialog: Dialog.Dialog<
    Coroutine.State<A>,
    Coroutine.State<A>,
    TelegramError.TelegramError,
    TelegramClient.TelegramClient
  >,
  state: Coroutine.State<A>,
  update: BotApi.Update
) =>
  Effect.flatMap(
    UpdateContext.fromAddress({ kind: dialog.kind, chatId: update.message!.chat.id }, update),
    (env) => dialog.decide(state, update).pipe(UpdateContext.provide(env))
  )

const texts = (tg: TestTelegram.TestTelegram) =>
  Effect.map(Ref.get(tg.sent), (sent) => sent.map((s) => s.text))

describe("Coroutine — registration wizard", () => {
  it.effect("prompts step by step and completes with the collected answers", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      yield* run(tg, [
        TestTelegram.textUpdate(1, 100, "/register"),
        TestTelegram.textUpdate(2, 100, "Alice"),
        TestTelegram.textUpdate(3, 100, "30")
      ])

      expect(yield* texts(tg)).toEqual(["Name?", "Age?", "Ok, Alice, 30"])
    }))

  it.effect("re-prompts on an invalid answer without advancing, then resumes", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      yield* run(tg, [
        TestTelegram.textUpdate(1, 100, "/register"),
        TestTelegram.textUpdate(2, 100, "Bob"),
        TestTelegram.textUpdate(3, 100, "not-a-number"),
        TestTelegram.textUpdate(4, 100, "42")
      ])

      expect(yield* texts(tg)).toEqual([
        "Name?",
        "Age?",
        "Age must be a number. Age?",
        "Ok, Bob, 42"
      ])
    }))

  it.effect("does not re-send prompts on replay after completion (determinism)", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      yield* run(tg, [
        TestTelegram.textUpdate(1, 100, "/register"),
        TestTelegram.textUpdate(2, 100, "Carol"),
        TestTelegram.textUpdate(3, 100, "7"),
        // Extra update after the wizard finished: must produce nothing.
        TestTelegram.textUpdate(4, 100, "hello?")
      ])

      expect(yield* texts(tg)).toEqual(["Name?", "Age?", "Ok, Carol, 7"])
    }))

  it.effect("keeps two chats' wizards independent", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      yield* run(tg, [
        TestTelegram.textUpdate(1, 100, "/register"),
        TestTelegram.textUpdate(2, 200, "/register"),
        TestTelegram.textUpdate(3, 100, "Ann"),
        TestTelegram.textUpdate(4, 200, "Ben"),
        TestTelegram.textUpdate(5, 100, "1"),
        TestTelegram.textUpdate(6, 200, "2")
      ])

      const sent = yield* Ref.get(tg.sent)
      const forChat = (id: number) => sent.filter((s) => s.chatId === id).map((s) => s.text)
      expect(forChat(100)).toEqual(["Name?", "Age?", "Ok, Ann, 1"])
      expect(forChat(200)).toEqual(["Name?", "Age?", "Ok, Ben, 2"])
    }))
})

describe("Coroutine — durable activity (d.run) and divergence guard", () => {
  it.effect("records a d.run result that a later `if` branches on deterministically", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const dice = Coroutine.make("dice", function* (d) {
        const roll = yield* d.run(Effect.succeed(7), Schema.Number)
        yield* (roll > 5 ? d.reply(`high ${roll}`) : d.reply(`low ${roll}`));
      })

      yield* runWith(dice, tg, [TestTelegram.textUpdate(1, 100, "/play")])

      expect(yield* texts(tg)).toEqual(["high 7"])
    }))

  it.effect("runs its activity once and replays the recorded result across a suspend", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const runs = yield* Ref.make(0)
      const once = Coroutine.make("once", function* (d) {
        const answer = yield* d.run(
          Ref.updateAndGet(runs, (n) => n + 1).pipe(Effect.as(42)),
          Schema.Number
        )
        const name = yield* d.prompt("name?", Schema.NonEmptyString)
        yield* d.reply(`${name}:${answer}`)
      })

      yield* runWith(once, tg, [
        TestTelegram.textUpdate(1, 100, "/start"),
        TestTelegram.textUpdate(2, 100, "Ann")
      ])

      // The prompt forces a replay on update 2; the activity must not run again.
      expect(yield* texts(tg)).toEqual(["name?", "Ann:42"])
      expect(yield* Ref.get(runs)).toBe(1)
    }))

  it.effect("dies with NonDeterminismError when a replay takes a different branch", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      let branch = true
      const diverge = Coroutine.make("diverge", function* (d) {
        // A non-deterministic branch: `branch` is not persisted, so flipping it
        // between updates changes the recorded step sequence.
        if (branch) yield* d.reply("A")
        yield* d.prompt("q?", Schema.NonEmptyString)
        yield* d.reply("done")
      })

      // Turn 1 (branch = true): "A" is recorded at position 0, then we suspend.
      const first = yield* decideWith(diverge, diverge.initialState, TestTelegram.textUpdate(1, 100, "/x"))
        .pipe(Effect.provide(tg.layer))
      const state1 = first.events[0]!

      // Turn 2 with the branch flipped: the prompt now lands where a `say` was
      // recorded → divergence is caught instead of silently feeding a bad value.
      branch = false
      const cause = yield* decideWith(diverge, state1, TestTelegram.textUpdate(2, 100, "hello"))
        .pipe(Effect.catchCause((c) => Effect.succeed(c)), Effect.provide(tg.layer))

      expect(String(cause)).toContain("NonDeterminismError")
    }))
})

describe("Coroutine — effect ordering and composition", () => {
  it.effect("performs reply/effect/run in program order, not run-first", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const events = yield* Ref.make<ReadonlyArray<string>>([])
      const push = (label: string) => Ref.update(events, (xs) => [...xs, label])

      const ordered = Coroutine.make("ordered", function* (d) {
        yield* d.effect(push("before"))
        yield* d.run(push("run").pipe(Effect.as(1)), Schema.Number)
        yield* d.effect(push("after"))
      })

      yield* runWith(ordered, tg, [TestTelegram.textUpdate(1, 100, "/go")])

      // Before inline execution, the inline `run` jumped ahead of the deferred
      // `effect`s and this was ["run", "before", "after"].
      expect(yield* Ref.get(events)).toEqual(["before", "run", "after"])
    }))

  it.effect("composes a sub-coroutine by delegation, flowing its return value up", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make

      // A reusable sub-coroutine body: a plain generator over the same Dsl.
      const askName = function* (
        d: Coroutine.Dsl<TelegramError.TelegramError, TelegramClient.TelegramClient>
      ) {
        const name = yield* d.prompt("Name?", Schema.NonEmptyString)
        return name
      }

      const parent = Coroutine.make("parent", function* (d) {
        const name = yield* askName(d)
        const age = yield* d.prompt("Age?", Age)
        yield* d.reply(`${name} is ${age}`)
      })

      yield* runWith(parent, tg, [
        TestTelegram.textUpdate(1, 100, "/x"),
        TestTelegram.textUpdate(2, 100, "Alice"),
        TestTelegram.textUpdate(3, 100, "30")
      ])

      // The child's prompt shares the parent's one log and replays correctly, and
      // its `return` flows into the parent as `name`.
      expect(yield* texts(tg)).toEqual(["Name?", "Age?", "Alice is 30"])
    }))

  it.effect("captures the generator's return value in State.result once done", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const summary = Coroutine.make("summary", function* (d) {
        const name = yield* d.prompt("Name?", Schema.NonEmptyString)
        return { name }
      })

      // Turn 1: still asking → no result yet.
      const first = yield* decideWith(summary, summary.initialState, TestTelegram.textUpdate(1, 100, "/x"))
        .pipe(Effect.provide(tg.layer))
      const state1 = first.events[0]!
      expect(state1.done).toBe(false)
      expect(Option.isNone(state1.result)).toBe(true)

      // Turn 2: the answer completes the coroutine, surfacing its return value.
      const second = yield* decideWith(summary, state1, TestTelegram.textUpdate(2, 100, "Bob"))
        .pipe(Effect.provide(tg.layer))
      const state2 = second.events[0]!
      expect(state2.done).toBe(true)
      expect(Option.getOrNull(state2.result)).toStrictEqual({ name: "Bob" })
    }))
})
