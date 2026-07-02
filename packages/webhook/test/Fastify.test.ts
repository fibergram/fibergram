import { it } from "@effect/vitest"
import { Effect, Stream } from "effect"
import Fastify_ from "fastify"
import { describe, expect } from "vitest"

import { Fastify, Webhook } from "@fibergram/webhook"

import type { FastifyInstance } from "fastify"
import type { AddressInfo } from "node:net"

const updateJson = (id: number, text: string): string =>
  JSON.stringify({
    update_id: id,
    message: { message_id: id, date: 0, chat: { id: 1, type: "private" }, text }
  })

// Boot a real fastify server on an ephemeral port, tied to the Effect scope.
const server = (configure: (app: FastifyInstance) => void) =>
  Effect.acquireRelease(
    Effect.promise(async () => {
      const app = Fastify_()
      configure(app)
      await app.listen({ port: 0 })
      const port = (app.server.address() as AddressInfo).port
      return { app, url: `http://localhost:${port}/webhook` }
    }),
    ({ app }) => Effect.promise(() => app.close())
  )

const post = (url: string, body: string, headers: Record<string, string>) =>
  Effect.promise(() =>
    fetch(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body }))

describe("Fastify adapter (section 7.1)", () => {
  it.live("bridges a validly-signed update through fastify's parser: 200 + enqueued", () =>
    Effect.gen(function* () {
      const webhook = yield* Webhook.make({ secretToken: "s3cret" })
      const { url } = yield* server((app) => {
        app.post("/webhook", Fastify.handler(webhook))
      })

      const response = yield* post(url, updateJson(21, "hi"), {
        [Webhook.secretTokenHeader]: "s3cret"
      })
      expect(response.status).toBe(200)

      const updates = yield* Stream.runCollect(Stream.take(webhook.updates, 1))
      expect(updates.map((u) => u.updateId)).toEqual([21])
    }).pipe(Effect.scoped))

  it.live("rejects a wrong secret token with 401", () =>
    Effect.gen(function* () {
      const webhook = yield* Webhook.make({ secretToken: "s3cret" })
      const { url } = yield* server((app) => {
        app.post("/webhook", Fastify.handler(webhook))
      })

      const response = yield* post(url, updateJson(1, "x"), {
        [Webhook.secretTokenHeader]: "wrong"
      })
      expect(response.status).toBe(401)
    }).pipe(Effect.scoped))
})
