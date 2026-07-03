/**
 * `WebApp` - validation of Telegram Mini App `initData`. A Mini App receives its
 * launch context as a URL-encoded `initData` string signed with the bot token;
 * {@link validate} recomputes the HMAC-SHA256 the way Telegram specifies and,
 * on success, returns the typed {@link WebAppInitData} (the analogue of aiogram's
 * `safe_parse_webapp_init_data`).
 *
 * This lives in the `client` module because it owns the same `snake_case` edge as
 * the rest of the Bot API surface (the `initData` fields are `snake_case`, mapped
 * to `camelCase` on decode). HMAC uses the platform Web Crypto (`crypto.subtle`),
 * so it is portable to Node, workers and browsers.
 *
 * @since 0.1.0
 */
import { Clock, Data, Duration, Effect, Encoding, Redacted, Schema } from "effect"

/**
 * Raised when `initData` fails validation: a wrong/absent `hash`, a signature
 * mismatch, an unparseable field, or an expired `auth_date` (when `maxAge` is set).
 *
 * @category errors
 * @since 0.1.0
 */
export class InvalidInitData extends Data.TaggedError("InvalidInitData")<{
  readonly reason: string
}> {}

/**
 * A Mini App user (`WebAppUser`), decoded to `camelCase` from the `snake_case`
 * JSON Telegram embeds in `initData`.
 *
 * @category schemas
 * @since 0.1.0
 */
export const WebAppUser = Schema.Struct({
  id: Schema.Number,
  isBot: Schema.optionalKey(Schema.Boolean),
  firstName: Schema.String,
  lastName: Schema.optionalKey(Schema.String),
  username: Schema.optionalKey(Schema.String),
  languageCode: Schema.optionalKey(Schema.String),
  isPremium: Schema.optionalKey(Schema.Boolean),
  addedToAttachmentMenu: Schema.optionalKey(Schema.Boolean),
  allowsWriteToPm: Schema.optionalKey(Schema.Boolean),
  photoUrl: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    isBot: "is_bot",
    firstName: "first_name",
    lastName: "last_name",
    languageCode: "language_code",
    isPremium: "is_premium",
    addedToAttachmentMenu: "added_to_attachment_menu",
    allowsWriteToPm: "allows_write_to_pm",
    photoUrl: "photo_url"
  })
)

/**
 * Decoded `camelCase` {@link WebAppUser}.
 *
 * @category models
 * @since 0.1.0
 */
export type WebAppUser = Schema.Schema.Type<typeof WebAppUser>

/**
 * A Mini App chat (`WebAppChat`), decoded to `camelCase`.
 *
 * @category schemas
 * @since 0.1.0
 */
export const WebAppChat = Schema.Struct({
  id: Schema.Number,
  type: Schema.String,
  title: Schema.String,
  username: Schema.optionalKey(Schema.String),
  photoUrl: Schema.optionalKey(Schema.String)
}).pipe(Schema.encodeKeys({ photoUrl: "photo_url" }))

/**
 * Decoded `camelCase` {@link WebAppChat}.
 *
 * @category models
 * @since 0.1.0
 */
export type WebAppChat = Schema.Schema.Type<typeof WebAppChat>

/**
 * The parsed, validated Mini App launch context (`WebAppInitData`).
 *
 * @category schemas
 * @since 0.1.0
 */
export const WebAppInitData = Schema.Struct({
  queryId: Schema.optionalKey(Schema.String),
  user: Schema.optionalKey(WebAppUser),
  receiver: Schema.optionalKey(WebAppUser),
  chat: Schema.optionalKey(WebAppChat),
  chatType: Schema.optionalKey(Schema.String),
  chatInstance: Schema.optionalKey(Schema.String),
  startParam: Schema.optionalKey(Schema.String),
  canSendAfter: Schema.optionalKey(Schema.NumberFromString),
  authDate: Schema.NumberFromString,
  hash: Schema.String,
  signature: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    queryId: "query_id",
    chatType: "chat_type",
    chatInstance: "chat_instance",
    startParam: "start_param",
    canSendAfter: "can_send_after",
    authDate: "auth_date"
  })
)

/**
 * Decoded `camelCase` {@link WebAppInitData}.
 *
 * @category models
 * @since 0.1.0
 */
export type WebAppInitData = Schema.Schema.Type<typeof WebAppInitData>

/**
 * Options for {@link validate}.
 *
 * @category models
 * @since 0.1.0
 */
export interface ValidateOptions {
  /** Reject data older than this (compared against `auth_date`). */
  readonly maxAge?: Duration.Duration
}

const decodeInitData = Schema.decodeUnknownEffect(WebAppInitData)
const encoder = new TextEncoder()

const hmacSha256 = (key: Uint8Array, message: Uint8Array): Effect.Effect<Uint8Array> =>
  Effect.promise(async () => {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key as unknown as ArrayBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    // The DOM `SubtleCrypto` lib docgen typechecks against wants a stricter
    // `BufferSource` than `@types/node`'s; cast so both toolchains accept it.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, message as unknown as ArrayBuffer)
    return new Uint8Array(signature)
  })

// Constant-time hex comparison so a wrong hash can't be discovered byte by byte.
const constantTimeEqual = (a: string, b: string): boolean => {
  let diff = a.length ^ b.length
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ (b.charCodeAt(i) || 0)
  return diff === 0
}

/**
 * Validates a Mini App `initData` query string against the bot `token`. On
 * success, resolves the typed {@link WebAppInitData}; on any mismatch, fails with
 * {@link InvalidInitData}. Pass `maxAge` to also reject stale launches (checked
 * against the ambient `Clock`, so it is deterministic under `TestClock`).
 *
 * @example
 * import { WebApp } from "@fibergram/core/client"
 * import { Effect } from "effect"
 *
 * const program = (initData: string) =>
 *   Effect.gen(function* () {
 *     const data = yield* WebApp.validate(initData, "TOKEN")
 *     return data.user?.id
 *   })
 *
 * @category constructors
 * @since 0.1.0
 */
export const validate = (
  initData: string,
  token: Redacted.Redacted<string> | string,
  options?: ValidateOptions
): Effect.Effect<WebAppInitData, InvalidInitData> =>
  Effect.gen(function* () {
    const params = new URLSearchParams(initData)
    const hash = params.get("hash")
    if (hash === null) return yield* Effect.fail(new InvalidInitData({ reason: "missing hash" }))

    // data-check-string: every field except `hash`, `key=value` lines sorted by key.
    const dataCheckString = [...params.entries()]
      .filter(([key]) => key !== "hash")
      .sort(([a], [b]) => (a < b ? -1 : (a > b ? 1 : 0)))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n")

    const rawToken = typeof token === "string" ? token : Redacted.value(token)
    const secretKey = yield* hmacSha256(encoder.encode("WebAppData"), encoder.encode(rawToken))
    const computed = yield* hmacSha256(secretKey, encoder.encode(dataCheckString))
    if (!constantTimeEqual(Encoding.encodeHex(computed), hash)) {
      return yield* Effect.fail(new InvalidInitData({ reason: "hash mismatch" }))
    }

    // Reassemble the record: nested objects arrive as embedded JSON, scalars as
    // strings the schema transforms (auth_date -> number, ...).
    const record: Record<string, unknown> = {}
    for (const [key, value] of params.entries()) record[key] = value
    for (const nested of ["user", "receiver", "chat"]) {
      const value = record[nested]
      if (typeof value === "string") {
        const parsed = yield* Effect.try({
          try: () => JSON.parse(value) as unknown,
          catch: () => new InvalidInitData({ reason: `invalid ${nested} json` })
        })
        record[nested] = parsed
      }
    }

    const data = yield* decodeInitData(record).pipe(
      Effect.mapError(() => new InvalidInitData({ reason: "schema mismatch" }))
    )

    if (options?.maxAge !== undefined) {
      const now = yield* Clock.currentTimeMillis
      const ageMs = now - data.authDate * 1000
      if (ageMs > Duration.toMillis(options.maxAge)) {
        return yield* Effect.fail(new InvalidInitData({ reason: "expired" }))
      }
    }

    return data
  })
