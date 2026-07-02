import { BotApi, TelegramClient } from "@fibergram/client"
import { Polling } from "@fibergram/polling"
import { it } from "@effect/vitest"
import { Effect, Layer, Ref, Stream } from "effect"
import { describe, expect } from "vitest"

const update = (id: number, text: string): BotApi.Update => ({
  updateId: id,
  message: { messageId: id, date: 0, chat: { id: 1, type: "private" }, text }
})

// The Bot API has 180 methods; this test only drives `getUpdates`. Fill the rest
// with a die-if-called default so a stray call fails loudly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StubMethod = (params?: any) => Effect.Effect<any, any, any>

const stubClient = (
  overrides: Record<string, StubMethod>
): TelegramClient.TelegramClientService =>
  new Proxy(overrides, {
    get(target, prop: string) {
      const impl = (target as Record<string, StubMethod | undefined>)[prop]
      return impl ?? (() => Effect.die(new Error(`Polling test: ${String(prop)} not stubbed`)))
    }
  }) as unknown as TelegramClient.TelegramClientService

describe("Polling ingestion (section 7 - offset management)", () => {
  it.effect("advances the offset by (max updateId + 1) and streams updates in order", () =>
    Effect.gen(function* () {
      const requestedOffsets = yield* Ref.make<ReadonlyArray<number | undefined>>([])
      const calls = yield* Ref.make(0)

      const service = stubClient({
        getUpdates: (params) =>
          Effect.gen(function* () {
            yield* Ref.update(requestedOffsets, (all) => [...all, params?.offset])
            const n = yield* Ref.updateAndGet(calls, (c) => c + 1)
            if (n === 1) return [update(1, "a"), update(2, "b")]
            if (n === 2) return [update(3, "c")]
            // No more updates: park so the loop doesn't busy-spin until the scope closes.
            return yield* Effect.never
          })
      })
      const clientLayer = Layer.succeed(TelegramClient.TelegramClient, service)

      const collected = yield* Effect.gen(function* () {
        const updates = yield* Polling.make({ timeout: 0, limit: 10 })
        return yield* Stream.runCollect(Stream.take(updates, 3))
      }).pipe(Effect.scoped, Effect.provide(clientLayer))

      expect(collected.map((u) => u.updateId)).toEqual([1, 2, 3])

      // First request has no offset; after the [1,2] batch the offset commits to 3.
      const offsets = yield* Ref.get(requestedOffsets)
      expect(offsets.slice(0, 2)).toEqual([undefined, 3])
    }))
})
