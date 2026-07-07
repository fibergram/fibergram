# @fibergram/menu

Stateful inline menus for [fibergram](https://github.com/fibergram/fibergram) bots: submenu / back / pagination navigation declared as an immutable builder. The analogue of grammY's `@grammyjs/menu`, with one structural difference — the navigation state (stack, current pane, page indices) lives in the `DialogStore`, not in "outdated menu" heuristics guessed from the message.

```bash
pnpm add @fibergram/menu @fibergram/core effect
```

## Usage

### Declare a menu

A menu is a tree of panes. Labels can be `Effect`s, so a button can read a `Session` (or any service) and show fresh text after its handler runs — toggle buttons work out of the box:

```ts
import { Menu } from "@fibergram/menu"
import { Effect, Ref } from "effect"

const program = Effect.gen(function* () {
  const notifications = yield* Ref.make(false)
  const label = Effect.map(Ref.get(notifications), (on) =>
    on ? "Notifications: ON" : "Notifications: OFF")

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

### Send it and mount the route

```ts
import { Menu } from "@fibergram/menu"
import { Router, Command } from "@fibergram/core"
import { Effect } from "effect"

const start = Command.make("/start")

const router = Router.make(
  Router.command(start, () => Effect.asVoid(Menu.reply(main))),
  Menu.route(main)
)
// Router.allowedUpdates(router) includes "callback_query" automatically
```

`Menu.route` matches taps on this menu's buttons (by `CallbackData` prefix), runs the tapped handler, updates the stored state, re-renders the message, and acknowledges the callback query.

### Pagination

A paged button section takes its items from an `Effect` — a static array via `Menu.pages`, or a DB query directly:

```ts
import { Menu } from "@fibergram/menu"
import { Effect } from "effect"

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

Renders the items (one per row by default, tune with `columns`), plus a navigation row: `‹` (when not on the first page), a `· N ·` page indicator, and `›` (while `hasNext`). The callback carries only item ids.

## How state works

- **Intent in the callback, truth in the store.** A button payload says *what was tapped* (`["n","settings"]`, `["p","catalog","goods",2]`); the `DialogStore` holds *where this message actually is* — the back stack, the current pane, and each section's page.
- **Per message.** State is keyed `menu:<rootId>:<messageId>`, so two live menu messages in one chat never share a stack. With `Menu.make(id, { scope: "user" })` the tapper's id joins the key and every user navigates the same message independently.
- **Stale views resync.** A tap arriving from a keyboard that is no longer the current pane (old message, changed state) does **not** run the handler — the message is re-rendered to the real state instead.
- **Missing state degrades gracefully.** A fresh store (or a redeploy that renamed panes) treats the tap as a fresh root — no crash, no stuck menu.
- **Durability is a Layer choice.** `DialogStore.layerMemory` for a single process; `@fibergram/durable`'s `PersistedDialogStore` and the menus survive restarts.

## Tech facts

- **Byte budget.** Payloads are compact JSON tuples under the menu's `CallbackData` prefix (`menu-<id>` by default) — `menu-main:["b","main","notif"]` is ~30 of the 64 allowed bytes. Keep pane/button/item ids short (≤ ~10 chars); oversized payloads spill to a `CallbackStore` when one is provided, exactly like any other `CallbackData` codec.
- **Re-render after every action.** After a `text`/`onSelect` handler the keyboard re-renders (labels may have changed); an unchanged keyboard's `MessageNotModified` response is swallowed.
- **Panes with `text` edit the whole message** (`editMessageText`) on navigation; textless panes edit only the keyboard (`editMessageReplyMarkup`).
- **E/R accumulate in the type.** Handler and label errors/requirements surface in `Menu.route(menu)`'s type exactly like `Router` routes — one edge `Layer` satisfies the finished bot.
- Duplicate pane ids in one tree are a wiring bug and die as a defect; sharing the *same* submenu value from two parents is fine.
- ESM-only; depends only on `effect` and `@fibergram/core`.
