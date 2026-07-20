import { it } from "@effect/vitest"
import { Effect, Option, Ref, Stream } from "effect"
import { describe, expect } from "vitest"

import * as TestTelegram from "./TestTelegram.js"
import { Chat, Dedup, DialogAddress, Dialog, DialogStore, Dispatcher } from "../src/index.js"


import type { BotApi, TelegramClient } from "../src/client/index.js"

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

  it.effect("reply accepts pre-formatted text: sends entities, omits parseMode", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const dialog = Dialog.stateless({
        onUpdate: () =>
          // Structurally the output of an entity-tree formatter (Chat.FormattedText).
          Effect.asVoid(Chat.reply(
            { text: "bold", entities: [{ type: "bold", offset: 0, length: 4 }] },
            // A parseMode here must be ignored when explicit entities are present.
            { parseMode: "HTML" }
          ))
      })
      yield* runDialog(tg, dialog, [TestTelegram.textUpdate(1, 777, "go")])

      const sent = yield* Ref.get(tg.sent)
      expect(sent).toEqual([
        { chatId: 777, text: "bold", entities: [{ type: "bold", offset: 0, length: 4 }] }
      ])
      expect(sent[0]).not.toHaveProperty("parseMode")
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

  it.effect("userId resolves the sender, falling back to chatId", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const dialog = Dialog.stateless({
        onUpdate: () => Effect.gen(function* () {
          const { chatId, userId } = yield* Chat.identity
          const alsoUserId = yield* Chat.userId
          yield* Chat.reply(`${chatId}:${userId}:${alsoUserId}`)
        })
      })
      yield* runDialog(tg, dialog, [
        // A callback update carries a sender (42) distinct from the chat (100).
        TestTelegram.callbackUpdate(1, 100, 42, "x"),
        // A plain text update carries no sender, so userId falls back to chatId.
        TestTelegram.textUpdate(2, 777, "hi")
      ], DialogAddress.byUpdate())

      const sent = yield* Ref.get(tg.sent)
      expect(sent.map((s) => s.text)).toEqual(["100:42:42", "777:777:777"])
    }))
})
