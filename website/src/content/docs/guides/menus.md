---
title: Menus
description: Stateful inline menus — submenus, back navigation, and pagination with state that lives in the store, not in the message.
sidebar:
  order: 7
---

```bash
pnpm add @fibergram/menu
```

`@fibergram/menu` is the analogue of grammY's `@grammyjs/menu`, with one
structural difference: the navigation state — the back stack, the current pane,
each section's page — lives in the `DialogStore`, not in heuristics guessed from
the message. "Outdated menu" is a state the framework knows about rather than
something it detects.

## Declare a menu

A menu is a tree of panes:

```ts
import { Menu } from "@fibergram/menu"
import { Effect, Ref } from "effect"

const program = Effect.gen(function* () {
  const notifications = yield* Ref.make(false)
  const label = Effect.map(Ref.get(notifications), (on) =>
    on ? "Notifications: ON" : "Notifications: OFF"
  )

  const settings = Menu.make("settings", { text: "Settings" })
    .text("notif", label, Ref.update(notifications, (v) => !v))
    .row()
    .back("‹ Back")

  const main = Menu.make("main", { text: "Main menu" })
    .submenu("Settings", settings)
    .url("Docs", "https://effect.website")

  return main
})
```

Labels can be `Effect`s. That is what makes toggle buttons work without special
support: after a handler runs, the keyboard re-renders and the label reads the
new value.

## Send it and mount the route

```ts
import { Command, Router } from "@fibergram/core"
import { Menu } from "@fibergram/menu"
import { Effect } from "effect"

const start = Command.make("/start")

const router = Router.make(
  Router.command(start, () => Effect.asVoid(Menu.reply(main))),
  Menu.route(main)
)
```

`Menu.route` matches taps on this menu's buttons by `CallbackData` prefix, runs
the tapped handler, updates the stored state, re-renders the message, and
acknowledges the callback query. `Router.allowedUpdates(router)` picks up
`callback_query` automatically.

## Pagination

A paged section takes its items from an `Effect` — a static array via
`Menu.pages`, or a database query directly:

```ts
const catalog = Menu.make("catalog", { text: "Catalog" })
  .paginated("goods", {
    source: Menu.pages(
      [
        { id: "apl", label: "Apples" },
        { id: "bnn", label: "Bananas" },
        { id: "chr", label: "Cherries" }
      ],
      2
    ),
    onSelect: (id) => Effect.log(`picked ${id}`)
  })
  .row()
  .back("‹ Back")
```

Renders one item per row (tune with `columns`) plus a navigation row: `‹` when
not on the first page, a `· N ·` indicator, and `›` while there is a next page.
The callback carries only item ids.

## How the state works

- **Intent in the callback, truth in the store.** A payload says *what was
  tapped* (`["n","settings"]`, `["p","catalog","goods",2]`); the store holds
  *where this message actually is*.
- **Per message.** State is keyed `menu:<rootId>:<messageId>`, so two live menu
  messages in one chat never share a stack. With `Menu.make(id, { scope: "user" })`
  the tapper's id joins the key and every user navigates the same message
  independently — the shape you want for a menu posted in a group.
- **Stale views resync.** A tap from a keyboard that is no longer the current
  pane does **not** run the handler. The message is re-rendered to the real state
  instead.
- **Missing state degrades gracefully.** A fresh store, or a redeploy that
  renamed panes, treats the tap as a fresh root. No crash, no stuck menu.

## Rendering rules

- Panes with `text` edit the whole message (`editMessageText`) on navigation;
  textless panes edit only the keyboard (`editMessageReplyMarkup`).
- The keyboard re-renders after every `text` / `onSelect` handler, because labels
  may have changed. An unchanged keyboard's `MessageNotModified` is swallowed.

## The byte budget

Payloads are compact JSON tuples under the menu's `CallbackData` prefix
(`menu-<id>` by default). `menu-main:["b","main","notif"]` is about 30 of the 64
available bytes, so keep pane, button, and item ids short — roughly ten
characters. Oversized payloads spill to a `CallbackStore` when one is provided,
exactly like any other codec. See [Callback data](/guides/callback-data/).

## Durability

`DialogStore.layerMemory` keeps menus working for a single process;
`PersistedDialogStore` from [`@fibergram/durable`](/guides/durable/) makes open
menus survive restarts. Same handler code either way.

## Notes

- Errors and requirements from handlers and labels accumulate in `Menu.route`'s
  type exactly as they do for router routes — one edge `Layer` satisfies the
  finished bot.
- Duplicate pane ids in one tree are a wiring bug and die as a defect. Sharing
  the *same* submenu value from two parents is fine.
