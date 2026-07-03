/**
 * `StartLink` - typed deep-linking payloads for `t.me/<bot>?start=<payload>`.
 * Telegram lets a `/start` (or `startgroup`/`startapp`) link carry a ≤64-character
 * payload made of `A-Za-z0-9_-`; `StartLink` turns that opaque payload into an
 * encode/decode pair over a `Schema` - the exact discipline
 * {@link module:CallbackData.Codec} applies to inline-button data.
 *
 * A value is JSON-encoded, then `base64url`-encoded (which uses precisely the
 * characters Telegram allows), so `encode` yields a ready-to-share URL and
 * {@link module:Router.start} decodes the payload back into its typed value. A
 * payload that does not fit in 64 characters fails with {@link StartLinkTooLong}.
 *
 * @since 0.1.0
 */
import { Data, Effect, Encoding, Result, Schema } from "effect"

/** Telegram's hard limit on a deep-link payload, in characters. */
const MAX_LENGTH = 64

/**
 * Raised when an encoded payload exceeds Telegram's 64-character deep-link limit.
 *
 * @category errors
 * @since 0.1.0
 */
export class StartLinkTooLong extends Data.TaggedError("StartLinkTooLong")<{
  readonly size: number
}> {}

/**
 * Raised when a `/start` payload cannot be decoded back into the codec's type -
 * malformed base64url/JSON or a schema mismatch.
 *
 * @category errors
 * @since 0.1.0
 */
export class StartLinkMalformed extends Data.TaggedError("StartLinkMalformed")<{
  readonly reason: string
}> {}

/**
 * A typed deep-link codec bound to a bot `username` and a `Schema`. `encode`
 * variants build the three deep-link flavours; `decode`/`encodePayload` operate
 * on the raw payload for {@link module:Router.start}.
 *
 * @category models
 * @since 0.1.0
 */
export interface Codec<A> {
  /** The bot username these links point at (without the leading `@`). */
  readonly username: string
  /** Encodes a value into the raw ≤64-char payload (no URL), spilling nothing. */
  readonly encodePayload: (value: A) => Effect.Effect<string, StartLinkTooLong>
  /** Decodes a raw `/start` payload back into its value. */
  readonly decode: (payload: string) => Effect.Effect<A, StartLinkMalformed>
  /** Builds `https://t.me/<username>?start=<payload>` (opens a private chat). */
  readonly encode: (value: A) => Effect.Effect<string, StartLinkTooLong>
  /** Builds `https://t.me/<username>?startgroup=<payload>` (adds the bot to a group). */
  readonly encodeGroup: (value: A) => Effect.Effect<string, StartLinkTooLong>
  /** Builds `https://t.me/<username>?startapp=<payload>` (opens the bot's Main Mini App). */
  readonly encodeApp: (value: A) => Effect.Effect<string, StartLinkTooLong>
}

/**
 * Builds a {@link Codec} for a bot `username` and payload `schema`.
 *
 * @example
 * import { StartLink } from "@fibergram/core"
 * import { Effect, Schema } from "effect"
 *
 * const Ref = StartLink.make("mybot", Schema.Struct({ ref: Schema.String }))
 *
 * const program = Effect.gen(function* () {
 *   const url = yield* Ref.encode({ ref: "abc" })
 *   // "https://t.me/mybot?start=..."
 *   const back = yield* Ref.decode(url.split("start=")[1] ?? "")
 *   return back.ref // "abc"
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = <A, I>(username: string, schema: Schema.Codec<A, I>): Codec<A> => {
  const encodeSchema = Schema.encodeUnknownEffect(schema)
  const decodeSchema = Schema.decodeUnknownEffect(schema)
  const handle = stripAt(username)

  const encodePayload: Codec<A>["encodePayload"] = (value) =>
    Effect.gen(function* () {
      // A schema-encode failure means the value doesn't fit the schema: a bug,
      // not a runtime condition. Surface it as a defect, keeping E clean.
      const encoded = yield* Effect.orDie(encodeSchema(value))
      const payload = Encoding.encodeBase64Url(JSON.stringify(encoded))
      if (payload.length > MAX_LENGTH) {
        return yield* Effect.fail(new StartLinkTooLong({ size: payload.length }))
      }
      return payload
    })

  const decode: Codec<A>["decode"] = (payload) =>
    Result.match(Encoding.decodeBase64UrlString(payload), {
      onFailure: () => Effect.fail(new StartLinkMalformed({ reason: "invalid base64url" })),
      onSuccess: (json) =>
        Effect.try({
          try: () => JSON.parse(json) as unknown,
          catch: () => new StartLinkMalformed({ reason: "invalid JSON" })
        }).pipe(
          Effect.flatMap((parsed) =>
            decodeSchema(parsed).pipe(
              Effect.mapError(() => new StartLinkMalformed({ reason: "schema mismatch" }))
            ))
        )
    })

  const url = (param: "start" | "startgroup" | "startapp") =>
  (value: A): Effect.Effect<string, StartLinkTooLong> =>
    Effect.map(encodePayload(value), (payload) => `https://t.me/${handle}?${param}=${payload}`)

  return {
    username: handle,
    encodePayload,
    decode,
    encode: url("start"),
    encodeGroup: url("startgroup"),
    encodeApp: url("startapp")
  }
}

const stripAt = (username: string): string => (username.startsWith("@") ? username.slice(1) : username)
