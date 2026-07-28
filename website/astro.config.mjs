// @ts-check
import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"

const REPO = "https://github.com/fibergram/fibergram"

/**
 * The deployment target is configurable so the same build works from a custom
 * domain, a preview deploy, or a GitHub Pages project site (`SITE_BASE=/fibergram`).
 */
const site = process.env.SITE_URL ?? "https://fibergram.dev"
const base = process.env.SITE_BASE ?? undefined

/** Sidebar labels: `label` is the default (English) locale, `translations` keyed by BCP-47 tag. */
const sidebar = [
  {
    label: "Start here",
    translations: { ru: "Начало" },
    items: [
      "getting-started/introduction",
      "getting-started/installation",
      "getting-started/your-first-bot",
      "getting-started/project-structure"
    ]
  },
  {
    label: "Concepts",
    translations: { ru: "Концепции" },
    items: [
      "concepts/architecture",
      "concepts/dialogs",
      "concepts/no-ctx",
      "concepts/errors",
      "concepts/routing",
      "concepts/ingestion",
      "concepts/persistence"
    ]
  },
  {
    label: "Guides",
    translations: { ru: "Руководства" },
    items: [
      "guides/commands",
      "guides/deep-linking",
      "guides/keyboards-and-formatting",
      "guides/callback-data",
      "guides/conversations",
      "guides/sessions",
      "guides/menus",
      "guides/i18n",
      "guides/testing",
      "guides/webhooks",
      "guides/durable",
      "guides/chat-members",
      "guides/transforms",
      "guides/observability"
    ]
  },
  {
    label: "API reference",
    translations: { ru: "Справочник API" },
    // Generated from `@effect/docgen` output by `scripts/sync-api-reference.mjs`.
    items: [{ autogenerate: { directory: "reference", collapsed: true } }]
  },
  {
    label: "Contributing",
    translations: { ru: "Контрибьютинг" },
    items: ["contributing/documentation"]
  }
]

export default defineConfig({
  site,
  ...(base === undefined ? {} : { base }),
  integrations: [
    starlight({
      title: "fibergram",
      description:
        "Effect-native framework for Telegram bots: a handler is an Effect<A, E, R>, a dialog is an addressable entity.",
      favicon: "/favicon.svg",
      social: [{ icon: "github", label: "GitHub", href: REPO }],
      editLink: { baseUrl: `${REPO}/edit/main/website/` },
      lastUpdated: true,
      defaultLocale: "root",
      locales: {
        root: { label: "English", lang: "en" },
        ru: { label: "Русский", lang: "ru" }
      },
      sidebar,
      customCss: ["./src/styles/custom.css"],
      expressiveCode: {
        themes: ["catppuccin-macchiato", "catppuccin-latte"]
      }
    })
  ]
})
