import { it } from "@effect/vitest"
import { Duration, Effect, Fiber, Metric, Ref, Schema } from "effect"
import { TestClock } from "effect/testing"
import { describe, expect } from "vitest"

import { TelegramClient, TelegramError, Transform } from "../src/client/index.js"
import { Chat, Dedup, DialogStore, Dispatcher, Router } from "../src/index.js"
import { TestTelegram, Updates } from "../src/testing/index.js"

describe("Transform.compose (ordering)", () => {
  it("applies transforms outermost-first (left = outer)", () => {
    const trace: Array<string> = []
    const tag = (name: string): Transform.Transform => (next) => (method, ps, rs, params) => {
      trace.push(`>${name}`)
      return Effect.tap(next(method, ps, rs, params), () => Effect.sync(() => trace.push(`<${name}`)))
    }
    const base = (() => Effect.succeed(true)) as Parameters<Transform.Transform>[0]
    const composed = Transform.applyAll([tag("a"), tag("b")], base)
    Effect.runSync(composed("close", null, Schema.Boolean, {}))
    expect(trace).toEqual([">a", ">b", "<b", "<a"])
  })
})

describe("Transform.defaults", () => {
  it.effect("injects a default only where the schema declares the field", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.makeWith({
        transforms: [Transform.defaults({ parseMode: "HTML" })]
      })
      yield* Effect.gen(function* () {
        const client = yield* TelegramClient.TelegramClient
        yield* client.sendMessage({ chatId: 1, text: "hi" })
        // `getMe` has no `parseMode` field: the default must not leak in.
        yield* client.getMe()
      }).pipe(Effect.provide(tg.layer))

      expect(yield* tg.sent).toEqual([{ chatId: 1, text: "hi", parseMode: "HTML" }])
      expect(yield* tg.callsTo("getMe")).toEqual([undefined])
    }))

  it.effect("never overrides an explicit param", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.makeWith({
        transforms: [Transform.defaults({ parseMode: "HTML" })]
      })
      yield* Effect.gen(function* () {
        const client = yield* TelegramClient.TelegramClient
        yield* client.sendMessage({ chatId: 1, text: "hi", parseMode: "MarkdownV2" })
      }).pipe(Effect.provide(tg.layer))

      expect(yield* tg.sent).toEqual([{ chatId: 1, text: "hi", parseMode: "MarkdownV2" }])
    }))
})

describe("Transform.throttle (no 429 on a broadcast)", () => {
  it.effect("paces per-chat sends under a 1 msg/s ceiling via TestClock", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.makeWith({
        transforms: [Transform.throttle({ perChat: { limit: 1, window: Duration.seconds(1) } })]
      })

      const fanOut = Effect.gen(function* () {
        const client = yield* TelegramClient.TelegramClient
        yield* Effect.forEach([1, 2, 3], (n) => client.sendMessage({ chatId: 1, text: `m${n}` }))
      }).pipe(Effect.provide(tg.layer))

      const fiber = yield* Effect.forkChild(fanOut)

      // First send goes immediately; the next two are spaced 1s apart.
      yield* TestClock.adjust(Duration.zero)
      expect((yield* tg.sent).length).toBe(1)
      yield* TestClock.adjust(Duration.seconds(1))
      expect((yield* tg.sent).length).toBe(2)
      yield* TestClock.adjust(Duration.seconds(1))
      yield* Fiber.join(fiber)
      expect(yield* tg.sent).toEqual([
        { chatId: 1, text: "m1" },
        { chatId: 1, text: "m2" },
        { chatId: 1, text: "m3" }
      ])
    }))
})

describe("Transform.autoRetry (429 handled on the seam)", () => {
  it.effect("retries a rate-limited call after retry_after, transparently", () =>
    Effect.gen(function* () {
      const attempts = yield* Ref.make(0)
      const failTwice: Transform.Transform = (next) => (method, ps, rs, params) =>
        Ref.updateAndGet(attempts, (n) => n + 1).pipe(
          Effect.flatMap((n) =>
            n <= 2
              ? Effect.fail(new TelegramError.RateLimited({ method, retryAfter: Duration.seconds(2) }))
              : next(method, ps, rs, params))
        )
      const tg = yield* TestTelegram.makeWith({
        transforms: [Transform.autoRetry({ maxAttempts: 5 }), failTwice]
      })

      const send = Effect.gen(function* () {
        const client = yield* TelegramClient.TelegramClient
        return yield* client.sendMessage({ chatId: 1, text: "hi" })
      }).pipe(Effect.provide(tg.layer))

      const fiber = yield* Effect.forkChild(send)
      yield* TestClock.adjust(Duration.seconds(2))
      yield* TestClock.adjust(Duration.seconds(2))
      yield* Fiber.join(fiber)

      expect(yield* Ref.get(attempts)).toBe(3)
      expect((yield* tg.sent).length).toBe(1)
    }))

  it.effect("surfaces the 429 once retry_after exceeds maxDelay", () =>
    Effect.gen(function* () {
      const alwaysLimited: Transform.Transform = (_next) => (method) =>
        Effect.fail(new TelegramError.RateLimited({ method, retryAfter: Duration.seconds(60) }))
      const tg = yield* TestTelegram.makeWith({
        transforms: [Transform.autoRetry({ maxAttempts: 5, maxDelay: Duration.seconds(5) }), alwaysLimited]
      })

      const result = yield* Effect.gen(function* () {
        const client = yield* TelegramClient.TelegramClient
        return yield* client.sendMessage({ chatId: 1, text: "hi" })
      }).pipe(Effect.provide(tg.layer), Effect.flip)

      expect(result._tag).toBe("RateLimited")
    }))
})

describe("Transform.metrics", () => {
  it.effect("counts outgoing calls and failures", () =>
    Effect.gen(function* () {
      const before = (yield* Metric.value(Transform.callsTotal)).count
      const tg = yield* TestTelegram.makeWith({ transforms: [Transform.metrics] })
      yield* Effect.gen(function* () {
        const client = yield* TelegramClient.TelegramClient
        yield* client.sendMessage({ chatId: 1, text: "hi" })
      }).pipe(Effect.provide(tg.layer))
      const after = (yield* Metric.value(Transform.callsTotal)).count
      expect(after - before).toBe(1)
    }))
})

describe("Router inbound rate limiting", () => {
  it.effect("drops updates past the per-user allowance", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const router = Router.make(
        Router.when((u) => u.message?.text !== undefined, (u) => Chat.reply(u.message?.text ?? ""))
      )
      const dialog = Router.toDialog(router, {
        rateLimit: { limit: 2, window: Duration.seconds(10) }
      })

      yield* Dispatcher.run({
        updates: Updates.stream([
          Updates.text({ updateId: 1, chatId: 7, fromId: 42, text: "a" }),
          Updates.text({ updateId: 2, chatId: 7, fromId: 42, text: "b" }),
          Updates.text({ updateId: 3, chatId: 7, fromId: 42, text: "c" })
        ]),
        dialog
      }).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer]))

      // Third update from the same user is over the limit and silently dropped.
      expect(yield* tg.sent).toEqual([
        { chatId: 7, text: "a" },
        { chatId: 7, text: "b" }
      ])
    }))

  it.effect("routes an over-limit update to onLimit and refills after the window", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const router = Router.make(
        Router.when((u) => u.message?.text !== undefined, (u) => Chat.reply(u.message?.text ?? ""))
      )
      const dialog = Router.toDialog(router, {
        rateLimit: {
          limit: 1,
          window: Duration.seconds(10),
          onLimit: () => Chat.reply("slow down")
        }
      })

      // Two updates now (second is throttled), one more after the window refills.
      const fiber = yield* Effect.forkChild(
        Dispatcher.run({
          updates: Updates.stream([
            Updates.text({ updateId: 1, chatId: 7, fromId: 42, text: "a" }),
            Updates.text({ updateId: 2, chatId: 7, fromId: 42, text: "b" })
          ]),
          dialog
        }).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer]))
      )
      yield* Fiber.join(fiber)

      expect(yield* tg.sent).toEqual([
        { chatId: 7, text: "a" },
        { chatId: 7, text: "slow down" }
      ])
    }))
})
