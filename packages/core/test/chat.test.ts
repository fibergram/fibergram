import { it } from "@effect/vitest"
import { Effect, Option, Ref, Stream } from "effect"
import { describe, expect } from "vitest"

import { Chat, Dedup, DialogAddress, Dialog, DialogStore, Dispatcher } from "@fibergram/core"

import * as TestTelegram from "./TestTelegram.js"

import type { BotApi, TelegramClient } from "@fibergram/client"

const runDialog = <S, Ev, E>(
  tg: TestTelegram.TestTelegram,
  dialog: Dialog.Dialog<S, Ev, E, TelegramClient.TelegramClient>,
  updates: ReadonlyArray<BotApi.Update>,
  keyExtractor?: DialogAddress.KeyExtractor
) =>
  Dispatcher.run({
    updates: Stream.fromIterable(updates),
    dialog,
    ...(keyExtractor !== undefined ? { keyExtractor } : {})
  }).pipe(
    Effect.scoped,
    Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer])
  )

describe("Chat accessors", () => {
  it.effect("reply targets the current chat resolved from the ambient env", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const echo = Dialog.stateless({
        onUpdate: (u) =>
          u.message?.text !== undefined
            ? Effect.asVoid(Chat.reply(u.message.text))
            : Effect.void
      })
      yield* runDialog(tg, echo, [TestTelegram.textUpdate(1, 555, "hi")])

      expect(yield* Ref.get(tg.sent)).toEqual([{ chatId: 555, text: "hi" }])
    }))

  it.effect("editLast edits the message reply just sent, not a new one", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const dialog = Dialog.stateless({
        onUpdate: () =>
          Effect.gen(function* () {
            const sent = yield* Chat.reply("Loading...")
            yield* Chat.editLast("Done")
            return sent
          }).pipe(Effect.asVoid)
      })
      yield* runDialog(tg, dialog, [TestTelegram.textUpdate(1, 100, "go")])

      const sent = yield* Ref.get(tg.sent)
      const edited = yield* Ref.get(tg.edited)
      expect(sent.map((s) => s.text)).toEqual(["Loading..."])
      expect(edited.map((e) => e.text)).toEqual(["Done"])
      // editLast targeted the id the recorder assigned to the sent message.
      expect(edited[0]?.messageId).toBe(1001)
    }))

  it.effect("thread reflects the update's Forum Topic", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const threaded: BotApi.Update = {
        updateId: 1,
        message: {
          messageId: 1,
          date: 0,
          chat: { id: 100, type: "supergroup" },
          text: "hi",
          messageThreadId: 7
        }
      }
      const dialog = Dialog.stateless({
        onUpdate: () =>
          Effect.gen(function* () {
            const thread = yield* Chat.thread
            yield* Chat.reply(`thread=${Option.getOrElse(thread, () => 0)}`)
          })
      })
      yield* runDialog(tg, dialog, [threaded])

      const sent = yield* Ref.get(tg.sent)
      expect(sent[0]?.text).toBe("thread=7")
      // The reply inherits the thread id.
      expect(sent[0]?.messageThreadId).toBe(7)
    }))

  it.effect("withTyping shows a typing indicator around the work", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const dialog = Dialog.stateless({
        onUpdate: () => Chat.withTyping(Effect.asVoid(Chat.reply("done")))
      })
      yield* runDialog(tg, dialog, [TestTelegram.textUpdate(1, 100, "slow")])

      const actions = yield* Ref.get(tg.actions)
      expect(actions.length).toBeGreaterThanOrEqual(1)
      expect(actions.every((a) => a.action === "typing")).toBe(true)
      expect(yield* Ref.get(tg.sent)).toEqual([{ chatId: 100, text: "done" }])
    }))

  it.effect("answerCallback acknowledges the tapped inline button", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const dialog = Dialog.stateless({
        onUpdate: () => Effect.asVoid(Chat.answerCallback({ text: "Saved" }))
      })
      yield* runDialog(tg, dialog, [TestTelegram.callbackUpdate(1, 100, 42, "vote:1")])

      const answered = yield* Ref.get(tg.answered)
      expect(answered).toEqual([{ callbackQueryId: "cb-1", text: "Saved" }])
    }))

  it.effect("from resolves the sender of a callback update", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const dialog = Dialog.stateless({
        onUpdate: () =>
          Effect.gen(function* () {
            const sender = yield* Chat.from
            yield* Chat.reply(Option.match(sender, {
              onNone: () => "anon",
              onSome: (u) => u.firstName
            }))
          })
      })
      yield* runDialog(tg, dialog, [TestTelegram.callbackUpdate(1, 100, 42, "vote:1")], DialogAddress.byUser())

      expect((yield* Ref.get(tg.sent))[0]?.text).toBe("Tester")
    }))
})
