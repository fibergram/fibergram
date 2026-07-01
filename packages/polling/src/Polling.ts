/**
 * Long-polling ingestion (design section 7). The transport is just a **producer into a
 * shared `Queue<Update>`**; the dispatcher drains `Stream.fromQueue`. Ingestion
 * knows nothing about handlers, and handlers know nothing about the transport - * which is exactly what makes webhook a drop-in second producer later (section 7.1).
 *
 * **Offset management.** `getUpdates(offset)` needs the offset committed so the
 * same update is not fetched twice. We commit `highest updateId + 1` *after*
 * enqueueing the batch; a crash between enqueue and commit re-fetches, and dedup
 * by `updateId` (design section 13.5) makes that reprocessing harmless - at-least-once
 * fetch + idempotent processing ~ exactly-once.
 *
 * @since 0.1.0
 */
import type { BotApi } from "@fibergram/client"
import { TelegramClient } from "@fibergram/client"
import type { Scope, Stream } from "effect"
import { Duration, Effect, Queue, Ref, Stream as StreamNs } from "effect"

const emptyUpdates: ReadonlyArray<BotApi.Update> = []

/**
 * Options for {@link make}.
 *
 * @category models
 * @since 0.1.0
 */
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

/**
 * Starts long polling as a background fiber owned by the ambient `Scope`, and
 * returns the `Stream<Update>` the dispatcher consumes. Rate limits honour
 * `retry_after`; other errors are logged and retried after `errorBackoff`, so
 * the loop never dies on a transient failure.
 *
 * @example
 * import { Polling } from "@fibergram/polling"
 * import { Dispatcher, Dialog, DialogStore, Dedup } from "@fibergram/core"
 * import { TelegramClient } from "@fibergram/client"
 * import { Effect, Layer } from "effect"
 * import { FetchHttpClient } from "effect/unstable/http"
 *
 * const echo = Dialog.stateless({ onUpdate: () => Effect.void })
 *
 * const program = Effect.gen(function* () {
 *   const updates = yield* Polling.make()
 *   yield* Dispatcher.run({ updates, dialog: echo })
 * }).pipe(
 *   Effect.scoped,
 *   Effect.provide([
 *     DialogStore.layerMemory,
 *     Dedup.layerMemory,
 *     TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
 *   ])
 * )
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = (
  options?: MakeOptions
): Effect.Effect<Stream.Stream<BotApi.Update>, never, TelegramClient.TelegramClient | Scope.Scope> =>
  Effect.gen(function* () {
    const tg = yield* TelegramClient.TelegramClient
    const timeout = options?.timeout ?? 30
    const limit = options?.limit ?? 100
    const errorBackoff = options?.errorBackoff ?? Duration.seconds(1)
    const capacity = options?.capacity ?? 1024
    const allowedUpdates = options?.allowedUpdates

    const queue = yield* Queue.bounded<BotApi.Update>(capacity)
    const offsetRef = yield* Ref.make<number | undefined>(undefined)

    const loop = Effect.forever(
      Effect.gen(function* () {
        const offset = yield* Ref.get(offsetRef)
        const params: BotApi.GetUpdatesParams = {
          timeout,
          limit,
          ...(offset !== undefined ? { offset } : {}),
          ...(allowedUpdates !== undefined ? { allowedUpdates } : {})
        }

        const updates = yield* tg.getUpdates(params).pipe(
          // Rate limits: wait exactly as long as Telegram asks, keep the offset.
          Effect.catchTag("RateLimited", (error) =>
            Effect.as(Effect.sleep(error.retryAfter), emptyUpdates)),
          // Anything else (typed error or defect): log, back off, keep the offset.
          Effect.catchCause((cause) =>
            Effect.as(
              Effect.andThen(
                Effect.logWarning("fibergram: polling failed", cause),
                Effect.sleep(errorBackoff)
              ),
              emptyUpdates
            ))
        )

        yield* Effect.forEach(updates, (update) => Queue.offer(queue, update), {
          discard: true
        })

        // Commit offset only after the whole batch is enqueued.
        const highest = updates.reduce(
          (max, update) => (update.updateId > max ? update.updateId : max),
          -1
        )
        if (highest >= 0) {
          yield* Ref.set(offsetRef, highest + 1)
        }
      })
    )

    yield* Effect.forkScoped(loop)
    return StreamNs.fromQueue(queue)
  })
