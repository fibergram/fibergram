import { it } from "@effect/vitest"
import { Effect, Layer, Ref } from "effect"
import { HttpClient, HttpClientResponse } from "effect/unstable/http"
import { describe, expect } from "vitest"

import { TelegramClient } from "@fibergram/client"

// `Response` (web fetch) is a Node global but not in this project's TS lib (no DOM).
// Grab it off `globalThis` and reuse the exact type `HttpClientResponse.fromWeb`
// expects, so the mock typechecks without pulling in DOM types.
type WebResponse = Parameters<typeof HttpClientResponse.fromWeb>[1]
const WebResponse = (globalThis as typeof globalThis & {
  Response: new (body: string, init: { headers: Record<string, string> }) => WebResponse
}).Response

// A mock HttpClient that records the called method path and replies with a canned
// Bot API envelope per method. Exercises the real generated `makeMethods` + `call`
// transport seam (encode params -> POST -> decode result) end to end.
const mockClient = (seen: Ref.Ref<ReadonlyArray<string>>, bodies: Record<string, unknown>) =>
  HttpClient.make((request, url) =>
    Effect.gen(function* () {
      const method = url.pathname.split("/").pop() ?? ""
      yield* Ref.update(seen, (all) => [...all, method])
      const envelope = bodies[method] ?? { ok: false, error_code: 400, description: `no mock for ${method}` }
      return HttpClientResponse.fromWeb(
        request,
        new WebResponse(JSON.stringify(envelope), { headers: { "content-type": "application/json" } })
      )
    })
  )

const withClient = (bodies: Record<string, unknown>) =>
  Effect.gen(function* () {
    const seen = yield* Ref.make<ReadonlyArray<string>>([])
    const layer = TelegramClient.layerToken({ token: "TEST" }).pipe(
      Layer.provide(Layer.succeed(HttpClient.HttpClient, mockClient(seen, bodies)))
    )
    return { seen, layer }
  })

describe("TelegramClient transport (generated makeMethods + call)", () => {
  it.effect("decodes snake_case results into camelCase across return shapes", () =>
    Effect.gen(function* () {
      const { layer, seen } = yield* withClient({
        getMe: { ok: true, result: { id: 7, is_bot: true, first_name: "FiberBot", username: "fiber_bot" } },
        sendMessage: {
          ok: true,
          result: { message_id: 100, date: 0, chat: { id: 42, type: "private" }, text: "yo" }
        },
        deleteMessage: { ok: true, result: true }
      })

      const result = yield* Effect.gen(function* () {
        const tg = yield* TelegramClient.TelegramClient
        const me = yield* tg.getMe()
        const msg = yield* tg.sendMessage({ chatId: 42, text: "yo" })
        const deleted = yield* tg.deleteMessage({ chatId: 42, messageId: 100 })
        return { me, msg, deleted }
      }).pipe(Effect.provide(layer))

      // Object return with snake_case fields mapped to camelCase.
      expect(result.me.isBot).toBe(true)
      expect(result.me.username).toBe("fiber_bot")
      // Nested object return (Message -> Chat).
      expect(result.msg.messageId).toBe(100)
      expect(result.msg.chat.id).toBe(42)
      // Boolean return.
      expect(result.deleted).toBe(true)
      // Each call routed to its own method endpoint.
      expect(yield* Ref.get(seen)).toEqual(["getMe", "sendMessage", "deleteMessage"])
    }))

  it.effect("maps an ok:false envelope onto the typed error union", () =>
    Effect.gen(function* () {
      const { layer } = yield* withClient({
        sendMessage: { ok: false, error_code: 429, description: "Too Many Requests", parameters: { retry_after: 3 } }
      })

      const error = yield* Effect.gen(function* () {
        const tg = yield* TelegramClient.TelegramClient
        return yield* tg.sendMessage({ chatId: 1, text: "hi" })
      }).pipe(Effect.provide(layer), Effect.flip)

      expect(error._tag).toBe("RateLimited")
    }))
})
