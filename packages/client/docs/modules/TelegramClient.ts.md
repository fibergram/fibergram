---

title: TelegramClient.ts
nav_order: 6
parent: Modules
---

## TelegramClient overview

`TelegramClient` - a `Context.Service` (Tag + Layer) over the Effect
`HttpClient` (design section 6). The volatile HTTP perimeter sits behind this port;
the domain talks to the port, never to `fetch` (design section 9).

The method surface ({@link TelegramClientService}) is **generated** from the Bot
API spec (`./generated/client`) - every Bot API method, fully typed. Only the
transport seam (`call`: HTTP request, token, `snake_case` encode/decode, error
mapping) is hand-written here. Methods fail with the typed
{@link module:TelegramError.TelegramError} union, never with thrown errors.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [layers](#layers)
  - [layer](#layer)
  - [layerToken](#layertoken)
- [models](#models)
  - [MakeOptions (interface)](#makeoptions-interface)
  - [TelegramClientService (type alias)](#telegramclientservice-type-alias)
- [services](#services)
  - [TelegramClient (class)](#telegramclient-class)

---

# constructors

## make

Builds the {@link TelegramClientService} against the ambient `HttpClient`.
Prefer {@link layer}/{@link layerToken}; this is the seam tests wire a mock
`HttpClient` into.

**Signature**

```ts
export declare const make: (
  options: MakeOptions
) => Effect.Effect<GeneratedClient.TelegramClientService, never, HttpClient.HttpClient>
```

**Example**

```ts
import { TelegramClient } from "@fibergram/client"
import { Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

const layer = Layer.effect(TelegramClient.TelegramClient, TelegramClient.make({ token: "T" })).pipe(
  Layer.provide(FetchHttpClient.layer)
)
```

Added in v0.1.0

# layers

## layer

A `Layer` providing {@link TelegramClient}, reading the bot token from the
`BOT_TOKEN` environment variable via `Config.redacted` (design section 5.3, D5).
Wire an `HttpClient` underneath.

**Signature**

```ts
export declare const layer: Layer.Layer<TelegramClient, Config.ConfigError, HttpClient.HttpClient>
```

**Example**

```ts
import { TelegramClient } from "@fibergram/client"
import { Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

const layer = TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
```

Added in v0.1.0

## layerToken

A `Layer` providing {@link TelegramClient} from an explicit token. Wire an
`HttpClient` (e.g. `FetchHttpClient.layer`) underneath.

**Signature**

```ts
export declare const layerToken: (options: MakeOptions) => Layer.Layer<TelegramClient, never, HttpClient.HttpClient>
```

**Example**

```ts
import { TelegramClient } from "@fibergram/client"
import { Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

const layer = TelegramClient.layerToken({ token: "T" }).pipe(Layer.provide(FetchHttpClient.layer))
```

Added in v0.1.0

# models

## MakeOptions (interface)

Options for constructing a {@link TelegramClient}.

**Signature**

```ts
export interface MakeOptions {
  /** Bot token from `@BotFather`. Accepts a plain string or a `Redacted`. */
  readonly token: Redacted.Redacted<string> | string
  /** Override the API origin (e.g. a local Bot API server or a test double). */
  readonly apiBaseUrl?: string
}
```

Added in v0.1.0

## TelegramClientService (type alias)

The service shape: the full Bot API, generated from the spec. Each call is an
`Effect` whose only failure channel is the typed Telegram error union.

**Signature**

```ts
export type TelegramClientService = GeneratedClient.TelegramClientService
```

Added in v0.1.0

# services

## TelegramClient (class)

The `TelegramClient` service tag. `yield*` it inside any handler to reach the
Bot API; provide it once at the edge with {@link layer} or {@link layerToken}.

**Signature**

```ts
export declare class TelegramClient
```

**Example**

```ts
import { TelegramClient } from "@fibergram/client"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const tg = yield* TelegramClient.TelegramClient
  yield* tg.sendMessage({ chatId: 1, text: "hi" })
})
```

Added in v0.1.0
