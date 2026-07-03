/**
 * `@fibergram/core` - the invariant model: dialog addressing, the decider
 * primitive, the in-memory `EntityManager`, dedup, retry honouring `retry_after`
 * and the dispatch loop. This package stays publishable and
 * useful even while the durable backend absorbs beta churn.
 *
 * @since 0.1.0
 */

/**
 * Dialog addressing and pluggable key extractors.
 *
 * @since 0.1.0
 */
export * as DialogAddress from "./DialogAddress.js"

/**
 * The `Decision` type (events + effects) and its constructors.
 *
 * @since 0.1.0
 */
export * as Decision from "./Decision.js"

/**
 * The `Dialog` decider primitive and its constructors.
 *
 * @since 0.1.0
 */
export * as Dialog from "./Dialog.js"

/**
 * The `DialogStore` persistence port and its in-memory backend.
 *
 * @since 0.1.0
 */
export * as DialogStore from "./DialogStore.js"

/**
 * The `Dedup` idempotency port and its in-memory backend.
 *
 * @since 0.1.0
 */
export * as Dedup from "./Dedup.js"

/**
 * The `EntityManager` virtual-actor runtime.
 *
 * @since 0.1.0
 */
export * as EntityManager from "./EntityManager.js"

/**
 * The `Dispatcher` loop over a `Stream<Update>`.
 *
 * @since 0.1.0
 */
export * as Dispatcher from "./Dispatcher.js"

/**
 * Retry that honours Telegram's `retry_after`.
 *
 * @since 0.1.0
 */
export * as Retry from "./Retry.js"

/**
 * Observability defaults (annotated logs, per-update spans, metrics) applied at
 * the dispatch boundary.
 *
 * @since 0.1.0
 */
export * as Telemetry from "./Telemetry.js"

/**
 * The per-update ambient context (`UpdateEnv` + reference) that dissolves `ctx`.
 *
 * @since 0.1.0
 */
export * as UpdateContext from "./UpdateContext.js"

/**
 * Ctx-less accessor helpers over the current update (`reply`, `editLast`, ...).
 *
 * @since 0.1.0
 */
export * as Chat from "./Chat.js"

/**
 * `SentMessage` - hydrated send results with `Effect` methods (`edit`/`delete`/...).
 *
 * @since 0.1.0
 */
export * as SentMessage from "./SentMessage.js"

/**
 * `MediaGroup` - an immutable album builder for `sendMediaGroup`.
 *
 * @since 0.1.0
 */
export * as MediaGroup from "./MediaGroup.js"

/**
 * Typed `callback_data` codec plus the optional overflow store port.
 *
 * @since 0.1.0
 */
export * as CallbackData from "./CallbackData.js"

/**
 * Typed slash commands with `Schema`-decoded arguments.
 *
 * @since 0.1.0
 */
export * as Command from "./Command.js"

/**
 * The coroutine DSL that elaborates into the `Dialog` decider.
 *
 * @since 0.1.0
 */
export * as Coroutine from "./Coroutine.js"

/**
 * Handler-style update routing with declarative `Command`/`CallbackData` sugar
 * and type-level requirement accumulation.
 *
 * @since 0.1.0
 */
export * as Router from "./Router.js"
