/**
 * `PersistedDialogStore` - a durable backend for `@fibergram/core`'s
 * {@link module:DialogStore.DialogStore} port, layered over
 * `effect/unstable/persistence`'s `KeyValueStore`.
 *
 * This is the cornerstone of durability: `@fibergram/core` already event-sources
 * dialog state (the coroutine folds each answered prompt / recorded activity into
 * a snapshot and hands it to the store on every update). Swap the in-memory store
 * for this one and that snapshot lands in a `KeyValueStore` - so a session
 * **survives a deploy/restart** and **replays** to exactly where it left off, with
 * no change to handler code (the promise: regime is a Layer choice).
 *
 * State is serialized as JSON. The core port stores state as `unknown`, so this
 * backend cannot know the concrete schema; the constraint is that persisted
 * dialog state must be JSON round-trippable (true for coroutine snapshots, whose
 * replay driver reads only the JSON-safe `log`/`asked`/`done` fields). A typed,
 * schema-migrated store is a later milestone (see core's `DialogStore`).
 *
 * A store or (de)serialization failure is turned into a **defect** (`orDie`): the
 * core port's error channel is `never`, and the {@link module:EntityManager}
 * catches the whole `Cause` at the address boundary, so a transient persistence
 * failure drops that one update's turn without taking the bot down.
 *
 * @since 0.1.0
 */
import { Effect, Layer, Option } from "effect"
import { KeyValueStore } from "effect/unstable/persistence"

import { DialogStore } from "@fibergram/core"

/**
 * The key namespace every dialog snapshot is stored under, keeping fibergram's
 * keys from colliding with other users of the same `KeyValueStore`.
 *
 * @category constants
 * @since 0.1.0
 */
export const keyPrefix = "fibergram:dialog:" as const

/**
 * Builds a {@link module:DialogStore.DialogStoreService} over a `KeyValueStore`.
 * Snapshots are JSON-encoded under {@link keyPrefix}. Store and JSON failures
 * become defects.
 *
 * @example
 * import { PersistedDialogStore } from "@fibergram/durable"
 * import { Effect } from "effect"
 * import { KeyValueStore } from "effect/unstable/persistence"
 *
 * const program = Effect.gen(function* () {
 *   const kvs = yield* KeyValueStore.KeyValueStore
 *   const store = PersistedDialogStore.make(kvs)
 *   yield* store.save("registration:1::", { log: [], asked: false, done: false })
 * }).pipe(Effect.provide(KeyValueStore.layerMemory))
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = (kvs: KeyValueStore.KeyValueStore): DialogStore.DialogStoreService => {
  const store = KeyValueStore.prefix(kvs, keyPrefix)
  return {
    load: (key) =>
      store.get(key).pipe(
        Effect.flatMap((raw) =>
          Option.match(Option.fromNullishOr(raw), {
            onNone: () => Effect.succeedNone,
            onSome: (json) =>
              Effect.map(
                Effect.try(() => JSON.parse(json) as unknown),
                Option.some
              )
          })),
        Effect.orDie
      ),
    save: (key, state) =>
      Effect.try(() => JSON.stringify(state)).pipe(
        Effect.flatMap((json) => store.set(key, json)),
        Effect.orDie
      )
  }
}

/**
 * A {@link module:DialogStore.DialogStore} Layer backed by whatever
 * `KeyValueStore` is in context - compose it with a concrete store Layer
 * (`KeyValueStore.layerFileSystem`, `KeyValueStore.layerSql`, ...) for durable
 * production storage.
 *
 * @example
 * import { DialogStore } from "@fibergram/core"
 * import { PersistedDialogStore } from "@fibergram/durable"
 * import { Layer } from "effect"
 * import { KeyValueStore } from "effect/unstable/persistence"
 *
 * const durableStore: Layer.Layer<DialogStore.DialogStore> = PersistedDialogStore.layer.pipe(
 *   Layer.provide(KeyValueStore.layerMemory)
 * )
 *
 * @category layers
 * @since 0.1.0
 */
export const layer: Layer.Layer<DialogStore.DialogStore, never, KeyValueStore.KeyValueStore> =
  Layer.effect(DialogStore.DialogStore, Effect.map(KeyValueStore.KeyValueStore, make))

/**
 * A self-contained durable-store Layer over an **in-memory** `KeyValueStore`.
 * State survives within one process (and across a rehydrate/passivation cycle)
 * but not a real restart - use {@link layer} with a filesystem/SQL store for
 * that. Ideal for tests that exercise the durable path without a disk or DB.
 *
 * @example
 * import { DialogStore } from "@fibergram/core"
 * import { PersistedDialogStore } from "@fibergram/durable"
 * import { Layer } from "effect"
 *
 * const layer: Layer.Layer<DialogStore.DialogStore> = PersistedDialogStore.layerMemory
 *
 * @category layers
 * @since 0.1.0
 */
export const layerMemory: Layer.Layer<DialogStore.DialogStore> = layer.pipe(
  Layer.provide(KeyValueStore.layerMemory)
)
