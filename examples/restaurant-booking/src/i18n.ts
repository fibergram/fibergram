/**
 * Localization with `@fibergram/i18n` (Fluent / `.ftl`).
 *
 * Catalogs live as real `.ftl` files under `locales/` (one per locale, named by
 * its tag, e.g. `en.ftl`, `ru.ftl`) and are loaded from disk at startup — add a
 * language by dropping in another file, no code change. `@fibergram/i18n` takes
 * source strings rather than reading files itself, so this module is the thin
 * loader in between.
 *
 * The active locale is resolved per update through the ambient chain the package
 * installs: an explicit override → the user's persisted `/language` choice (in
 * the shared `DialogStore`) → their Telegram `language_code` → the default
 * (`en`). Handlers translate with the ambient accessor `i18n.t(key, vars)`; the
 * wizards resolve the locale once (a durable `d.run`) and then translate purely
 * with {@link translate} so every replay renders identically.
 */
import { Option } from "effect"
import * as NodeFs from "node:fs"
import NodePath from "node:path"
import { fileURLToPath } from "node:url"

import { I18n } from "@fibergram/i18n"

/** The default locale, used when nothing better can be negotiated. */
export const defaultLocale = "en"

// `locales/` sits next to `src/` and `dist/`, so `../locales` resolves from both
// the TypeScript sources and the compiled output.
const localesDir = fileURLToPath(new URL("../locales", import.meta.url))

const loadCatalogs = (): Record<string, string> => {
  const catalogs: Record<string, string> = {}
  for (const file of NodeFs.readdirSync(localesDir)) {
    if (!file.endsWith(".ftl")) continue
    const tag = NodePath.basename(file, ".ftl")
    catalogs[tag] = NodeFs.readFileSync(NodePath.join(localesDir, file), "utf8")
  }
  return catalogs
}

const catalogs = loadCatalogs()

/** Display names for the /language keyboard, each in its own language. */
const displayNames: Record<string, string> = {
  en: "🇬🇧 English",
  ru: "🇷🇺 Русский"
}

/** The locales this bot ships (default first, then the rest alphabetically). */
export const supportedLocales: ReadonlyArray<string> = Object.keys(catalogs).sort((a, b) =>
  a === defaultLocale ? -1 : (b === defaultLocale ? 1 : a.localeCompare(b))
)

/** A locale tag known to be loaded. */
export type Locale = string

/** Human-readable name of a locale, falling back to the tag. */
export const localeName = (locale: string): string => displayNames[locale] ?? locale

/**
 * The translator. Built eagerly (Fluent parsing is synchronous) so it can be
 * shared by the router routes and the wizards before any `Layer` exists.
 */
export const i18n = I18n.make({
  defaultLocale,
  scope: "user",
  locales: catalogs
})

/** Provide {@link I18n} for the ambient `i18n.t` accessor used in handlers. */
export const layer = I18n.layer(i18n)

/** Pure lookup for a resolved locale, falling back to the key on a miss. */
export const translate = (
  locale: string,
  key: string,
  vars?: Record<string, string | number>
): string => Option.getOrElse(i18n.translate(locale, key, vars), () => key)
