---

title: DialogAddress.ts
nav_order: 8
parent: Modules
---

## DialogAddress overview

Dialog addressing - a dialog is a virtual actor with a stable address
(design section 4.2). The address is the mailbox key: ordering is guaranteed _within_
an address, concurrency is allowed _between_ addresses (section 8).

The `KeyExtractor` is pluggable because different bots want different address
shapes (per-chat, per-user, per-thread).

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [messageOf](#messageof)
  - [senderOf](#senderof)
  - [toKey](#tokey)
- [constructors](#constructors)
  - [byChat](#bychat)
  - [byUser](#byuser)
- [models](#models)
  - [DialogAddress (interface)](#dialogaddress-interface)
  - [KeyExtractor (type alias)](#keyextractor-type-alias)

---

# combinators

## messageOf

The message an update carries, if any (`message`, `editedMessage`, or the
message a `callbackQuery` was attached to).

**Signature**

```ts
export declare const messageOf: (update: BotApi.Update) => Option.Option<BotApi.Message>
```

Added in v0.1.0

## senderOf

The sender of an update, if any - from a message, an edited message, or a
callback query (whose `from` is always present).

**Signature**

```ts
export declare const senderOf: (update: BotApi.Update) => Option.Option<BotApi.User>
```

Added in v0.1.0

## toKey

A stable, collision-free string key for a {@link DialogAddress} - the mailbox
identity used by the {@link module:EntityManager.EntityManager}.

**Signature**

```ts
export declare const toKey: (address: DialogAddress) => string
```

**Example**

```ts
import { DialogAddress } from "@fibergram/core"

DialogAddress.toKey({ chatId: 1, kind: "default" }) // "default:1::"
```

Added in v0.1.0

# constructors

## byChat

The default per-chat extractor. Addresses by `chatId` (plus Forum Topic
`threadId` when present); drops updates that carry no message. Pass a `kind`
to namespace the dialog type.

**Signature**

```ts
export declare const byChat: (kind?: string) => KeyExtractor
```

**Example**

```ts
import { DialogAddress } from "@fibergram/core"

const extract = DialogAddress.byChat("registration")
```

Added in v0.1.0

## byUser

A per-user extractor: addresses by `(chatId, fromId)`, so each user in a group
gets an independent dialog. Drops updates with no sender.

**Signature**

```ts
export declare const byUser: (kind?: string) => KeyExtractor
```

**Example**

```ts
import { DialogAddress } from "@fibergram/core"

const extract = DialogAddress.byUser("survey")
```

Added in v0.1.0

# models

## DialogAddress (interface)

The stable identity of a dialog. `kind` distinguishes co-located dialog types
(e.g. `"registration"` vs `"combat"`) in the same chat; `threadId` shards by
Forum Topic; `fromId` opts into per-user (rather than per-chat) dialogs.

**Signature**

```ts
export interface DialogAddress {
  readonly chatId: number
  readonly threadId?: number
  readonly fromId?: number
  readonly kind: string
}
```

Added in v0.1.0

## KeyExtractor (type alias)

Extracts the {@link DialogAddress} an update belongs to, or `None` to drop the
update. Pluggable per bot (design section 4.2).

**Signature**

```ts
export type KeyExtractor = (update: BotApi.Update) => Option.Option<DialogAddress>
```

Added in v0.1.0
