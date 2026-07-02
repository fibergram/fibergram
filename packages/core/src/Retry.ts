/**
 * Retry that honours Telegram's `retry_after` (design section 5.2, D4). A blind
 * exponential backoff would ignore the exact wait Telegram hands back on a 429;
 * this waits precisely {@link RateLimited.retryAfter} and retries, up to a bound.
 *
 * Because the wait goes through `Effect.sleep`, tests drive it with `TestClock`
 * without real time passing (design section 5.6).
 *
 * @since 0.1.0
 */
import { Effect } from "effect"

import type { TelegramError } from "@fibergram/client"

/**
 * Retries `effect` on {@link TelegramError.RateLimited}, sleeping for the
 * server-provided `retryAfter` between attempts. All other Telegram errors fail
 * fast, untouched. Gives up after `maxAttempts` (default 3), surfacing the last
 * `RateLimited`.
 *
 * @example
 * import { Retry } from "@fibergram/core"
 * import { TelegramClient } from "@fibergram/client"
 * import { Effect } from "effect"
 *
 * const send = Effect.gen(function* () {
 *   const tg = yield* TelegramClient.TelegramClient
 *   return yield* Retry.retryRateLimited(tg.sendMessage({ chatId: 1, text: "hi" }))
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const retryRateLimited = <A, R>(
  effect: Effect.Effect<A, TelegramError.TelegramError, R>,
  options?: { readonly maxAttempts?: number }
): Effect.Effect<A, TelegramError.TelegramError, R> => {
  const maxAttempts = options?.maxAttempts ?? 3
  const attempt = (n: number): Effect.Effect<A, TelegramError.TelegramError, R> =>
    Effect.catchTag(effect, "RateLimited", (error) =>
      n >= maxAttempts
        ? Effect.fail(error)
        : Effect.andThen(Effect.sleep(error.retryAfter), attempt(n + 1)))
  return attempt(1)
}
