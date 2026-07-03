/**
 * `EntityManager` - the virtual-actor runtime. It routes each
 * update to its dialog address, guarantees **one mailbox per address** (ordering
 * within an address), runs address mailboxes on independent fibers (concurrency
 * between addresses), and wraps each address in `catchCause` so **a crash in one
 * chat never takes down another**.
 *
 * The in-memory manager keeps every address hot. Idle passivation + rehydrate
 * is a durable-backend concern.
 *
 * @since 0.1.0
 */
import { Effect, HashMap, Latch, Option, Queue, Ref } from "effect"

import { Dedup } from "./Dedup.js"
import * as DialogAddress from "./DialogAddress.js"
import { DialogStore } from "./DialogStore.js"
import * as Telemetry from "./Telemetry.js"
import * as UpdateContext from "./UpdateContext.js"

import type { Dialog } from "./Dialog.js"
import type { BotApi } from "@fibergram/client"
import type { Cause , Scope } from "effect"

/**
 * The manager's public surface: hand it an update and it routes, dedups, orders
 * and supervises. `send` is intended to be driven sequentially by one dispatcher
 *; ordering within an address depends on that.
 *
 * @category models
 * @since 0.1.0
 */
export interface EntityManager {
  readonly send: (update: BotApi.Update) => Effect.Effect<void>
  /**
   * Completes once every accepted update has been fully processed. In
   * production the ingestion stream never ends, so this is mainly a test seam
   * for asserting on effects after feeding a finite batch.
   */
  readonly awaitIdle: Effect.Effect<void>
}

/**
 * Options for {@link make}.
 *
 * @category models
 * @since 0.1.0
 */
export interface MakeOptions<State, Event, E, R> {
  readonly dialog: Dialog<State, Event, E, R>
  /** Address extractor; defaults to {@link module:DialogAddress.byUpdate}, namespaced by the dialog's `kind`. */
  readonly keyExtractor?: DialogAddress.KeyExtractor
  /** Per-address failure hook; defaults to logging the cause and carrying on. */
  readonly onDefect?: (
    address: DialogAddress.DialogAddress,
    cause: Cause.Cause<E>
  ) => Effect.Effect<void>
}

/**
 * Builds an {@link EntityManager} for a single dialog. Requires the dialog's own
 * requirements `R` (captured once and provided to every address fiber), a
 * {@link DialogStore}, a {@link Dedup} and a `Scope` that owns the address fibers.
 *
 * @example
 * import { EntityManager, Dialog, DialogStore, Dedup } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const echo = Dialog.stateless({ onUpdate: () => Effect.void })
 *
 * const program = Effect.gen(function* () {
 *   const manager = yield* EntityManager.make({ dialog: echo })
 *   return manager
 * }).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory]))
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = <State, Event, E, R>(
  options: MakeOptions<State, Event, E, R>
): Effect.Effect<EntityManager, never, R | DialogStore | Dedup | Scope.Scope> =>
  Effect.gen(function* () {
    const store = yield* DialogStore
    const dedup = yield* Dedup
    const scope = yield* Effect.scope
    // Capture R once; every forked address fiber runs closed over these services.
    const services = yield* Effect.context<R>()
    const extract = options.keyExtractor ?? DialogAddress.byUpdate(options.dialog.kind)
    const mailboxes = yield* Ref.make(HashMap.empty<string, Queue.Queue<BotApi.Update>>())
    // Quiescence tracking: `pending` counts accepted-but-unprocessed updates;
    // `idle` is open exactly when `pending === 0`.
    const pending = yield* Ref.make(0)
    const idle = yield* Latch.make(true)

    // decider step: load -> decide -> run effects (in order) -> fold events -> save.
    const processOne = (
      address: DialogAddress.DialogAddress,
      update: BotApi.Update
    ): Effect.Effect<void, E, R> =>
      Effect.gen(function* () {
        const key = DialogAddress.toKey(address)
        const loaded = yield* store.load(key)
        const state = Option.match(loaded, {
          onNone: () => options.dialog.initialState,
          onSome: (persisted) => persisted as State
        })
        // Stamp the per-update ambient env so `Chat.*` accessors resolve to this
        // chat, both while deciding and while running the resulting effects.
        const env = yield* UpdateContext.fromAddress(address, update)
        const decision = yield* options.dialog.decide(state, update).pipe(
          UpdateContext.provide(env)
        )
        yield* Effect.forEach(decision.effects, (effect) => effect, { discard: true }).pipe(
          UpdateContext.provide(env)
        )
        const nextState = decision.events.reduce(options.dialog.reduce, state)
        yield* store.save(key, nextState)
      })

    // address boundary: swallow the whole Cause so a crash never propagates.
    const supervised = (
      address: DialogAddress.DialogAddress,
      update: BotApi.Update
    ): Effect.Effect<void> =>
      processOne(address, update).pipe(
        Telemetry.instrument(address, update),
        Effect.catchCause((cause) =>
          options.onDefect
            ? options.onDefect(address, cause)
            : Effect.logError(
              `fibergram: dialog "${address.kind}" crashed at ${DialogAddress.toKey(address)}`,
              cause
            )),
        Effect.provide(services)
      )

    const runMailbox = (
      queue: Queue.Queue<BotApi.Update>,
      address: DialogAddress.DialogAddress
    ): Effect.Effect<never> =>
      Effect.forever(
        Queue.take(queue).pipe(
          Effect.flatMap((update) => supervised(address, update)),
          Effect.flatMap(() => Ref.modify(pending, (n) => [n - 1, n - 1] as const)),
          Effect.flatMap((remaining) => (remaining === 0 ? idle.open : Effect.succeed(false)))
        )
      )

    const mailboxFor = (
      address: DialogAddress.DialogAddress
    ): Effect.Effect<Queue.Queue<BotApi.Update>> =>
      Effect.gen(function* () {
        const key = DialogAddress.toKey(address)
        const existing = HashMap.get(yield* Ref.get(mailboxes), key)
        if (Option.isSome(existing)) return existing.value
        const queue = yield* Queue.unbounded<BotApi.Update>()
        yield* Ref.update(mailboxes, HashMap.set(key, queue))
        yield* Effect.forkIn(runMailbox(queue, address), scope)
        return queue
      })

    const send: EntityManager["send"] = (update) =>
      Effect.gen(function* () {
        const address = extract(update)
        if (Option.isNone(address)) return
        const fresh = yield* dedup.seen(update.updateId)
        if (!fresh) return
        const queue = yield* mailboxFor(address.value)
        yield* Ref.update(pending, (n) => n + 1)
        yield* idle.close
        yield* Queue.offer(queue, update)
      })

    return { send, awaitIdle: idle.await }
  })
