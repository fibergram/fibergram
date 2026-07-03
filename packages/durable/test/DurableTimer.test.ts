import { it } from "@effect/vitest"
import { Duration, Effect, Ref } from "effect"
import { TestClock } from "effect/testing"
import { KeyValueStore } from "effect/unstable/persistence"
import { describe, expect } from "vitest"

import { DurableTimer } from "@fibergram/durable"

import type { DialogAddress } from "@fibergram/core"

const addr = (chatId: number): DialogAddress.DialogAddress => ({ chatId, kind: "rpg" })

const record = (fired: Ref.Ref<ReadonlyArray<string>>) =>
(address: DialogAddress.DialogAddress, key: string) =>
  Ref.update(fired, (all) => [...all, `${address.chatId}:${key}`])

describe("DurableTimer", () => {
  it.effect("fires onFire once the (durable) delay elapses, not before", () =>
    Effect.gen(function* () {
      const fired = yield* Ref.make<ReadonlyArray<string>>([])
      const kvs = yield* KeyValueStore.KeyValueStore
      const timer = yield* DurableTimer.make({ store: kvs, onFire: record(fired) })

      yield* timer.schedule({ address: addr(1), key: "turn", delay: Duration.days(3) })

      yield* TestClock.adjust(Duration.days(1))
      expect(yield* Ref.get(fired)).toEqual([])

      yield* TestClock.adjust(Duration.days(2))
      expect(yield* Ref.get(fired)).toEqual(["1:turn"])
    }).pipe(Effect.scoped, Effect.provide(KeyValueStore.layerMemory)))

  it.effect("cancel disarms a pending timer", () =>
    Effect.gen(function* () {
      const fired = yield* Ref.make<ReadonlyArray<string>>([])
      const kvs = yield* KeyValueStore.KeyValueStore
      const timer = yield* DurableTimer.make({ store: kvs, onFire: record(fired) })

      yield* timer.schedule({ address: addr(1), key: "turn", delay: Duration.days(3) })
      yield* timer.cancel(addr(1), "turn")

      yield* TestClock.adjust(Duration.days(4))
      expect(yield* Ref.get(fired)).toEqual([])
    }).pipe(Effect.scoped, Effect.provide(KeyValueStore.layerMemory)))

  it.effect("re-scheduling the same key replaces the deadline", () =>
    Effect.gen(function* () {
      const fired = yield* Ref.make<ReadonlyArray<string>>([])
      const kvs = yield* KeyValueStore.KeyValueStore
      const timer = yield* DurableTimer.make({ store: kvs, onFire: record(fired) })

      yield* timer.schedule({ address: addr(1), key: "turn", delay: Duration.days(1) })
      // Re-arm the same (address, key) further out; the first deadline must not fire.
      yield* timer.schedule({ address: addr(1), key: "turn", delay: Duration.days(5) })

      yield* TestClock.adjust(Duration.days(2))
      expect(yield* Ref.get(fired)).toEqual([])

      yield* TestClock.adjust(Duration.days(4))
      expect(yield* Ref.get(fired)).toEqual(["1:turn"])
    }).pipe(Effect.scoped, Effect.provide(KeyValueStore.layerMemory)))

  it.effect("survives a restart: a new engine reloads persisted timers and re-arms the remaining delay", () =>
    Effect.gen(function* () {
      const fired = yield* Ref.make<ReadonlyArray<string>>([])
      const kvs = yield* KeyValueStore.KeyValueStore

      // Process A arms a 3-day timer, then "crashes" (its scope closes) before it fires.
      yield* Effect.scoped(
        Effect.gen(function* () {
          const timer = yield* DurableTimer.make({ store: kvs, onFire: record(fired) })
          yield* timer.schedule({ address: addr(1), key: "turn", delay: Duration.days(3) })
        })
      )

      // A day passes during the downtime; the timer is not lost, just unarmed.
      yield* TestClock.adjust(Duration.days(1))
      expect(yield* Ref.get(fired)).toEqual([])

      // Process B restarts over the same store: it must reload the timer with ~2 days left.
      yield* Effect.scoped(
        Effect.gen(function* () {
          yield* DurableTimer.make({ store: kvs, onFire: record(fired) })
          yield* TestClock.adjust(Duration.days(2))
          expect(yield* Ref.get(fired)).toEqual(["1:turn"])
        })
      )
    }).pipe(Effect.scoped, Effect.provide(KeyValueStore.layerMemory)))
})
