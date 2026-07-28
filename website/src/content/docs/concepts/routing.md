---
title: Routing
description: Route constructors, filters, and how E and R accumulate across a router at the type level.
sidebar:
  order: 5
---

A `Router` is a list of `Route`s tried in order. A `Route<E, R>` is a matcher
that either produces the effect to run or declines:

```ts
interface Route<out E, out R> {
  readonly match: (update: Update) => Option<Effect<void, E, R>>
}
```

Everything else — commands, callbacks, `hears` — is sugar over that.

## Route constructors

### By update kind

`Router.on(kind, handler)` narrows the payload type from the kind, so there is no
`Update` digging and no casting:

```ts
Router.on("editedMessage", (message) => Chat.reply(`edited: ${message.text ?? ""}`))
Router.on("inlineQuery", (query) => query.answer(results))
```

### Commands

```ts
const setAge = Command.make("/setage", Schema.Struct({ age: Schema.NumberFromString }), {
  description: "Set your age"
})

Router.command(setAge, ({ age }) => Chat.reply(`age ${age}`))
```

Tokens map positionally onto the schema's fields, `/cmd@yourbot` is handled, and
the handler only runs on a successful decode. See [Commands](/guides/commands/).

### Callback buttons

```ts
const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number }))

Router.callback(Vote, ({ id }) => Chat.answerCallback({ text: `voted ${id}` }))
```

Matching is a cheap prefix check before any decode. See
[Callback data](/guides/callback-data/).

### Text

```ts
Router.hears("Menu", () => showMenu) // exact string
Router.hears(/^search (.+)$/, (m) => search(m[1])) // RegExp → RegExpMatchArray
Router.hears(Schema.NumberFromString, (n) => Chat.reply(`${n * 2}`)) // typed refinement
```

The `Schema` overload is the interesting one: the route matches **only when the
text decodes**, and the handler receives the decoded value. No decode error leaks
into `E`.

### Everything else

| Constructor | Matches |
|---|---|
| `Router.entity(kind, handler)` | messages carrying a `url` / `email` / `hashtag` / `mention` entity, with the substrings extracted |
| `Router.reaction(emoji?, handler)` | `message_reaction`, with a computed added/removed diff |
| `Router.chatMember(handler)` / `Router.myChatMember` | membership transitions |
| `Router.chatJoinRequest(handler)` | join requests |
| `Router.inlineQuery(pattern?, handler)` | inline queries, hydrated with `.answer(results)` |
| `Router.preCheckout` / `Router.shippingQuery` | the payment flow, hydrated with `.answer(…)` |
| `Router.start(handler)` | `/start` with a [deep-link payload](/guides/deep-linking/) |
| `Router.commandNotFound(options)` | an unrecognised command, with a fuzzy "did you mean" suggestion |
| `Router.when(predicate, handler)` | an arbitrary predicate over the update |
| `Router.route(match)` | the raw matcher, for anything the sugar does not cover |

## Filters

`Filter` is a library of update predicates, with `and` / `or` / `not` to combine
them. The commonly-used ones are re-exported from `Router`, so a filtered route
reads in one import:

```ts
import { Filter, Router } from "@fibergram/core"

Router.when(Router.and(Router.chatType("group"), Router.not(Filter.isCommand)), handler)
```

Ready-made filters: `chatType`, `isPrivate`, `isGroup`, `isText`, `isCommand`,
`textEquals`, `textStartsWith`, `hasEntity`, `fromUser`, `fromUsers`, `inChat`.

## Composition, and why the types matter

```ts
const router = Router.make(routeA, routeB).add(routeC).concat(otherRouter)
```

`Route<out E, out R>` is **covariant** in both parameters, so `make`, `add`, and
`concat` accumulate them as unions:

```ts
Router.Router<UserNotFound | TelegramError, UserRepo | TelegramClient>
```

This is the payoff of not having middleware: the router's type is a complete,
compiler-checked inventory of everything the bot can fail with and everything it
needs. Miss a layer and it does not compile.

## Running a router

```ts
Dispatcher.run({ updates, dialog: Router.toDialog(router) })
```

`toDialog` options:

| Option | What it does |
|---|---|
| `kind` | Address namespace for the resulting dialog (default `"router"`). |
| `fallback` | Handler for updates no route matched (default: do nothing). |
| `rateLimit` | Inbound rate limiting — see below. |

### Inbound rate limiting

```ts
Router.toDialog(router, {
  rateLimit: {
    limit: 5,
    window: Duration.seconds(10),
    onLimit: () => Chat.reply("Slow down!")
  }
})
```

Fixed windows, keyed by the sender's id by default. `key` returning `undefined`
exempts an update (admins, say). Applied **before** route matching, so every
dispatched update counts. Omit `onLimit` to drop over-limit updates silently.

This is the inbound counterpart of [`Transform.throttle()`](/guides/transforms/),
which paces your bot's *outbound* calls.

## Derived from the routes you mounted

Two lists you would otherwise maintain by hand are computed instead:

```ts
Router.allowedUpdates(router) // → ["message", "callback_query", "chat_member", …]
Router.setMyCommands(router) // syncs Telegram's command menu from your descriptions
```

`allowedUpdates` matters more than it looks: `chat_member` is **not** in
Telegram's default set, so a bot that forgets to request it silently receives no
membership updates. Mounting `ChatMembers.route` puts it in the derived list
automatically.

```ts
const updates = yield * Polling.make({ allowedUpdates: Router.allowedUpdates(router) })
```

`Router.commands` and `Router.commandGroups` expose the same metadata if you want
to render your own help text.
