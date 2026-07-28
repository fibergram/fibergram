---
title: Installation
description: Install fibergram, pick the packages you need, and get a bot token.
sidebar:
  order: 2
---

## Requirements

- **Node.js ≥ 20** (or any ESM runtime — Bun, Deno, and workerd all work; the
  webhook transport speaks web-standard `Request`/`Response`).
- **`effect` v4**. fibergram is built against the beta and pins an exact version;
  your app must resolve the *same* one, or Effect's `Context` tags will not match.

:::caution[Pin `effect`]
Install `effect` without a caret and keep it in lockstep with the version
fibergram declares. Two copies of `effect` in one dependency tree is the single
most common cause of "service not found" at runtime.
:::

## Install

```bash
pnpm add @fibergram/core effect
```

`@fibergram/core` is one package with five subpath modules — you do not install
`client`, `polling`, `testing`, or `ui` separately:

| Import | What lives there |
|---|---|
| `@fibergram/core` | `Dialog`, `Router`, `Dispatcher`, `Coroutine`, `Chat`, `Session`, `Command`, `CallbackData`, `StartLink` |
| `@fibergram/core/client` | `TelegramClient`, generated Bot API types, `Transform`, `InputFile`, `WebApp` |
| `@fibergram/core/polling` | long-polling ingestion with offset management |
| `@fibergram/core/testing` | `TestTelegram` recording double, synthetic `Updates` |
| `@fibergram/core/ui` | `InlineKeyboard`, `Keyboard`, `Fmt`, `Emoji`, `Reaction` |

Add the satellite packages only when you need them:

```bash
pnpm add @fibergram/webhook       # webhook ingestion, Express/Fastify adapters
pnpm add @fibergram/menu          # stateful inline menus
pnpm add @fibergram/i18n          # Fluent (.ftl) localization
pnpm add @fibergram/durable       # persisted dialogs, durable timers, passivation
pnpm add @fibergram/chat-members  # chat-membership cache
```

Why the split is drawn where it is — and why `client` is *not* its own package —
is explained in [Architecture](/concepts/architecture/).

## Get a bot token

Talk to [@BotFather](https://t.me/BotFather), send `/newbot`, and keep the token
it gives you. fibergram reads it from the `BOT_TOKEN` environment variable by
default, through Effect's `Config`:

```bash
export BOT_TOKEN="123456:ABC-DEF..."
```

```ts
import { TelegramClient } from "@fibergram/core/client"

TelegramClient.layer // reads BOT_TOKEN via Config.redacted
```

To pass it explicitly instead — multiple bots in one process, or a token from
your own secret store:

```ts
import { TelegramClient } from "@fibergram/core/client"

const layer = TelegramClient.layerToken({ token: "123456:ABC-DEF..." })
```

Because the token is a `Redacted<string>`, it will not leak into logs or error
messages if you print the client's configuration.

## Provide an HTTP client

fibergram does not bundle an HTTP implementation — `TelegramClient` is built on
Effect's `HttpClient`, so you choose the backing implementation:

```ts
import { TelegramClient } from "@fibergram/core/client"
import { Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

const layer = TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
```

`FetchHttpClient.layer` works everywhere `fetch` does. Swap in a different
`HttpClient` layer for proxying, custom agents, or connection pooling.

## TypeScript configuration

fibergram is **ESM-only** and ships `.d.ts` built for modern resolution. Your
`tsconfig.json` needs:

```jsonc
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    // Effect's type-level machinery depends on these:
    "exactOptionalPropertyTypes": true,
    "strictNullChecks": true
  }
}
```

Installing [`@effect/language-service`](https://github.com/Effect-TS/language-service)
as a dev dependency is strongly recommended — it turns Effect's type errors into
readable ones and is what the fibergram repository itself uses.

Next: [your first bot](/getting-started/your-first-bot/).
