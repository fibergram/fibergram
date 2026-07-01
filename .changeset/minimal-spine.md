---
"@fibergram/client": minor
"@fibergram/core": minor
"@fibergram/polling": minor
---

The first real public API lands on Effect v4.

- `@fibergram/client`: `TelegramClient` service (Tag + Layer over `HttpClient`), Bot API edge schemas with `snake_case ↔ camelCase` mapping via `Schema.encodeKeys`, and the typed `TelegramError` union with a response mapper.
- `@fibergram/core`: pluggable `DialogAddress` extractors, the `Dialog` decider (+ `Dialog.stateless`), `Decision`, in-memory `DialogStore` and `Dedup` ports, the `EntityManager` virtual-actor runtime (per-address ordering, cross-address concurrency, `catchCause` isolation), the `Dispatcher` loop, and `Retry.retryRateLimited` honouring `retry_after`.
- `@fibergram/polling`: long-polling ingestion producing into a shared `Queue<Update>` with offset management, exposed as a `Stream<Update>`.

An echo bot now runs end-to-end on polling with typed errors and Telegram-semantic rate-limit retries; a crash in one chat does not affect others.
