---
title: Deep linking
description: Typed t.me/<bot>?start=<payload> links — referral codes, invites, and "open this item".
sidebar:
  order: 2
---

Telegram lets a `/start` link carry up to 64 characters of `A-Za-z0-9_-`.
`StartLink` treats that budget the way [`CallbackData`](/guides/callback-data/)
treats its 64 bytes: as an encode/decode pair over a `Schema`, not an opaque
string you parse by hand.

## Build a codec

```ts
import { StartLink } from "@fibergram/core"
import { Schema } from "effect"

const Invite = StartLink.make("mybot", Schema.Struct({ ref: Schema.String }))
```

The value is JSON-encoded and then `base64url`-encoded — which happens to use
exactly the character set Telegram allows.

## Produce a link

```ts
const link = yield * Invite.encode({ ref: "ada" })
// → "https://t.me/mybot?start=eyJyZWYiOiJhZGEifQ"
```

`encode` fails with `StartLinkTooLong` if the payload does not fit. That is a
typed error, so an over-long referral code is caught at the call site rather than
producing a link that silently truncates.

## Handle the arrival

```ts
import { Chat, Router } from "@fibergram/core"

const router = Router.make(
  Router.start(Invite, ({ ref }) => Chat.reply(`Invited by ${ref}`)),
  Router.command(start, () => Chat.reply("Welcome!"))
)
```

`Router.start` decodes for you, so `ref` is a `string` in the handler and
`StartLinkMalformed` shows up in the route's `E` — someone hand-editing the URL
is a case you can see in the type.

A **plain `/start` with no payload does not match** `Router.start`. That is why
the example mounts an ordinary `command` route after it: first-time users who
tapped the bot normally still get a greeting.

## Typical shapes

```ts
// referral attribution
StartLink.make("mybot", Schema.Struct({ ref: Schema.String }))

// deep link into an item
StartLink.make("mybot", Schema.Struct({ item: Schema.Number }))

// a tagged union of link kinds, in one route
StartLink.make(
  "mybot",
  Schema.Union([
    Schema.Struct({ _tag: Schema.Literal("invite"), by: Schema.Number }),
    Schema.Struct({ _tag: Schema.Literal("item"), id: Schema.Number })
  ])
)
```

Keep payloads small: 64 characters of base64url is roughly 48 bytes of JSON, so
short field names matter. `{"r":"ada"}` costs a third of what
`{"referrer":"ada"}` does.

:::caution[A deep link is public]
Anyone can share the URL, and anyone can construct one. Treat the decoded payload
as untrusted input — it says *what the link claims*, not who followed it. Use
`Chat.from` for identity, and never encode an authorisation grant into a
`?start=` payload.
:::
