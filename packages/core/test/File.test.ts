import { it } from "@effect/vitest"
import { Effect, Option, Stream } from "effect"
import { describe, expect } from "vitest"

import { File } from "../src/index.js"
import { TestTelegram } from "../src/testing/index.js"

import type { BotApi } from "../src/client/index.js"

const raw: BotApi.File = { fileId: "abc", fileUniqueId: "u1", filePath: "photos/1.jpg" }

const baseMessage: BotApi.Message = {
  messageId: 1,
  date: 0,
  chat: { id: 100, type: "private" }
}

describe("File", () => {
  it.effect("url resolves through the client and records the call", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const url = yield* File.make(raw).url.pipe(Effect.provide(tg.layer))
      expect(url).toBe("https://api.telegram.org/file/bottest/photos/1.jpg")
      const calls = yield* tg.callsTo("getFileUrl")
      expect(calls).toEqual([raw])
    }))

  it.effect("download streams the file's bytes", () =>
    Effect.gen(function* () {
      const bytes = Uint8Array.of(1, 2, 3)
      const tg = yield* TestTelegram.makeWith({ download: () => bytes })
      const chunks = yield* Stream.runCollect(File.make(raw).download()).pipe(
        Effect.provide(tg.layer)
      )
      expect(chunks).toEqual([bytes])
      const calls = yield* tg.callsTo("downloadFile")
      expect(calls).toEqual([raw])
    }))

  it("fromMessage picks the largest photo size", () => {
    const small: BotApi.PhotoSize = { fileId: "s", fileUniqueId: "us", width: 90, height: 90 }
    const large: BotApi.PhotoSize = { fileId: "l", fileUniqueId: "ul", width: 800, height: 800 }
    const file = File.fromMessage({ ...baseMessage, photo: [small, large] })
    expect(Option.map(file, (f) => f.fileId)).toEqual(Option.some("l"))
  })

  it("fromMessage picks a document", () => {
    const document: BotApi.Document = { fileId: "d", fileUniqueId: "ud" }
    const file = File.fromMessage({ ...baseMessage, document })
    expect(Option.map(file, (f) => f.fileId)).toEqual(Option.some("d"))
  })

  it("fromMessage is none for a plain text message", () => {
    expect(Option.isNone(File.fromMessage({ ...baseMessage, text: "hi" }))).toBe(true)
  })
})
