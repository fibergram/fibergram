---

title: TelegramError.ts
nav_order: 4
parent: Modules
---

## TelegramError overview

Telegram error model - a tagged union, not an error base class (design section 5.2, D4).

Domain errors of the user flow untouched through `E`; only Bot-API-semantic
failures are represented here. `RateLimited` carries a {@link Duration} so a
retry `Schedule` can honour Telegram's `retry_after` instead of guessing a
backoff.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [fromResponse](#fromresponse)
- [errors](#errors)
  - [BadRequest (class)](#badrequest-class)
  - [BotBlocked (class)](#botblocked-class)
  - [ChatMigrated (class)](#chatmigrated-class)
  - [Forbidden (class)](#forbidden-class)
  - [MessageNotModified (class)](#messagenotmodified-class)
  - [RateLimited (class)](#ratelimited-class)
  - [TransportError (class)](#transporterror-class)
- [models](#models)
  - [TelegramError (type alias)](#telegramerror-type-alias)

---

# constructors

## fromResponse

Maps a failed Bot API response (`ok: false`) onto the most specific
{@link TelegramError}. `errorCode` and `description` follow Telegram's own
conventions; unknown shapes fall back to {@link BadRequest}.

**Signature**

```ts
export declare const fromResponse: (
  method: string,
  response: { readonly errorCode?: number; readonly description?: string; readonly parameters?: ResponseParameters }
) => TelegramError
```

**Example**

```ts
import { TelegramError } from "@fibergram/client"

const err = TelegramError.fromResponse("sendMessage", {
  errorCode: 429,
  description: "Too Many Requests",
  parameters: { retryAfter: 5 }
})
// err._tag === "RateLimited"
```

Added in v0.1.0

# errors

## BadRequest (class)

A malformed request (HTTP 400) or any other Bot API `ok: false` response not
covered by a more specific tag.

**Signature**

```ts
export declare class BadRequest
```

Added in v0.1.0

## BotBlocked (class)

The bot was blocked by the user (a common HTTP 403).

**Signature**

```ts
export declare class BotBlocked
```

Added in v0.1.0

## ChatMigrated (class)

The group chat was upgraded to a supergroup; retry against
{@link ChatMigrated.newChatId}.

**Signature**

```ts
export declare class ChatMigrated
```

Added in v0.1.0

## Forbidden (class)

A forbidden action (HTTP 403) that is not specifically {@link BotBlocked}.

**Signature**

```ts
export declare class Forbidden
```

Added in v0.1.0

## MessageNotModified (class)

Edit was a no-op - the _expected_ error the dialog swallows when re-rendering
an unchanged prompt (design section 5.2, section 13.6).

**Signature**

```ts
export declare class MessageNotModified
```

Added in v0.1.0

## RateLimited (class)

Rate limit hit (HTTP 429). Retry after {@link RateLimited.retryAfter}.

**Signature**

```ts
export declare class RateLimited
```

Added in v0.1.0

## TransportError (class)

A transport- or decode-level failure: the network call itself failed, or the
body could not be parsed. Distinct from a well-formed Bot API error.

**Signature**

```ts
export declare class TransportError
```

Added in v0.1.0

# models

## TelegramError (type alias)

The closed union of every failure a {@link module:TelegramClient.TelegramClient}
method can produce.

**Signature**

```ts
export type TelegramError =
  RateLimited | BotBlocked | MessageNotModified | ChatMigrated | Forbidden | BadRequest | TransportError
```

Added in v0.1.0
