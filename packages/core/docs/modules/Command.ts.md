---

title: Command.ts
nav_order: 3
parent: Modules
---

## Command overview

`Command` - typed slash commands with `Schema`-decoded arguments (design
section 5.3). `Command.make("/setage", Schema.Struct({ age: NumberFromString }))`
matches `/setage 30` (and `/setage@bot 30` in groups) and decodes `"30"` into
`{ age: 30 }` - the same Schema-on-every-edge discipline used for updates.

Argument mapping is positional: a **single-field** schema captures the whole
argument tail (so `/say hello world` fills one `text` field), while a
**multi-field** schema splits the tail on whitespace and zips it against the
fields in declaration order.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [errors](#errors)
  - [CommandArgsError (class)](#commandargserror-class)
- [models](#models)
  - [Command (interface)](#command-interface)
  - [Match (interface)](#match-interface)

---

# constructors

## make

Declares a {@link Command} named `name` (with or without a leading slash) whose
arguments decode against `argsSchema`. Omit the schema for an argument-less
command.

**Signature**

```ts
export declare const make: <Fields extends Schema.Struct.Fields = {}>(
  name: string,
  argsSchema?: Schema.Struct<Fields>
) => Command<Schema.Schema.Type<Schema.Struct<Fields>>>
```

**Example**

```ts
import { Command } from "@fibergram/core"
import { Effect, Schema } from "effect"

const setAge = Command.make("/setage", Schema.Struct({ age: Schema.NumberFromString }))

const update = {
  updateId: 1,
  message: { messageId: 1, date: 0, chat: { id: 1, type: "private" }, text: "/setage 30" }
}

const program = Effect.gen(function* () {
  const parsed = setAge.parse(update)
  return parsed
})
```

Added in v0.1.0

# errors

## CommandArgsError (class)

Raised when a command's arguments don't decode against its schema (missing,
extra or ill-typed).

**Signature**

```ts
export declare class CommandArgsError
```

Added in v0.1.0

# models

## Command (interface)

A declared command: its `name` (without the leading slash) plus matching and
argument-decoding helpers.

**Signature**

```ts
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
```

Added in v0.1.0

## Match (interface)

A successful surface match of a command against an update, before argument
decoding: the raw argument tail and its whitespace tokens.

**Signature**

```ts
export interface Match {
  readonly raw: string
  readonly tokens: ReadonlyArray<string>
}
```

Added in v0.1.0
