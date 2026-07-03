import { it } from "@effect/vitest"
import { Effect, Stream } from "effect"
import { describe, expect } from "vitest"

import { InputFile, TelegramClient } from "@fibergram/client"
import { Chat, Dedup, Dialog, DialogStore, Dispatcher, MediaGroup } from "@fibergram/core"

import { TestTelegram, Updates } from "../src/index.js"

import type { TelegramError } from "@fibergram/client"

const run = (
  tg: TestTelegram.TestTelegram,
  dialog: Dialog.Dialog<void, never, TelegramError.TelegramError, TelegramClient.TelegramClient>
) =>
  Dispatcher.run({
    updates: Updates.stream([Updates.text({ updateId: 1, chatId: 100, text: "go" })]),
    dialog
  }).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer]))

describe("M7 send surface through the recording double", () => {
  it.effect("sends a photo from disk (recorded as an InputFile, not a wire body)", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const dialog = Dialog.stateless({
        onUpdate: () => Chat.replyPhoto(InputFile.fromPath("./cat.png"), { caption: "meow" }).pipe(Effect.asVoid)
      })
      yield* run(tg, dialog)

      const [photo] = (yield* tg.callsTo("sendPhoto")) as ReadonlyArray<{
        readonly photo: unknown
        readonly caption?: string
      }>
      expect(photo?.caption).toBe("meow")
      expect(InputFile.isInputFile(photo?.photo)).toBe(true)
      expect((photo?.photo as InputFile.Path)._tag).toBe("Path")
      expect((photo?.photo as InputFile.Path).path).toBe("./cat.png")
    }))

  it.effect("sends an album built with the MediaGroup builder", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const dialog = Dialog.stateless({
        onUpdate: () =>
          Chat.replyMediaGroup(
            MediaGroup.empty
              .photo(InputFile.fromPath("./1.png"), { caption: "Album" })
              .photo(InputFile.fromBytes(new Uint8Array([2])))
          ).pipe(Effect.asVoid)
      })
      yield* run(tg, dialog)

      const [group] = (yield* tg.callsTo("sendMediaGroup")) as ReadonlyArray<{
        readonly media: ReadonlyArray<{ type: string; media: unknown; caption?: string }>
      }>
      expect(group?.media.map((m) => m.type)).toEqual(["photo", "photo"])
      expect(group?.media[0]?.caption).toBe("Album")
      expect(group?.media.every((m) => InputFile.isInputFile(m.media))).toBe(true)
    }))

  it.effect("downloads an incoming file into a byte stream", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.makeWith({ download: () => Uint8Array.of(1, 2, 3, 4) })
      const collected = yield* Effect.gen(function* () {
        const client = yield* TelegramClient.TelegramClient
        return yield* Stream.runCollect(client.downloadFile("FILE_ID"))
      }).pipe(Effect.provide(tg.layer))

      expect(collected.flatMap((chunk) => [...chunk])).toEqual([1, 2, 3, 4])
      expect(yield* tg.callsTo("downloadFile")).toEqual(["FILE_ID"])
    }))

  it.effect("reacts to and deletes the incoming message", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const dialog = Dialog.stateless({
        onUpdate: () =>
          Effect.gen(function* () {
            yield* Chat.react("🔥")
            yield* Chat.deleteMessage
          })
      })
      yield* run(tg, dialog)

      const [reaction] = (yield* tg.callsTo("setMessageReaction")) as ReadonlyArray<{
        readonly messageId: number
        readonly reaction: ReadonlyArray<{ type: string; emoji: string }>
      }>
      expect(reaction?.reaction).toEqual([{ type: "emoji", emoji: "🔥" }])
      const [deleted] = (yield* tg.callsTo("deleteMessage")) as ReadonlyArray<{ readonly messageId: number }>
      expect(deleted?.messageId).toBe(1)
    }))
})
