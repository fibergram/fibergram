import { it } from "@effect/vitest"
import { Effect, Ref, Schema, Stream } from "effect"
import { describe, expect } from "vitest"

import * as TestTelegram from "./TestTelegram.js"
import { Chat, Dedup, DialogStore, Dispatcher, Router, StartLink } from "../src/index.js"

const Invite = StartLink.make("mybot", Schema.Struct({ ref: Schema.String }))

describe("StartLink deep linking", () => {
  it.effect("round-trips a payload through a t.me url", () =>
    Effect.gen(function* () {
      const url = yield* Invite.encode({ ref: "alice" })
      expect(url.startsWith("https://t.me/mybot?start=")).toBe(true)
      const payload = url.slice("https://t.me/mybot?start=".length)
      expect(payload.length).toBeLessThanOrEqual(64)
      expect(yield* Invite.decode(payload)).toEqual({ ref: "alice" })
    }))

  it.effect("group and app variants use the right query parameter", () =>
    Effect.gen(function* () {
      expect((yield* Invite.encodeGroup({ ref: "x" })).includes("?startgroup=")).toBe(true)
      expect((yield* Invite.encodeApp({ ref: "x" })).includes("?startapp=")).toBe(true)
    }))

  it.effect("fails StartLinkTooLong when the payload exceeds 64 chars", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(Invite.encode({ ref: "x".repeat(80) }))
      expect(error._tag).toBe("StartLinkTooLong")
    }))

  it.effect("fails StartLinkMalformed on a garbage payload", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(Invite.decode("!!!not-base64!!!"))
      expect(error._tag).toBe("StartLinkMalformed")
    }))

  it.effect("Router.start decodes /start <payload>; plain /start is left alone", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const payload = yield* Invite.encodePayload({ ref: "bob" })
      const router = Router.make(
        Router.start(Invite, ({ ref }) => Effect.asVoid(Chat.reply(`hi ${ref}`))),
        Router.when((u) => u.message?.text === "/start", () => Effect.asVoid(Chat.reply("welcome")))
      )

      yield* Dispatcher.run({
        updates: Stream.fromIterable([
          TestTelegram.textUpdate(1, 100, `/start ${payload}`),
          TestTelegram.textUpdate(2, 100, "/start")
        ]),
        dialog: Router.toDialog(router)
      }).pipe(
        Effect.scoped,
        Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer])
      )

      expect((yield* Ref.get(tg.sent)).map((s) => s.text)).toEqual(["hi bob", "welcome"])
    }))
})
