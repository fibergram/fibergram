import { it } from "@effect/vitest"
import { Effect, Stream } from "effect"
import express from "express"
import { describe, expect } from "vitest"

import { Express, Webhook } from "@fibergram/webhook"

import type { Express as ExpressApp } from "express"
import type { Server } from "node:http"
import type { AddressInfo } from "node:net"


const updateJson = (id: number, text: string): string =>
  JSON.stringify({
    update_id: id,
    message: { message_id: id, date: 0, chat: { id: 1, type: "private" }, text }
  })

// Boot a real express server on an ephemeral port, tied to the Effect scope so it
// is closed when the test finishes.
const server = (configure: (app: ExpressApp) => void) =>
  Effect.acquireRelease(
    Effect.promise(
      () =>
        new Promise<{ readonly url: string; readonly listening: Server }>((resolve) => {
          const app = express()
          configure(app)
          const listening = app.listen(0, () => {
            const port = (listening.address() as AddressInfo).port
            resolve({ url: `http://localhost:${port}/webhook`, listening })
          })
        })
    ),
    ({ listening }) => Effect.promise(() => new Promise<void>((done) => listening.close(() => done())))
  )

const post = (url: string, body: string, headers: Record<string, string>) =>
  Effect.promise(() =>
    fetch(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body }))

describe("Express adapter", () => {
  it.live("bridges a validly-signed update through express.json(): 200 + enqueued", () =>
    Effect.gen(function* () {
      const webhook = yield* Webhook.make({ secretToken: "s3cret" })
      const { url } = yield* server((app) => {
        app.use(express.json())
        app.post("/webhook", Express.middleware(webhook))
      })

      const response = yield* post(url, updateJson(11, "hi"), {
        [Webhook.secretTokenHeader]: "s3cret"
      })
      expect(response.status).toBe(200)

      const updates = yield* Stream.runCollect(Stream.take(webhook.updates, 1))
      expect(updates.map((u) => u.updateId)).toEqual([11])
    }).pipe(Effect.scoped))

  it.live("handles a raw Buffer body (express.raw): 200 + enqueued", () =>
    Effect.gen(function* () {
      const webhook = yield* Webhook.make({ secretToken: "s3cret" })
      const { url } = yield* server((app) => {
        app.use(express.raw({ type: () => true }))
        app.post("/webhook", Express.middleware(webhook))
      })

      const response = yield* post(url, updateJson(12, "raw"), {
        [Webhook.secretTokenHeader]: "s3cret"
      })
      expect(response.status).toBe(200)

      const updates = yield* Stream.runCollect(Stream.take(webhook.updates, 1))
      expect(updates.map((u) => u.updateId)).toEqual([12])
    }).pipe(Effect.scoped))

  it.live("rejects a wrong secret token with 401", () =>
    Effect.gen(function* () {
      const webhook = yield* Webhook.make({ secretToken: "s3cret" })
      const { url } = yield* server((app) => {
        app.use(express.json())
        app.post("/webhook", Express.middleware(webhook))
      })

      const response = yield* post(url, updateJson(1, "x"), {
        [Webhook.secretTokenHeader]: "wrong"
      })
      expect(response.status).toBe(401)
    }).pipe(Effect.scoped))
})
