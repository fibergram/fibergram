---
title: Keyboards and formatting
description: Inline and reply keyboards, entity-tree formatting with Fmt, typed emoji, and reactions.
sidebar:
  order: 3
---

Everything on this page lives in `@fibergram/core/ui`.

## Inline keyboards

An immutable builder; buttons append to the current row, `row()` starts a new
one:

```ts
import { Chat } from "@fibergram/core"
import { InlineKeyboard } from "@fibergram/core/ui"
import { Effect } from "effect"

const handler = Effect.gen(function* () {
  const keyboard = InlineKeyboard.empty.text("Yes", "yes").text("No", "no")
  yield* Chat.reply("Confirm?", { replyMarkup: yield* InlineKeyboard.build(keyboard) })
})
```

`build` is an `Effect` because encoding typed payloads can fail — see below.

Button kinds: `text`, `data` (typed payload), `url`, `webApp`, `login`,
`switchInline`, `switchInlineCurrent`, `copyText`, `pay`. Layout: `row()` to
break manually, or `adjust(...sizes)` to reflow everything at once — the last
size repeats, so `.adjust(2)` gives you two columns.

### Typed payloads

Rather than stringly-typed `callback_data`, hand the builder a codec:

```ts
import { CallbackData } from "@fibergram/core"
import { Schema } from "effect"

const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number }))

const keyboard = InlineKeyboard.empty.data("👍", Vote, { id: 1 }).data("👎", Vote, { id: 2 })
```

`InlineKeyboard.build` encodes them and fails with `CallbackDataTooLong` if a
payload exceeds Telegram's 64 bytes and no `CallbackStore` is available to spill
it into. Details: [Callback data](/guides/callback-data/).

## Reply keyboards

```ts
import { Keyboard } from "@fibergram/core/ui"

const keyboard = Keyboard.empty
  .text("Yes")
  .text("No")
  .row()
  .requestContact("Share my number")
  .resized()
  .oneTime()

yield * Chat.reply("Pick one", { replyMarkup: yield* Keyboard.build(keyboard) })
```

Also available: `requestLocation`, `requestPoll`, `requestUsers`, `requestChat`,
`webApp`. Flags: `resized()`, `oneTime()`, `adjust(...)`. To take a keyboard
away, send `Keyboard.remove()`.

:::note[Reply keyboards and wizards]
A tapped reply-keyboard button arrives as an ordinary text message. That is what
makes them compose with [coroutines](/guides/conversations/): `d.prompt` decodes
the label like any other answer, so a keyboard-driven wizard step needs no
special support.
:::

## Formatting without `parse_mode`

`parse_mode` is a footgun — every user-supplied string has to be escaped, and
forgetting once turns a name into markup. `Fmt` builds the message as an
**entity tree** instead, computing offsets as it goes. Nothing is parsed, so
nothing needs escaping:

```ts
import { Fmt } from "@fibergram/core/ui"

const message = Fmt.fmt`Welcome, ${Fmt.bold("Ada")}! Read the ${Fmt.link("docs", "https://effect.website")}.`
message.text // "Welcome, Ada! Read the docs." — plus typed entities
```

```ts
yield * Chat.reply(message)
```

Available marks: `bold`, `italic`, `underline`, `strikethrough`, `spoiler`,
`code`, `pre`, `link`, `mention`, `customEmoji`, `blockquote`,
`expandableBlockquote`. Compose with `Fmt.concat` and `Fmt.join`.

Nesting works as you would expect, and user input interpolated into an `fmt`
template is *text*, never markup:

```ts
Fmt.fmt`Hello ${Fmt.bold(userSuppliedName)}` // safe for any value of userSuppliedName
```

## Typed emoji

```ts
import { Emoji } from "@fibergram/core/ui"

Emoji.emoji`Congrats ${"tada"} you did it ${"fire"}`
// "Congrats 🎉 you did it 🔥"
```

The names are checked at compile time — a typo is a type error, not a literal
`:tada:` shipped to a user. `Emoji.get(name)` is the function form.

## Reactions

```ts
import { Reaction } from "@fibergram/core/ui"

yield * Chat.react(Reaction.thumbsUp)
```

Named constants exist for the common ones (`thumbsUp`, `thumbsDown`, `heart`,
`fire`, `clap`, …); `Reaction.of(emoji)` covers the rest, and
`Reaction.isReactionEmoji` narrows an arbitrary string.

To *handle* an incoming reaction, route it:

```ts
Router.reaction("👍", (reaction) => Effect.log(`liked by ${reaction.user?.firstName ?? "someone"}`))
```

The handler receives a hydrated reaction with the added/removed diff already
computed — Telegram sends you the whole list before and after, which is rarely
what you want to work with.

## Sending other media

`Chat` has a reply variant per media type — `replyPhoto`, `replyDocument`,
`replyVideo`, `replyAudio`, `replyVoice`, `replyAnimation`, `replySticker`,
`replyLocation`, `replyContact`, `replyPoll`, `replyDice`, `replyMediaGroup` —
each taking the same `InputFile` shapes:

```ts
import { InputFile } from "@fibergram/core/client"

yield * Chat.replyPhoto(InputFile.fromPath("./chart.png"), { caption: "Last week" })
```

`InputFile` accepts a path, bytes, a stream, or a URL, and switches the request
to multipart automatically. A `file_id` string Telegram already knows is passed
straight through.
