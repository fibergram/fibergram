import { it } from "@effect/vitest"
import { Effect, Option } from "effect"
import { describe, expect } from "vitest"

import { ChatMembers } from "@fibergram/chat-members"
import { Router } from "@fibergram/core"
import { TestTelegram } from "@fibergram/core/testing"

import type { BotApi } from "@fibergram/core/client"

const ada: BotApi.User = { id: 42, isBot: false, firstName: "Ada" }
const chat: BotApi.Chat = { id: -100, type: "supergroup" }

const joinUpdate = (updateId: number): BotApi.Update => ({
  updateId,
  chatMember: {
    chat,
    from: ada,
    date: 0,
    oldChatMember: { status: "left", user: ada },
    newChatMember: { status: "member", user: ada }
  }
})

const textUpdate: BotApi.Update = {
  updateId: 99,
  message: { messageId: 1, date: 0, chat, text: "hi" }
}

describe("ChatMembers", () => {
  it.effect("route folds a chat_member update into the cache", () =>
    Effect.gen(function* () {
      const matched = ChatMembers.route.match(joinUpdate(1))
      expect(Option.isSome(matched)).toBe(true)
      yield* Option.getOrThrow(matched)

      const members = yield* ChatMembers.ChatMembers
      const cached = yield* members.get(chat.id, ada.id)
      expect(Option.map(cached, (m) => m.status)).toEqual(Option.some("member"))
    }).pipe(Effect.provide(ChatMembers.layerMemory)))

  it("route ignores non-chat_member updates and derives allowed_updates", () => {
    expect(Option.isNone(ChatMembers.route.match(textUpdate))).toBe(true)
    expect(Router.allowedUpdates(Router.make(ChatMembers.route))).toEqual(["chat_member"])
  })

  it.effect("get on a never-seen pair is None", () =>
    Effect.gen(function* () {
      const members = yield* ChatMembers.ChatMembers
      const cached = yield* members.get(1, 2)
      expect(Option.isNone(cached)).toBe(true)
    }).pipe(Effect.provide(ChatMembers.layerMemory)))

  it.effect("resolve falls back to getChatMember once, then serves the cache", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.makeWith({
        respond: (method) =>
          method === "getChatMember" ? { status: "administrator", user: ada } : undefined
      })

      const [first, second] = yield* Effect.gen(function* () {
        const members = yield* ChatMembers.ChatMembers
        const a = yield* members.resolve(chat.id, ada.id)
        const b = yield* members.resolve(chat.id, ada.id)
        return [a, b] as const
      }).pipe(Effect.provide([ChatMembers.layerMemory, tg.layer]))

      expect(first.status).toBe("administrator")
      expect(second.status).toBe("administrator")
      expect(yield* tg.callsTo("getChatMember")).toEqual([{ chatId: chat.id, userId: ada.id }])
    }))

  it.effect("resolve prefers the membership the route already cached", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make

      const resolved = yield* Effect.gen(function* () {
        yield* Option.getOrThrow(ChatMembers.route.match(joinUpdate(1)))
        const members = yield* ChatMembers.ChatMembers
        return yield* members.resolve(chat.id, ada.id)
      }).pipe(Effect.provide([ChatMembers.layerMemory, tg.layer]))

      expect(resolved.status).toBe("member")
      expect(yield* tg.callsTo("getChatMember")).toEqual([])
    }))
})
