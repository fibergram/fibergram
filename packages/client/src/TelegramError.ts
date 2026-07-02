/**
 * Telegram error model - a tagged union, not an error base class (design section 5.2, D4).
 *
 * Domain errors of the user flow untouched through `E`; only Bot-API-semantic
 * failures are represented here. `RateLimited` carries a {@link Duration} so a
 * retry `Schedule` can honour Telegram's `retry_after` instead of guessing a
 * backoff.
 *
 * @since 0.1.0
 */
import { Data, Duration } from "effect"

import type { ResponseParameters } from "./BotApi.js"

/**
 * Rate limit hit (HTTP 429). Retry after {@link RateLimited.retryAfter}.
 *
 * @category errors
 * @since 0.1.0
 */
export class RateLimited extends Data.TaggedError("RateLimited")<{
  readonly method: string
  readonly retryAfter: Duration.Duration
}> {}

/**
 * The bot was blocked by the user (a common HTTP 403).
 *
 * @category errors
 * @since 0.1.0
 */
export class BotBlocked extends Data.TaggedError("BotBlocked")<{
  readonly method: string
}> {}

/**
 * Edit was a no-op - the *expected* error the dialog swallows when re-rendering
 * an unchanged prompt (design section 5.2, section 13.6).
 *
 * @category errors
 * @since 0.1.0
 */
export class MessageNotModified extends Data.TaggedError("MessageNotModified")<{
  readonly method: string
}> {}

/**
 * The group chat was upgraded to a supergroup; retry against
 * {@link ChatMigrated.newChatId}.
 *
 * @category errors
 * @since 0.1.0
 */
export class ChatMigrated extends Data.TaggedError("ChatMigrated")<{
  readonly method: string
  readonly newChatId: number
}> {}

/**
 * A forbidden action (HTTP 403) that is not specifically {@link BotBlocked}.
 *
 * @category errors
 * @since 0.1.0
 */
export class Forbidden extends Data.TaggedError("Forbidden")<{
  readonly method: string
  readonly description: string
}> {}

/**
 * A malformed request (HTTP 400) or any other Bot API `ok: false` response not
 * covered by a more specific tag.
 *
 * @category errors
 * @since 0.1.0
 */
export class BadRequest extends Data.TaggedError("BadRequest")<{
  readonly method: string
  readonly description: string
  readonly errorCode: number
}> {}

/**
 * A transport- or decode-level failure: the network call itself failed, or the
 * body could not be parsed. Distinct from a well-formed Bot API error.
 *
 * @category errors
 * @since 0.1.0
 */
export class TransportError extends Data.TaggedError("TransportError")<{
  readonly method: string
  readonly cause: unknown
}> {}

/**
 * The closed union of every failure a {@link module:TelegramClient.TelegramClient}
 * method can produce.
 *
 * @category models
 * @since 0.1.0
 */
export type TelegramError =
  | RateLimited
  | BotBlocked
  | MessageNotModified
  | ChatMigrated
  | Forbidden
  | BadRequest
  | TransportError

/**
 * Maps a failed Bot API response (`ok: false`) onto the most specific
 * {@link TelegramError}. `errorCode` and `description` follow Telegram's own
 * conventions; unknown shapes fall back to {@link BadRequest}.
 *
 * @example
 * import { TelegramError } from "@fibergram/client"
 *
 * const err = TelegramError.fromResponse("sendMessage", {
 *   errorCode: 429,
 *   description: "Too Many Requests",
 *   parameters: { retryAfter: 5 }
 * })
 * // err._tag === "RateLimited"
 *
 * @category constructors
 * @since 0.1.0
 */
export const fromResponse = (
  method: string,
  response: {
    readonly errorCode?: number
    readonly description?: string
    readonly parameters?: ResponseParameters
  }
): TelegramError => {
  const errorCode = response.errorCode ?? 0
  const description = response.description ?? "Unknown Bot API error"
  const migrateToChatId = response.parameters?.migrateToChatId
  const retryAfter = response.parameters?.retryAfter

  if (errorCode === 429 || retryAfter !== undefined) {
    return new RateLimited({
      method,
      retryAfter: Duration.seconds(retryAfter ?? 1)
    })
  }

  if (migrateToChatId !== undefined) {
    return new ChatMigrated({ method, newChatId: migrateToChatId })
  }

  const normalized = description.toLowerCase()

  if (normalized.includes("message is not modified")) {
    return new MessageNotModified({ method })
  }

  if (errorCode === 403) {
    return normalized.includes("blocked")
      ? new BotBlocked({ method })
      : new Forbidden({ method, description })
  }

  return new BadRequest({ method, description, errorCode })
}
