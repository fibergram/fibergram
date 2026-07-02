---
"@fibergram/webhook": minor
"@fibergram/polling": minor
---

M4 — full ingestion: webhook transport + durable offset commit.

- `@fibergram/webhook`: `Webhook.make` turns the webhook into a second producer into the shared `Queue<Update>` (same `Stream.fromQueue` contract as polling). It exposes a framework-agnostic `handle(Request) => Promise<Response>` (constant-time secret-token validation → 401 on spoof, `Schema.fromJsonString` decode → log + 200 drop on malformed, fast-ack `offer` + 200) and the Effect-native `httpApp` (`Effect<HttpServerResponse, never, HttpServerRequest>`) mounted via `HttpRouter.add`. Durable-ack is a Layer parameter (`persist?`): persist → offer → 200, with 500 on persist failure so Telegram re-delivers (at-least-once; dedup by `updateId` removes duplicates). Thin adapters ship as subpath exports `@fibergram/webhook/express` (`Express.middleware`) and `@fibergram/webhook/fastify` (`Fastify.handler`), both bridging the framework request/response to `handle` with zero runtime coupling (optional peer deps).
- `@fibergram/polling`: `OffsetStore` port (`load` / `commit`) makes offset commit durable across restarts — resume from the persisted offset, commit `highest updateId + 1` after each enqueued batch. Combined with dedup by `updateId` this yields effectively-once processing. Omit the store for the previous in-memory behaviour.
