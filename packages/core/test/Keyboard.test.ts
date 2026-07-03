import { Effect } from "effect"
import { describe, expect, it } from "vitest"

import { Keyboard } from "../src/ui/index.js"

describe("Keyboard", () => {
  it("builds rows with flags, dropping empty rows", () => {
    const markup = Keyboard.build(
      Keyboard.empty
        .text("Yes").text("No")
        .row()
        .requestContact("Share number")
        .row() // trailing empty row dropped
        .resized()
        .oneTime()
        .persistent()
        .placeholder("Choose…")
        .selective()
    )
    expect(markup).toEqual({
      keyboard: [
        [{ text: "Yes" }, { text: "No" }],
        [{ text: "Share number", requestContact: true }]
      ],
      resizeKeyboard: true,
      oneTimeKeyboard: true,
      isPersistent: true,
      inputFieldPlaceholder: "Choose…",
      selective: true
    })
  })

  it("covers request* and webApp button kinds", () => {
    const markup = Keyboard.build(
      Keyboard.empty
        .requestLocation("Where").row()
        .requestPoll("Quiz", "quiz").row()
        .requestUsers("Pick users", { requestId: 1, maxQuantity: 2 }).row()
        .requestChat("Pick chat", { requestId: 2, chatIsChannel: false }).row()
        .webApp("Open", "https://app.example")
    )
    expect(markup.keyboard).toEqual([
      [{ text: "Where", requestLocation: true }],
      [{ text: "Quiz", requestPoll: { type: "quiz" } }],
      [{ text: "Pick users", requestUsers: { requestId: 1, maxQuantity: 2 } }],
      [{ text: "Pick chat", requestChat: { requestId: 2, chatIsChannel: false } }],
      [{ text: "Open", webApp: { url: "https://app.example" } }]
    ])
  })

  it("adjust reflows buttons into columns", () => {
    const markup = Keyboard.build(
      Keyboard.empty.text("a").text("b").text("c").adjust(2)
    )
    expect(markup.keyboard.map((row) => row.map((b) => b.text))).toEqual([["a", "b"], ["c"]])
  })

  it("remove produces a ReplyKeyboardRemove", () => {
    expect(Keyboard.remove()).toEqual({ removeKeyboard: true })
    expect(Keyboard.remove({ selective: true })).toEqual({ removeKeyboard: true, selective: true })
  })

  // Type-level: a built keyboard is a plain value, no Effect needed (unlike inline).
  it("build is synchronous", () => {
    const markup: unknown = Keyboard.build(Keyboard.empty.text("x"))
    expect(Effect.isEffect(markup)).toBe(false)
  })
})
