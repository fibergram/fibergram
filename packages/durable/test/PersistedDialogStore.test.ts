import { it } from "@effect/vitest"
import { Effect, Option, Schema } from "effect"
import { describe, expect } from "vitest"

import { Coroutine, Dedup, DialogStore } from "@fibergram/core"
import { PassivatingEntityManager, PersistedDialogStore } from "@fibergram/durable"
import { TestTelegram, Updates } from "@fibergram/testing"

// A two-question wizard: the canonical long-lived dialog whose progress must
// outlive a restart.
const wizard = Coroutine.make("registration", function* (d) {
  const name = yield* d.prompt("Name?", Schema.NonEmptyString)
  const age = yield* d.prompt("Age?", Schema.NumberFromString)
  yield* d.reply(`Ok, ${name}, ${age}`)
})

describe("PersistedDialogStore", () => {
  it.effect("round-trips folded state, and reports a miss as None", () =>
    Effect.gen(function* () {
      const store = yield* DialogStore.DialogStore
      yield* store.save("registration:1::", { count: 3, tag: "x" })

      expect(yield* store.load("registration:1::")).toEqual(Option.some({ count: 3, tag: "x" }))
      expect(yield* store.load("registration:missing::")).toEqual(Option.none())
    }).pipe(Effect.provide(PersistedDialogStore.layerMemory)))

  it.effect("a wizard survives a restart and replays to completion", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      // Each `feed` is a fresh scope/manager (== a process lifetime): all in-memory
      // fibers die between calls, so only the persisted store carries progress.
      const feed = (update: ReturnType<typeof Updates.text>) =>
        PassivatingEntityManager.run({ updates: Updates.stream([update]), dialog: wizard }).pipe(
          Effect.scoped,
          Effect.provide(tg.layer)
        )

      // Process A: kick the wizard off (asks "Name?"), answer "Ada" (asks "Age?").
      yield* feed(Updates.text({ updateId: 1, chatId: 7, text: "start" }))
      yield* feed(Updates.text({ updateId: 2, chatId: 7, text: "Ada" }))
      // RESTART: a brand-new process answers the age and the wizard finishes -
      // only possible if the persisted log replayed the earlier answer.
      yield* feed(Updates.text({ updateId: 3, chatId: 7, text: "42" }))

      const texts = (yield* tg.sent).map((params) => params.text)
      expect(texts).toEqual(["Name?", "Age?", "Ok, Ada, 42"])
    }).pipe(Effect.provide([PersistedDialogStore.layerMemory, Dedup.layerMemory])))
})
