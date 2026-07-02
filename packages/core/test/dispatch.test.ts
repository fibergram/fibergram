import { BotApi, TelegramClient, TelegramError } from "@fibergram/client"
import { Dedup, Dialog, DialogStore, Dispatcher } from "@fibergram/core"
import { it } from "@effect/vitest"
import { Effect, Layer, Ref, Stream } from "effect"
import { describe, expect } from "vitest"

// --- Test doubles -----------------------------------------------------------

interface Recorder {
  readonly sent: Ref.Ref<ReadonlyArray<BotApi.SendMessageParams>>
  readonly layer: Layer.Layer<TelegramClient.TelegramClient>
}

const makeRecorder: Effect.Effect<Recorder> = Effect.gen(function* () {
  const sent = yield* Ref.make<ReadonlyArray<BotApi.SendMessageParams>>([])
  const service: TelegramClient.TelegramClientService = {
    getUpdates: () => Effect.succeed<ReadonlyArray<BotApi.Update>>([]),
    sendMessage: (params) => {
      const reply: BotApi.Message = {
        messageId: 1,
        date: 0,
        chat: { id: Number(params.chatId), type: "private" },
        ...(params.text !== undefined ? { text: params.text } : {})
      }
      return Ref.update(sent, (all) => [...all, params]).pipe(Effect.as(reply))
    },
    editMessageText: (params) => {
      const edited: BotApi.Message = {
        messageId: params.messageId,
        date: 0,
        chat: { id: Number(params.chatId), type: "private" },
        text: params.text
      }
      return Effect.succeed(edited)
    },
    answerCallbackQuery: () => Effect.succeed(true),
    sendChatAction: () => Effect.succeed(true)
  }
  return { sent, layer: Layer.succeed(TelegramClient.TelegramClient, service) }
})

const textUpdate = (updateId: number, chatId: number, text: string): BotApi.Update => ({
  updateId,
  message: { messageId: updateId, date: 0, chat: { id: chatId, type: "private" }, text }
})

const echo = Dialog.stateless({
  onUpdate: (update) =>
    Effect.gen(function* () {
      const tg = yield* TelegramClient.TelegramClient
      const message = update.message
      if (message?.text !== undefined) {
        yield* tg.sendMessage({ chatId: message.chat.id, text: message.text })
      }
    })
})

// --- Tests ------------------------------------------------------------------

describe("Dispatcher + EntityManager", () => {
  it.effect("echoes text back, preserving order within a chat", () =>
    Effect.gen(function* () {
      const recorder = yield* makeRecorder
      yield* Dispatcher.run({
        updates: Stream.fromIterable([
          textUpdate(1, 100, "hi"),
          textUpdate(2, 100, "yo")
        ]),
        dialog: echo
      }).pipe(
        Effect.scoped,
        Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, recorder.layer])
      )

      const sent = yield* Ref.get(recorder.sent)
      expect(sent).toEqual([
        { chatId: 100, text: "hi" },
        { chatId: 100, text: "yo" }
      ])
    }))

  it.effect("drops updates with a duplicate updateId (dedup section 13.5)", () =>
    Effect.gen(function* () {
      const recorder = yield* makeRecorder
      yield* Dispatcher.run({
        updates: Stream.fromIterable([
          textUpdate(1, 100, "a"),
          textUpdate(1, 100, "a-duplicate"),
          textUpdate(2, 100, "b")
        ]),
        dialog: echo
      }).pipe(
        Effect.scoped,
        Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, recorder.layer])
      )

      const sent = yield* Ref.get(recorder.sent)
      expect(sent).toEqual([
        { chatId: 100, text: "a" },
        { chatId: 100, text: "b" }
      ])
    }))

  it.effect("a crash in one chat does not stop another (address isolation)", () =>
    Effect.gen(function* () {
      const recorder = yield* makeRecorder
      const crashes = yield* Ref.make(0)

      const crashy = Dialog.stateless({
        onUpdate: (update) =>
          Effect.gen(function* () {
            const tg = yield* TelegramClient.TelegramClient
            const message = update.message
            if (message === undefined) return
            if (message.chat.id === 666) {
              return yield* Effect.die("boom")
            }
            yield* tg.sendMessage({ chatId: message.chat.id, text: message.text ?? "" })
          })
      })

      yield* Dispatcher.run({
        updates: Stream.fromIterable([
          textUpdate(1, 666, "bad"),
          textUpdate(2, 100, "good")
        ]),
        dialog: crashy,
        onDefect: () => Ref.update(crashes, (n) => n + 1)
      }).pipe(
        Effect.scoped,
        Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, recorder.layer])
      )

      expect(yield* Ref.get(crashes)).toBe(1)
      expect(yield* Ref.get(recorder.sent)).toEqual([{ chatId: 100, text: "good" }])
    }))

  it.effect("keeps per-user state across updates when addressed by user", () =>
    Effect.gen(function* () {
      const recorder = yield* makeRecorder

      const counter = Dialog.make<
        { readonly count: number },
        { readonly _tag: "Ticked" },
        TelegramError.TelegramError,
        TelegramClient.TelegramClient
      >({
        kind: "counter",
        initialState: { count: 0 },
        reduce: (state, event) => (event._tag === "Ticked" ? { count: state.count + 1 } : state),
        decide: (state, update) =>
          Effect.gen(function* () {
            const tg = yield* TelegramClient.TelegramClient
            const chatId = update.message?.chat.id ?? 0
            yield* tg.sendMessage({ chatId, text: `count=${state.count + 1}` })
            return { events: [{ _tag: "Ticked" as const }], effects: [] }
          })
      })

      yield* Dispatcher.run({
        updates: Stream.fromIterable([
          textUpdate(1, 100, "a"),
          textUpdate(2, 100, "b"),
          textUpdate(3, 100, "c")
        ]),
        dialog: counter
      }).pipe(
        Effect.scoped,
        Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, recorder.layer])
      )

      expect(yield* Ref.get(recorder.sent)).toEqual([
        { chatId: 100, text: "count=1" },
        { chatId: 100, text: "count=2" },
        { chatId: 100, text: "count=3" }
      ])
    }))
})
