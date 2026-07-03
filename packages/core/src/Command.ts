/**
 * `Command` - typed slash commands with `Schema`-decoded arguments.
 * `Command.make("/setage", Schema.Struct({ age: NumberFromString }))`
 * matches `/setage 30` (and `/setage@bot 30` in groups) and decodes `"30"` into
 * `{ age: 30 }` - the same Schema-on-every-edge discipline used for updates.
 *
 * Argument mapping is positional: a **single-field** schema captures the whole
 * argument tail (so `/say hello world` fills one `text` field), while a
 * **multi-field** schema splits the tail on whitespace and zips it against the
 * fields in declaration order.
 *
 * @since 0.1.0
 */
import { Data, Effect, Option, Schema } from "effect"

import type { BotApi } from "@fibergram/client"

/**
 * Raised when a command's arguments don't decode against its schema (missing,
 * extra or ill-typed).
 *
 * @category errors
 * @since 0.1.0
 */
export class CommandArgsError extends Data.TaggedError("CommandArgsError")<{
  readonly command: string
  readonly reason: string
}> {}

/**
 * A successful surface match of a command against an update, before argument
 * decoding: the raw argument tail and its whitespace tokens.
 *
 * @category models
 * @since 0.1.0
 */
export interface Match {
  readonly raw: string
  readonly tokens: ReadonlyArray<string>
}

/**
 * A declared command: its `name` (without the leading slash) plus matching and
 * argument-decoding helpers.
 *
 * @category models
 * @since 0.1.0
 */
export interface Command<Args> {
  /** The command name, normalized without the leading slash (e.g. `"setage"`). */
  readonly name: string
  /** Surface-matches an update's message text; `None` if it isn't this command. */
  readonly match: (update: BotApi.Update) => Option.Option<Match>
  /** Decodes a {@link Match}'s tokens into typed `Args`. */
  readonly decodeArgs: (match: Match) => Effect.Effect<Args, CommandArgsError>
  /** {@link match} then {@link decodeArgs}: `None` when the update isn't this command. */
  readonly parse: (update: BotApi.Update) => Option.Option<Effect.Effect<Args, CommandArgsError>>
}

const stripSlash = (name: string): string => (name.startsWith("/") ? name.slice(1) : name)

// /name  |  /name@bot  |  /name args...  |  /name@bot args...
const commandPattern = /^\/(\w+)(?:@\w+)?(?:\s+([\s\S]+))?$/

/**
 * Declares a {@link Command} named `name` (with or without a leading slash) whose
 * arguments decode against `argsSchema`. Omit the schema for an argument-less
 * command.
 *
 * @example
 * import { Command } from "@fibergram/core"
 * import { Effect, Schema } from "effect"
 *
 * const setAge = Command.make("/setage", Schema.Struct({ age: Schema.NumberFromString }))
 *
 * const update = {
 *   updateId: 1,
 *   message: { messageId: 1, date: 0, chat: { id: 1, type: "private" }, text: "/setage 30" }
 * }
 *
 * const program = Effect.gen(function* () {
 *   const parsed = setAge.parse(update)
 *   return parsed
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = <Fields extends Schema.Struct.Fields = {}>(
  name: string,
  argsSchema?: Schema.Struct<Fields>
): Command<Schema.Schema.Type<Schema.Struct<Fields>>> => {
  const normalized = stripSlash(name).toLowerCase()
  const schema = argsSchema ?? (Schema.Struct({}) as unknown as Schema.Struct<Fields>)
  const keys = Object.keys(schema.fields)
  const decode = Schema.decodeUnknownEffect(schema)

  const match: Command<never>["match"] = (update) => {
    const text = update.message?.text
    if (text === undefined) return Option.none()
    const groups = commandPattern.exec(text.trim())
    if (groups === null || groups[1]?.toLowerCase() !== normalized) return Option.none()
    const raw = groups[2] ?? ""
    const tokens = raw.length > 0 ? raw.split(/\s+/) : []
    return Option.some({ raw, tokens })
  }

  const decodeArgs = (
    matched: Match
  ): Effect.Effect<Schema.Schema.Type<Schema.Struct<Fields>>, CommandArgsError> => {
    // Single field: capture the whole tail. Multiple fields: zip positionally.
    const record: Record<string, string> = {}
    if (keys.length === 1) {
      const key = keys[0]
      if (key !== undefined && matched.raw.length > 0) record[key] = matched.raw
    } else {
      for (const [index, key] of keys.entries()) {
        const token = matched.tokens[index]
        if (token !== undefined) record[key] = token
      }
    }
    // Command arg schemas are plain data (no decoding services), so erase the
    // schema's `DecodingServices` from the requirement channel.
    return decode(record).pipe(
      Effect.mapError(
        (error) => new CommandArgsError({ command: normalized, reason: String(error) })
      )
    ) as Effect.Effect<Schema.Schema.Type<Schema.Struct<Fields>>, CommandArgsError>
  }

  const parse: Command<Schema.Schema.Type<Schema.Struct<Fields>>>["parse"] = (update) =>
    Option.map(match(update), decodeArgs)

  return { name: normalized, match, decodeArgs, parse }
}
