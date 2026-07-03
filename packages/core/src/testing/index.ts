/**
 * `@fibergram/core/testing` - run the whole bot without a network.
 * A recording `TelegramClient` double ({@link module:TestTelegram}) captures
 * outbound calls so a test asserts *"the handler sent X"*, {@link module:Updates}
 * builds synthetic updates to feed in, and `@effect/vitest`'s `TestClock` cranks
 * dialog timeouts - all in-memory.
 *
 * @since 0.0.0
 */

/**
 * The recording `TelegramClient` double and its constructors.
 *
 * @since 0.1.0
 */
export * as TestTelegram from "./TestTelegram.js"

/**
 * Synthetic `Update` factories (text, command, callback) for feeding a bot.
 *
 * @since 0.1.0
 */
export * as Updates from "./Updates.js"
