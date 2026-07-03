import { describe, expect, it } from "vitest"

import { Fmt } from "../src/ui/index.js"

describe("Fmt", () => {
  it("concat shifts nested entity offsets by preceding text length", () => {
    const result = Fmt.concat("Hello, ", Fmt.bold("world"), "!")
    expect(result.text).toBe("Hello, world!")
    expect(result.entities).toEqual([{ type: "bold", offset: 7, length: 5 }])
  })

  it("nests styles, keeping outer-then-inner entities with correct offsets", () => {
    const result = Fmt.bold("a ", Fmt.italic("b"), " c")
    expect(result.text).toBe("a b c")
    expect(result.entities).toEqual([
      { type: "bold", offset: 0, length: 5 },
      { type: "italic", offset: 2, length: 1 }
    ])
  })

  it("fmt tagged template interpolates content and computes offsets", () => {
    const result = Fmt.fmt`Hi ${Fmt.bold("Ada")}, see ${Fmt.link("docs", "https://effect.website")}`
    expect(result.text).toBe("Hi Ada, see docs")
    expect(result.entities).toEqual([
      { type: "bold", offset: 3, length: 3 },
      { type: "text_link", offset: 12, length: 4, url: "https://effect.website" }
    ])
  })

  it("code and pre produce leaf entities (pre carries an optional language)", () => {
    expect(Fmt.code("npm i")).toEqual({
      text: "npm i",
      entities: [{ type: "code", offset: 0, length: 5 }]
    })
    expect(Fmt.pre("const x = 1", "typescript")).toEqual({
      text: "const x = 1",
      entities: [{ type: "pre", offset: 0, length: 11, language: "typescript" }]
    })
    expect(Fmt.pre("plain").entities[0]).toEqual({ type: "pre", offset: 0, length: 5 })
  })

  it("mention and customEmoji carry their extra fields", () => {
    const user = { id: 42, isBot: false, firstName: "Ada" }
    expect(Fmt.mention("Ada", user).entities).toEqual([
      { type: "text_mention", offset: 0, length: 3, user }
    ])
    expect(Fmt.customEmoji("🔥", "123").entities).toEqual([
      { type: "custom_emoji", offset: 0, length: 2, customEmojiId: "123" }
    ])
  })

  it("join interleaves a separator while preserving entities", () => {
    const result = Fmt.join([Fmt.bold("a"), Fmt.bold("b")], ", ")
    expect(result.text).toBe("a, b")
    expect(result.entities).toEqual([
      { type: "bold", offset: 0, length: 1 },
      { type: "bold", offset: 3, length: 1 }
    ])
  })

  it("uses UTF-16 code-unit offsets (astral chars count as 2)", () => {
    const result = Fmt.concat("🔥", Fmt.bold("x"))
    expect(result.text).toBe("🔥x")
    // "🔥" is 2 UTF-16 units, so the bold "x" starts at offset 2.
    expect(result.entities).toEqual([{ type: "bold", offset: 2, length: 1 }])
  })
})
