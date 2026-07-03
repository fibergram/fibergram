import { Effect, Layer, Ref } from "effect"

import { TelegramClient } from "../src/client/index.js"

import type { BotApi} from "../src/client/index.js";


// The Bot API now has 180 methods; tests only care about a handful. `stubClient`
// fills the whole `TelegramClientService` from a partial override - any method not
// overridden dies if called, so a missing stub is a loud test failure, not a silent
// pass. Overrides are loosely typed on purpose: pinning them to the exact 180-method
// interface makes TypeScript deep-compare the giant param types (TS2719). Exported
// for reuse across test files.
 
type StubMethod = (params?: any) => Effect.Effect<any, any, any>

export const stubClient = (
  overrides: Record<string, StubMethod>
): TelegramClient.TelegramClientService =>
  new Proxy(overrides, {
    get(target, prop: string) {
      const impl = (target as Record<string, StubMethod | undefined>)[prop]
      if (impl !== undefined) return impl
      return () => Effect.die(new Error(`TestTelegram: ${String(prop)} not stubbed`))
    }
  }) as unknown as TelegramClient.TelegramClientService

// A recording TelegramClient for M1 tests: captures every outbound call and
// hands back a plausible Message so `Chat.editLast` has a target.
export interface TestTelegram {
  readonly sent: Ref.Ref<ReadonlyArray<BotApi.SendMessageParams>>
  readonly edited: Ref.Ref<ReadonlyArray<BotApi.EditMessageTextParams>>
  readonly actions: Ref.Ref<ReadonlyArray<BotApi.SendChatActionParams>>
  readonly answered: Ref.Ref<ReadonlyArray<BotApi.AnswerCallbackQueryParams>>
  readonly reactions: Ref.Ref<ReadonlyArray<BotApi.SetMessageReactionParams>>
  readonly inlineAnswers: Ref.Ref<ReadonlyArray<BotApi.AnswerInlineQueryParams>>
  readonly myCommands: Ref.Ref<ReadonlyArray<BotApi.SetMyCommandsParams>>
  readonly layer: Layer.Layer<TelegramClient.TelegramClient>
}

export const make: Effect.Effect<TestTelegram> = Effect.gen(function* () {
  const sent = yield* Ref.make<ReadonlyArray<BotApi.SendMessageParams>>([])
  const edited = yield* Ref.make<ReadonlyArray<BotApi.EditMessageTextParams>>([])
  const actions = yield* Ref.make<ReadonlyArray<BotApi.SendChatActionParams>>([])
  const answered = yield* Ref.make<ReadonlyArray<BotApi.AnswerCallbackQueryParams>>([])
  const reactions = yield* Ref.make<ReadonlyArray<BotApi.SetMessageReactionParams>>([])
  const inlineAnswers = yield* Ref.make<ReadonlyArray<BotApi.AnswerInlineQueryParams>>([])
  const myCommands = yield* Ref.make<ReadonlyArray<BotApi.SetMyCommandsParams>>([])
  const counter = yield* Ref.make(1000)

  const service = stubClient({
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
        }
      }),
    editMessageText: (params) =>
      Effect.gen(function* () {
        yield* Ref.update(edited, (all) => [...all, params])
        return {
          messageId: params.messageId ?? 0,
          date: 0,
          chat: { id: Number(params.chatId), type: "private" },
          ...(params.text !== undefined ? { text: params.text } : {})
        }
      }),
    answerCallbackQuery: (params) =>
      Ref.update(answered, (all) => [...all, params]).pipe(Effect.as(true)),
    sendChatAction: (params) => Ref.update(actions, (all) => [...all, params]).pipe(Effect.as(true)),
    setMessageReaction: (params) =>
      Ref.update(reactions, (all) => [...all, params]).pipe(Effect.as(true)),
    answerInlineQuery: (params) =>
      Ref.update(inlineAnswers, (all) => [...all, params]).pipe(Effect.as(true)),
    setMyCommands: (params) =>
      Ref.update(myCommands, (all) => [...all, params]).pipe(Effect.as(true))
  })

  return {
    sent,
    edited,
    actions,
    answered,
    reactions,
    inlineAnswers,
    myCommands,
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
    chatInstance: `ci-${chatId}`,
    message: { messageId: updateId, date: 0, chat: { id: chatId, type: "private" } },
    data
  }
})

export const reactionUpdate = (
  updateId: number,
  chatId: number,
  fromId: number,
  emoji: string
): BotApi.Update => ({
  updateId,
  messageReaction: {
    chat: { id: chatId, type: "private" },
    messageId: updateId,
    user: { id: fromId, isBot: false, firstName: "Tester" },
    date: 0,
    oldReaction: [],
    newReaction: [{ type: "emoji", emoji }]
  }
})

export const chatMemberJoinUpdate = (
  updateId: number,
  chatId: number,
  fromId: number,
  memberName: string
): BotApi.Update => {
  const user: BotApi.User = { id: fromId, isBot: false, firstName: memberName }
  return {
    updateId,
    chatMember: {
      chat: { id: chatId, type: "supergroup" },
      from: user,
      date: 0,
      oldChatMember: { status: "left", user },
      newChatMember: { status: "member", user }
    }
  }
}

export const inlineQueryUpdate = (
  updateId: number,
  fromId: number,
  query: string
): BotApi.Update => ({
  updateId,
  inlineQuery: {
    id: `iq-${updateId}`,
    from: { id: fromId, isBot: false, firstName: "Tester" },
    query,
    offset: ""
  }
})
