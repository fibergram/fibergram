/**
 * `Router` - the update-routing layer (design section 11.1). It resolves the
 * open question of *how* to shape the routing API by taking both sides:
 *
 * - a **handler-style core** ({@link Route} + {@link Router}), where a route is a
 *   plain value pairing a matcher with an `Effect` handler, composed with the
 *   full flexibility of `HttpRouter`; and
 * - **declarative sugar** on top - {@link command} and {@link callback} consume
 *   the Schema-carrying {@link module:Command.Command}/{@link module:CallbackData.Codec}
 *   declarations and *auto-insert* the `Schema.decode` step, so args and payloads
 *   arrive already typed (the `HttpApi` feel), while desugaring into the very
 *   same `Route`.
 *
 * The hard part (design section 11.3) is **requirement accumulation**: a router
 * built from a heterogeneous list of routes must accumulate every route's `R`
 * (and `E`) at the type level - exactly as `HttpApi` accumulates requirements -
 * so the finished bot exposes one precise union and is satisfied by one `Layer`
 * at the edge. Here that falls out of `Route` being covariant in `E`/`R`: each
 * {@link add}/{@link make} widens both channels by union, never collapsing to
 * `any`.
 *
 * @since 0.1.0
 */
import { Array as Arr, Effect, Option, Pipeable } from "effect"

import * as Dialog from "./Dialog.js"

import type * as CallbackData from "./CallbackData.js"
import type * as Command from "./Command.js"
import type { BotApi } from "@fibergram/client"

/**
 * A single route: given an update, either it applies - yielding the handler
 * `Effect` to run for it - or it does not (`None`). The matcher owns *both* the
 * "is this mine?" test and the (possibly decode-carrying) handler it produces,
 * which is what lets {@link command}/{@link callback} fold Schema decoding into
 * the effect's `E`.
 *
 * Covariant in `E` and `R` so that a list of differently-typed routes widens to
 * their union rather than their (impossible) intersection.
 *
 * @category models
 * @since 0.1.0
 */
export interface Route<out E, out R> {
  readonly match: (update: BotApi.Update) => Option.Option<Effect.Effect<void, E, R>>
}

/**
 * An ordered collection of {@link Route}s. Its `E`/`R` are the union of every
 * contained route's - the type-level accumulation of requirements that keeps the
 * finished bot satisfiable by a single edge `Layer` (design section 11.3).
 *
 * @category models
 * @since 0.1.0
 */
export interface Router<out E, out R> extends Pipeable.Pipeable {
  readonly routes: ReadonlyArray<Route<E, R>>
}

const makeRouter = <E, R>(routes: ReadonlyArray<Route<E, R>>): Router<E, R> => ({
  routes,
  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return Pipeable.pipeArguments(this, arguments)
  }
})

/**
 * Extracts the error channel of a {@link Route}, distributing over unions.
 *
 * @category type-level
 * @since 0.1.0
 */
export type Error<T> = T extends Route<infer E, infer _R> ? E : never

/**
 * Extracts the requirement channel of a {@link Route}, distributing over unions.
 *
 * @category type-level
 * @since 0.1.0
 */
export type Context<T> = T extends Route<infer _E, infer R> ? R : never

/**
 * The empty router: matches nothing, requires nothing. The identity for
 * {@link add}/{@link concat} and the starting point of a piped build.
 *
 * @example
 * import { Router } from "@fibergram/core"
 *
 * const router = Router.empty
 *
 * @category constructors
 * @since 0.1.0
 */
export const empty: Router<never, never> = makeRouter([])

/**
 * The lowest-level route constructor: a raw matcher. `match` returns `Some` with
 * the handler to run when the update is this route's, `None` otherwise. Prefer
 * {@link when}/{@link command}/{@link callback}; reach for this for bespoke
 * matching the sugar does not cover.
 *
 * @example
 * import { Router } from "@fibergram/core"
 * import { Effect, Option } from "effect"
 *
 * const pings = Router.route((update) =>
 *   update.message?.text === "ping"
 *     ? Option.some(Effect.log("pong"))
 *     : Option.none()
 * )
 *
 * @category constructors
 * @since 0.1.0
 */
export const route = <E, R>(
  match: (update: BotApi.Update) => Option.Option<Effect.Effect<void, E, R>>
): Route<E, R> => ({ match })

/**
 * A route guarded by a boolean predicate over the update. The handler receives
 * the raw update; use it when the decision needs no Schema decoding.
 *
 * @example
 * import { Router, Chat } from "@fibergram/core"
 *
 * const greet = Router.when(
 *   (update) => update.message?.text === "/hi",
 *   () => Chat.reply("hello")
 * )
 *
 * @category constructors
 * @since 0.1.0
 */
export const when = <E, R>(
  predicate: (update: BotApi.Update) => boolean,
  handler: (update: BotApi.Update) => Effect.Effect<void, E, R>
): Route<E, R> =>
  route((update) => (predicate(update) ? Option.some(handler(update)) : Option.none()))

/**
 * Declarative sugar for a slash command. Consumes a {@link module:Command.Command}
 * declaration (which carries the args `Schema`) and calls `handler` with the
 * *already-decoded* args - the `Schema.decode` step is inserted for you, so its
 * `CommandArgsError` shows up in the route's `E` automatically.
 *
 * @example
 * import { Router, Command, Chat } from "@fibergram/core"
 * import { Schema } from "effect"
 *
 * const setAge = Command.make("/setage", Schema.Struct({ age: Schema.NumberFromString }))
 *
 * const route = Router.command(setAge, ({ age }) => Chat.reply(`age is ${age}`))
 *
 * @category constructors
 * @since 0.1.0
 */
export const command = <Args, E, R>(
  command_: Command.Command<Args>,
  handler: (args: Args) => Effect.Effect<void, E, R>
): Route<E | Command.CommandArgsError, R> =>
  route((update) =>
    Option.map(command_.parse(update), (decodeArgs) => Effect.flatMap(decodeArgs, handler))
  )

/**
 * Declarative sugar for an inline-button tap. Consumes a
 * {@link module:CallbackData.Codec} (which carries the payload `Schema`) and
 * calls `handler` with the *already-decoded* value - the decode step is inserted
 * for you, so its `CallbackDataMalformed` shows up in the route's `E`, and the
 * route only applies to callback queries this codec produced.
 *
 * @example
 * import { Router, CallbackData, Chat } from "@fibergram/core"
 * import { Schema } from "effect"
 *
 * const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number }))
 *
 * const route = Router.callback(Vote, ({ id }) => Chat.answerCallback({ text: `voted ${id}` }))
 *
 * @category constructors
 * @since 0.1.0
 */
export const callback = <A, E, R>(
  codec: CallbackData.Codec<A>,
  handler: (value: A) => Effect.Effect<void, E, R>
): Route<E | CallbackData.CallbackDataMalformed, R> =>
  route((update) => {
    const data = update.callbackQuery?.data
    if (data === undefined) return Option.none()
    return Option.map(codec.parse(data), (decodeValue) => Effect.flatMap(decodeValue, handler))
  })

/**
 * Appends `route` to `self`, **widening** both channels by union. This is the
 * accumulator at the heart of the §11.3 PoC: chaining routes with different
 * requirements grows one precise `R` union with no `any` in sight.
 *
 * @example
 * import { Router, Chat } from "@fibergram/core"
 *
 * const router = Router.empty.pipe(
 *   Router.add(Router.when((u) => u.message?.text === "/a", () => Chat.reply("a"))),
 *   Router.add(Router.when((u) => u.message?.text === "/b", () => Chat.reply("b")))
 * )
 *
 * @category combinators
 * @since 0.1.0
 */
export const add =
  <E2, R2>(route_: Route<E2, R2>) =>
  <E, R>(self: Router<E, R>): Router<E | E2, R | R2> =>
    makeRouter<E | E2, R | R2>([...self.routes, route_])

/**
 * Concatenates two routers, unioning their channels. Lets you build sub-routers
 * (per feature, per module) and glue them at the edge.
 *
 * @example
 * import { Router, Chat } from "@fibergram/core"
 *
 * const admin = Router.make(Router.when((u) => u.message?.text === "/ban", () => Chat.reply("banned")))
 * const user = Router.make(Router.when((u) => u.message?.text === "/help", () => Chat.reply("help")))
 *
 * const router = user.pipe(Router.concat(admin))
 *
 * @category combinators
 * @since 0.1.0
 */
export const concat =
  <E2, R2>(other: Router<E2, R2>) =>
  <E, R>(self: Router<E, R>): Router<E | E2, R | R2> =>
    makeRouter<E | E2, R | R2>([...self.routes, ...other.routes])

/**
 * Builds a router from routes in one shot, accumulating their `E`/`R` unions.
 * The variadic sugar over {@link empty} + {@link add}; the type inference proves
 * the §11.3 accumulation - `make(a, b, c)` has `R = R_a | R_b | R_c`.
 *
 * @example
 * import { Router, Command, CallbackData, Chat } from "@fibergram/core"
 * import { Schema } from "effect"
 *
 * const setAge = Command.make("/setage", Schema.Struct({ age: Schema.NumberFromString }))
 * const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number }))
 *
 * const router = Router.make(
 *   Router.command(setAge, ({ age }) => Chat.reply(`age ${age}`)),
 *   Router.callback(Vote, ({ id }) => Chat.answerCallback({ text: `voted ${id}` }))
 * )
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = <Routes extends ReadonlyArray<Route<any, any>>>(
  ...routes: Routes
): Router<Error<Routes[number]>, Context<Routes[number]>> =>
  makeRouter(
    routes as ReadonlyArray<Route<Error<Routes[number]>, Context<Routes[number]>>>
  )

/**
 * Options for {@link toDialog} and {@link toHandler}.
 *
 * @category models
 * @since 0.1.0
 */
export interface ToDialogOptions<E, R> {
  /** Address namespace for the resulting dialog (defaults to `"router"`). */
  readonly kind?: string
  /** Handler for updates no route matched; defaults to doing nothing. */
  readonly fallback?: (update: BotApi.Update) => Effect.Effect<void, E, R>
}

/**
 * Resolves `update` to the first matching route's handler, falling back to
 * `fallback` (or a no-op) when nothing matches. Routes are tried in insertion
 * order - first match wins.
 *
 * @example
 * import { Router, Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const router = Router.make(Router.when((u) => u.message?.text === "/hi", () => Chat.reply("hi")))
 *
 * const program = Effect.gen(function* () {
 *   yield* Router.toHandler(router)({ updateId: 1 })
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const toHandler = <E, R>(
  router: Router<E, R>,
  options?: ToDialogOptions<E, R>
): ((update: BotApi.Update) => Effect.Effect<void, E, R>) =>
(update) =>
  Option.getOrElse(
    Arr.findFirst(router.routes, (candidate) => candidate.match(update)),
    () => (options?.fallback !== undefined ? options.fallback(update) : Effect.void)
  )

/**
 * Turns a router into a stateless {@link module:Dialog.Dialog} the
 * {@link module:Dispatcher} can run: every update is dispatched to the first
 * matching route. The dialog carries the router's accumulated `E`/`R`, so the
 * whole bot is provided by one `Layer` at the edge (design section 5.1).
 *
 * @example
 * import { Router, Dispatcher, DialogStore, Dedup, Chat } from "@fibergram/core"
 * import { Effect, Stream } from "effect"
 *
 * const router = Router.make(Router.when((u) => u.message?.text === "/hi", () => Chat.reply("hi")))
 *
 * const program = Dispatcher.run({
 *   updates: Stream.empty,
 *   dialog: Router.toDialog(router)
 * }).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory]))
 *
 * @category conversions
 * @since 0.1.0
 */
export const toDialog = <E, R>(
  router: Router<E, R>,
  options?: ToDialogOptions<E, R>
): Dialog.Dialog<void, never, E, R> =>
  Dialog.stateless({
    kind: options?.kind ?? "router",
    onUpdate: toHandler(router, options)
  })
