/**
 * `Router` - the update-routing layer. It resolves the
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
 * The hard part is **requirement accumulation**: a router
 * built from a heterogeneous list of routes must accumulate every route's `R`
 * (and `E`) at the type level - exactly as `HttpApi` accumulates requirements -
 * so the finished bot exposes one precise union and is satisfied by one `Layer`
 * at the edge. Here that falls out of `Route` being covariant in `E`/`R`: each
 * {@link add}/{@link make} widens both channels by union, never collapsing to
 * `any`.
 *
 * @since 0.1.0
 */
import { Array as Arr, Effect, Option, Pipeable, Schema } from "effect"

import * as Chat from "./Chat.js"
import * as Dialog from "./Dialog.js"
import * as Filter from "./Filter.js"
import * as Hydrated from "./Hydrated.js"
import * as Message from "./Message.js"

import type * as CallbackData from "./CallbackData.js"
import type * as Command from "./Command.js"
import type { BotApi, TelegramClient } from "@fibergram/client"

/**
 * The addressable update kinds a route can match: every payload-bearing key of
 * {@link module:BotApi.Update} (`"message"`, `"editedMessage"`, `"callbackQuery"`,
 * `"messageReaction"`, `"chatMember"`, `"inlineQuery"`, `"chatJoinRequest"`, ...) -
 * everything except the `updateId` envelope field. {@link on} narrows the handler's
 * payload by this key, and {@link allowedUpdates} folds the kinds a router consumes.
 *
 * @category type-level
 * @since 0.1.0
 */
export type UpdateKind = Exclude<keyof BotApi.Update, "updateId">

/**
 * The precise payload type carried by update kind `K` - the non-nullable value of
 * `Update[K]`. This is what {@link on} hands a handler, fully typed.
 *
 * @category type-level
 * @since 0.1.0
 */
export type PayloadOf<K extends UpdateKind> = NonNullable<BotApi.Update[K]>

/**
 * A single route: given an update, either it applies - yielding the handler
 * `Effect` to run for it - or it does not (`None`). The matcher owns *both* the
 * "is this mine?" test and the (possibly decode-carrying) handler it produces,
 * which is what lets {@link command}/{@link callback} fold Schema decoding into
 * the effect's `E`.
 *
 * `kinds` records which {@link UpdateKind}s this route can consume, so
 * {@link allowedUpdates} can derive a bot's subscription set. `undefined` means
 * the route is a **wildcard** (a raw predicate that could match anything), which
 * forces the whole subscription open.
 *
 * Covariant in `E` and `R` so that a list of differently-typed routes widens to
 * their union rather than their (impossible) intersection.
 *
 * @category models
 * @since 0.1.0
 */
export interface Route<out E, out R> {
  readonly match: (update: BotApi.Update) => Option.Option<Effect.Effect<void, E, R>>
  /** The update kinds this route consumes, or `undefined` for a wildcard. */
  readonly kinds?: ReadonlyArray<UpdateKind>
}

const routeOf = <E, R>(
  match: (update: BotApi.Update) => Option.Option<Effect.Effect<void, E, R>>,
  kinds?: ReadonlyArray<UpdateKind>
): Route<E, R> => (kinds !== undefined ? { match, kinds } : { match })

/**
 * An ordered collection of {@link Route}s. Its `E`/`R` are the union of every
 * contained route's - the type-level accumulation of requirements that keeps the
 * finished bot satisfiable by a single edge `Layer`.
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
  routeOf(
    (update) =>
      Option.map(command_.parse(update), (decodeArgs) => Effect.flatMap(decodeArgs, handler)),
    ["message"]
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
export function callback<A, E, R>(
  codec: CallbackData.Codec<A>,
  handler: (value: A) => Effect.Effect<void, E, R>
): Route<E | CallbackData.CallbackDataMalformed, R>
/**
 * With `{ autoAnswer: true }`, the callback query is acknowledged with
 * `answerCallbackQuery` after the handler runs (errors ignored), so a handler
 * never has to remember to stop the client spinner. This adds `TelegramClient`
 * to the route's `R`.
 */
export function callback<A, E, R>(
  codec: CallbackData.Codec<A>,
  handler: (value: A) => Effect.Effect<void, E, R>,
  options: { readonly autoAnswer: true }
): Route<E | CallbackData.CallbackDataMalformed, R | TelegramClient.TelegramClient>
export function callback<A, E, R>(
  codec: CallbackData.Codec<A>,
  handler: (value: A) => Effect.Effect<void, E, R>,
  options?: { readonly autoAnswer: true }
): Route<E | CallbackData.CallbackDataMalformed, R | TelegramClient.TelegramClient> {
  const run = options?.autoAnswer === true
    ? (value: A): Effect.Effect<void, E, R | TelegramClient.TelegramClient> =>
      Effect.flatMap(handler(value), () => Effect.ignore(Chat.answerCallback()))
    : handler
  return routeOf((update) => {
    const data = update.callbackQuery?.data
    if (data === undefined) return Option.none()
    return Option.map(codec.parse(data), (decodeValue) => Effect.flatMap(decodeValue, run))
  }, ["callbackQuery"])
}

/**
 * Matches an update **by its kind**, handing the handler the precisely-typed
 * payload for that kind (`Update["message"]`, `Update["inlineQuery"]`,
 * `Update["chatMember"]`, ...). The type of `payload` is narrowed by `kind`, so
 * no manual `Update` digging or casting is needed.
 *
 * @example
 * import { Router, Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const edits = Router.on("editedMessage", (message) =>
 *   Chat.reply(`edited: ${message.text ?? ""}`).pipe(Effect.asVoid)
 * )
 *
 * @category constructors
 * @since 0.1.0
 */
export const on = <K extends UpdateKind, E, R>(
  kind: K,
  handler: (payload: PayloadOf<K>) => Effect.Effect<void, E, R>
): Route<E, R> =>
  routeOf((update) => {
    const payload = update[kind]
    return payload === undefined
      ? Option.none()
      : Option.some(handler(payload as PayloadOf<K>))
  }, [kind])

/**
 * A text pattern for {@link hears}: an exact `string`, a `RegExp`, or a `Schema`
 * used as a typed refinement.
 *
 * @category models
 * @since 0.1.0
 */
export type HearsPattern<A> = string | RegExp | Schema.Codec<A, string>

/**
 * Matches a message's text (or caption) against a pattern, handing the handler
 * the typed match. An exact `string` passes the text; a `RegExp` passes its
 * `RegExpMatchArray`; a `Schema` acts as a **typed refinement** - the route
 * matches only when the text decodes, and the handler receives the decoded value
 * (no error leaks into `E`).
 *
 * @example
 * import { Router, Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const search = Router.hears(/^search (.+)$/, (match) =>
 *   Chat.reply(`searching ${match[1]}`).pipe(Effect.asVoid)
 * )
 *
 * @category constructors
 * @since 0.1.0
 */
export function hears<E, R>(
  pattern: string,
  handler: (match: string) => Effect.Effect<void, E, R>
): Route<E, R>
export function hears<E, R>(
  pattern: RegExp,
  handler: (match: RegExpMatchArray) => Effect.Effect<void, E, R>
): Route<E, R>
export function hears<A, E, R>(
  pattern: Schema.Codec<A, string>,
  handler: (match: A) => Effect.Effect<void, E, R>
): Route<E, R>
export function hears<A, E, R>(
  pattern: HearsPattern<A>,
  handler: (match: never) => Effect.Effect<void, E, R>
): Route<E, R> {
  const run = handler as (match: unknown) => Effect.Effect<void, E, R>
  return routeOf((update) =>
    Option.flatMap(Message.text(update), (text) => {
      if (typeof pattern === "string") {
        return text === pattern ? Option.some(run(text)) : Option.none()
      }
      if (pattern instanceof RegExp) {
        const matched = text.match(pattern)
        return matched === null ? Option.none() : Option.some(run(matched))
      }
      return Option.map(Schema.decodeUnknownOption(pattern)(text), run)
    }), ["message"])
}

/**
 * Matches a message carrying at least one entity of type `kind` (`"url"`,
 * `"email"`, `"hashtag"`, `"mention"`, ...), handing the handler the extracted
 * entities paired with their substrings.
 *
 * @example
 * import { Router } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const links = Router.entity("url", (urls) =>
 *   Effect.log(`found ${urls.length} url(s)`)
 * )
 *
 * @category constructors
 * @since 0.1.0
 */
export const entity = <E, R>(
  kind: string,
  handler: (entities: ReadonlyArray<Message.Entity>) => Effect.Effect<void, E, R>
): Route<E, R> =>
  routeOf((update) =>
    Option.flatMap(Message.of(update), (message) => {
      const found = Message.entitiesOfType(message, kind)
      return found.length > 0 ? Option.some(handler(found)) : Option.none()
    }), ["message"])

// --- chat member transitions -------------------------------------------------

/**
 * A membership transition computed from a `ChatMemberUpdated`'s old→new status:
 * `"join"`/`"leave"` (presence changed), `"promoted"`/`"demoted"` (admin rights
 * changed), `"banned"`/`"unbanned"`.
 *
 * @category models
 * @since 0.1.0
 */
export type MemberTransition = "join" | "leave" | "promoted" | "demoted" | "banned" | "unbanned"

const isPresent = (member: BotApi.ChatMember): boolean => {
  switch (member.status) {
    case "left":
    case "kicked":
      return false
    case "restricted":
      return member.isMember
    default:
      return true
  }
}

const isAdmin = (member: BotApi.ChatMember): boolean =>
  member.status === "creator" || member.status === "administrator"

const matchesTransition = (
  transition: MemberTransition,
  update: BotApi.ChatMemberUpdated
): boolean => {
  const before = update.oldChatMember
  const after = update.newChatMember
  switch (transition) {
    case "join":
      return !isPresent(before) && isPresent(after)
    case "leave":
      return isPresent(before) && !isPresent(after)
    case "promoted":
      return !isAdmin(before) && isAdmin(after)
    case "demoted":
      return isAdmin(before) && !isAdmin(after)
    case "banned":
      return after.status === "kicked"
    case "unbanned":
      return before.status === "kicked" && after.status !== "kicked"
  }
}

const memberRoute = <E, R>(
  kind: "chatMember" | "myChatMember",
  transition: MemberTransition,
  handler: (update: BotApi.ChatMemberUpdated) => Effect.Effect<void, E, R>
): Route<E, R> =>
  routeOf((update) => {
    const payload = update[kind]
    if (payload === undefined || !matchesTransition(transition, payload)) return Option.none()
    return Option.some(handler(payload))
  }, [kind])

/**
 * Matches a `chat_member` update whose old→new status is `transition`
 * (`"join"`/`"leave"`/`"promoted"`/`"demoted"`/`"banned"`/`"unbanned"`) - the
 * membership DSL that saves comparing statuses by hand.
 *
 * @example
 * import { Router, Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const welcome = Router.chatMember("join", (update) =>
 *   Chat.reply(`welcome ${update.newChatMember.user.firstName}`).pipe(Effect.asVoid)
 * )
 *
 * @category constructors
 * @since 0.1.0
 */
export const chatMember = <E, R>(
  transition: MemberTransition,
  handler: (update: BotApi.ChatMemberUpdated) => Effect.Effect<void, E, R>
): Route<E, R> => memberRoute("chatMember", transition, handler)

/**
 * Like {@link chatMember} but for `my_chat_member` - transitions of the **bot's
 * own** membership (added to / removed from a chat, promoted to admin, ...).
 *
 * @example
 * import { Router } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const added = Router.myChatMember("join", () => Effect.log("bot was added"))
 *
 * @category constructors
 * @since 0.1.0
 */
export const myChatMember = <E, R>(
  transition: MemberTransition,
  handler: (update: BotApi.ChatMemberUpdated) => Effect.Effect<void, E, R>
): Route<E, R> => memberRoute("myChatMember", transition, handler)

/**
 * Matches a `chat_join_request`, handing the handler the hydrated request with
 * `.approve()/.decline()`.
 *
 * @example
 * import { Router } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const gate = Router.chatJoinRequest((request) => request.approve().pipe(Effect.asVoid))
 *
 * @category constructors
 * @since 0.1.0
 */
export const chatJoinRequest = <E, R>(
  handler: (request: Hydrated.ChatJoinRequest) => Effect.Effect<void, E, R>
): Route<E, R> =>
  routeOf((update) =>
    update.chatJoinRequest === undefined
      ? Option.none()
      : Option.some(handler(Hydrated.chatJoinRequest(update.chatJoinRequest))), ["chatJoinRequest"])

// --- reactions ---------------------------------------------------------------

/**
 * Matches a `message_reaction` update, handing the handler the hydrated reaction
 * with its computed `added`/`removed` diff. Pass an `emoji` to match only when
 * that emoji was **added**.
 *
 * @example
 * import { Router } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const liked = Router.reaction("👍", (reaction) =>
 *   Effect.log(`liked by ${reaction.user?.firstName ?? "someone"}`)
 * )
 *
 * @category constructors
 * @since 0.1.0
 */
export function reaction<E, R>(
  handler: (reaction: Hydrated.MessageReaction) => Effect.Effect<void, E, R>
): Route<E, R>
export function reaction<E, R>(
  emoji: string,
  handler: (reaction: Hydrated.MessageReaction) => Effect.Effect<void, E, R>
): Route<E, R>
export function reaction<E, R>(
  emojiOrHandler: string | ((reaction: Hydrated.MessageReaction) => Effect.Effect<void, E, R>),
  handler?: (reaction: Hydrated.MessageReaction) => Effect.Effect<void, E, R>
): Route<E, R> {
  const emoji = typeof emojiOrHandler === "string" ? emojiOrHandler : undefined
  const run = (typeof emojiOrHandler === "string" ? handler : emojiOrHandler) as (
    reaction: Hydrated.MessageReaction
  ) => Effect.Effect<void, E, R>
  return routeOf((update) => {
    if (update.messageReaction === undefined) return Option.none()
    const hydrated = Hydrated.messageReaction(update.messageReaction)
    if (emoji !== undefined && !hydrated.emojiAdded.includes(emoji)) return Option.none()
    return Option.some(run(hydrated))
  }, ["messageReaction"])
}

// --- inline & payment queries ------------------------------------------------

/**
 * Matches an `inline_query`, handing the handler the hydrated query with
 * `.answer(results)`. Pass a `string`/`RegExp` to match only queries whose text
 * matches it.
 *
 * @example
 * import { Router, InlineResult } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const inline = Router.inlineQuery((query) =>
 *   query.answer([InlineResult.article({ id: "1", title: query.query, message: query.query })]).pipe(Effect.asVoid)
 * )
 *
 * @category constructors
 * @since 0.1.0
 */
export function inlineQuery<E, R>(
  handler: (query: Hydrated.InlineQuery) => Effect.Effect<void, E, R>
): Route<E, R>
export function inlineQuery<E, R>(
  pattern: string | RegExp,
  handler: (query: Hydrated.InlineQuery) => Effect.Effect<void, E, R>
): Route<E, R>
export function inlineQuery<E, R>(
  patternOrHandler: string | RegExp | ((query: Hydrated.InlineQuery) => Effect.Effect<void, E, R>),
  handler?: (query: Hydrated.InlineQuery) => Effect.Effect<void, E, R>
): Route<E, R> {
  const pattern = typeof patternOrHandler === "function" ? undefined : patternOrHandler
  const run = (typeof patternOrHandler === "function" ? patternOrHandler : handler) as (
    query: Hydrated.InlineQuery
  ) => Effect.Effect<void, E, R>
  const gate = (text: string): boolean =>
    pattern === undefined ? true : typeof pattern === "string" ? text === pattern : pattern.test(text)
  return routeOf((update) => {
    if (update.inlineQuery === undefined || !gate(update.inlineQuery.query)) return Option.none()
    return Option.some(run(Hydrated.inlineQuery(update.inlineQuery)))
  }, ["inlineQuery"])
}

/**
 * Matches a `pre_checkout_query` (the final confirmation before payment), handing
 * the handler the hydrated query with `.answer(ok)`. Telegram requires an answer
 * within 10 seconds.
 *
 * @example
 * import { Router } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const checkout = Router.preCheckout((query) => query.answer(true).pipe(Effect.asVoid))
 *
 * @category constructors
 * @since 0.1.0
 */
export const preCheckout = <E, R>(
  handler: (query: Hydrated.PreCheckoutQuery) => Effect.Effect<void, E, R>
): Route<E, R> =>
  routeOf((update) =>
    update.preCheckoutQuery === undefined
      ? Option.none()
      : Option.some(handler(Hydrated.preCheckoutQuery(update.preCheckoutQuery))), ["preCheckoutQuery"])

/**
 * Matches a `shipping_query`, handing the handler the hydrated query with
 * `.answer(ok, { shippingOptions })`.
 *
 * @example
 * import { Router } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const shipping = Router.shippingQuery((query) =>
 *   query.answer(true, { shippingOptions: [{ id: "std", title: "Standard", prices: [] }] }).pipe(Effect.asVoid)
 * )
 *
 * @category constructors
 * @since 0.1.0
 */
export const shippingQuery = <E, R>(
  handler: (query: Hydrated.ShippingQuery) => Effect.Effect<void, E, R>
): Route<E, R> =>
  routeOf((update) =>
    update.shippingQuery === undefined
      ? Option.none()
      : Option.some(handler(Hydrated.shippingQuery(update.shippingQuery))), ["shippingQuery"])

/**
 * Appends `route` to `self`, **widening** both channels by union. This is the
 * accumulator at the heart of the PoC: chaining routes with different
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
 * the accumulation - `make(a, b, c)` has `R = R_a | R_b | R_c`.
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

const toSnakeCase = (kind: string): string => kind.replaceAll(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)

/**
 * Derives the `allowed_updates` set a router needs from the kinds its routes
 * consume, so the subscription follows the routing table automatically. Feed the
 * result to `Polling.make({ allowedUpdates })` / `setWebhook` so Telegram only
 * sends what the bot actually routes.
 *
 * A **wildcard** route (a raw {@link when}/{@link route} predicate, whose `kinds`
 * are unknown) could match anything, so it forces the result to `[]` - Telegram's
 * "send the default set". Otherwise the kinds are unioned and rendered as the
 * snake_case update-type strings Telegram expects.
 *
 * @example
 * import { Router } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const router = Router.make(
 *   Router.on("message", () => Effect.void),
 *   Router.reaction((r) => Effect.log(r.emojiAdded.join("")))
 * )
 *
 * Router.allowedUpdates(router) // ["message", "message_reaction"]
 *
 * @category combinators
 * @since 0.1.0
 */
export const allowedUpdates = <E, R>(router: Router<E, R>): ReadonlyArray<string> => {
  if (router.routes.some((candidate) => candidate.kinds === undefined)) return []
  const kinds = new Set<string>()
  for (const candidate of router.routes) {
    for (const kind of candidate.kinds ?? []) kinds.add(toSnakeCase(kind))
  }
  return [...kinds].sort()
}

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
 * whole bot is provided by one `Layer` at the edge.
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

// --- predicate combinators (re-exported from `Filter`) -----------------------
// The full predicate set lives in `Filter`; the ones the routing story reaches
// for most are surfaced here too, so a bot can write `Router.when(Router.chatType(...))`
// without a second import. They return `(update) => boolean`, not `Route`.

/**
 * A predicate matching a chat of type `kind` (`"private"`, `"group"`,
 * `"supergroup"`, `"channel"`) - for use with {@link when}. Re-exported from
 * {@link module:Filter.chatType}.
 *
 * @example
 * import { Router, Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const dm = Router.when(Router.chatType("private"), () => Effect.asVoid(Chat.reply("hi")))
 *
 * @category filters
 * @since 0.1.0
 */
export const chatType: (kind: BotApi.Chat["type"]) => Filter.Filter = Filter.chatType

/**
 * Combines predicates with AND (empty ⇒ always true) - for use with {@link when}.
 * Re-exported from {@link module:Filter.and}.
 *
 * @example
 * import { Router, Filter, Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const adminDm = Router.when(
 *   Router.and(Router.chatType("private"), Filter.fromUser(42)),
 *   () => Effect.asVoid(Chat.reply("hi admin"))
 * )
 *
 * @category filters
 * @since 0.1.0
 */
export const and: (...filters: ReadonlyArray<Filter.Filter>) => Filter.Filter = Filter.and

/**
 * Combines predicates with OR (empty ⇒ always false) - for use with {@link when}.
 * Re-exported from {@link module:Filter.or}.
 *
 * @example
 * import { Router, Filter, Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const help = Router.when(
 *   Router.or(Filter.textEquals("help"), Filter.textEquals("?")),
 *   () => Effect.asVoid(Chat.reply("help"))
 * )
 *
 * @category filters
 * @since 0.1.0
 */
export const or: (...filters: ReadonlyArray<Filter.Filter>) => Filter.Filter = Filter.or

/**
 * Negates a predicate - for use with {@link when}. Re-exported from
 * {@link module:Filter.not}.
 *
 * @example
 * import { Router, Filter, Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const nonCommand = Router.when(
 *   Router.and(Filter.isText, Router.not(Filter.isCommand)),
 *   () => Effect.asVoid(Chat.reply("plain text"))
 * )
 *
 * @category filters
 * @since 0.1.0
 */
export const not: (filter: Filter.Filter) => Filter.Filter = Filter.not
