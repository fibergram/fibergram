import { it } from "@effect/vitest"
import { Effect, Fiber } from "effect"
import { TestClock } from "effect/testing"
import { describe, expect } from "vitest"

import { Chat, Dedup, Dialog, DialogStore, Dispatcher } from "@fibergram/core"

import { TestTelegram, Updates } from "../src/index.js"

// An echo bot: replies to every text update with the same text. Its only
// requirement is `TelegramClient`, satisfied by the TestTelegram layer — the
// whole bot runs with no network (design §5.6).
const echo = Dialog.stateless({
  onUpdate: (update) =>
    Effect.gen(function* () {
      const text = update.message?.text
      if (text !== undefined) yield* Chat.reply(text)
    })
})

describe("bot without a network", () => {
  it.effect("runs on synthetic updates and records the replies", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      yield* Dispatcher.run({
        updates: Updates.stream([
          Updates.text({ updateId: 1, chatId: 100, text: "hi" }),
          Updates.text({ updateId: 2, chatId: 100, text: "yo" })
        ]),
        dialog: echo
      }).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer]))

      expect(yield* tg.sent).toEqual([
        { chatId: 100, text: "hi" },
        { chatId: 100, text: "yo" }
      ])
    }))

  it.effect("cranks a dialog timeout through TestClock", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const delayed = Dialog.stateless({
        onUpdate: (update) =>
          Effect.gen(function* () {
            yield* Effect.sleep("30 seconds")
            yield* Chat.reply(update.message?.text ?? "")
          })
      })

      const fiber = yield* Dispatcher.run({
        updates: Updates.stream([Updates.text({ updateId: 1, chatId: 5, text: "later" })]),
        dialog: delayed
      }).pipe(
        Effect.scoped,
        Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer]),
        Effect.forkChild
      )

      // Before the timeout elapses, the handler is still suspended: nothing sent.
      yield* TestClock.adjust("10 seconds")
      expect(yield* tg.sent).toEqual([])

      // Crossing the 30s boundary releases the reply.
      yield* TestClock.adjust("30 seconds")
      yield* Fiber.join(fiber)
      expect(yield* tg.sent).toEqual([{ chatId: 5, text: "later" }])
    }))

  it.effect("keeps typing indicators off the network but on the record", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const typing = Dialog.stateless({
        onUpdate: () => Chat.withTyping(Chat.reply("done").pipe(Effect.asVoid))
      })

      yield* Dispatcher.run({
        updates: Updates.stream([Updates.text({ updateId: 1, chatId: 9, text: "go" })]),
        dialog: typing
      }).pipe(
        Effect.scoped,
        Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer])
      )

      expect((yield* tg.actions).map((a) => a.action)).toContain("typing")
      expect(yield* tg.sent).toEqual([{ chatId: 9, text: "done" }])
    }))
})
