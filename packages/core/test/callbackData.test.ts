import { it } from "@effect/vitest"
import { Effect, Option, Schema } from "effect"
import { describe, expect } from "vitest"

import { CallbackData } from "@fibergram/core"

const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number, up: Schema.Boolean }))

describe("CallbackData codec (§5.3)", () => {
  it.effect("round-trips a value through encode/decode inline", () =>
    Effect.gen(function* () {
      const data = yield* Vote.encode({ id: 42, up: true })
      expect(data.startsWith("vote:")).toBe(true)
      const back = yield* Vote.decode(data)
      expect(back).toEqual({ id: 42, up: true })
    }))

  it.effect("matches only its own prefix and parses accordingly", () =>
    Effect.gen(function* () {
      const data = yield* Vote.encode({ id: 1, up: false })
      expect(Vote.matches(data)).toBe(true)
      expect(Vote.matches("other:1")).toBe(false)
      expect(Option.isSome(Vote.parse(data))).toBe(true)
      expect(Option.isNone(Vote.parse("other:1"))).toBe(true)
    }))

  it.effect("fails CallbackDataTooLong on overflow when no store is provided (§11.4)", () =>
    Effect.gen(function* () {
      const Big = CallbackData.make("big", Schema.Struct({ text: Schema.String }))
      const error = yield* Effect.flip(Big.encode({ text: "x".repeat(200) }))
      expect(error._tag).toBe("CallbackDataTooLong")
    }))

  it.effect("spills to CallbackStore on overflow and decodes back (§11.4)", () =>
    Effect.gen(function* () {
      const Big = CallbackData.make("big", Schema.Struct({ text: Schema.String }))
      const value = { text: "x".repeat(200) }
      const data = yield* Big.encode(value)
      // The button carries a short store key, not the payload.
      expect(data.startsWith("big#")).toBe(true)
      expect(data.length).toBeLessThanOrEqual(64)
      const back = yield* Big.decode(data)
      expect(back).toEqual(value)
    }).pipe(Effect.provide(CallbackData.layerMemory)))

  it.effect("reports malformed data instead of throwing", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(Vote.decode("vote:not json"))
      expect(error._tag).toBe("CallbackDataMalformed")
    }))

  it.effect("builds an inline button carrying the encoded payload", () =>
    Effect.gen(function* () {
      const button = yield* Vote.button("👍", { id: 7, up: true })
      expect(button.text).toBe("👍")
      expect(button.callbackData).toBeDefined()
      const back = yield* Vote.decode(button.callbackData!)
      expect(back).toEqual({ id: 7, up: true })
    }))
})
