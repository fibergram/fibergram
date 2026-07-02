import { it } from "@effect/vitest"
import { Effect, Ref, Stream } from "effect"
import { HttpServerRequest } from "effect/unstable/http"
import { describe, expect } from "vitest"

import { Webhook } from "@fibergram/webhook"

// Webhook bodies arrive as raw Bot API JSON - snake_case, decoded to camelCase
// at the client edge (section 5.3). So the fixtures are snake_case on purpose.
const updateJson = (id: number, text: string): string =>
  JSON.stringify({
    update_id: id,
    message: { message_id: id, date: 0, chat: { id: 1, type: "private" }, text }
  })

// Node >= 20 ships web-standard Request/Response globally, matching the
// framework-agnostic contract Webhook.handle speaks.
const request = (body: string, headers?: Record<string, string>): Request =>
  new Request(
    "http://localhost/webhook",
    headers === undefined
      ? { method: "POST", body }
      : { method: "POST", body, headers }
  )

const withSecret = (token: string, body: string): Request =>
  request(body, { [Webhook.secretTokenHeader]: token })

// The Effect-native path reads the active HttpServerRequest; `fromWeb` lifts a
// web Request into one so both entrypoints run off the same fixtures.
const serverRequest = (body: string, headers?: Record<string, string>) =>
  HttpServerRequest.fromWeb(request(body, headers))

describe("Webhook ingestion (section 7.1)", () => {
  describe("handle - framework-agnostic (web Request/Response)", () => {
    it.effect("accepts a validly-signed update: 200 + decoded update on the stream", () =>
      Effect.gen(function* () {
        const webhook = yield* Webhook.make({ secretToken: "s3cret" })

        const response = yield* Effect.promise(() =>
          webhook.handle(withSecret("s3cret", updateJson(7, "hi"))))
        expect(response.status).toBe(200)

        const updates = yield* Stream.runCollect(Stream.take(webhook.updates, 1))
        expect(updates.map((u) => u.updateId)).toEqual([7])
        expect(updates.map((u) => u.message?.text)).toEqual(["hi"])
      }).pipe(Effect.scoped))

    it.effect("rejects a wrong secret token with 401 (do not stay silent to spoofers)", () =>
      Effect.gen(function* () {
        const webhook = yield* Webhook.make({ secretToken: "s3cret" })
        const response = yield* Effect.promise(() =>
          webhook.handle(withSecret("wrong", updateJson(1, "x"))))
        expect(response.status).toBe(401)
      }).pipe(Effect.scoped))

    it.effect("rejects a missing secret-token header with 401", () =>
      Effect.gen(function* () {
        const webhook = yield* Webhook.make({ secretToken: "s3cret" })
        const response = yield* Effect.promise(() =>
          webhook.handle(request(updateJson(1, "x"))))
        expect(response.status).toBe(401)
      }).pipe(Effect.scoped))

    it.effect("drops an authenticated-but-malformed body with 200 (no retry storm)", () =>
      Effect.gen(function* () {
        const webhook = yield* Webhook.make({ secretToken: "s3cret" })

        const bad = yield* Effect.promise(() =>
          webhook.handle(withSecret("s3cret", "{ not json")))
        expect(bad.status).toBe(200)

        // The malformed update was dropped, not enqueued: the next valid update is
        // the first thing the stream yields.
        yield* Effect.promise(() => webhook.handle(withSecret("s3cret", updateJson(42, "ok"))))
        const updates = yield* Stream.runCollect(Stream.take(webhook.updates, 1))
        expect(updates.map((u) => u.updateId)).toEqual([42])
      }).pipe(Effect.scoped))

    it.effect("accepts without a token when none is configured", () =>
      Effect.gen(function* () {
        const webhook = yield* Webhook.make()
        const response = yield* Effect.promise(() =>
          webhook.handle(request(updateJson(3, "y"))))
        expect(response.status).toBe(200)

        const updates = yield* Stream.runCollect(Stream.take(webhook.updates, 1))
        expect(updates.map((u) => u.updateId)).toEqual([3])
      }).pipe(Effect.scoped))
  })

  describe("httpApp - Effect-native (HttpServerRequest/Response)", () => {
    it.effect("validates and enqueues the update, answering 200", () =>
      Effect.gen(function* () {
        const webhook = yield* Webhook.make({ secretToken: "s3cret" })

        const response = yield* webhook.httpApp.pipe(
          Effect.provideService(
            HttpServerRequest.HttpServerRequest,
            serverRequest(updateJson(9, "hey"), { [Webhook.secretTokenHeader]: "s3cret" })
          )
        )
        expect(response.status).toBe(200)

        const updates = yield* Stream.runCollect(Stream.take(webhook.updates, 1))
        expect(updates.map((u) => u.updateId)).toEqual([9])
      }).pipe(Effect.scoped))

    it.effect("rejects a wrong secret token with 401", () =>
      Effect.gen(function* () {
        const webhook = yield* Webhook.make({ secretToken: "s3cret" })
        const response = yield* webhook.httpApp.pipe(
          Effect.provideService(
            HttpServerRequest.HttpServerRequest,
            serverRequest(updateJson(1, "x"), { [Webhook.secretTokenHeader]: "wrong" })
          )
        )
        expect(response.status).toBe(401)
      }).pipe(Effect.scoped))
  })

  describe("durable-ack - persist before ack (section 7.2)", () => {
    it.effect("persists, enqueues and answers 200 on success", () =>
      Effect.gen(function* () {
        const persisted = yield* Ref.make<ReadonlyArray<number>>([])
        const webhook = yield* Webhook.make({
          secretToken: "s3cret",
          persist: (update) => Ref.update(persisted, (all) => [...all, update.updateId])
        })

        const response = yield* Effect.promise(() =>
          webhook.handle(withSecret("s3cret", updateJson(5, "z"))))
        expect(response.status).toBe(200)
        expect(yield* Ref.get(persisted)).toEqual([5])

        const updates = yield* Stream.runCollect(Stream.take(webhook.updates, 1))
        expect(updates.map((u) => u.updateId)).toEqual([5])
      }).pipe(Effect.scoped))

    it.effect("answers 500 and does not enqueue when persist fails (Telegram retries)", () =>
      Effect.gen(function* () {
        const webhook = yield* Webhook.make({
          secretToken: "s3cret",
          // Fail only for update 6, so update 42 can prove 6 never reached the queue.
          persist: (update) =>
            update.updateId === 6 ? Effect.fail("boom") : Effect.void
        })

        const bad = yield* Effect.promise(() =>
          webhook.handle(withSecret("s3cret", updateJson(6, "z"))))
        expect(bad.status).toBe(500)

        yield* Effect.promise(() => webhook.handle(withSecret("s3cret", updateJson(42, "ok"))))
        const updates = yield* Stream.runCollect(Stream.take(webhook.updates, 1))
        expect(updates.map((u) => u.updateId)).toEqual([42])
      }).pipe(Effect.scoped))
  })
})
