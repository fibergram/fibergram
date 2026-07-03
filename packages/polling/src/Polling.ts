/**
 * Long-polling ingestion. The transport is just a **producer into a
 * shared `Queue<Update>`**; the dispatcher drains `Stream.fromQueue`. Ingestion
 * knows nothing about handlers, and handlers know nothing about the transport - * which is exactly what makes webhook a drop-in second producer later.
 *
 * **Offset management.** `getUpdates(offset)` needs the offset committed so the
 * same update is not fetched twice. We commit `highest updateId + 1` *after*
 * enqueueing the batch; a crash between enqueue and commit re-fetches, and dedup
 * by `updateId` makes that reprocessing harmless - at-least-once
 * fetch + idempotent processing ~ exactly-once.
 *
 * **Durability.** By default the offset lives in an in-memory `Ref` and resets on
 * restart (Telegram still redelivers its ~24h backlog, so nothing is lost - it is
 * merely refetched). Pass an {@link OffsetStore} to persist the committed offset
 * across restarts and resume exactly where the last run stopped.
 *
 * @since 0.1.0
 */
import { Duration, Effect, Option, Queue, Ref, Stream as StreamNs } from "effect"

import { TelegramClient } from "@fibergram/client"

import type { BotApi } from "@fibergram/client"
import type { Scope, Stream } from "effect"


const emptyUpdates: ReadonlyArray<BotApi.Update> = []

/**
 * A durable home for the polling offset (M4). Implement it over
 * whatever store survives a restart (a file, Redis, a row) and pass it to
 * {@link make}; `load` seeds the initial offset on start, `commit` persists
 * `highest updateId + 1` after each batch is enqueued. Both must be `R = never` -
 * close over your store handle.
 *
 * @category models
 * @since 0.1.0
 */
export interface OffsetStore {
  /** The last committed offset, or `None` on a first run. */
  readonly load: Effect.Effect<Option.Option<number>>
  /** Persist the next offset (`highest updateId + 1`) after a batch is enqueued. */
  readonly commit: (offset: number) => Effect.Effect<void>
}

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
  /** Persist the offset across restarts. Omit for an in-memory offset (default). */
  readonly offsetStore?: OffsetStore
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
    const offsetStore = options?.offsetStore

    const queue = yield* Queue.bounded<BotApi.Update>(capacity)
    // Resume from the persisted offset when a store is provided; otherwise start
    // fresh and let Telegram's backlog redelivery + dedup cover the gap.
    const initialOffset = offsetStore === undefined
      ? undefined
      : Option.getOrUndefined(yield* offsetStore.load)
    const offsetRef = yield* Ref.make<number | undefined>(initialOffset)

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
          (max, update) => (Math.max(update.updateId, max)),
          -1
        )
        if (highest >= 0) {
          const next = highest + 1
          yield* Ref.set(offsetRef, next)
          // Persist after enqueue; a commit defect is logged, not fatal - the
          // offset stays and the next batch re-commits, dedup absorbs the overlap.
          if (offsetStore !== undefined) {
            yield* offsetStore.commit(next).pipe(
              Effect.catchCause((cause) =>
                Effect.logWarning("fibergram: offset commit failed", cause))
            )
          }
        }
      })
    )

    yield* Effect.forkScoped(loop)
    return StreamNs.fromQueue(queue)
  })
