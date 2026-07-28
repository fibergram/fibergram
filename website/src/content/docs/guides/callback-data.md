---
title: Callback data
description: Typed inline-button payloads inside Telegram's 64-byte budget, and what to do when you exceed it.
sidebar:
  order: 4
---

Telegram gives every inline button 64 bytes of `callback_data` and no structure.
The usual result is `"vote:42:yes"` split with `.split(":")` on the way back in,
with the parsing rules living in two places that drift apart.

`CallbackData.make(prefix, schema)` makes it a codec instead:

```ts
import { CallbackData } from "@fibergram/core"
import { Schema } from "effect"

const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number }))
```

The `prefix` is the routing discriminator. It may not contain `":"` or `"#"` —
those are the codec's own separators.

## Encode, route, decode

```ts
import { Chat, Router } from "@fibergram/core"
import { InlineKeyboard } from "@fibergram/core/ui"

// build a keyboard from the codec
const keyboard = InlineKeyboard.empty.data("👍", Vote, { id: 1 }).data("👎", Vote, { id: 2 })

// route by the same codec — the payload arrives decoded
const route = Router.callback(Vote, ({ id }) => Chat.answerCallback({ text: `Voted ${id}` }))
```

Matching is a cheap prefix check (`matches`) before any decoding happens, so a
router with twenty callback routes does not attempt twenty decodes per tap.

The codec's full surface:

| Member | What it does |
|---|---|
| `encode(value)` | → the `callback_data` string; fails with `CallbackDataTooLong` |
| `decode(data)` | → the value; fails with `CallbackDataMalformed` |
| `matches(data)` | cheap prefix check, no decode |
| `parse(data)` | `decode` guarded by `matches` — `None` when the data is not ours |
| `button(text, value)` | an `InlineKeyboardButton` carrying the encoded payload |

## Always answer the callback

Telegram shows a spinner on the tapped button until the query is answered:

```ts
Router.callback(Vote, ({ id }) =>
  Effect.gen(function* () {
    yield* recordVote(id)
    yield* Chat.answerCallback({ text: "Thanks!" })
  })
)
```

`Chat.answerCallback()` with no options is the silent acknowledgement.

## When 64 bytes is not enough

`encode` fails with `CallbackDataTooLong` rather than truncating. Three ways out,
in order of preference:

**1. Shrink the payload.** Field names are part of the JSON. `{"i":42}` fits
where `{"itemId":42}` may not. A tuple schema is smaller still — this is what
[`@fibergram/menu`](/guides/menus/) uses internally.

**2. Store an id, not the data.** A button should usually carry a key into your
own state, not the state itself.

**3. Spill to a `CallbackStore`.** Provide the optional port and oversized
payloads transparently stash themselves, with the button carrying a short key:

```ts
import { CallbackData } from "@fibergram/core"

Effect.provide(CallbackData.layerMemory)
```

`layerMemory` uses monotonic integer keys and **never evicts**, which is fine for
tests and a single-process bot but is an unbounded map in production. Back it
with Redis or a KV store — the port is two methods, `put` and `get`.

:::caution[The spill store must outlive the message]
A button lives as long as its message. If the store is in-process memory and the
process restarts, taps on old messages decode to nothing. Either use a durable
store, or accept the failure and handle `CallbackDataMalformed` by re-rendering.
:::

## Callback data is untrusted

Anyone who can see a button can craft its `callback_data`. The schema guarantees
the *shape*, never the *authorisation*: check permissions in the handler against
`Chat.from`, exactly as you would for a command.

The same applies to identity — a `callback_query` in a group arrives from
whoever tapped, which is not necessarily who the keyboard was sent for. If that
distinction matters, put the intended user's id in the payload and compare.

## Related

- [Deep linking](/guides/deep-linking/) — the same discipline for `?start=`
  payloads, with a 64-*character* budget.
- [Menus](/guides/menus/) — a whole navigation layer built on this codec, where
  the payload says *what was tapped* and the store holds *where the message is*.
