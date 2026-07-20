import { it } from "@effect/vitest"
import { Effect, Option, Schema } from "effect"
import { describe, expect } from "vitest"

import { Command } from "../src/index.js"

import type { BotApi } from "../src/client/index.js"

const msg = (text: string): BotApi.Update => ({
  updateId: 1,
  message: { messageId: 1, date: 0, chat: { id: 1, type: "private" }, text }
})

const setAge = Command.make("/setage", Schema.Struct({ age: Schema.NumberFromString }))
const coords = Command.make(
  "coords",
  Schema.Struct({ x: Schema.NumberFromString, y: Schema.NumberFromString })
)
const ping = Command.make("/ping")

describe("Command", () => {
  it.effect("matches its command and decodes a single-field tail", () =>
    Effect.gen(function* () {
      const parsed = setAge.parse(msg("/setage 30"))
      expect(Option.isSome(parsed)).toBe(true)
      const args = yield* Option.getOrThrow(parsed)
      expect(args).toEqual({ age: 30 })
    }))

  it.effect("also matches the /command@botname form used in groups", () =>
    Effect.gen(function* () {
      const args = yield* Option.getOrThrow(setAge.parse(msg("/setage@mybot 25")))
      expect(args).toEqual({ age: 25 })
    }))

  it("does not match a different command or plain text", () => {
    expect(Option.isNone(setAge.match(msg("/other 1")))).toBe(true)
    expect(Option.isNone(setAge.match(msg("hello")))).toBe(true)
  })

  it("matches is a boolean sugar over match", () => {
    expect(Command.matches(ping, msg("/ping"))).toBe(true)
    expect(Command.matches(ping, msg("/ping@bot"))).toBe(true)
    expect(Command.matches(setAge, msg("/setage 30"))).toBe(true)
    expect(Command.matches(ping, msg("/other"))).toBe(false)
    expect(Command.matches(ping, msg("hello"))).toBe(false)
  })

  it.effect("zips whitespace tokens onto multiple fields positionally", () =>
    Effect.gen(function* () {
      const args = yield* Option.getOrThrow(coords.parse(msg("/coords 3 4")))
      expect(args).toEqual({ x: 3, y: 4 })
    }))

  it.effect("fails CommandArgsError when a required argument is missing", () =>
    Effect.gen(function* () {
      const parsed = coords.parse(msg("/coords 3"))
      const error = yield* Effect.flip(Option.getOrThrow(parsed))
      expect(error._tag).toBe("CommandArgsError")
    }))

  it.effect("supports argument-less commands", () =>
    Effect.gen(function* () {
      const parsed = ping.parse(msg("/ping"))
      expect(Option.isSome(parsed)).toBe(true)
      const args = yield* Option.getOrThrow(parsed)
      expect(args).toEqual({})
    }))
})
