# Restaurant Booking Bot

A complete [fibergram](../../README.md) bot — the idiomatic-Effect counterpart of
[telega-gleam's `06-restaurant-booking`](https://github.com/bondiano/telega-gleam/tree/master/examples/06-restaurant-booking).
It manages restaurant table reservations end to end and exercises most of the
framework:

- 🧾 **Multi-step wizards** — `/start` registration and `/book` booking as
  [`Coroutine`](../../packages/core/src/Coroutine.ts) generators (one `prompt`
  per step, replay-based, durable).
- 🍽️ **Inline menu with pagination** — `/menu` built with
  [`@fibergram/menu`](../../packages/menu): categories → paginated dishes, with
  dynamic (per-locale) button labels.
- 🌍 **Internationalization** — English + Russian via
  [`@fibergram/i18n`](../../packages/i18n) (Fluent `.ftl` files under
  [`locales/`](./locales)); locale auto-detected and switchable with `/language`.
- 💾 **Durable persistence** — a single filesystem `KeyValueStore` backs
  *everything* through [`@fibergram/durable`](../../packages/durable): in-progress
  wizard state, the persisted language choice, open menu navigation, and the
  domain data. A half-finished booking survives a restart.
- 🧱 **Typed domain layer** — `User` / `Table` / `Booking` repositories as Effect
  services (stable ports) over the swappable storage backend.
- ✅ **Input validation** — via prompt `Schema`s, re-asking with a localized
  message on bad input.

## Commands

| Command | What it does |
|---|---|
| `/start` | Register (name → phone → optional email), or greet an existing guest |
| `/book` | Book a table (date → time → guests → seating → extras → optional address → confirm) |
| `/menu` | Browse the food menu by category, paginated |
| `/my_bookings` | List your reservations |
| `/language` | Switch between 🇬🇧 English and 🇷🇺 Русский |
| `/cancel` | Abort the wizard in progress |
| `/help` | Show the command list |

## Running it

```bash
export BOT_TOKEN="<token from @BotFather>"   # required
export RESTAURANT_NAME="Bella Vista"          # optional
export DATA_DIR="./.data"                     # optional (durable store location)

pnpm --filter @fibergram/example-restaurant-booking build
pnpm --filter @fibergram/example-restaurant-booking start
```

The `locales/`, tables, and storage directory are all created/seeded on first
run — no database server required.

```bash
pnpm --filter @fibergram/example-restaurant-booking test   # end-to-end tests, no network
```

## How it's put together

```
src/
  config.ts        RESTAURANT_NAME / DATA_DIR as an AppConfig service
  storage.ts       filesystem KeyValueStore (node:fs) — the durable backend
  domain.ts        User/Table/Booking models + repositories (ports over the store)
  i18n.ts          loads locales/*.ftl and builds the translator
  wizard.ts        shared coroutine helpers (locale capture, reply-keyboard choices)
  registration.ts  /start wizard
  booking.ts       /book wizard
  menu.ts          /menu inline menu (@fibergram/menu)
  commands.ts      /help, /my_bookings, /language (+ the language callback)
  app.ts           the root dialog: composes the Router with the two wizards
  main.ts          layer wiring + long polling
locales/
  en.ftl, ru.ftl   Fluent catalogs
```

### Composing a Router with stateful wizards

fibergram runs **one dialog per chat**, and a `Coroutine` is a *text-only*
wizard, so this example owns the "which conversation is active" state itself.
[`app.ts`](./src/app.ts) is a single [`Dialog`](../../packages/core/src/Dialog.ts)
over a small tagged union (`Idle | Registration | Booking`) whose `decide`:

1. lets `/cancel` abort an active wizard,
2. delegates every other update to the active wizard (`wizard.decide(sub, update)`
   runs its sends and returns the next snapshot; a `done` snapshot returns to
   `Idle`),
3. from `Idle`, enters a wizard on `/start` / `/book` (behind a registration
   check) and otherwise hands off to the stateless
   [`Router`](../../packages/core/src/Router.ts) (`/help`, `/menu`,
   `/my_bookings`, `/language`, and all the callback taps).

### Differences from the telega-gleam reference

The reference models booking as a declarative *dialog* of inline-keyboard
**windows** with managed **widgets** (`paged_select`, `radio`, `multiselect`) and
a **sub-dialog**. fibergram has no widget engine — its higher-level primitive is
the coroutine — so the same journey is re-expressed idiomatically:

| telega-gleam | here |
|---|---|
| hand-written `flow` (registration) | `Coroutine` wizard ([`registration.ts`](./src/registration.ts)) |
| declarative `dialog` + widgets (booking) | `Coroutine` wizard with reply-keyboard choice steps ([`booking.ts`](./src/booking.ts)) |
| `subdialog` for the address | two ordinary `d.prompt` steps |
| `menu_builder` | `@fibergram/menu` ([`menu.ts`](./src/menu.ts)) |
| SQLite (`telega_storage_sqlite`) | filesystem `KeyValueStore` ([`storage.ts`](./src/storage.ts)) |
| `telega_i18n` (TOML) | `@fibergram/i18n` (Fluent `.ftl`) |

A tapped **reply-keyboard** button sends its label as ordinary text, which the
coroutine's `d.prompt` decodes — that's how the keyboard-driven booking steps fit
the text-only wizard model.

### Swapping the storage backend

Everything durable rides one `KeyValueStore`. [`main.ts`](./src/main.ts) provides
the filesystem one; the tests provide `KeyValueStore.layerMemory`. Point it at a
SQL or Redis layer instead and dialogs, sessions, i18n preferences, and the
repositories all follow — no handler changes.
