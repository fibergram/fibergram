import { describe, expect, it } from "vitest"

import { Reaction } from "../src/ui/index.js"

describe("Reaction", () => {
  it("of builds a ReactionTypeEmoji", () => {
    expect(Reaction.of("🔥")).toEqual({ type: "emoji", emoji: "🔥" })
  })

  it("named constants are members of the closed list", () => {
    expect(Reaction.thumbsUp).toBe("👍")
    expect(Reaction.emojis).toContain(Reaction.thumbsUp)
    expect(Reaction.emojis).toContain(Reaction.fire)
    expect(Reaction.emojis).toContain(Reaction.heart)
  })

  it("isReactionEmoji refines against the closed list", () => {
    expect(Reaction.isReactionEmoji("🔥")).toBe(true)
    expect(Reaction.isReactionEmoji("🥑")).toBe(false)
  })

  it("the closed list has no duplicates", () => {
    expect(new Set(Reaction.emojis).size).toBe(Reaction.emojis.length)
  })
})
