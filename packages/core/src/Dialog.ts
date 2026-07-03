/**
 * `Dialog` - the decider primitive (D2). A dialog is `(state,
 * update) => Effect<Decision>` plus a pure `reduce` folding emitted events into
 * the next state. This is the public "bottom": full control, replayable. The
 * coroutine DSL elaborates *into* this shape.
 *
 * The requirement channel `R` stays open: a handler `yield*`s whatever services
 * it needs (`TelegramClient`, a `UserRepo`, ...), provided once at the edge
 *.
 *
 * @since 0.1.0
 */
import { Effect } from "effect"

import * as Decision from "./Decision.js"

import type { BotApi } from "@fibergram/client"

/**
 * A dialog handler: decide what happens for `update` given the current `state`.
 *
 * @category models
 * @since 0.1.0
 */
export type Handler<State, Event, E, R> = (
  state: State,
  update: BotApi.Update
) => Effect.Effect<Decision.Decision<Event, E, R>, E, R>

/**
 * A dialog definition: its `kind` (address namespace), `initialState`, the pure
 * `reduce` that folds events into state, and the `decide` handler.
 *
 * @category models
 * @since 0.1.0
 */
export interface Dialog<State, Event, E, R> {
  readonly kind: string
  readonly initialState: State
  readonly reduce: (state: State, event: Event) => State
  readonly decide: Handler<State, Event, E, R>
}

/**
 * Defines a stateful dialog from an explicit decider.
 *
 * @example
 * import { Dialog, Decision } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * type State = { readonly count: number }
 * type Event = { readonly _tag: "Ticked" }
 *
 * const counter = Dialog.make<State, Event, never, never>({
 *   kind: "counter",
 *   initialState: { count: 0 },
 *   reduce: (state, event) =>
 *     event._tag === "Ticked" ? { count: state.count + 1 } : state,
 *   decide: (state) => Effect.succeed(Decision.emit({ _tag: "Ticked" as const }))
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = <State, Event, E, R>(
  definition: Dialog<State, Event, E, R>
): Dialog<State, Event, E, R> => definition

/**
 * Defines a stateless dialog: no persisted state, every update handled the same
 * way. This is the whole surface an echo/command bot needs.
 *
 * @example
 * import { Dialog } from "@fibergram/core"
 * import { TelegramClient } from "@fibergram/client"
 * import { Effect } from "effect"
 *
 * const echo = Dialog.stateless({
 *   onUpdate: (update) =>
 *     Effect.gen(function* () {
 *       const tg = yield* TelegramClient.TelegramClient
 *       const message = update.message
 *       if (message?.text !== undefined) {
 *         yield* tg.sendMessage({ chatId: message.chat.id, text: message.text })
 *       }
 *     })
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const stateless = <E, R>(options: {
  readonly kind?: string
  readonly onUpdate: (update: BotApi.Update) => Effect.Effect<void, E, R>
}): Dialog<void, never, E, R> => ({
  kind: options.kind ?? "default",
  initialState: undefined,
  reduce: (state) => state,
  // A stateless dialog emits no events; it just runs its single effect.
  decide: (_state, update) => Effect.succeed(Decision.run(options.onUpdate(update)))
})
