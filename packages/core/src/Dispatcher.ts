/**
 * `Dispatcher` - the seam between ingestion and dialogs. It reads
 * the transport-agnostic `Stream<Update>` and feeds each update into an
 * {@link module:EntityManager.EntityManager}. Polling and webhook are both just
 * producers into the queue this stream drains, so the dispatcher never knows
 * which transport it is on.
 *
 * @since 0.1.0
 */
import { Effect, Stream as StreamNs } from "effect"

import * as EntityManager from "./EntityManager.js"

import type { Dedup } from "./Dedup.js"
import type { Dialog } from "./Dialog.js"
import type * as DialogAddress from "./DialogAddress.js"
import type { DialogStore } from "./DialogStore.js"
import type { BotApi } from "@fibergram/client"
import type { Cause, Scope, Stream } from "effect"


/**
 * Options for {@link run}.
 *
 * @category models
 * @since 0.1.0
 */
export interface RunOptions<State, Event, E, R> {
  /** The ingestion stream (from polling/webhook, via a shared `Queue`). */
  readonly updates: Stream.Stream<BotApi.Update>
  /** The dialog handling every routed update. */
  readonly dialog: Dialog<State, Event, E, R>
  /** Address extractor; defaults to {@link module:DialogAddress.byUpdate} by the dialog's `kind`. */
  readonly keyExtractor?: DialogAddress.KeyExtractor
  /** Per-address failure hook; defaults to logging and carrying on. */
  readonly onDefect?: (
    address: DialogAddress.DialogAddress,
    cause: Cause.Cause<E>
  ) => Effect.Effect<void>
}

/**
 * Runs the dispatch loop: consume `updates` sequentially, routing each into the
 * dialog's mailboxes. Blocks for as long as the stream produces (i.e. forever,
 * for a live bot); for a finite stream it returns once all accepted updates have
 * been fully processed.
 *
 * Requires the dialog's `R`, a {@link DialogStore}, a {@link Dedup} and a
 * `Scope` owning the address fibers - provided once at the edge.
 *
 * @example
 * import { Dispatcher, Dialog, DialogStore, Dedup } from "@fibergram/core"
 * import { Effect, Stream } from "effect"
 *
 * const echo = Dialog.stateless({ onUpdate: () => Effect.void })
 *
 * const program = Dispatcher.run({
 *   updates: Stream.empty,
 *   dialog: echo
 * }).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory]))
 *
 * @category constructors
 * @since 0.1.0
 */
export const run = <State, Event, E, R>(
  options: RunOptions<State, Event, E, R>
): Effect.Effect<void, never, R | DialogStore | Dedup | Scope.Scope> =>
  Effect.gen(function* () {
    const manager = yield* EntityManager.make({
      dialog: options.dialog,
      ...(options.keyExtractor !== undefined ? { keyExtractor: options.keyExtractor } : {}),
      ...(options.onDefect !== undefined ? { onDefect: options.onDefect } : {})
    })
    yield* StreamNs.runForEach(options.updates, manager.send)
    yield* manager.awaitIdle
  })
