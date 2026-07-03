/**
 * `DurableTimer` - fibergram's port for **durable, restart-surviving timers**,
 * the substrate of a pacing engine. A days-long RPG that
 * paces events cannot use `Effect.sleep`: a sleeping fiber dies on the next
 * deploy and the pacing is lost. A `DurableTimer` instead **persists** each
 * pending wake-up, so on restart the engine reloads what was due and re-arms the
 * remaining delay - the timer outlives the process.
 *
 * The port is deliberately transport-neutral: `schedule`/`cancel` name a wake-up
 * by `(address, key)`, and a single `onFire` callback - supplied when the engine
 * is built - runs when a timer matures. Wiring `onFire` back into a dialog's
 * mailbox is how "pacing on the same actor" is expressed; a raw
 * engine is equally usable on its own.
 *
 * The backend here stores wake-ups in a `KeyValueStore` behind an explicit index
 * key (the store exposes no key enumeration), and drives them off the Effect
 * `Clock` - so the whole engine runs deterministically on `TestClock`. The
 * `@effect/workflow` `DurableClock` is an alternative backend behind the same
 * port; it is not on the critical path because it couples to a live
 * `WorkflowEngine` (the most volatile beta module).
 *
 * @since 0.1.0
 */
import { Clock, Context, Duration, Effect, Fiber, HashMap, Layer, Option, Ref, Schema, Semaphore } from "effect"
import { KeyValueStore } from "effect/unstable/persistence"

import { DialogAddress } from "@fibergram/core"

import type { Scope } from "effect"

const AddressSchema = Schema.Struct({
  chatId: Schema.Number,
  threadId: Schema.optionalKey(Schema.Number),
  fromId: Schema.optionalKey(Schema.Number),
  kind: Schema.String
})

/**
 * A persisted wake-up record: the full dialog address, the timer key, and the
 * absolute epoch-millis deadline. Storing the absolute deadline (not the
 * original delay) is what lets a restart compute the *remaining* delay.
 *
 * @category models
 * @since 0.1.0
 */
export const Record = Schema.Struct({
  address: AddressSchema,
  timerKey: Schema.String,
  dueAt: Schema.Number
})

/**
 * A persisted wake-up record.
 *
 * @category models
 * @since 0.1.0
 */
export interface Record extends Schema.Schema.Type<typeof Record> {}

/**
 * The `DurableTimer` service surface: arm a wake-up for a dialog address, or
 * cancel a pending one. Both are idempotent by `(address, key)` - scheduling the
 * same key again replaces the deadline; cancelling an unknown key is a no-op.
 *
 * @category models
 * @since 0.1.0
 */
export interface DurableTimerService {
  readonly schedule: (options: {
    readonly address: DialogAddress.DialogAddress
    readonly key: string
    readonly delay: Duration.Input
  }) => Effect.Effect<void>
  readonly cancel: (address: DialogAddress.DialogAddress, key: string) => Effect.Effect<void>
}

/**
 * The `DurableTimer` service tag. A dialog `yield*`s it from an effect to pace
 * itself; the engine is provided once at the edge.
 *
 * @example
 * import { DurableTimer } from "@fibergram/durable"
 * import { DialogAddress } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const armNextTurn = (address: DialogAddress.DialogAddress) =>
 *   Effect.gen(function* () {
 *     const timer = yield* DurableTimer.DurableTimer
 *     yield* timer.schedule({ address, key: "next-turn", delay: "3 days" })
 *   })
 *
 * @category services
 * @since 0.1.0
 */
export class DurableTimer extends Context.Service<DurableTimer, DurableTimerService>()(
  "@fibergram/durable/DurableTimer"
) {}

const indexKey = "index"

// A collision-free store key for a wake-up: JSON keeps `(addressKey, timerKey)`
// unambiguous regardless of what characters either part contains.
const idOf = (address: DialogAddress.DialogAddress, timerKey: string): string =>
  JSON.stringify([DialogAddress.toKey(address), timerKey])

const decodeIndex = Schema.decodeUnknownEffect(Schema.fromJsonString(Schema.Array(Schema.String)))
const encodeIndex = Schema.encodeUnknownEffect(Schema.fromJsonString(Schema.Array(Schema.String)))
const decodeRecord = Schema.decodeUnknownEffect(Schema.fromJsonString(Record))
const encodeRecord = Schema.encodeUnknownEffect(Schema.fromJsonString(Record))

/**
 * Options for {@link make}.
 *
 * @category models
 * @since 0.1.0
 */
export interface MakeOptions {
  /** Where wake-ups persist. Use a filesystem/SQL `KeyValueStore` for real durability. */
  readonly store: KeyValueStore.KeyValueStore
  /**
   * Runs when a timer matures, before its record is removed. Keep it idempotent:
   * a crash after `onFire` but before the record is cleared re-fires on restart
   * (at-least-once, like any durable activity).
   */
  readonly onFire: (address: DialogAddress.DialogAddress, key: string) => Effect.Effect<void>
  /** Namespace for this engine's keys within `store`. Defaults to `"fibergram:timer:"`. */
  readonly keyPrefix?: string
}

/**
 * Builds a scoped {@link DurableTimerService}. On construction it **reloads every
 * persisted wake-up** and re-arms each for its *remaining* delay (so a restart
 * resumes pacing); scheduling forks a fiber into the enclosing `Scope`. Every
 * armed fiber is interrupted when the scope closes, but the persisted records
 * remain - the next `make` over the same store re-arms them.
 *
 * @example
 * import { DurableTimer } from "@fibergram/durable"
 * import { Effect } from "effect"
 * import { KeyValueStore } from "effect/unstable/persistence"
 *
 * const program = Effect.gen(function* () {
 *   const kvs = yield* KeyValueStore.KeyValueStore
 *   const timer = yield* DurableTimer.make({ store: kvs, onFire: () => Effect.void })
 *   return timer
 * }).pipe(Effect.scoped, Effect.provide(KeyValueStore.layerMemory))
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = (
  options: MakeOptions
): Effect.Effect<DurableTimerService, never, Scope.Scope> =>
  Effect.gen(function* () {
    const store = KeyValueStore.prefix(options.store, options.keyPrefix ?? "fibergram:timer:")
    const scope = yield* Effect.scope
    // Live fibers keyed by record id, so a re-schedule/cancel can interrupt the
    // fiber armed for the previous deadline.
    const fibers = yield* Ref.make(HashMap.empty<string, Fiber.Fiber<void>>())
    // Serializes read-modify-write of the index and record set: timers are armed
    // from per-address dialog effects that run concurrently across addresses.
    const gate = yield* Semaphore.make(1)

    const readIndex: Effect.Effect<ReadonlyArray<string>> = store.get(indexKey).pipe(
      Effect.flatMap((raw) =>
        raw === undefined ? Effect.succeed<ReadonlyArray<string>>([]) : decodeIndex(raw)),
      Effect.orDie
    )

    const writeIndex = (ids: ReadonlyArray<string>): Effect.Effect<void> =>
      encodeIndex(ids).pipe(Effect.flatMap((json) => store.set(indexKey, json)), Effect.orDie)

    // Persist a record and index it, atomically under the gate.
    const persist = (id: string, record: Record): Effect.Effect<void> =>
      gate.withPermits(1)(
        Effect.gen(function* () {
          yield* encodeRecord(record).pipe(Effect.flatMap((json) => store.set(id, json)), Effect.orDie)
          const ids = yield* readIndex
          if (!ids.includes(id)) yield* writeIndex([...ids, id])
        })
      )

    // Drop a matured/cancelled timer's persisted trace and forget its fiber.
    const forget = (id: string): Effect.Effect<void> =>
      gate.withPermits(1)(
        Effect.gen(function* () {
          yield* store.remove(id).pipe(Effect.orDie)
          const ids = yield* readIndex
          yield* writeIndex(ids.filter((each) => each !== id))
          yield* Ref.update(fibers, HashMap.remove(id))
        })
      )

    // Interrupt whatever fiber is currently armed for `id`, if any.
    const interruptExisting = (id: string): Effect.Effect<void> =>
      Ref.get(fibers).pipe(
        Effect.flatMap((map) =>
          Option.match(HashMap.get(map, id), {
            onNone: () => Effect.void,
            onSome: (fiber) => Fiber.interrupt(fiber)
          }))
      )

    // Arm a fiber that sleeps `remaining`, then (still supervised) runs `onFire`
    // and clears the record. A defect in `onFire` is logged, not propagated, so
    // one bad wake-up never kills the engine.
    const arm = (record: Record, remaining: Duration.Input): Effect.Effect<void> =>
      Effect.gen(function* () {
        const id = idOf(record.address, record.timerKey)
        const fire = Effect.sleep(remaining).pipe(
          Effect.flatMap(() => options.onFire(record.address, record.timerKey)),
          Effect.catchCause((cause) =>
            Effect.logError(
              `fibergram: durable timer ${DialogAddress.toKey(record.address)}/${record.timerKey} failed`,
              cause
            )),
          Effect.flatMap(() => forget(id))
        )
        const fiber = yield* Effect.forkIn(fire, scope)
        yield* Ref.update(fibers, HashMap.set(id, fiber))
      })

    const schedule: DurableTimerService["schedule"] = (opts) =>
      Effect.gen(function* () {
        const id = idOf(opts.address, opts.key)
        const now = yield* Clock.currentTimeMillis
        const record: Record = {
          address: opts.address,
          timerKey: opts.key,
          dueAt: now + Duration.toMillis(opts.delay)
        }
        yield* interruptExisting(id)
        yield* persist(id, record)
        yield* arm(record, opts.delay)
      })

    const cancel: DurableTimerService["cancel"] = (address, key) =>
      Effect.gen(function* () {
        const id = idOf(address, key)
        yield* interruptExisting(id)
        yield* forget(id)
      })

    // Restart recovery: reload persisted wake-ups and re-arm each for whatever
    // delay is left (clamped to zero, so an already-overdue timer fires at once).
    const now = yield* Clock.currentTimeMillis
    const ids = yield* readIndex
    yield* Effect.forEach(ids, (id) =>
      store.get(id).pipe(
        Effect.flatMap((raw) =>
          raw === undefined ? Effect.succeedNone : Effect.map(decodeRecord(raw), Option.some)),
        Effect.orDie,
        Effect.flatMap(
          Option.match({
            onNone: () => forget(id),
            onSome: (record) => arm(record, Duration.millis(Math.max(0, record.dueAt - now)))
          })
        )), { discard: true })

    return { schedule, cancel }
  })

/**
 * A {@link DurableTimer} Layer over the `KeyValueStore` in context, wired to
 * `onFire`. Compose with a concrete store Layer for real durability.
 *
 * @example
 * import { DurableTimer } from "@fibergram/durable"
 * import { Effect, Layer } from "effect"
 * import { KeyValueStore } from "effect/unstable/persistence"
 *
 * const timers: Layer.Layer<DurableTimer.DurableTimer> = DurableTimer.layer({
 *   onFire: () => Effect.void
 * }).pipe(Layer.provide(KeyValueStore.layerMemory))
 *
 * @category layers
 * @since 0.1.0
 */
export const layer = (options: {
  readonly onFire: (address: DialogAddress.DialogAddress, key: string) => Effect.Effect<void>
  readonly keyPrefix?: string
}): Layer.Layer<DurableTimer, never, KeyValueStore.KeyValueStore> =>
  Layer.effect(
    DurableTimer,
    Effect.flatMap(KeyValueStore.KeyValueStore, (store) =>
      make({
        store,
        onFire: options.onFire,
        ...(options.keyPrefix !== undefined ? { keyPrefix: options.keyPrefix } : {})
      }))
  )
