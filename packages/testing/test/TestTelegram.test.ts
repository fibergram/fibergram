import { TelegramClient } from "@fibergram/client"
import { Chat, UpdateContext } from "@fibergram/core"
import { it } from "@effect/vitest"
import { Effect, Option, Ref } from "effect"
import { describe, expect } from "vitest"
import { TestTelegram } from "../src/index.js"

const envFor = (chatId: number) =>
  Effect.map(Ref.make(Option.none<number>()), (lastSent) => ({
    chatId,
    threadId: Option.none<number>(),
    fromId: Option.none<number>(),
    update: { updateId: 1 },
    lastSent
  }))

describe("TestTelegram", () => {
  it.effect("records outbound calls in order, above the snake_case edge", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      yield* Effect.gen(function* () {
        const client = yield* TelegramClient.TelegramClient
        yield* client.sendMessage({ chatId: 1, text: "hi" })
        yield* client.sendMessage({ chatId: 1, text: "again" })
      }).pipe(Effect.provide(tg.layer))

      expect(yield* tg.sent).toEqual([
        { chatId: 1, text: "hi" },
        { chatId: 1, text: "again" }
      ])
      expect(yield* tg.calls).toEqual([
        { method: "sendMessage", params: { chatId: 1, text: "hi" } },
        { method: "sendMessage", params: { chatId: 1, text: "again" } }
      ])
    }))

  it.effect("hands back a Message so Chat.editLast targets the sent id", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const env = yield* envFor(7)
      yield* Effect.gen(function* () {
        yield* Chat.reply("loading...")
        yield* Chat.editLast("done")
      }).pipe(UpdateContext.provide(env), Effect.provide(tg.layer))

      const sent = yield* tg.sent
      const edited = yield* tg.edited
      expect(sent).toEqual([{ chatId: 7, text: "loading..." }])
      // editLast edits the id the recorder handed back to `reply`, not a new one.
      expect(edited.map((e) => e.text)).toEqual(["done"])
      expect(edited[0]?.messageId).toBe(1001)
    }))

  it.effect("respond overrides a method's canned result", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.makeWith({
        respond: (method) =>
          method === "getMe" ? { id: 42, isBot: true, firstName: "TestBot" } : undefined
      })
      const me = yield* Effect.gen(function* () {
        const client = yield* TelegramClient.TelegramClient
        return yield* client.getMe()
      }).pipe(Effect.provide(tg.layer))

      expect(me.firstName).toBe("TestBot")
    }))

  it.effect("clear forgets recorded calls", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      yield* Effect.gen(function* () {
        const client = yield* TelegramClient.TelegramClient
        yield* client.sendMessage({ chatId: 1, text: "one" })
      }).pipe(Effect.provide(tg.layer))

      yield* tg.clear
      expect(yield* tg.calls).toEqual([])
    }))
})
