import { BotApi, TelegramClient } from "@fibergram/client"
import { Effect, Layer, Ref } from "effect"

// A recording TelegramClient for M1 tests: captures every outbound call and
// hands back a plausible Message so `Chat.editLast` has a target.
export interface TestTelegram {
  readonly sent: Ref.Ref<ReadonlyArray<BotApi.SendMessageParams>>
  readonly edited: Ref.Ref<ReadonlyArray<BotApi.EditMessageTextParams>>
  readonly actions: Ref.Ref<ReadonlyArray<BotApi.SendChatActionParams>>
  readonly answered: Ref.Ref<ReadonlyArray<BotApi.AnswerCallbackQueryParams>>
  readonly layer: Layer.Layer<TelegramClient.TelegramClient>
}

export const make: Effect.Effect<TestTelegram> = Effect.gen(function* () {
  const sent = yield* Ref.make<ReadonlyArray<BotApi.SendMessageParams>>([])
  const edited = yield* Ref.make<ReadonlyArray<BotApi.EditMessageTextParams>>([])
  const actions = yield* Ref.make<ReadonlyArray<BotApi.SendChatActionParams>>([])
  const answered = yield* Ref.make<ReadonlyArray<BotApi.AnswerCallbackQueryParams>>([])
  const counter = yield* Ref.make(1000)

  const service: TelegramClient.TelegramClientService = {
    getUpdates: () => Effect.succeed<ReadonlyArray<BotApi.Update>>([]),
    sendMessage: (params) =>
      Effect.gen(function* () {
        const messageId = yield* Ref.updateAndGet(counter, (n) => n + 1)
        yield* Ref.update(sent, (all) => [...all, params])
        return {
          messageId,
          date: 0,
          chat: { id: Number(params.chatId), type: "private" },
          ...(params.text !== undefined ? { text: params.text } : {})
        } satisfies BotApi.Message
      }),
    editMessageText: (params) =>
      Effect.gen(function* () {
        yield* Ref.update(edited, (all) => [...all, params])
        return {
          messageId: params.messageId,
          date: 0,
          chat: { id: Number(params.chatId), type: "private" },
          text: params.text
        } satisfies BotApi.Message
      }),
    answerCallbackQuery: (params) =>
      Ref.update(answered, (all) => [...all, params]).pipe(Effect.as(true)),
    sendChatAction: (params) => Ref.update(actions, (all) => [...all, params]).pipe(Effect.as(true))
  }

  return {
    sent,
    edited,
    actions,
    answered,
    layer: Layer.succeed(TelegramClient.TelegramClient, service)
  }
})

export const textUpdate = (updateId: number, chatId: number, text: string): BotApi.Update => ({
  updateId,
  message: { messageId: updateId, date: 0, chat: { id: chatId, type: "private" }, text }
})

export const callbackUpdate = (
  updateId: number,
  chatId: number,
  fromId: number,
  data: string
): BotApi.Update => ({
  updateId,
  callbackQuery: {
    id: `cb-${updateId}`,
    from: { id: fromId, isBot: false, firstName: "Tester" },
    message: { messageId: updateId, date: 0, chat: { id: chatId, type: "private" } },
    data
  }
})
