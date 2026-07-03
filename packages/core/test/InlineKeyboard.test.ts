import { it } from "@effect/vitest"
import { Effect, Schema } from "effect"
import { describe, expect } from "vitest"

import { CallbackData } from "../src/index.js"
import { InlineKeyboard } from "../src/ui/index.js"

const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number }))

describe("InlineKeyboard", () => {
  it.effect("builds rows of static buttons, dropping empty rows", () =>
    Effect.gen(function* () {
      const keyboard = InlineKeyboard.empty
        .url("Docs", "https://effect.website")
        .row()
        .text("Ping", "ping")
        .text("Pong", "pong")
        .row() // trailing empty row must be dropped
      const markup = yield* InlineKeyboard.build(keyboard)
      expect(markup).toEqual({
        inlineKeyboard: [
          [{ text: "Docs", url: "https://effect.website" }],
          [{ text: "Ping", callbackData: "ping" }, { text: "Pong", callbackData: "pong" }]
        ]
      })
    }))

  it.effect("encodes a typed CallbackData button via .data", () =>
    Effect.gen(function* () {
      const keyboard = InlineKeyboard.empty.data("Upvote", Vote, { id: 42 })
      const markup = yield* InlineKeyboard.build(keyboard)
      const button = markup.inlineKeyboard[0]?.[0]
      expect(button?.text).toBe("Upvote")
      expect(button?.callbackData).toBe("vote:{\"id\":42}")
      // The encoded payload round-trips through the same codec.
      const back = yield* Vote.decode(button?.callbackData ?? "")
      expect(back).toEqual({ id: 42 })
    }))

  it.effect("adjust reflows all buttons into the given column sizes (last repeats)", () =>
    Effect.gen(function* () {
      const keyboard = InlineKeyboard.empty
        .text("1", "1").text("2", "2").text("3", "3").text("4", "4").text("5", "5")
        .adjust(1, 2)
      const markup = yield* InlineKeyboard.build(keyboard)
      // sizes 1, 2, then 2 repeats: [1] [2 3] [4 5]
      expect(markup.inlineKeyboard.map((row) => row.map((b) => b.text))).toEqual([
        ["1"], ["2", "3"], ["4", "5"]
      ])
    }))

  it.effect("covers webApp, login, switchInline, copyText, pay button kinds", () =>
    Effect.gen(function* () {
      const keyboard = InlineKeyboard.empty
        .webApp("App", "https://app.example").row()
        .login("Login", "https://login.example").row()
        .switchInline("Share", "q").row()
        .switchInlineCurrent("Here").row()
        .copyText("Copy", "secret").row()
        .pay("Pay")
      const markup = yield* InlineKeyboard.build(keyboard)
      expect(markup.inlineKeyboard).toEqual([
        [{ text: "App", webApp: { url: "https://app.example" } }],
        [{ text: "Login", loginUrl: { url: "https://login.example" } }],
        [{ text: "Share", switchInlineQuery: "q" }],
        [{ text: "Here", switchInlineQueryCurrentChat: "" }],
        [{ text: "Copy", copyText: { text: "secret" } }],
        [{ text: "Pay", pay: true }]
      ])
    }))

  it.effect("fails CallbackDataTooLong when a typed payload overflows and no store is provided", () =>
    Effect.gen(function* () {
      const Big = CallbackData.make("big", Schema.Struct({ text: Schema.String }))
      const keyboard = InlineKeyboard.empty.data("x", Big, { text: "y".repeat(200) })
      const error = yield* Effect.flip(InlineKeyboard.build(keyboard))
      expect(error._tag).toBe("CallbackDataTooLong")
    }))

  it("from builds a keyboard from an existing matrix", () => {
    const keyboard = InlineKeyboard.from([[{ text: "A", callbackData: "a" }]])
    expect(keyboard.rows.length).toBe(1)
  })
})
