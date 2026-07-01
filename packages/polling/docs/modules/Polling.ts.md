---

title: Polling.ts
nav_order: 2
parent: Modules
---

## Polling overview

Long-polling ingestion (design section 7). The transport is just a **producer into a
shared `Queue<Update>`**; the dispatcher drains `Stream.fromQueue`. Ingestion
knows nothing about handlers, and handlers know nothing about the transport - * which is exactly what makes webhook a drop-in second producer later (section 7.1).

**Offset management.** `getUpdates(offset)` needs the offset committed so the
same update is not fetched twice. We commit `highest updateId + 1` _after_
enqueueing the batch; a crash between enqueue and commit re-fetches, and dedup
by `updateId` (design section 13.5) makes that reprocessing harmless - at-least-once
fetch + idempotent processing ~ exactly-once.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [MakeOptions (interface)](#makeoptions-interface)

---

# constructors

## make

Starts long polling as a background fiber owned by the ambient `Scope`, and
returns the `Stream<Update>` the dispatcher consumes. Rate limits honour
`retry_after`; other errors are logged and retried after `errorBackoff`, so
the loop never dies on a transient failure.

**Signature**

```ts
export declare const make: (
  options?: MakeOptions
) => Effect.Effect<Stream.Stream<BotApi.Update>, never, TelegramClient.TelegramClient | Scope.Scope>
```

**Example**

```ts
import { Polling } from "@fibergram/polling"
import { Dispatcher, Dialog, DialogStore, Dedup } from "@fibergram/core"
import { TelegramClient } from "@fibergram/client"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

const echo = Dialog.stateless({ onUpdate: () => Effect.void })

const program = Effect.gen(function* () {
  const updates = yield* Polling.make()
  yield* Dispatcher.run({ updates, dialog: echo })
}).pipe(
  Effect.scoped,
  Effect.provide([
    DialogStore.layerMemory,
    Dedup.layerMemory,
    TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
  ])
)
```

Added in v0.1.0

# models

## MakeOptions (interface)

Options for {@link make}.

**Signature**

```ts
export interface MakeOptions {
  /** Long-poll timeout in seconds passed to `getUpdates` (default 30). */
  readonly timeout?: number
  /** Max updates per batch (default 100). */
  readonly limit?: number
  /** Restrict the update types Telegram sends (default: all). */
  readonly allowedUpdates?: ReadonlyArray<string>
  /** Backoff after a non-rate-limit polling error (default 1s). */
  readonly errorBackoff?: Duration.Duration
  /** Bounded queue capacity; full queue back-pressures polling (default 1024). */
  readonly capacity?: number
}
```

Added in v0.1.0
