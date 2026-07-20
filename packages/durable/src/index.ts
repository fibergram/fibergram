/**
 * `@fibergram/durable` - the durable backend for long-lived sessions.
 * It isolates the volatile v4-beta perimeter
 * behind fibergram's own ports: a {@link module:PersistedDialogStore} backing
 * `@fibergram/core`'s `DialogStore` over a `KeyValueStore` (so sessions survive a
 * deploy/restart and replay), a {@link module:DurableTimer} for pacing that
 * outlives the process, and a {@link module:PassivatingEntityManager} that evicts
 * idle dialogs and rehydrates them on the next update behind a per-address latch.
 *
 * The `@effect/workflow`/`cluster` binding (the weekly-breaking modules) is an
 * alternative backend behind these same ports, kept off the critical
 * path so `core` and `durable` stay publishable through the churn.
 *
 * @since 0.1.0
 */

/**
 * A durable `DialogStore` backend over `effect/unstable/persistence`'s
 * `KeyValueStore`.
 *
 * @since 0.1.0
 */
export * as PersistedDialogStore from "./PersistedDialogStore.js"

/**
 * The `DurableTimer` port and its persisted, restart-surviving backend.
 *
 * @since 0.1.0
 */
export * as DurableTimer from "./DurableTimer.js"

/**
 * A passivating virtual-actor runtime: idle eviction, rehydrate on next update,
 * per-address latch surviving passivation.
 *
 * @since 0.1.0
 */
export * as PassivatingEntityManager from "./PassivatingEntityManager.js"

/**
 * A filesystem-backed `KeyValueStore` layer (one file per key) for polling
 * deployments that want durability with no external service.
 *
 * @since 0.1.0
 */
export * as FileKeyValueStore from "./FileKeyValueStore.js"
