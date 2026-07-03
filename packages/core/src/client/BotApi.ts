/**
 * Bot API edge schemas - the **only** place `snake_case` is allowed.
 *
 * The bulk of this module is **generated** from the Telegram Bot API spec: every
 * object schema (`./generated/types`) and every method's request-parameter schema
 * (`./generated/methods`) is re-exported here so downstream code sees one flat
 * `BotApi` namespace. Each generated schema decodes `snake_case -> camelCase` via
 * {@link Schema.encodeKeys} and drops unknown fields (forward-compatible).
 *
 * Only the response *envelope* ({@link ApiResponse}) is hand-written - it is a
 * transport construct, not a Bot API object, so it is not in the spec. Regenerate
 * the rest with `pnpm codegen`.
 *
 * @since 0.1.0
 */
import { Schema } from "effect"

import { ResponseParameters } from "./generated/types.js"

/**
 * Every Bot API object schema (`Update`, `Message`, `User`, `Chat`, ...), generated
 * from the spec. See `./generated/types` for the full list.
 *
 * @since 0.1.0
 */
export * from "./generated/types.js"

/**
 * Every Bot API method's request-parameter schema (`SendMessageParams`,
 * `GetUpdatesParams`, ...), generated from the spec. See `./generated/methods`.
 *
 * @since 0.1.0
 */
export * from "./generated/methods.js"

/**
 * The Bot API response envelope. `result` is left as `unknown` and decoded by the
 * caller against the specific method result schema on success; on failure the error
 * fields feed {@link module:TelegramError.fromResponse}. Not a spec type - kept by hand.
 *
 * @example
 * import { BotApi } from "@fibergram/core/client"
 * import { Schema } from "effect"
 *
 * const envelope = Schema.decodeUnknownSync(BotApi.ApiResponse)({ ok: true, result: [] })
 *
 * @category schemas
 * @since 0.1.0
 */
export const ApiResponse = Schema.Struct({
  ok: Schema.Boolean,
  result: Schema.optionalKey(Schema.Unknown),
  errorCode: Schema.optionalKey(Schema.Number),
  description: Schema.optionalKey(Schema.String),
  parameters: Schema.optionalKey(ResponseParameters)
}).pipe(
  Schema.encodeKeys({
    errorCode: "error_code"
  })
)

/**
 * Decoded response envelope.
 *
 * @category models
 * @since 0.1.0
 */
export type ApiResponse = Schema.Schema.Type<typeof ApiResponse>
