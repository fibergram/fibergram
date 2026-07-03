/**
 * `Dedup` - idempotency by `updateId`. Long polling and
 * webhook both retry on failure, so exactly-once processing is achieved by
 * dropping updates whose `updateId` has already been seen. This ships the
 * in-memory backend; a durable event log slots behind the same port later.
 *
 * @since 0.1.0
 */
import { Context, Effect, HashSet, Layer, Ref } from "effect"

/**
 * The dedup port. {@link DedupService.seen} atomically records an `updateId` and
 * reports whether it is *fresh* (first time seen) - `true` means "process it".
 *
 * @category models
 * @since 0.1.0
 */
export interface DedupService {
  readonly seen: (updateId: number) => Effect.Effect<boolean>
}

/**
 * The `Dedup` service tag.
 *
 * @example
 * import { Dedup } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const dedup = yield* Dedup.Dedup
 *   const fresh = yield* dedup.seen(42) // true first time, false after
 * })
 *
 * @category services
 * @since 0.1.0
 */
export class Dedup extends Context.Service<Dedup, DedupService>()(
  "@fibergram/core/Dedup"
) {}

/**
 * An in-memory {@link Dedup} backed by a `Ref<HashSet<number>>`. The check-and-
 * mark is a single atomic `Ref.modify`, so concurrent dispatch cannot double-
 * admit the same update.
 *
 * @example
 * import { Dedup } from "@fibergram/core"
 * import { Layer } from "effect"
 *
 * const layer: Layer.Layer<Dedup.Dedup> = Dedup.layerMemory
 *
 * @category layers
 * @since 0.1.0
 */
export const layerMemory: Layer.Layer<Dedup> = Layer.effect(
  Dedup,
  Effect.map(Ref.make(HashSet.empty<number>()), (ref) => ({
    seen: (updateId) =>
      Ref.modify(ref, (set) =>
        HashSet.has(set, updateId)
          ? [false, set]
          : [true, HashSet.add(set, updateId)])
  }))
)
