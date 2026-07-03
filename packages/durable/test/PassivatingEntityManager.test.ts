import { it } from "@effect/vitest"
import { Duration, Effect, Option } from "effect"
import { TestClock } from "effect/testing"
import { describe, expect } from "vitest"

import { Dedup, Dialog, DialogAddress, DialogStore } from "@fibergram/core"
import { Updates } from "@fibergram/core/testing"
import { PassivatingEntityManager, PersistedDialogStore } from "@fibergram/durable"

// A pure counter: no effects, no client. State lives entirely in the store, so
// asserting on the store proves rehydration preserved it.
const counter = Dialog.make<{ readonly count: number }, { readonly _tag: "Tick" }, never, never>({
  kind: "counter",
  initialState: { count: 0 },
  reduce: (state, event) => (event._tag === "Tick" ? { count: state.count + 1 } : state),
  decide: () => Effect.succeed({ events: [{ _tag: "Tick" as const }], effects: [] })
})

const keyFor = (chatId: number) => DialogAddress.toKey({ chatId, kind: "counter" })

// Eviction runs on the address fiber after its timed `take` expires; give the
// scheduler room to run it, then assert.
const eventually = (check: Effect.Effect<boolean>): Effect.Effect<void> =>
  Effect.gen(function* () {
    for (let i = 0; i < 10_000; i++) {
      if (yield* check) return
      yield* Effect.yieldNow
    }
  })

describe("PassivatingEntityManager", () => {
  it.effect("passivates an idle address and rehydrates it, preserving state", () =>
    Effect.gen(function* () {
      const store = yield* DialogStore.DialogStore
      const manager = yield* PassivatingEntityManager.make({
        dialog: counter,
        passivateAfter: Duration.minutes(1)
      })
      const key = keyFor(5)

      yield* manager.send(Updates.text({ updateId: 1, chatId: 5, text: "a" }))
      yield* manager.awaitIdle
      expect(yield* manager.activeCount).toBe(1)
      expect(yield* store.load(key)).toEqual(Option.some({ count: 1 }))

      // Idle past the threshold: the address should evict itself from memory.
      yield* TestClock.adjust(Duration.minutes(2))
      yield* eventually(Effect.map(manager.activeCount, (n) => n === 0))
      expect(yield* manager.activeCount).toBe(0)
      // State is untouched by eviction - it was in the store all along.
      expect(yield* store.load(key)).toEqual(Option.some({ count: 1 }))

      // The next update rehydrates the address and continues from the saved count.
      yield* manager.send(Updates.text({ updateId: 2, chatId: 5, text: "b" }))
      yield* manager.awaitIdle
      expect(yield* manager.activeCount).toBe(1)
      expect(yield* store.load(key)).toEqual(Option.some({ count: 2 }))
    }).pipe(Effect.scoped, Effect.provide([PersistedDialogStore.layerMemory, Dedup.layerMemory])))

  it.effect("loses no update across repeated passivation cycles", () =>
    Effect.gen(function* () {
      const store = yield* DialogStore.DialogStore
      const manager = yield* PassivatingEntityManager.make({
        dialog: counter,
        passivateAfter: Duration.seconds(30)
      })
      const key = keyFor(9)

      // Force an evict/rehydrate boundary between every update; all five must land.
      for (let i = 1; i <= 5; i++) {
        yield* manager.send(Updates.text({ updateId: i, chatId: 9, text: `u${i}` }))
        yield* manager.awaitIdle
        yield* TestClock.adjust(Duration.minutes(1))
        yield* eventually(Effect.map(manager.activeCount, (n) => n === 0))
      }

      expect(yield* store.load(key)).toEqual(Option.some({ count: 5 }))
    }).pipe(Effect.scoped, Effect.provide([PersistedDialogStore.layerMemory, Dedup.layerMemory])))
})
