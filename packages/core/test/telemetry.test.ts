import { it } from "@effect/vitest"
import { Duration, Effect, Fiber, Layer, Metric, References, Stream } from "effect"
import { TestClock } from "effect/testing"
import { describe, expect } from "vitest"

import { stubClient } from "./TestTelegram.js"
import { TelegramClient, TelegramError } from "../src/client/index.js"
import { Dedup, Dialog, DialogStore, Dispatcher, Retry, Telemetry } from "../src/index.js"


import type { BotApi } from "../src/client/index.js"

// Metrics live in a process-global registry, so tests assert on the *delta*
// around a run rather than absolute values.
const counterCount = (metric: Metric.Counter<number>) =>
  Effect.map(Metric.value(metric), (state) => state.count)

const histogramCount = (metric: Metric.Histogram<Duration.Duration>) =>
  Effect.map(Metric.value(metric), (state) => state.count)

const textUpdate = (updateId: number, chatId: number, text: string): BotApi.Update => ({
  updateId,
  message: { messageId: updateId, date: 0, chat: { id: chatId, type: "private" }, text }
})

const silentClient = Layer.succeed(
  TelegramClient.TelegramClient,
  stubClient({
    getUpdates: () => Effect.succeed<ReadonlyArray<BotApi.Update>>([]),
    sendMessage: (params) =>
      Effect.succeed({
        messageId: 1,
        date: 0,
        chat: { id: Number(params.chatId), type: "private" as const }
      })
  })
)

const echo = Dialog.stateless({ onUpdate: () => Effect.void })

describe("Telemetry (observability defaults)", () => {
  it.effect("instrument opens a fibergram.update span and annotates logs", () =>
    Effect.gen(function* () {
      const address = { chatId: 100, kind: "echo" }
      const update = textUpdate(7, 100, "hi")

      const captured = yield* Effect.all({
        span: Effect.currentSpan,
        annotations: References.CurrentLogAnnotations
      }).pipe(Telemetry.instrument(address, update))

      expect(captured.span.name).toBe(Telemetry.updateSpanName)
      expect(captured.span.attributes.get("telegram.chatId")).toBe(100)
      expect(captured.span.attributes.get("telegram.updateId")).toBe(7)
      expect(captured.span.attributes.get("fibergram.dialog.kind")).toBe("echo")
      expect(captured.annotations).toMatchObject({ chatId: 100, updateId: 7 })
    }))

  it.effect("dispatching updates records updatesTotal and dialogDuration", () =>
    Effect.gen(function* () {
      const before = yield* Effect.all({
        updates: counterCount(Telemetry.updatesTotal),
        samples: histogramCount(Telemetry.dialogDuration)
      })

      yield* Dispatcher.run({
        updates: Stream.fromIterable([
          textUpdate(1, 100, "a"),
          textUpdate(2, 100, "b")
        ]),
        dialog: echo
      }).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, silentClient]))

      const after = yield* Effect.all({
        updates: counterCount(Telemetry.updatesTotal),
        samples: histogramCount(Telemetry.dialogDuration)
      })

      expect(after.updates - before.updates).toBe(2)
      expect(after.samples - before.samples).toBe(2)
    }))

  it.effect("a crashing update is still counted and timed", () =>
    Effect.gen(function* () {
      const before = yield* Effect.all({
        updates: counterCount(Telemetry.updatesTotal),
        samples: histogramCount(Telemetry.dialogDuration)
      })

      const crashy = Dialog.stateless({ onUpdate: () => Effect.die("boom") })

      yield* Dispatcher.run({
        updates: Stream.fromIterable([textUpdate(1, 100, "bad")]),
        dialog: crashy,
        onDefect: () => Effect.void
      }).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, silentClient]))

      const after = yield* Effect.all({
        updates: counterCount(Telemetry.updatesTotal),
        samples: histogramCount(Telemetry.dialogDuration)
      })

      expect(after.updates - before.updates).toBe(1)
      expect(after.samples - before.samples).toBe(1)
    }))

  it.effect("retryRateLimited counts every 429 in rateLimitHits", () =>
    Effect.gen(function* () {
      const before = yield* counterCount(Telemetry.rateLimitHits)

      const alwaysLimited = Effect.fail(
        new TelegramError.RateLimited({ method: "sendMessage", retryAfter: Duration.seconds(1) })
      )
      const fiber = yield* Effect.forkChild(
        Effect.exit(Retry.retryRateLimited(alwaysLimited, { maxAttempts: 3 }))
      )
      yield* TestClock.adjust(Duration.seconds(1))
      yield* TestClock.adjust(Duration.seconds(1))
      yield* Fiber.join(fiber)

      const after = yield* counterCount(Telemetry.rateLimitHits)
      // Three attempts -> three observed 429s (the last one gives up).
      expect(after - before).toBe(3)
    }))
})
