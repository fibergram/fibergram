/**
 * `CallbackData` - the typed codec for inline-button payloads (design section 5.3,
 * the "killer feature"). Telegram gives every inline button a ≤64-byte
 * `callback_data` string and echoes it back on tap; `CallbackData` turns that
 * opaque string into an encode/decode pair over a `Schema`, so buttons carry
 * typed values and routing is a `decode`, not string-splitting.
 *
 * **Overflow (section 11.4).** A payload that does not fit in 64 bytes fails with
 * {@link CallbackDataTooLong} **by default**. Provide a {@link CallbackStore}
 * layer and overflow transparently spills to it: the button carries a short key,
 * `decode` reads the value back. The store is an *optional* port - codecs that
 * never overflow need nothing provided.
 *
 * @since 0.1.0
 */
import { Context, Data, Effect, Layer, Option, Ref, Schema } from "effect"

import type { BotApi } from "@fibergram/client"

/** The Bot API hard limit on a `callback_data` string, in bytes. */
const MAX_BYTES = 64

// UTF-8 byte length without depending on `TextEncoder`/`Buffer` typings, so the
// codec is portable to any runtime (Node, workers, browsers).
const byteLength = (value: string): number => {
  let bytes = 0
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    if (code < 0x80) bytes += 1
    else if (code < 0x8_00) bytes += 2
    else if (code >= 0xD8_00 && code <= 0xDB_FF) {
      // High surrogate: a full code point is 4 bytes; skip its low surrogate.
      bytes += 4
      i++
    } else bytes += 3
  }
  return bytes
}

/**
 * Raised when an encoded payload exceeds 64 bytes and no {@link CallbackStore} is
 * available to spill it to (design section 11.4).
 *
 * @category errors
 * @since 0.1.0
 */
export class CallbackDataTooLong extends Data.TaggedError("CallbackDataTooLong")<{
  readonly prefix: string
  readonly size: number
}> {}

/**
 * Raised when a `callback_data` string cannot be decoded back into the codec's
 * type - malformed JSON, a schema mismatch, or a store key that is missing
 * (expired/evicted).
 *
 * @category errors
 * @since 0.1.0
 */
export class CallbackDataMalformed extends Data.TaggedError("CallbackDataMalformed")<{
  readonly prefix: string
  readonly reason: string
}> {}

/**
 * The optional overflow port (design section 11.4). A tiny key/value store: `put`
 * stashes an oversized payload and returns a short key; `get` reads it back.
 * Provide {@link layerMemory} in tests, a Redis/KV-backed layer in production.
 *
 * @category services
 * @since 0.1.0
 */
export class CallbackStore extends Context.Service<CallbackStore, {
  readonly put: (payload: string) => Effect.Effect<string>
  readonly get: (key: string) => Effect.Effect<Option.Option<string>>
}>()("@fibergram/core/CallbackStore") {}

/**
 * An in-memory {@link CallbackStore} - monotonic integer keys, no eviction. Fine
 * for tests and single-process bots; swap for a durable layer in production.
 *
 * @example
 * import { CallbackData } from "@fibergram/core"
 * import { Layer } from "effect"
 *
 * const layer: Layer.Layer<CallbackData.CallbackStore> = CallbackData.layerMemory
 *
 * @category layers
 * @since 0.1.0
 */
export const layerMemory: Layer.Layer<CallbackStore> = Layer.effect(
  CallbackStore,
  Effect.gen(function* () {
    const store = yield* Ref.make<ReadonlyMap<string, string>>(new Map())
    const counter = yield* Ref.make(0)
    return {
      put: (payload) =>
        Effect.gen(function* () {
          const id = yield* Ref.modify(counter, (n) => [n, n + 1] as const)
          const key = id.toString(36)
          yield* Ref.update(store, (map) => new Map(map).set(key, payload))
          return key
        }),
      get: (key) => Effect.map(Ref.get(store), (map) => Option.fromNullishOr(map.get(key)))
    }
  })
)

/**
 * A typed `callback_data` codec bound to a `prefix` (its routing discriminator)
 * and a `Schema`.
 *
 * @category models
 * @since 0.1.0
 */
export interface Codec<A> {
  /** The routing discriminator prepended to every encoded string. */
  readonly prefix: string
  /** Encodes a value into a `callback_data` string, spilling to {@link CallbackStore} on overflow. */
  readonly encode: (value: A) => Effect.Effect<string, CallbackDataTooLong>
  /** Whether `data` was produced by this codec (cheap prefix check, no decode). */
  readonly matches: (data: string) => boolean
  /** Decodes a `callback_data` string this codec produced back into its value. */
  readonly decode: (data: string) => Effect.Effect<A, CallbackDataMalformed>
  /** {@link decode} guarded by {@link matches}: `None` when `data` is not ours. */
  readonly parse: (data: string) => Option.Option<Effect.Effect<A, CallbackDataMalformed>>
  /** Builds an inline button whose payload is `value` encoded by this codec. */
  readonly button: (
    text: string,
    value: A
  ) => Effect.Effect<BotApi.InlineKeyboardButton, CallbackDataTooLong>
}

const INLINE = ":"
const STORED = "#"

/**
 * Builds a {@link Codec} for `prefix`/`schema`. The `prefix` must not contain
 * `":"` or `"#"` (the codec's separators).
 *
 * @example
 * import { CallbackData } from "@fibergram/core"
 * import { Effect, Schema } from "effect"
 *
 * const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number }))
 *
 * const program = Effect.gen(function* () {
 *   const data = yield* Vote.encode({ id: 42 })
 *   const back = yield* Vote.decode(data)
 *   return back.id // 42
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = <A, I>(prefix: string, schema: Schema.Codec<A, I>): Codec<A> => {
  const encodePayload = Schema.encodeUnknownEffect(schema)
  const decodePayload = Schema.decodeUnknownEffect(schema)
  const inlinePrefix = `${prefix}${INLINE}`
  const storedPrefix = `${prefix}${STORED}`

  const encode: Codec<A>["encode"] = (value) =>
    Effect.gen(function* () {
      // Schema-encode failures mean the value doesn't fit the schema: a bug, not
      // a runtime condition. Surface them as a defect, keeping E clean.
      const encoded = yield* Effect.orDie(encodePayload(value))
      const json = JSON.stringify(encoded)
      const inline = `${inlinePrefix}${json}`
      if (byteLength(inline) <= MAX_BYTES) return inline

      const store = yield* Effect.serviceOption(CallbackStore)
      if (Option.isNone(store)) {
        return yield* Effect.fail(
          new CallbackDataTooLong({ prefix, size: byteLength(inline) })
        )
      }
      const key = yield* store.value.put(json)
      return `${storedPrefix}${key}`
    })

  const decodeJson = (json: string): Effect.Effect<A, CallbackDataMalformed> =>
    Effect.try({
      try: () => JSON.parse(json) as unknown,
      catch: () => new CallbackDataMalformed({ prefix, reason: "invalid JSON" })
    }).pipe(
      Effect.flatMap((parsed) =>
        decodePayload(parsed).pipe(
          Effect.mapError(() => new CallbackDataMalformed({ prefix, reason: "schema mismatch" }))
        ))
    )

  const decode: Codec<A>["decode"] = (data) => {
    if (data.startsWith(inlinePrefix)) {
      return decodeJson(data.slice(inlinePrefix.length))
    }
    if (data.startsWith(storedPrefix)) {
      const key = data.slice(storedPrefix.length)
      return Effect.gen(function* () {
        const store = yield* Effect.serviceOption(CallbackStore)
        if (Option.isNone(store)) {
          return yield* Effect.fail(
            new CallbackDataMalformed({ prefix, reason: "no CallbackStore to resolve key" })
          )
        }
        const payload = yield* store.value.get(key)
        if (Option.isNone(payload)) {
          return yield* Effect.fail(
            new CallbackDataMalformed({ prefix, reason: "unknown or expired key" })
          )
        }
        return yield* decodeJson(payload.value)
      })
    }
    return Effect.fail(new CallbackDataMalformed({ prefix, reason: "prefix mismatch" }))
  }

  const matches: Codec<A>["matches"] = (data) =>
    data.startsWith(inlinePrefix) || data.startsWith(storedPrefix)

  const parse: Codec<A>["parse"] = (data) =>
    matches(data) ? Option.some(decode(data)) : Option.none()

  const button: Codec<A>["button"] = (text, value) =>
    Effect.map(encode(value), (callbackData) => ({ text, callbackData }))

  return { prefix, encode, matches, decode, parse, button }
}
