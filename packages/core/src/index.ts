/**
 * `@fibergram/core` - the invariant model: dialog addressing, the decider
 * primitive, the in-memory `EntityManager`, dedup, retry honouring `retry_after`
 * and the dispatch loop (design section 4, section 5, section 8). This package stays publishable and
 * useful even while the durable backend absorbs beta churn (section 6).
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
