# @fibergram/i18n

[Fluent](https://projectfluent.org) (`.ftl`) localization for [fibergram](https://github.com/fibergram/fibergram) bots — the Effect-native analogue of grammY's `@grammyjs/i18n` and aiogram's `I18n` middleware. Translate with `t(key, vars)` through an **ambient locale**: no `ctx` object, nothing threaded through handlers.

```bash
pnpm add @fibergram/i18n @fibergram/core effect
```

## Usage

### Build a translator

`I18n.make` is synchronous (Fluent parsing is pure) — the value can build routes before any Layer exists:

```ts
import { I18n } from "@fibergram/i18n"

const i18n = I18n.make({
  defaultLocale: "en",
  locales: {
    en: `
hello = Hello, { $name }!
menu-button = Menu
`,
    ru: `
hello = Привет, { $name }!
menu-button = Меню
`
  }
})
```

### Translate inside a handler

`t` resolves the locale itself and adds nothing to `R`:

```ts
import { Chat } from "@fibergram/core"
import { Effect } from "effect"

const greet = Effect.gen(function* () {
  const text = yield* i18n.t("hello", { name: "Ada" })
  yield* Chat.reply(text)
})
```

Or reach the translator through `R` with the free accessors — provide `I18n.layer(i18n)` at the edge:

```ts
import { I18n } from "@fibergram/i18n"
import { Effect } from "effect"

const greet = Effect.gen(function* () {
  const text = yield* I18n.t("hello", { name: "Ada" })
  return text
})
```

### How the locale is picked

First hit wins:

1. an explicit `I18n.withLocale("ru")` override (a `Context.Reference`, like `UpdateContext`),
2. the preference persisted by `setLocale` through the `DialogStore` port (skipped when no store is in context),
3. the sender's `languageCode` on the update being handled,
4. `defaultLocale`.

Tags are negotiated against the loaded locales: exact → case-insensitive → primary subtag (`"pt-BR"` finds a `"pt"` bundle) → default.

```ts
// inside any handler: persist the sender's choice
const toRussian = i18n.setLocale("ru")
```

### Localized `hears`

Reply-keyboard presses come back as plain localized text. `i18n.hears` matches a message against the key's translation in **any** loaded locale and tells the handler which one matched:

```ts
import { Router } from "@fibergram/core"
import { Effect } from "effect"

const router = Router.make(
  i18n.hears("menu-button", (locale) => Effect.log(`menu opened in ${locale}`))
)
```

## API

| Export | What it is |
|---|---|
| `I18n.make(options)` | Synchronous constructor over `.ftl` sources per locale tag |
| `I18n.I18n` | `Context.Service` tag for the translator |
| `I18n.layer(service)` | `Layer<I18n>` wiring a `make` value into `R` |
| `I18n.t(key, vars?)` | Free accessor: format in the current locale (falls back to default) |
| `I18n.locale` | Free accessor: the negotiated current locale |
| `I18n.setLocale(tag)` | Free accessor: persist the preference (`DialogStore` in `R`) |
| `I18n.withLocale(tag)` | Scope an explicit locale override around an effect |
| `I18n.currentLocale` | The ambient override `Context.Reference` itself |

Service methods (on the `make` value): `t`, `locale`, `setLocale`, `translate(locale, key, vars?)` (pure per-locale lookup, `Option<string>`), `hears(key, handler)`, plus `locales` / `defaultLocale`.

## Tech facts

- **Formatting** is `@fluent/bundle`, the reference Fluent implementation — plurals, selectors, and `key.attribute` message attributes work as in the spec. `useIsolating` defaults to `false` so formatted text round-trips through Telegram and `hears` can exact-match.
- **Missing keys.** A key absent from the resolved locale falls back to the default bundle; absent from both is a programming error and dies (defect). A missing *variable* is not fatal — Fluent renders its `{$name}` placeholder.
- **Persistence** goes through core's `DialogStore` port under a `i18n:locale` kind (keys shaped like `Session`'s, scope `"user"` by default or `"chat"`), so a durable store backend makes locale preferences durable for free. Reads are opportunistic (`Effect.serviceOption`) — `t` works with no store in context.
- **`hears` carries `kinds: ["message"]`**, so `Router.allowedUpdates` derives the subscription as usual.
- ESM-only; depends on `effect`, `@fibergram/core`, and `@fluent/bundle`.
