/**
 * `Session` - a typed key-value slot per chat (or per user), for bots that want
 * "just `ctx.session`" without reaching for the {@link module:Dialog} primitive.
 *
 * A session is sugar over the {@link module:DialogStore} port keyed by a
 * {@link module:DialogAddress}: `get`/`set`/`update` resolve the address from the
 * ambient {@link module:UpdateContext} (so inside a handler they need nothing but
 * the `DialogStore` that is already in the dispatch environment), while
 * `getAt`/`setAt`/`updateAt` take an explicit {@link module:DialogAddress.Identity}
 * for use outside a handler (broadcasts, admin jobs). Session keys are
 * namespaced with a `session:<name>` kind, so they never collide with dialog
 * state living at the same address - and choosing a durable `DialogStore`
 * backend makes sessions durable for free.
 *
 * `update` is load-then-save, not an atomic read-modify-write: updates for one
 * address are already serialized by the `EntityManager` mailbox, so a session
 * whose scope matches the key extractor (e.g. `"user"` scope under the default
 * `byUpdate` extractor) never loses writes; a *wider* scope (a per-chat session
 * under a per-user extractor) is last-writer-wins across concurrent handlers.
 *
 * @since 0.1.0
 */
import { Effect, Option } from "effect"

import * as DialogAddress from "./DialogAddress.js"
import { DialogStore } from "./DialogStore.js"
import * as UpdateContext from "./UpdateContext.js"

/**
 * How a session derives its address from the current update: `"chat"` shares
 * one slot per chat (plus Forum Topic thread), `"user"` gives each sender in a
 * chat an independent slot.
 *
 * @category models
 * @since 0.1.0
 */
export type Scope = "chat" | "user"

/**
 * Options for {@link make}: the value a fresh session starts from and the
 * {@link Scope} the address is derived with. Treat `initial` as immutable -
 * the same value is handed out for every address that has no stored state yet.
 *
 * @category models
 * @since 0.1.0
 */
export interface Options<A> {
  readonly initial: A
  readonly scope?: Scope
}

/**
 * A typed session slot. The ambient accessors (`get`/`set`/`update`) address by
 * the update currently being handled; the `At` variants take an explicit
 * {@link module:DialogAddress.Identity} and work anywhere. All of them only
 * require the {@link module:DialogStore.DialogStore} already present in the
 * dispatch environment.
 *
 * @category models
 * @since 0.1.0
 */
export interface Session<in out A> {
  readonly name: string
  readonly scope: Scope
  /** The session value for the current update, or `initial` when none is stored. */
  readonly get: Effect.Effect<A, never, DialogStore>
  /** Overwrites the session value for the current update. */
  readonly set: (value: A) => Effect.Effect<void, never, DialogStore>
  /** Applies `f` to the current value (or `initial`), stores and returns the result. */
  readonly update: (f: (current: A) => A) => Effect.Effect<A, never, DialogStore>
  /** {@link get} at an explicit identity - usable outside a handler. */
  readonly getAt: (identity: DialogAddress.Identity) => Effect.Effect<A, never, DialogStore>
  /** {@link set} at an explicit identity - usable outside a handler. */
  readonly setAt: (
    identity: DialogAddress.Identity,
    value: A
  ) => Effect.Effect<void, never, DialogStore>
  /** {@link update} at an explicit identity - usable outside a handler. */
  readonly updateAt: (
    identity: DialogAddress.Identity,
    f: (current: A) => A
  ) => Effect.Effect<A, never, DialogStore>
}

const keyFor = (
  name: string,
  scope: Scope,
  identity: DialogAddress.Identity
): Effect.Effect<string> => {
  if (scope === "user" && identity.fromId === undefined) {
    return Effect.die(
      new Error(
        `fibergram: session "${name}" is scoped per-user, but the update carries no sender (fromId)`
      )
    )
  }
  return Effect.succeed(
    DialogAddress.toKey({
      chatId: identity.chatId,
      ...(identity.threadId !== undefined ? { threadId: identity.threadId } : {}),
      ...(scope === "user" && identity.fromId !== undefined ? { fromId: identity.fromId } : {}),
      kind: `session:${name}`
    })
  )
}

const ambientIdentity: Effect.Effect<DialogAddress.Identity> = Effect.map(
  UpdateContext.env,
  (env) => ({
    chatId: env.chatId,
    ...(Option.isSome(env.threadId) ? { threadId: env.threadId.value } : {}),
    ...(Option.isSome(env.fromId) ? { fromId: env.fromId.value } : {})
  })
)

/**
 * Creates a typed {@link Session} named `name`. State is stored through the
 * {@link module:DialogStore.DialogStore} port under a `session:<name>` kind, so
 * two sessions with different names - or a session and a dialog at the same
 * address - never see each other's state.
 *
 * @example
 * import { Session } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const counter = Session.make("counter", { initial: 0 })
 *
 * // Inside any handler: the address comes from the ambient update context.
 * const handler = Effect.gen(function* () {
 *   const count = yield* counter.update((n) => n + 1)
 *   return count
 * })
 *
 * // Outside a handler: address explicitly.
 * const admin = counter.getAt({ chatId: 555 })
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = <A>(name: string, options: Options<A>): Session<A> => {
  const scope = options.scope ?? "chat"

  const getAt = (identity: DialogAddress.Identity): Effect.Effect<A, never, DialogStore> =>
    Effect.gen(function* () {
      const store = yield* DialogStore
      const key = yield* keyFor(name, scope, identity)
      const loaded = yield* store.load(key)
      return Option.match(loaded, {
        onNone: () => options.initial,
        onSome: (state) => state as A
      })
    })

  const setAt = (
    identity: DialogAddress.Identity,
    value: A
  ): Effect.Effect<void, never, DialogStore> =>
    Effect.gen(function* () {
      const store = yield* DialogStore
      const key = yield* keyFor(name, scope, identity)
      yield* store.save(key, value)
    })

  const updateAt = (
    identity: DialogAddress.Identity,
    f: (current: A) => A
  ): Effect.Effect<A, never, DialogStore> =>
    Effect.gen(function* () {
      const store = yield* DialogStore
      const key = yield* keyFor(name, scope, identity)
      const current = Option.match(yield* store.load(key), {
        onNone: () => options.initial,
        onSome: (state) => state as A
      })
      const next = f(current)
      yield* store.save(key, next)
      return next
    })

  return {
    name,
    scope,
    get: Effect.flatMap(ambientIdentity, getAt),
    set: (value) => Effect.flatMap(ambientIdentity, (identity) => setAt(identity, value)),
    update: (f) => Effect.flatMap(ambientIdentity, (identity) => updateAt(identity, f)),
    getAt,
    setAt,
    updateAt
  }
}
