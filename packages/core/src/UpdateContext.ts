/**
 * `UpdateContext` - the per-update ambient state that dissolves the `ctx`
 * god-object. Instead of threading a mutable context object
 * through handlers, the dispatcher stamps a {@link UpdateEnv} onto a
 * `Context.Reference` before running the handler; free accessor functions (the
 * {@link module:Chat} namespace) read it back.
 *
 * Because {@link current} is a `Context.Reference` with a default, reading it adds
 * **nothing** to a handler's `R`: `Chat.reply` still only requires
 * `TelegramClient`, not some ambient tag. The env is scoped to exactly one update
 * via {@link provide}.
 *
 * @since 0.1.0
 */
import { Context, Effect, Option, Ref } from "effect"

import type * as DialogAddress from "./DialogAddress.js"
import type { BotApi } from "@fibergram/client"

/**
 * The ambient facts about the update currently being handled: where it came from
 * (`chatId`/`threadId`/`fromId`), the raw `update`, and `lastSent` - the id of
 * the most recent message the handler sent, so `Chat.editLast` can target it.
 *
 * @category models
 * @since 0.1.0
 */
export interface UpdateEnv {
  readonly chatId: number
  readonly threadId: Option.Option<number>
  readonly fromId: Option.Option<number>
  readonly update: BotApi.Update
  /** The id of the last message the handler sent in this turn (for `editLast`). */
  readonly lastSent: Ref.Ref<Option.Option<number>>
}

/**
 * The ambient reference holding the current {@link UpdateEnv}, or `None` when no
 * update is being handled (e.g. code called outside the dispatcher). Its default
 * makes reads requirement-free.
 *
 * @category references
 * @since 0.1.0
 */
export const current: Context.Reference<Option.Option<UpdateEnv>> = Context.Reference<
  Option.Option<UpdateEnv>
>("@fibergram/core/UpdateContext", {
  defaultValue: (): Option.Option<UpdateEnv> => Option.none()
})

/**
 * Reads the current {@link UpdateEnv}, failing as a defect if used outside an
 * update handler. Accessors build on this; handlers usually reach for
 * {@link module:Chat} instead.
 *
 * @example
 * import { UpdateContext } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const env = yield* UpdateContext.env
 *   return env.chatId
 * })
 *
 * @category accessors
 * @since 0.1.0
 */
export const env: Effect.Effect<UpdateEnv> = Effect.flatMap(Effect.service(current), (option) =>
  Option.match(option, {
    onNone: () =>
      Effect.die(
        new Error(
          "fibergram: no current update - a Chat/UpdateContext accessor was used outside of a dialog handler"
        )
      ),
    onSome: Effect.succeed
  }))

/**
 * Builds a fresh {@link UpdateEnv} for `address`/`update`, allocating the
 * `lastSent` ref. The dispatcher calls this once per update.
 *
 * @category constructors
 * @since 0.1.0
 */
export const fromAddress = (
  address: DialogAddress.DialogAddress,
  update: BotApi.Update
): Effect.Effect<UpdateEnv> =>
  Effect.map(Ref.make(Option.none<number>()), (lastSent) => ({
    chatId: address.chatId,
    threadId: Option.fromNullishOr(address.threadId),
    fromId: Option.fromNullishOr(address.fromId),
    update,
    lastSent
  }))

/**
 * Scopes `env` as the ambient {@link current} for the duration of `effect`. The
 * dispatcher wraps each handler run with this.
 *
 * @example
 * import { UpdateContext, Chat } from "@fibergram/core"
 * import { Effect, Option, Ref } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const lastSent = yield* Ref.make(Option.none<number>())
 *   const env = {
 *     chatId: 1,
 *     threadId: Option.none(),
 *     fromId: Option.none(),
 *     update: { updateId: 1 },
 *     lastSent
 *   }
 *   return yield* Chat.chatId.pipe(UpdateContext.provide(env))
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const provide = (env_: UpdateEnv) =>
<A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  Effect.provideService(effect, current, Option.some(env_))
