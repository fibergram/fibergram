---

title: CallbackData.ts
nav_order: 1
parent: Modules
---

## CallbackData overview

`CallbackData` - the typed codec for inline-button payloads (design section 5.3,
the "killer feature"). Telegram gives every inline button a ≤64-byte
`callback_data` string and echoes it back on tap; `CallbackData` turns that
opaque string into an encode/decode pair over a `Schema`, so buttons carry
typed values and routing is a `decode`, not string-splitting.

**Overflow (section 11.4).** A payload that does not fit in 64 bytes fails with
{@link CallbackDataTooLong} **by default**. Provide a {@link CallbackStore}
layer and overflow transparently spills to it: the button carries a short key,
`decode` reads the value back. The store is an _optional_ port - codecs that
never overflow need nothing provided.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [errors](#errors)
  - [CallbackDataMalformed (class)](#callbackdatamalformed-class)
  - [CallbackDataTooLong (class)](#callbackdatatoolong-class)
- [layers](#layers)
  - [layerMemory](#layermemory)
- [models](#models)
  - [Codec (interface)](#codec-interface)
- [services](#services)
  - [CallbackStore (class)](#callbackstore-class)

---

# constructors

## make

Builds a {@link Codec} for `prefix`/`schema`. The `prefix` must not contain
`":"` or `"#"` (the codec's separators).

**Signature**

```ts
export declare const make: <A, I>(prefix: string, schema: Schema.Codec<A, I>) => Codec<A>
```

**Example**

```ts
import { CallbackData } from "@fibergram/core"
import { Effect, Schema } from "effect"

const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number }))

const program = Effect.gen(function* () {
  const data = yield* Vote.encode({ id: 42 })
  const back = yield* Vote.decode(data)
  return back.id // 42
})
```

Added in v0.1.0

# errors

## CallbackDataMalformed (class)

Raised when a `callback_data` string cannot be decoded back into the codec's
type - malformed JSON, a schema mismatch, or a store key that is missing
(expired/evicted).

**Signature**

```ts
export declare class CallbackDataMalformed
```

Added in v0.1.0

## CallbackDataTooLong (class)

Raised when an encoded payload exceeds 64 bytes and no {@link CallbackStore} is
available to spill it to (design section 11.4).

**Signature**

```ts
export declare class CallbackDataTooLong
```

Added in v0.1.0

# layers

## layerMemory

An in-memory {@link CallbackStore} - monotonic integer keys, no eviction. Fine
for tests and single-process bots; swap for a durable layer in production.

**Signature**

```ts
export declare const layerMemory: Layer.Layer<CallbackStore, never, never>
```

**Example**

```ts
import { CallbackData } from "@fibergram/core"
import { Layer } from "effect"

const layer: Layer.Layer<CallbackData.CallbackStore> = CallbackData.layerMemory
```

Added in v0.1.0

# models

## Codec (interface)

A typed `callback_data` codec bound to a `prefix` (its routing discriminator)
and a `Schema`.

**Signature**

```ts
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
  readonly button: (text: string, value: A) => Effect.Effect<BotApi.InlineKeyboardButton, CallbackDataTooLong>
}
```

Added in v0.1.0

# services

## CallbackStore (class)

The optional overflow port (design section 11.4). A tiny key/value store: `put`
stashes an oversized payload and returns a short key; `get` reads it back.
Provide {@link layerMemory} in tests, a Redis/KV-backed layer in production.

**Signature**

```ts
export declare class CallbackStore
```

Added in v0.1.0
