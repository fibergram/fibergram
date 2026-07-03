/**
 * The raw Telegram Bot API spec shape (`api.json`) and its decoding into an in-memory
 * {@link Spec}. This is the generator's *input* model — a faithful mirror of the JSON,
 * still in `snake_case`; the `camelCase` boundary is applied later during rendering.
 */
import { Data, Effect } from "effect"

/** A single field of a type or method, as it appears in the spec. */
export interface RawField {
  readonly name: string
  readonly types: ReadonlyArray<string>
  readonly required: boolean
  readonly description?: string
}

/** A Bot API object: either a struct (has `fields`) or a union (has `subtypes`). */
export interface RawType {
  readonly name: string
  readonly href?: string
  readonly description?: ReadonlyArray<string>
  readonly fields?: ReadonlyArray<RawField>
  readonly subtypes?: ReadonlyArray<string>
}

/** A Bot API method with its parameters and possible return types. */
export interface RawMethod {
  readonly name: string
  readonly href?: string
  readonly description?: ReadonlyArray<string>
  readonly returns: ReadonlyArray<string>
  readonly fields?: ReadonlyArray<RawField>
}

/** The whole parsed spec. */
export interface Spec {
  readonly version: string
  readonly types: Record<string, RawType>
  readonly methods: Record<string, RawMethod>
}

/** The spec file could not be read or parsed as JSON. */
export class SpecError extends Data.TaggedError("SpecError")<{ readonly cause: unknown }> {}

/** Parse the spec JSON, failing with a typed {@link SpecError} rather than throwing. */
export const parseSpec = (content: string): Effect.Effect<Spec, SpecError> =>
  Effect.try({
    try: () => JSON.parse(content) as Spec,
    catch: (cause) => new SpecError({ cause })
  })
