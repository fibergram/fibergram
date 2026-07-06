# @fibergram/core

Effect-native framework for Telegram bots. A handler is an `Effect<A, E, R>` with typed errors, dependency injection via `Layer`, updates as a `Stream`, and multi-step dialogs as suspendable coroutines.

```bash
pnpm add @fibergram/core effect
```

One package, five subpath modules:

| Subpath | What lives there |
|---|---|
| `@fibergram/core` | `Dialog`, `Router`, `Dispatcher`, `Coroutine`, `Chat`, `Session`, `Command`, `CallbackData`, `StartLink`, typed errors |
| `@fibergram/core/client` | `TelegramClient` (Tag + Layer), generated Bot API types, `Transform`, `InputFile`, `WebApp` |
| `@fibergram/core/polling` | long-polling ingestion with offset management |
| `@fibergram/core/testing` | `TestTelegram` recording double, synthetic `Updates` |
| `@fibergram/core/ui` | `InlineKeyboard`, `Keyboard`, `Fmt` entity formatting, `Emoji`, `Reaction` |

## Quick start: echo bot

```ts
import { Polling } from "@fibergram/core/polling"
import { Dispatcher, Dialog, DialogStore, Dedup } from "@fibergram/core"
import { TelegramClient } from "@fibergram/core/client"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

const echo = Dialog.stateless({
  onUpdate: (update) =>
    Effect.gen(function* () {
      const tg = yield* TelegramClient.TelegramClient
      const message = update.message
      if (message?.text !== undefined) {
        yield* tg.sendMessage({ chatId: message.chat.id, text: message.text })
      }
    })
})

const program = Effect.gen(function* () {
  const updates = yield* Polling.make()
  yield* Dispatcher.run({ updates, dialog: echo })
}).pipe(
  Effect.scoped,
  Effect.provide([
    DialogStore.layerMemory,
    Dedup.layerMemory,
    TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
  ])
)
```

`TelegramClient.layer` reads the token from the `BOT_TOKEN` env var (`Config.redacted`); use `TelegramClient.layerToken({ token })` to pass it explicitly. `Polling.make` forks a background poller into the ambient `Scope` and returns the `Stream<Update>` that `Dispatcher.run` drains.

## Routing: commands, callbacks, text

Commands and callback payloads are schema-typed — arguments are parsed and validated before your handler runs:

```ts
import { Router, Command, CallbackData, Chat } from "@fibergram/core"
import { Schema } from "effect"

const setAge = Command.make("/setage", Schema.Struct({ age: Schema.NumberFromString }), {
  description: "Set your age"
})
const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number }))

const router = Router.make(
  Router.command(setAge, ({ age }) => Chat.reply(`age ${age}`)),
  Router.callback(Vote, ({ id }) => Chat.answerCallback({ text: `voted ${id}` }))
)
```

A router is converted to a dialog and dispatched like any other:

```ts
import { Router, Dispatcher, DialogStore, Dedup, Chat } from "@fibergram/core"
import { Effect, Stream } from "effect"

const router = Router.make(Router.when((u) => u.message?.text === "/hi", () => Chat.reply("hi")))

const program = Dispatcher.run({
  updates: Stream.empty, // your polling/webhook stream
  dialog: Router.toDialog(router)
}).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory]))
```

Other route constructors: `Router.on(kind, handler)`, `Router.hears(text | RegExp | Schema, handler)`, `Router.entity`, `Router.reaction`, `Router.chatMember`, `Router.start` (deep links). Composition: `Router.make(...)`, `.add`, `.concat` — `E` and `R` accumulate as type-level unions, satisfied by one `Layer` at the edge.

Two derived niceties:

- `Router.allowedUpdates(router)` — computes Telegram's `allowed_updates` set from the routes you actually mounted.
- `Router.setMyCommands(router)` — syncs the bot command menu from your `Command.make` descriptions.

## Multi-step dialogs: the Coroutine DSL

A conversation is a generator that suspends on `d.prompt` and resumes with the next update — the state machine is derived, never hand-written:

```ts
import { Coroutine } from "@fibergram/core"
import { Schema } from "effect"

const Age = Schema.NumberFromString.check(Schema.isBetween({ minimum: 0, maximum: 150 }))

const registration = Coroutine.make("registration", function* (d) {
  const name = yield* d.prompt("Name?", Schema.NonEmptyString)
  const age = yield* d.prompt("Age?", Age, {
    onInvalid: () => "Age must be a number. Age?"
  })
  yield* d.reply(`Ok, ${name}, ${age}`)
})
```

DSL operations: `d.prompt(question, schema, { onInvalid? })` waits for the next update; `d.reply(text, options?)` sends; `d.effect(effect)` runs a side effect; `d.run(effect, schema)` records a durable activity result (use it for non-deterministic or external data — the driver is replay-based, and inline branching on unrecorded non-determinism throws `Coroutine.NonDeterminismError`).

Feed the coroutine straight to the dispatcher: `Dispatcher.run({ updates, dialog: registration })`. Whether it survives restarts is decided by the `DialogStore` Layer (see `@fibergram/durable`), not by the handler code.

## Session state

`Session.make` gives per-chat (or per-user) state on top of the same `DialogStore`:

```ts
import { Session } from "@fibergram/core"
import { Effect } from "effect"

const counter = Session.make("counter", { initial: 0 })

// Inside any handler — the address comes from the ambient update context:
const handler = Effect.gen(function* () {
  const count = yield* counter.update((n) => n + 1)
  return count
})

// Outside a handler — address explicitly:
const admin = counter.getAt({ chatId: 555 })
```

Options: `scope: "chat" | "user"` (default `"chat"`). Methods: `get`/`set`/`update` (ambient) and `getAt`/`setAt`/`updateAt` (explicit). Durable when the `DialogStore` backend is durable.

## Client transforms

Transforms intercept outbound API calls — bot-wide defaults, flood-limit pacing, and 429 retry are one Layer:

```ts
import { TelegramClient, Transform } from "@fibergram/core/client"
import { Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

const layer = TelegramClient.transformed(
  Transform.defaults({ parseMode: "HTML" }),
  Transform.throttle(),
  Transform.autoRetry()
).pipe(Layer.provide(FetchHttpClient.layer))
```

- `Transform.defaults(values)` — injects fields (e.g. `parseMode`) only where the method schema declares them and the caller omitted them.
- `Transform.throttle()` — paces under Telegram's flood limits (30/s global, 1/s per chat, 20/min per group); driven by `Effect.sleep`, so `TestClock` controls it in tests.
- `Transform.autoRetry({ maxAttempts?, maxDelay? })` — transparently retries `429` honouring `retry_after`.

## Keyboards, formatting, emoji

```ts
import { InlineKeyboard } from "@fibergram/core/ui"
import { Chat } from "@fibergram/core"
import { Effect } from "effect"

const handler = Effect.gen(function* () {
  const keyboard = InlineKeyboard.empty.text("Yes", "yes").text("No", "no")
  yield* Chat.reply("Confirm?", { replyMarkup: yield* InlineKeyboard.build(keyboard) })
})
```

`Fmt` builds messages as entity trees — no `parse_mode`, nothing to escape:

```ts
import { Fmt } from "@fibergram/core/ui"

const message = Fmt.fmt`Welcome, ${Fmt.bold("Ada")}! Read the ${Fmt.link("docs", "https://effect.website")}.`
// message.text === "Welcome, Ada! Read the docs." — plus typed entities
```

```ts
import { Emoji } from "@fibergram/core/ui"

Emoji.emoji`Congrats ${"tada"} you did it ${"fire"}`
// "Congrats 🎉 you did it 🔥" — names are compile-checked
```

Reply keyboards: `Keyboard.empty.text("Yes").text("No").row().requestContact("Share my number").resized().oneTime()`. Reactions: `Chat.react(Reaction.thumbsUp)`.

## Testing without a network

`TestTelegram` is a recording `TelegramClient` double; `Updates` fabricates incoming updates. Assertions read back camelCase params:

```ts
import { Chat, Dedup, Dialog, DialogStore, Dispatcher } from "@fibergram/core"
import { TestTelegram, Updates } from "@fibergram/core/testing"
import { Effect } from "effect"

const echo = Dialog.stateless({
  onUpdate: (update) =>
    Effect.gen(function* () {
      const text = update.message?.text
      if (text !== undefined) yield* Chat.reply(text)
    })
})

const test = Effect.gen(function* () {
  const tg = yield* TestTelegram.make
  yield* Dispatcher.run({
    updates: Updates.stream([
      Updates.text({ updateId: 1, chatId: 100, text: "hi" }),
      Updates.text({ updateId: 2, chatId: 100, text: "yo" })
    ]),
    dialog: echo
  }).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer]))

  // tg.sent === [{ chatId: 100, text: "hi" }, { chatId: 100, text: "yo" }]
})
```

The double captures `calls`, `callsTo(method)`, `sent`, `edited`, `actions`, `answered`; `TestTelegram.makeWith({ respond })` stubs specific method responses. Dialog timeouts run on `TestClock`.

## Tech facts

- **No `ctx` god-object.** Per-update ambient state (chat, thread, sender) lives in a `FiberRef` set by the dispatcher; everything else your handler needs flows through the `R` channel and is provided by one `Layer` at the edge.
- **Typed errors.** Every client call fails only with the `TelegramError` union: `RateLimited | BotBlocked | MessageNotModified | ChatMigrated | Forbidden | BadRequest | TransportError` — all `Data.TaggedError`, so `catchTag` works. Domain errors pass through `E` untouched.
- **snake_case never escapes the edge.** The `./client` schemas map Bot API `snake_case ↔ camelCase` on decode/encode; handlers, tests, and everything else are camelCase only.
- **Transport-agnostic ingestion.** Polling and webhook (`@fibergram/webhook`) are both producers into one bounded `Queue<Update>`; the dispatcher drains `Stream.fromQueue` and routes each update to a per-address serialized mailbox (virtual-actor style).
- **Polling delivery.** Offset commits `highest updateId + 1` after enqueue; combined with dedup by `updateId` this gives effectively exactly-once processing. `Polling.make` never dies: `retry_after` is honoured, other errors are logged and retried after `errorBackoff` (default 1 s). Pass `offsetStore` to persist the offset across restarts.
- **Bot API surface is generated** from the spec (`src/client/generated`), plus hand-written file helpers (`getFileUrl`, `downloadFile`). `InputFile` uploads by path/bytes/stream/URL and switches to multipart automatically.
- ESM-only, single runtime dependency: `effect`. `HttpClient` comes from `effect/unstable/http` — provide `FetchHttpClient.layer` under any client layer.
