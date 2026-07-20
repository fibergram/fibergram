/**
 * `Conversations` - the scene manager that composes a stateless
 * {@link module:Router.Router} with N named {@link module:Coroutine} wizards as
 * **one** {@link module:Dialog.Dialog}. fibergram runs exactly one dialog per
 * chat, so "which conversation is active" is state the application would
 * otherwise own by hand - a tagged union, delegation into the active wizard,
 * entry behind a guard, a shared `/cancel`, and a fallthrough to the router.
 * `Conversations` owns all of that so a typical multi-scenario bot never writes
 * that state machine itself (the analogue of grammY's `Stage` / aiogram's
 * `Scenes`).
 *
 * The manager's {@link State} is `Idle`, or `Active` with the persisted snapshot
 * of the running wizard. On each update it:
 *
 *   1. aborts an active wizard on a {@link cancel} match,
 *   2. delegates to the active wizard (its `decide` performs the sends and
 *      returns the next snapshot; when the snapshot is `done`, it falls back to
 *      `Idle`),
 *   3. from `Idle`, tries each {@link Enter} rule in order - a matching command
 *      whose optional `guard` passes enters that wizard (a failing guard runs the
 *      rule's `onReject` and stays `Idle`),
 *   4. otherwise hands the update to the {@link module:Router.Router}.
 *
 * Delegation works because a coroutine is a plain decider, so the whole thing is
 * still one replayable dialog. `E`/`R` accumulate from the router and every
 * scene exactly as they do across a {@link module:Router.Router}, so the finished
 * bot is satisfied by one `Layer` at the edge. The entry (and cancel) commands
 * are contributed to {@link router}, so `Router.setMyCommands` /
 * `Router.allowedUpdates` sync them into Telegram's menu with no second list.
 *
 * @since 0.1.0
 */
import { Effect, Option } from "effect"

import * as Command from "./Command.js"
import * as Decision from "./Decision.js"
import * as Dialog from "./Dialog.js"
import * as Router from "./Router.js"

import type { BotApi } from "./client/index.js"
import type * as Coroutine from "./Coroutine.js"

/**
 * A wizard usable as a named scene: a {@link module:Dialog.Dialog} whose state is
 * a {@link module:Coroutine.State} snapshot - i.e. anything built with
 * `Coroutine.make`. The manager stores its snapshot inside {@link State} and
 * delegates updates to its `decide`.
 *
 * @category models
 * @since 0.1.0
 */
export type Scene<E, R> = Dialog.Dialog<Coroutine.State<any>, Coroutine.State<any>, E, R>

/**
 * Extracts a {@link Scene}'s error channel, distributing over a union of scenes.
 *
 * @category type-level
 * @since 0.1.0
 */
export type SceneError<S> = S extends Dialog.Dialog<any, any, infer E, any> ? E : never

/**
 * Extracts a {@link Scene}'s requirement channel, distributing over a union of
 * scenes.
 *
 * @category type-level
 * @since 0.1.0
 */
export type SceneContext<S> = S extends Dialog.Dialog<any, any, any, infer R> ? R : never

/**
 * The persisted state of a {@link Conversations} manager: `Idle`, or `Active`
 * with the name of the running scene and its {@link module:Coroutine.State}
 * snapshot. Serializable, so choosing a durable `DialogStore` backend makes the
 * whole multi-scene flow survive a restart.
 *
 * @category models
 * @since 0.1.0
 */
export type State =
  | { readonly _tag: "Idle" }
  | { readonly _tag: "Active"; readonly scene: string; readonly sub: Coroutine.State }

const idle: State = { _tag: "Idle" }

/**
 * Options for {@link on}: an optional `guard` gating entry and an `onReject`
 * effect run when the guard fails. The two carry independent `E`/`R`, unioned
 * into the entry rule's channels.
 *
 * @category models
 * @since 0.1.0
 */
export interface EnterOptions<GE, GR, JE, JR> {
  /** Only enter the scene when this resolves `true`; omitted means always enter. */
  readonly guard?: Effect.Effect<boolean, GE, GR>
  /** Run when the guard fails (e.g. reply "already registered"); the manager stays `Idle`. */
  readonly onReject?: Effect.Effect<void, JE, JR>
}

/**
 * An entry rule: the command that opens a named scene, with an optional guard.
 * Build one with {@link on} and pass it to {@link make}'s `enter` list.
 *
 * @category models
 * @since 0.1.0
 */
export interface Enter<Name extends string, E, R> {
  /** The scene name this rule enters (a key of {@link make}'s `scenes`). */
  readonly scene: Name
  /** The command that triggers entry - also contributed to {@link Conversations.router}. */
  readonly command: Command.Command<any>
  readonly guard: Effect.Effect<boolean, E, R> | undefined
  readonly onReject: Effect.Effect<void, E, R> | undefined
}

/**
 * Declares an entry rule: when `command` matches an update and the optional
 * `guard` passes, the manager enters scene `scene`. `scene` is constrained by
 * {@link make} to a real scene name, so a typo is a type error. The command's
 * metadata rides into {@link Conversations.router} for `Router.setMyCommands`.
 *
 * @example
 * import { Command, Conversations } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const start = Command.make("/start", { description: "Register" })
 *
 * const rule = Conversations.on(start, "registration", {
 *   guard: Effect.succeed(true),
 *   onReject: Effect.void
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const on = <Name extends string, GE = never, GR = never, JE = never, JR = never>(
  command: Command.Command<any>,
  scene: Name,
  options?: EnterOptions<GE, GR, JE, JR>
): Enter<Name, GE | JE, GR | JR> => ({
  scene,
  command,
  guard: options?.guard,
  onReject: options?.onReject
})

/**
 * The shared cancel rule: the command that aborts any active scene, with an
 * optional `onCancel` effect. Build one with {@link cancel}.
 *
 * @category models
 * @since 0.1.0
 */
export interface Cancel<E, R> {
  readonly command: Command.Command<any>
  readonly onCancel: Effect.Effect<void, E, R> | undefined
}

/**
 * Declares the shared cancel command that aborts whatever scene is active,
 * running the optional `onCancel` effect and returning the manager to `Idle`.
 * The command's metadata rides into {@link Conversations.router}.
 *
 * @example
 * import { Command, Conversations, Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const cmd = Command.make("/cancel", { description: "Abort" })
 *
 * const rule = Conversations.cancel(cmd, { onCancel: Effect.asVoid(Chat.reply("Cancelled")) })
 *
 * @category constructors
 * @since 0.1.0
 */
export const cancel = <E = never, R = never>(
  command: Command.Command<any>,
  options?: { readonly onCancel?: Effect.Effect<void, E, R> }
): Cancel<E, R> => ({ command, onCancel: options?.onCancel })

/**
 * A built scene manager: the accumulated {@link router} (base routes plus the
 * entry/cancel commands, for `Router.setMyCommands` / `Router.allowedUpdates`)
 * and the single {@link dialog} the dispatcher runs. Get the dialog with
 * {@link toDialog}.
 *
 * @category models
 * @since 0.1.0
 */
export interface Conversations<E, R> {
  readonly kind: string
  /** The router enriched with the entry/cancel command metadata, for command sync. */
  readonly router: Router.Router<E, R>
  /** The one dialog composing the router and every scene; extract with {@link toDialog}. */
  readonly dialog: Dialog.Dialog<State, State, E, R>
}

// A metadata-only route: never matches (so it is inert under `toHandler`), but
// carries the command's `CommandInfo` so `Router.setMyCommands` / `allowedUpdates`
// pick up the entry/cancel commands the dialog - not a route - actually handles.
const metaRoute = (command: Command.Command<any>): Router.Route<never, never> => ({
  match: () => Option.none(),
  kinds: ["message"],
  command: { name: command.name, description: command.description }
})

/**
 * Builds a {@link Conversations} manager from a base `router`, a record of named
 * `scenes`, the `enter` rules that open them, and an optional shared `cancel`.
 * `E`/`R` accumulate from every part, so the result is one dialog satisfied by a
 * single `Layer`. Run it via {@link toDialog}; sync its commands via
 * `Router.setMyCommands(manager.router)`.
 *
 * @example
 * import { Command, Conversations, Coroutine, Router, Chat } from "@fibergram/core"
 * import { Effect, Schema } from "effect"
 *
 * const registration = Coroutine.make("registration", function* (d) {
 *   const name = yield* d.prompt("Name?", Schema.NonEmptyString)
 *   yield* d.reply(`Hi ${name}`)
 * })
 *
 * const help = Command.make("/help", { description: "Help" })
 * const start = Command.make("/start", { description: "Register" })
 * const stop = Command.make("/cancel", { description: "Abort" })
 *
 * const manager = Conversations.make({
 *   router: Router.make(Router.command(help, () => Chat.reply("help").pipe(Effect.asVoid))),
 *   scenes: { registration },
 *   enter: [Conversations.on(start, "registration")],
 *   cancel: Conversations.cancel(stop, { onCancel: Chat.reply("Cancelled").pipe(Effect.asVoid) })
 * })
 *
 * const dialog = Conversations.toDialog(manager)
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = <
  Scenes extends Record<string, Scene<any, any>>,
  RE,
  RR,
  EnterE = never,
  EnterR = never,
  CancelE = never,
  CancelR = never
>(options: {
  readonly router: Router.Router<RE, RR>
  readonly scenes: Scenes
  readonly enter: ReadonlyArray<Enter<keyof Scenes & string, EnterE, EnterR>>
  readonly cancel?: Cancel<CancelE, CancelR>
  readonly kind?: string
}): Conversations<
  RE | SceneError<Scenes[keyof Scenes]> | EnterE | CancelE,
  RR | SceneContext<Scenes[keyof Scenes]> | EnterR | CancelR
> => {
  const kind = options.kind ?? "conversations"
  const scenes = options.scenes as Record<string, Scene<any, any>>
  const cancelRule = options.cancel
  const handleRouter = Router.toHandler(options.router)

  // The next manager state after a scene handled an update: keep it `Active`
  // with the emitted snapshot, or fall back to `Idle` once the wizard is done.
  const advance = (name: string, current: Coroutine.State, decision: Decision.Decision<Coroutine.State>): State => {
    const sub = decision.events[0] ?? current
    return sub.done ? idle : { _tag: "Active", scene: name, sub }
  }

  // Delegate `update` to a scene (starting from `current`), performing its sends
  // and folding the result into the manager's next state + any scene effects.
  const delegate = (
    name: string,
    current: Coroutine.State,
    update: BotApi.Update
  ): Effect.Effect<Decision.Decision<State, any, any>, any, any> =>
    Effect.map(scenes[name]!.decide(current, update), (decision) =>
      Decision.make<State, any, any>({
        events: [advance(name, current, decision as Decision.Decision<Coroutine.State>)],
        effects: decision.effects
      }))

  const decide: Dialog.Handler<State, State, any, any> = (state, update) =>
    Effect.gen(function* () {
      // 1. `/cancel` aborts any active scene.
      if (state._tag === "Active" && cancelRule !== undefined && Command.matches(cancelRule.command, update)) {
        if (cancelRule.onCancel !== undefined) yield* cancelRule.onCancel
        return Decision.emit<State>(idle)
      }

      // 2. An active scene consumes the update.
      if (state._tag === "Active") {
        return yield* delegate(state.scene, state.sub, update)
      }

      // 3. Idle: the first matching entry rule (guard permitting) enters its scene.
      for (const rule of options.enter) {
        if (!Command.matches(rule.command, update)) continue
        if (rule.guard !== undefined) {
          const allowed = yield* rule.guard
          if (!allowed) {
            if (rule.onReject !== undefined) yield* rule.onReject
            return Decision.emit<State>(idle)
          }
        }
        return yield* delegate(rule.scene, scenes[rule.scene]!.initialState, update)
      }

      // 4. Otherwise the stateless router handles it.
      yield* handleRouter(update)
      return Decision.emit<State>(idle)
    })

  // Enrich the router with metadata-only routes for the entry/cancel commands so
  // command sync sees the whole surface, not just the base routes.
  let enriched: Router.Router<any, any> = options.router
  for (const rule of options.enter) enriched = Router.add(metaRoute(rule.command))(enriched)
  if (cancelRule !== undefined) enriched = Router.add(metaRoute(cancelRule.command))(enriched)

  const dialog = Dialog.make<State, State, any, any>({
    kind,
    initialState: idle,
    reduce: (_state, event) => event,
    decide
  })

  return { kind, router: enriched, dialog }
}

/**
 * The one {@link module:Dialog.Dialog} a {@link Conversations} manager composes -
 * hand it to `Dispatcher.run`. It carries the accumulated `E`/`R`, so the whole
 * multi-scene bot is provided by one `Layer` at the edge.
 *
 * @example
 * import { Command, Conversations, Coroutine, Router, Chat, Dispatcher, DialogStore, Dedup } from "@fibergram/core"
 * import { Effect, Schema, Stream } from "effect"
 *
 * const registration = Coroutine.make("registration", function* (d) {
 *   yield* d.prompt("Name?", Schema.NonEmptyString)
 * })
 * const start = Command.make("/start", { description: "Register" })
 *
 * const manager = Conversations.make({
 *   router: Router.empty,
 *   scenes: { registration },
 *   enter: [Conversations.on(start, "registration")]
 * })
 *
 * const program = Dispatcher.run({
 *   updates: Stream.empty,
 *   dialog: Conversations.toDialog(manager)
 * }).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory]))
 *
 * @category conversions
 * @since 0.1.0
 */
export const toDialog = <E, R>(
  conversations: Conversations<E, R>
): Dialog.Dialog<State, State, E, R> => conversations.dialog
