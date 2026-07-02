/**
 * `Decision` - the output of a dialog handler (design section 4.3). A decision is the
 * event-sourced "truth layer": a set of `events` that fold into the next state,
 * plus a set of `effects` (send/edit/...) to run. Keeping the two apart is what
 * makes the primitive replayable and inspectable down the line (durable, section 13.2).
 *
 * @since 0.1.0
 */
import type { Effect } from "effect"

/**
 * The result of handling one update: `events` deterministically fold into the
 * next state; `effects` are the observable side effects to perform.
 *
 * @category models
 * @since 0.1.0
 */
export interface Decision<out Event, out E = never, out R = never> {
  readonly events: ReadonlyArray<Event>
  readonly effects: ReadonlyArray<Effect.Effect<void, E, R>>
}

/**
 * A decision that changes nothing - no events, no effects.
 *
 * @example
 * import { Decision } from "@fibergram/core"
 *
 * const noop = Decision.empty
 *
 * @category constructors
 * @since 0.1.0
 */
export const empty: Decision<never> = { events: [], effects: [] }

/**
 * A decision that only performs effects (a stateless reply).
 *
 * @example
 * import { Decision } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const decision = Decision.run(Effect.log("sent"))
 *
 * @category constructors
 * @since 0.1.0
 */
export const run = <E, R>(
  ...effects: ReadonlyArray<Effect.Effect<void, E, R>>
): Decision<never, E, R> => ({ events: [], effects })

/**
 * A decision that only emits events (a pure state transition).
 *
 * @example
 * import { Decision } from "@fibergram/core"
 *
 * const decision = Decision.emit({ _tag: "NameProvided", name: "Ada" })
 *
 * @category constructors
 * @since 0.1.0
 */
export const emit = <Event>(...events: ReadonlyArray<Event>): Decision<Event> => ({
  events,
  effects: []
})

/**
 * A decision that both emits events and performs effects.
 *
 * @example
 * import { Decision } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const decision = Decision.make({
 *   events: [{ _tag: "Done" }],
 *   effects: [Effect.log("done")]
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = <Event, E, R>(options: {
  readonly events?: ReadonlyArray<Event>
  readonly effects?: ReadonlyArray<Effect.Effect<void, E, R>>
}): Decision<Event, E, R> => ({
  events: options.events ?? [],
  effects: options.effects ?? []
})
