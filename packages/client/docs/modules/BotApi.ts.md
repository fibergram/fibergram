---

title: BotApi.ts
nav_order: 1
parent: Modules
---

## BotApi overview

Bot API edge schemas - the **only** place `snake_case` is allowed (design section 5.3).

The bulk of this module is **generated** from the Telegram Bot API spec: every
object schema (`./generated/types`) and every method's request-parameter schema
(`./generated/methods`) is re-exported here so downstream code sees one flat
`BotApi` namespace. Each generated schema decodes `snake_case -> camelCase` via
{@link Schema.encodeKeys} and drops unknown fields (forward-compatible).

Only the response _envelope_ ({@link ApiResponse}) is hand-written - it is a
transport construct, not a Bot API object, so it is not in the spec. Regenerate
the rest with `pnpm codegen`.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [exports](#exports)
  - [From "./generated/methods.js"](#from-generatedmethodsjs)
  - [From "./generated/types.js"](#from-generatedtypesjs)
- [models](#models)
  - [ApiResponse (type alias)](#apiresponse-type-alias)
- [schemas](#schemas)
  - [ApiResponse](#apiresponse)

---

# exports

## From "./generated/methods.js"

Every Bot API method's request-parameter schema (`SendMessageParams`,
`GetUpdatesParams`, ...), generated from the spec. See `./generated/methods`.

**Signature**

```ts
export * from "./generated/methods.js"
```

Added in v0.1.0

## From "./generated/types.js"

Every Bot API object schema (`Update`, `Message`, `User`, `Chat`, ...), generated
from the spec. See `./generated/types` for the full list.

**Signature**

```ts
export * from "./generated/types.js"
```

Added in v0.1.0

# models

## ApiResponse (type alias)

Decoded response envelope.

**Signature**

```ts
export type ApiResponse = Schema.Schema.Type<typeof ApiResponse>
```

Added in v0.1.0

# schemas

## ApiResponse

The Bot API response envelope. `result` is left as `unknown` and decoded by the
caller against the specific method result schema on success; on failure the error
fields feed {@link module:TelegramError.fromResponse}. Not a spec type - kept by hand.

**Signature**

```ts
export declare const ApiResponse: Schema.encodeKeys<
  Schema.Struct<{
    readonly ok: Schema.Boolean
    readonly result: Schema.optionalKey<Schema.Unknown>
    readonly errorCode: Schema.optionalKey<Schema.Number>
    readonly description: Schema.optionalKey<Schema.String>
    readonly parameters: Schema.optionalKey<
      Schema.encodeKeys<
        Schema.Struct<{
          readonly migrateToChatId: Schema.optionalKey<Schema.Number>
          readonly retryAfter: Schema.optionalKey<Schema.Number>
        }>,
        { readonly migrateToChatId: "migrate_to_chat_id"; readonly retryAfter: "retry_after" }
      >
    >
  }>,
  { readonly errorCode: "error_code" }
>
```

**Example**

```ts
import { BotApi } from "@fibergram/client"
import { Schema } from "effect"

const envelope = Schema.decodeUnknownSync(BotApi.ApiResponse)({ ok: true, result: [] })
```

Added in v0.1.0
