import { describe, expect, it } from "vitest"

import { Emoji } from "../src/ui/index.js"

describe("Emoji", () => {
  it("get looks up a single emoji by name", () => {
    expect(Emoji.get("tada")).toBe("🎉")
    expect(Emoji.get("fire")).toBe("🔥")
  })

  it("emoji tagged template substitutes names for unicode", () => {
    const message = Emoji.emoji`Congrats ${"tada"}${"tada"} you did it ${"fire"}`
    expect(message).toBe("Congrats 🎉🎉 you did it 🔥")
  })

  it("template with no interpolations returns the raw text", () => {
    expect(Emoji.emoji`just text`).toBe("just text")
  })

  it("every table value is a non-empty string", () => {
    for (const value of Object.values(Emoji.emojis)) {
      expect(value.length).toBeGreaterThan(0)
    }
  })
})
