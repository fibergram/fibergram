import { it } from "@effect/vitest"
import { Effect, Option, Stream } from "effect"
import { HttpServerRequest } from "effect/unstable/http"
import { describe, expect } from "vitest"

import { Multibot, Webhook } from "@fibergram/webhook"

// Same snake_case Bot API fixtures as the single-bot suite: webhook bodies are
// raw Bot API JSON, decoded to camelCase at the client edge.
const updateJson = (id: number, text: string): string =>
  JSON.stringify({
    update_id: id,
    message: { message_id: id, date: 0, chat: { id: 1, type: "private" }, text }
  })

// Path carries the routing token, mirroring setWebhook(https://host/webhook/<token>).
const request = (path: string, body: string, headers?: Record<string, string>): Request =>
  new Request(
    `http://localhost${path}`,
    headers === undefined
      ? { method: "POST", body }
      : { method: "POST", body, headers }
  )

const withSecret = (
  path: string,
  token: string,
  body: string
): Request => request(path, body, { [Webhook.secretTokenHeader]: token })

const serverRequest = (path: string, body: string, headers?: Record<string, string>) =>
  HttpServerRequest.fromWeb(request(path, body, headers))

describe("Multibot webhook fan-out", () => {
  describe("handle - framework-agnostic (web Request/Response)", () => {
    it.effect("routes to the bot named by the last path segment", () =>
      Effect.gen(function* () {
        const alice = yield* Webhook.make({ secretToken: "alice-secret" })
        const bob = yield* Webhook.make({ secretToken: "bob-secret" })
        const multibot = Multibot.fromMap(
          new Map([
            ["alice-token", alice],
            ["bob-token", bob]
          ])
        )

        const toAlice = yield* Effect.promise(() =>
          multibot.handle(withSecret("/webhook/alice-token", "alice-secret", updateJson(1, "hi alice"))))
        expect(toAlice.status).toBe(200)

        const toBob = yield* Effect.promise(() =>
          multibot.handle(withSecret("/webhook/bob-token", "bob-secret", updateJson(2, "hi bob"))))
        expect(toBob.status).toBe(200)

        // Each update landed on its own bot's stream, not the other's.
        const aliceUpdates = yield* Stream.runCollect(Stream.take(alice.updates, 1))
        expect(aliceUpdates.map((u) => u.message?.text)).toEqual(["hi alice"])
        const bobUpdates = yield* Stream.runCollect(Stream.take(bob.updates, 1))
        expect(bobUpdates.map((u) => u.message?.text)).toEqual(["hi bob"])
      }).pipe(Effect.scoped))

    it.effect("answers 404 for an unknown token without touching any queue", () =>
      Effect.gen(function* () {
        const alice = yield* Webhook.make({ secretToken: "alice-secret" })
        const multibot = Multibot.fromMap(new Map([["alice-token", alice]]))

        const unknown = yield* Effect.promise(() =>
          multibot.handle(withSecret("/webhook/ghost-token", "alice-secret", updateJson(1, "x"))))
        expect(unknown.status).toBe(404)

        // The ghost request never enqueued: the next valid update to alice is first.
        yield* Effect.promise(() =>
          multibot.handle(withSecret("/webhook/alice-token", "alice-secret", updateJson(9, "ok"))))
        const updates = yield* Stream.runCollect(Stream.take(alice.updates, 1))
        expect(updates.map((u) => u.updateId)).toEqual([9])
      }).pipe(Effect.scoped))

    it.effect("answers 404 when the path carries no routable segment", () =>
      Effect.gen(function* () {
        const alice = yield* Webhook.make({ secretToken: "alice-secret" })
        const multibot = Multibot.fromMap(new Map([["alice-token", alice]]))

        const response = yield* Effect.promise(() =>
          multibot.handle(withSecret("/", "alice-secret", updateJson(1, "x"))))
        expect(response.status).toBe(404)
      }).pipe(Effect.scoped))

    it.effect("passes the resolved bot's own status through (401 on a wrong secret)", () =>
      Effect.gen(function* () {
        const alice = yield* Webhook.make({ secretToken: "alice-secret" })
        const multibot = Multibot.fromMap(new Map([["alice-token", alice]]))

        const spoofed = yield* Effect.promise(() =>
          multibot.handle(withSecret("/webhook/alice-token", "wrong", updateJson(1, "x"))))
        expect(spoofed.status).toBe(401)
      }).pipe(Effect.scoped))

    it.effect("make: resolves bots dynamically at request time", () =>
      Effect.gen(function* () {
        const alice = yield* Webhook.make({ secretToken: "alice-secret" })
        const registry = new Map<string, Webhook.Webhook>()
        const multibot = Multibot.make({
          resolve: (key) => Effect.succeed(Option.fromNullishOr(registry.get(key)))
        })

        // Not registered yet -> 404.
        const before = yield* Effect.promise(() =>
          multibot.handle(withSecret("/webhook/alice-token", "alice-secret", updateJson(1, "x"))))
        expect(before.status).toBe(404)

        // Register, then the same request routes through.
        registry.set("alice-token", alice)
        const after = yield* Effect.promise(() =>
          multibot.handle(withSecret("/webhook/alice-token", "alice-secret", updateJson(3, "now"))))
        expect(after.status).toBe(200)

        const updates = yield* Stream.runCollect(Stream.take(alice.updates, 1))
        expect(updates.map((u) => u.updateId)).toEqual([3])
      }).pipe(Effect.scoped))
  })

  describe("httpApp - Effect-native (HttpServerRequest/Response)", () => {
    it.effect("routes by path segment and answers 200", () =>
      Effect.gen(function* () {
        const alice = yield* Webhook.make({ secretToken: "alice-secret" })
        const multibot = Multibot.fromMap(new Map([["alice-token", alice]]))

        const response = yield* multibot.httpApp.pipe(
          Effect.provideService(
            HttpServerRequest.HttpServerRequest,
            serverRequest("/webhook/alice-token", updateJson(4, "hey"), {
              [Webhook.secretTokenHeader]: "alice-secret"
            })
          )
        )
        expect(response.status).toBe(200)

        const updates = yield* Stream.runCollect(Stream.take(alice.updates, 1))
        expect(updates.map((u) => u.updateId)).toEqual([4])
      }).pipe(Effect.scoped))

    it.effect("answers 404 for an unknown token", () =>
      Effect.gen(function* () {
        const alice = yield* Webhook.make({ secretToken: "alice-secret" })
        const multibot = Multibot.fromMap(new Map([["alice-token", alice]]))

        const response = yield* multibot.httpApp.pipe(
          Effect.provideService(
            HttpServerRequest.HttpServerRequest,
            serverRequest("/webhook/ghost", updateJson(1, "x"), {
              [Webhook.secretTokenHeader]: "alice-secret"
            })
          )
        )
        expect(response.status).toBe(404)
      }).pipe(Effect.scoped))
  })
})
