/**
 * `@fibergram/core/polling` - long-polling ingestion. A producer into the shared
 * `Queue<Update>` the dispatcher drains; it depends only on
 * `@fibergram/core/client`, never on the dialog engine.
 *
 * @since 0.1.0
 */

/**
 * The long-polling ingestion constructor. See {@link module:Polling}.
 *
 * @since 0.1.0
 */
export * as Polling from "./Polling.js"
