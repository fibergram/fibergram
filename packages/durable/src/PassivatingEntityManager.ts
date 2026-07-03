/**
 * `PassivatingEntityManager` - a virtual-actor runtime that adds **passivation**
 * to the contract: an address that has been idle for `passivateAfter`
 * evicts its mailbox and fiber from memory, and the next update for that address
 * **rehydrates** it from the {@link module:DialogStore.DialogStore}.
 * This is what lets a bot hold millions of days-long sessions
 * without keeping a fiber hot for each.
 *
 * The subtle part is the race: an update can arrive at the exact
 * moment an address is being evicted, and a naive eviction drops it. The guard is
 * a **per-address latch that survives passivation** - a lock kept in a registry
 * that eviction never clears. Both the sender and a self-evicting fiber take that
 * lock before touching the address's mailbox entry, so evict-vs-send is
 * serialized and no update is lost:
 *
 * - if the sender wins the lock, it offers into the still-live queue, and the
 *   fiber (re-checking the now-nonempty queue under the lock) declines to evict;
 * - if the fiber wins, it removes the mailbox, and the sender - taking the *same*
 *   persisted lock - finds no mailbox and rehydrates a fresh one.
 *
 * Eviction is **cooperative**, not preemptive: the address fiber measures its own
 * idleness with a timed `Queue.take` and evicts itself, so a running handler is
 * never interrupted mid-flight. State itself lives in the store (every turn is
 * load -> decide -> run -> fold -> save), so eviction frees only the in-memory
 * fiber, never state.
 *
 * @since 0.1.0
 */
import { Duration, Effect, HashMap, Latch, Option, Queue, Ref, Semaphore, Stream } from "effect"

import { Dedup, DialogAddress, DialogStore, UpdateContext } from "@fibergram/core"


import type { BotApi } from "@fibergram/client"
import type { Dialog} from "@fibergram/core";
import type { Cause, Scope } from "effect"

/**
 * The manager surface. `send` routes/dedups/orders an update, `awaitIdle`
 * completes once every accepted update has been processed (a finite-batch test
 * seam), and `activeCount` reports how many addresses are currently hot - it
 * drops as sessions passivate and rises as they rehydrate.
 *
 * @category models
 * @since 0.1.0
 */
export interface PassivatingEntityManager {
  readonly send: (update: BotApi.Update) => Effect.Effect<void>
  readonly awaitIdle: Effect.Effect<void>
  readonly activeCount: Effect.Effect<number>
}

/**
 * Options for {@link make}.
 *
 * @category models
 * @since 0.1.0
 */
export interface MakeOptions<State, Event, E, R> {
  readonly dialog: Dialog.Dialog<State, Event, E, R>
  /** Address extractor; defaults to per-chat, namespaced by the dialog's `kind`. */
  readonly keyExtractor?: DialogAddress.KeyExtractor
  /** Per-address failure hook; defaults to logging the cause and carrying on. */
  readonly onDefect?: (
    address: DialogAddress.DialogAddress,
    cause: Cause.Cause<E>
  ) => Effect.Effect<void>
  /**
   * How long an address may sit with an empty mailbox before it passivates.
   * Defaults to 5 minutes. On a `TestClock`, advance past this to force eviction.
   */
  readonly passivateAfter?: Duration.Input
}

/**
 * Builds a {@link PassivatingEntityManager} for a single dialog. Requires the
 * dialog's own `R` (captured once and provided to every address fiber), a
 * {@link module:DialogStore.DialogStore}, a {@link module:Dedup.Dedup} and a
 * `Scope` owning the address fibers.
 *
 * @example
 * import { PassivatingEntityManager } from "@fibergram/durable"
 * import { PersistedDialogStore } from "@fibergram/durable"
 * import { Dialog, Dedup } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const echo = Dialog.stateless({ onUpdate: () => Effect.void })
 *
 * const program = Effect.gen(function* () {
 *   const manager = yield* PassivatingEntityManager.make({ dialog: echo })
 *   return manager
 * }).pipe(Effect.scoped, Effect.provide([PersistedDialogStore.layerMemory, Dedup.layerMemory]))
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = <State, Event, E, R>(
  options: MakeOptions<State, Event, E, R>
): Effect.Effect<
  PassivatingEntityManager,
  never,
  R | DialogStore.DialogStore | Dedup.Dedup | Scope.Scope
> =>
  Effect.gen(function* () {
    const store = yield* DialogStore.DialogStore
    const dedup = yield* Dedup.Dedup
    const scope = yield* Effect.scope
    const services = yield* Effect.context<R>()
    const extract = options.keyExtractor ?? DialogAddress.byChat(options.dialog.kind)
    const passivateAfter = options.passivateAfter ?? Duration.minutes(5)

    // Live mailboxes (the hot set). Removed on passivation, recreated on rehydrate.
    const mailboxes = yield* Ref.make(HashMap.empty<string, Queue.Queue<BotApi.Update>>())
    // Per-address locks that OUTLIVE passivation - the latch. A key's
    // lock is created once and never removed, so evict and send always contend on
    // the same lock even across eviction cycles.
    const locks = yield* Ref.make(HashMap.empty<string, Semaphore.Semaphore>())
    // Quiescence tracking for `awaitIdle`.
    const pending = yield* Ref.make(0)
    const idle = yield* Latch.make(true)

    // decider step, identical to the in-memory manager: load -> decide -> run
    // effects in order -> fold events -> save. State lives in the store.
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
        const env = yield* UpdateContext.fromAddress(address, update)
        const decision = yield* options.dialog.decide(state, update).pipe(UpdateContext.provide(env))
        yield* Effect.forEach(decision.effects, (effect) => effect, { discard: true }).pipe(
          UpdateContext.provide(env)
        )
        const nextState = decision.events.reduce(options.dialog.reduce, state)
        yield* store.save(key, nextState)
      })

    // Address boundary: swallow the whole Cause so one chat's crash is contained.
    const supervised = (
      address: DialogAddress.DialogAddress,
      update: BotApi.Update
    ): Effect.Effect<void> =>
      processOne(address, update).pipe(
        Effect.catchCause((cause) =>
          options.onDefect
            ? options.onDefect(address, cause)
            : Effect.logError(
              `fibergram: dialog "${address.kind}" crashed at ${DialogAddress.toKey(address)}`,
              cause
            )),
        Effect.provide(services)
      )

    // Cooperative passivation: block for the next update up to `passivateAfter`.
    // A real item resets the idle clock; a timeout means "try to evict myself",
    // done under the address lock and only if the queue is still empty.
    const runMailbox = (
      queue: Queue.Queue<BotApi.Update>,
      address: DialogAddress.DialogAddress,
      key: string,
      lock: Semaphore.Semaphore
    ): Effect.Effect<void> =>
      Effect.gen(function* () {
        let running = true
        while (running) {
          const taken = yield* Effect.timeoutOption(Queue.take(queue), passivateAfter)
          if (Option.isSome(taken)) {
            yield* supervised(address, taken.value)
            const remaining = yield* Ref.modify(pending, (n) => [n - 1, n - 1] as const)
            if (remaining === 0) yield* idle.open
          } else {
            yield* lock.withPermits(1)(
              Effect.gen(function* () {
                const size = yield* Queue.size(queue)
                if (size === 0) {
                  yield* Ref.update(mailboxes, HashMap.remove(key))
                  running = false
                }
              })
            )
          }
        }
      })

    // The per-address lock, created once and kept forever. Only `send` creates
    // locks, and `send` is driven sequentially by one dispatcher, so the
    // get-or-create needs no extra guard.
    const lockFor = (key: string): Effect.Effect<Semaphore.Semaphore> =>
      Effect.gen(function* () {
        const existing = HashMap.get(yield* Ref.get(locks), key)
        if (Option.isSome(existing)) return existing.value
        const lock = yield* Semaphore.make(1)
        yield* Ref.update(locks, HashMap.set(key, lock))
        return lock
      })

    // Get the live mailbox for an address or rehydrate a fresh one, forking its
    // fiber into the manager scope. Callers hold the address lock.
    const mailboxFor = (
      address: DialogAddress.DialogAddress,
      key: string,
      lock: Semaphore.Semaphore
    ): Effect.Effect<Queue.Queue<BotApi.Update>> =>
      Effect.gen(function* () {
        const existing = HashMap.get(yield* Ref.get(mailboxes), key)
        if (Option.isSome(existing)) return existing.value
        const queue = yield* Queue.unbounded<BotApi.Update>()
        yield* Ref.update(mailboxes, HashMap.set(key, queue))
        yield* Effect.forkIn(runMailbox(queue, address, key, lock), scope)
        return queue
      })

    const send: PassivatingEntityManager["send"] = (update) =>
      Effect.gen(function* () {
        const address = extract(update)
        if (Option.isNone(address)) return
        const fresh = yield* dedup.seen(update.updateId)
        if (!fresh) return
        const key = DialogAddress.toKey(address.value)
        const lock = yield* lockFor(key)
        // Offer under the address lock so it can never race a self-eviction.
        yield* lock.withPermits(1)(
          Effect.gen(function* () {
            const queue = yield* mailboxFor(address.value, key, lock)
            yield* Ref.update(pending, (n) => n + 1)
            yield* idle.close
            yield* Queue.offer(queue, update)
          })
        )
      })

    const activeCount: Effect.Effect<number> = Effect.map(Ref.get(mailboxes), HashMap.size)

    return { send, awaitIdle: idle.await, activeCount }
  })

/**
 * Options for {@link run}.
 *
 * @category models
 * @since 0.1.0
 */
export interface RunOptions<State, Event, E, R> extends MakeOptions<State, Event, E, R> {
  /** The ingestion stream (from polling/webhook, via a shared `Queue`). */
  readonly updates: Stream.Stream<BotApi.Update>
}

/**
 * Runs the passivating dispatch loop: consume `updates` sequentially into the
 * manager, then wait for quiescence. The durable counterpart to
 * `@fibergram/core`'s `Dispatcher.run` - swap it in (with a durable
 * {@link module:DialogStore.DialogStore}) and long-lived sessions passivate and
 * survive restart with no handler change.
 *
 * @example
 * import { PassivatingEntityManager, PersistedDialogStore } from "@fibergram/durable"
 * import { Dialog, Dedup } from "@fibergram/core"
 * import { Effect, Stream } from "effect"
 *
 * const echo = Dialog.stateless({ onUpdate: () => Effect.void })
 *
 * const program = PassivatingEntityManager.run({
 *   updates: Stream.empty,
 *   dialog: echo
 * }).pipe(Effect.scoped, Effect.provide([PersistedDialogStore.layerMemory, Dedup.layerMemory]))
 *
 * @category constructors
 * @since 0.1.0
 */
export const run = <State, Event, E, R>(
  options: RunOptions<State, Event, E, R>
): Effect.Effect<void, never, R | DialogStore.DialogStore | Dedup.Dedup | Scope.Scope> =>
  Effect.gen(function* () {
    const { updates, ...makeOptions } = options
    const manager = yield* make(makeOptions)
    yield* Stream.runForEach(updates, manager.send)
    yield* manager.awaitIdle
  })
