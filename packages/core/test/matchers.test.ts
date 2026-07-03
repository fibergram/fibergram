import { it } from "@effect/vitest"
import { Effect, Ref, Stream } from "effect"
import { describe, expect } from "vitest"

import { Chat, Command, Dedup, DialogStore, Dispatcher, Filter, InlineResult, Router } from "@fibergram/core"

import * as TestTelegram from "./TestTelegram.js"

import type { BotApi } from "@fibergram/client"

// --- One bot exercising every kind of typed matcher: command + text + reaction +
//     chat-member transition + inline query, with zero manual `Update` parsing.
const start = Command.make("/start")

const router = Router.make(
  Router.command(start, () => Effect.asVoid(Chat.reply("welcome!"))),
  Router.hears(/^echo (.+)$/, (match) => Effect.asVoid(Chat.reply(match[1] ?? ""))),
  Router.reaction("👍", () => Effect.asVoid(Chat.reply("reacted"))),
  Router.chatMember("join", (update) =>
    Effect.asVoid(Chat.reply(`welcome ${update.newChatMember.user.firstName}`))),
  Router.inlineQuery((query) =>
    Effect.asVoid(
      query.answer([InlineResult.article({ id: "1", title: query.query, message: query.query })])
    ))
)

// --- Compile-time proof: payload types are exact, never `any`. -----
type IsAny<T> = 0 extends 1 & T ? true : false
type Assert<T extends true> = T
type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

// `Router.on(kind)` narrows the payload to the precise Update field type.
type _inlineExact = Assert<Equals<Router.PayloadOf<"inlineQuery">, BotApi.InlineQuery>>
type _memberExact = Assert<Equals<Router.PayloadOf<"chatMember">, BotApi.ChatMemberUpdated>>
type _reactionExact = Assert<
  Equals<Router.PayloadOf<"messageReaction">, BotApi.MessageReactionUpdated>
>
type _inlineNotAny = Assert<IsAny<Router.PayloadOf<"inlineQuery">> extends false ? true : false>

export type _Proof = [_inlineExact, _memberExact, _reactionExact, _inlineNotAny]

describe("Router matchers", () => {
  it("derives allowed_updates from the router's routes", () => {
    // command→message, hears→message, reaction→message_reaction,
    // chatMember→chat_member, inlineQuery→inline_query — unioned + snake_cased.
    expect(Router.allowedUpdates(router)).toEqual([
      "chat_member",
      "inline_query",
      "message",
      "message_reaction"
    ])
  })

  it("forces allowed_updates open when a wildcard (raw predicate) route is present", () => {
    const withWildcard = router.pipe(
      Router.add(Router.when((u) => u.poll !== undefined, () => Effect.void))
    )
    expect(Router.allowedUpdates(withWildcard)).toEqual([])
  })

  it.effect("routes every update kind without manual Update parsing", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make

      yield* Dispatcher.run({
        updates: Stream.fromIterable([
          TestTelegram.textUpdate(1, 100, "/start"),
          TestTelegram.textUpdate(2, 100, "echo hi"),
          TestTelegram.reactionUpdate(3, 100, 7, "👍"),
          TestTelegram.chatMemberJoinUpdate(4, 200, 8, "Ada"),
          TestTelegram.inlineQueryUpdate(5, 9, "cats")
        ]),
        dialog: Router.toDialog(router)
      }).pipe(
        Effect.scoped,
        Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer])
      )

      // Different chats/users are distinct addresses processed concurrently, so
      // only the multiset of replies is deterministic, not their cross-address order.
      const sent = (yield* Ref.get(tg.sent)).map((s) => s.text).sort()
      expect(sent).toEqual(["hi", "reacted", "welcome Ada", "welcome!"])

      const inline = yield* Ref.get(tg.inlineAnswers)
      expect(inline.map((a) => a.results.map((r) => r.id))).toEqual([["1"]])
    }))

  it("predicate combinators compose over `when`", () => {
    const guard = Router.and(Router.chatType("private"), Filter.fromUser(7))
    const priv = TestTelegram.textUpdate(1, 100, "hi")
    const group: BotApi.Update = {
      updateId: 2,
      message: {
        messageId: 2,
        date: 0,
        chat: { id: 100, type: "group" },
        text: "hi",
        from: { id: 7, isBot: false, firstName: "T" }
      }
    }
    // private chat + right user → matches; group chat → not (chatType fails)
    expect(guard({ ...priv, message: { ...priv.message!, from: { id: 7, isBot: false, firstName: "T" } } }))
      .toBe(true)
    expect(guard(group)).toBe(false)
    expect(Router.not(Router.chatType("private"))(group)).toBe(true)
  })

  it("InlineResult builders tag results correctly", () => {
    expect(InlineResult.photo({ id: "p", photoUrl: "u", thumbnailUrl: "t" }).type).toBe("photo")
    expect(InlineResult.video({ id: "v", videoUrl: "u", mimeType: "video/mp4", thumbnailUrl: "t", title: "T" }).type)
      .toBe("video")
    expect(InlineResult.document({ id: "d", title: "T", documentUrl: "u", mimeType: "application/pdf" }).type)
      .toBe("document")
    expect(InlineResult.gif({ id: "g", gifUrl: "u", thumbnailUrl: "t" }).type).toBe("gif")
  })
})
