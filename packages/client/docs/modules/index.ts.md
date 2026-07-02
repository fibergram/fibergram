---

title: index.ts
nav_order: 5
parent: Modules
---

## index overview

`@fibergram/client` - `TelegramClient` (Tag + Layer over `HttpClient`) plus
the Bot API edge schemas. This package owns the `snake_case <-> camelCase`
boundary (design section 5.3) and the typed Telegram error union (section 5.2); everything
else in fibergram builds on top of it.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [exports](#exports)
  - [From "./BotApi.js"](#from-botapijs)
  - [From "./TelegramClient.js"](#from-telegramclientjs)
  - [From "./TelegramError.js"](#from-telegramerrorjs)

---

# exports

## From "./BotApi.js"

`@fibergram/client` - `TelegramClient` (Tag + Layer over `HttpClient`) plus
the Bot API edge schemas. This package owns the `snake_case <-> camelCase`
boundary (design section 5.3) and the typed Telegram error union (section 5.2); everything
else in fibergram builds on top of it.

**Signature**

```ts
export * as BotApi from "./BotApi.js"
```

Added in v0.1.0

## From "./TelegramClient.js"

The `TelegramClient` service, its layers and constructors.

**Signature**

```ts
export * as TelegramClient from "./TelegramClient.js"
```

Added in v0.1.0

## From "./TelegramError.js"

The typed Telegram error union and its response mapper.

**Signature**

```ts
export * as TelegramError from "./TelegramError.js"
```

Added in v0.1.0
