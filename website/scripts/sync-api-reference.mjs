#!/usr/bin/env node
/**
 * docgen → Starlight.
 *
 * `@effect/docgen` emits one Jekyll-flavoured markdown page per module under
 * `packages/<pkg>/docs/modules/**`. This script rewrites that output into the
 * Starlight `docs` collection (design §14.3: auto API-reference underneath the
 * handwritten guides):
 *
 *   - Jekyll frontmatter (`nav_order`/`parent`) → Starlight frontmatter.
 *   - The hand-rolled "Table of contents" block is dropped (Starlight renders
 *     its own from the headings).
 *   - Headings are demoted one level so the page title stays the only `h1`.
 *   - `{@link Symbol}` / `{@link module:Mod.Symbol}` are resolved against an
 *     index of every generated heading and become real cross-page links.
 *
 * The output is generated, gitignored, and safe to delete: `pnpm sync` rebuilds
 * it from whatever `pnpm docgen` last produced.
 */
import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, "..", "..")
const PACKAGES_DIR = path.join(ROOT, "packages")
const OUT_DIR = path.join(HERE, "..", "src", "content", "docs", "reference")

/** URL prefix for cross-references, kept in sync with `base` in astro.config.mjs. */
const BASE = (process.env.SITE_BASE ?? "").replace(/\/$/, "")

/**
 * Module paths excluded from the site. `client/generated/**` is the machine-
 * translated Bot API surface (~5 MB of markdown for three modules): the
 * authoritative reference for those shapes is Telegram's own Bot API docs, and
 * shipping multi-megabyte HTML pages helps nobody.
 */
const EXCLUDED = [/^client\/generated\//]

/** Package order in the reference index — `core` first, then the satellites. */
const PACKAGE_ORDER = ["core", "webhook", "menu", "i18n", "durable", "chat-members"]

const SYMBOL_KIND_SUFFIX = /\s+\((?:interface|class|type alias|namespace|function|const|constructor)\)$/

// ---------------------------------------------------------------- utilities

/** GitHub-style heading anchor, matching what docgen's own ToC links assume. */
const anchorOf = (heading) =>
  heading
    .toLowerCase()
    .replaceAll(/[^\w\- ]+/g, "")
    .trim()
    .replaceAll(/\s+/g, "-")

/** `TelegramClient` → `telegram-client`, `BotApi` → `bot-api`, `I18n` → `i18n`. */
const kebabOf = (name) =>
  name
    .replaceAll(/([a-z\d])([A-Z])/g, "$1-$2")
    .replaceAll(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()

const isFence = (line) => /^\s*(?:```|~~~)/.test(line)

/** Walk lines, telling the callback whether each one sits inside a code fence. */
const mapLines = (lines, f) => {
  let inFence = false
  return lines.map((line) => {
    if (isFence(line)) {
      inFence = !inFence
      return line
    }
    return f(line, inFence)
  })
}

const mapOutsideFences = (lines, f) => mapLines(lines, (line, inFence) => (inFence ? line : f(line)))

const stripBlankEdges = (lines) => {
  let start = 0
  let end = lines.length
  while (start < end && lines[start].trim() === "") start++
  while (end > start && lines[end - 1].trim() === "") end--
  return lines.slice(start, end)
}

const quoteYaml = (value) => `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const out = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full)
  }
  return out
}

const exists = async (p) =>
  fs
    .access(p)
    .then(() => true)
    .catch(() => false)

// ------------------------------------------------------------- page parsing

/** Split off docgen's leading Jekyll frontmatter block. */
const stripFrontmatter = (source) => {
  const lines = source.split("\n")
  if (lines[0]?.trim() !== "---") return lines
  const close = lines.findIndex((line, i) => i > 0 && line.trim() === "---")
  return close === -1 ? lines : lines.slice(close + 1)
}

/**
 * Split a docgen page into its overview blurb and the symbol documentation,
 * discarding the hand-rolled table of contents in between.
 */
const splitPage = (lines) => {
  const tocAt = lines.findIndex((line) => line.includes('class="text-delta"'))
  if (tocAt === -1) return { head: stripBlankEdges(lines), body: [] }

  let end = tocAt + 1
  while (end < lines.length && lines[end].trim() !== "---") end++

  const head = stripBlankEdges(lines.slice(0, tocAt)).filter((line) => line.trim() !== "---")
  return { head: stripBlankEdges(head), body: stripBlankEdges(lines.slice(end + 1)) }
}

/** Drop the `## <module> overview` heading — the page title already says it. */
const stripOverviewHeading = (head) =>
  stripBlankEdges(head.filter((line) => !/^##\s+\S+\s+overview\s*$/.test(line)))

/** First prose paragraph, flattened into a one-line frontmatter description. */
const descriptionFrom = (head) => {
  const paragraph = []
  for (const line of head) {
    if (line.trim() === "") {
      if (paragraph.length > 0) break
      continue
    }
    if (line.startsWith("#") || isFence(line)) break
    paragraph.push(line.trim())
  }
  const text = paragraph
    .join(" ")
    .replaceAll(/\{@link\s+!?(?:module:)?([^}]+)\}/g, "$1")
    .replaceAll(/[`*_]/g, "")
    .replaceAll(/\s+/g, " ")
    .trim()
  if (text === "") return undefined
  const firstSentence = /^(.+?[.!?])(?:\s|$)/.exec(text)?.[1] ?? text
  return firstSentence.length > 160 ? `${firstSentence.slice(0, 157).trimEnd()}…` : firstSentence
}

// -------------------------------------------------------------- collection

/**
 * @typedef {{
 *   pkg: string,
 *   dirs: ReadonlyArray<string>,
 *   moduleName: string,
 *   url: string,
 *   outPath: string,
 *   head: ReadonlyArray<string>,
 *   body: ReadonlyArray<string>,
 *   symbols: Map<string, string>
 * }} Page
 */

/** Collect every docgen module page for one package. */
const collectPackage = async (pkg) => {
  const modulesDir = path.join(PACKAGES_DIR, pkg, "docs", "modules")
  if (!(await exists(modulesDir))) return { pages: [], barrels: new Map(), excluded: [] }

  const files = await walk(modulesDir)
  /** @type {Array<Page>} */
  const pages = []
  /** Overview text of each `index.ts` barrel, keyed by its directory. */
  const barrels = new Map()
  const excluded = []

  for (const file of files.sort()) {
    const rel = path.relative(modulesDir, file).replaceAll(path.sep, "/")

    // docgen's own Jekyll nav stubs carry no content.
    if (rel === "index.md" || rel.endsWith("/index.md")) continue
    if (EXCLUDED.some((re) => re.test(rel))) {
      excluded.push(rel)
      continue
    }

    const source = await fs.readFile(file, "utf8")
    const { head, body } = splitPage(stripFrontmatter(source))
    const dirs = rel.split("/").slice(0, -1)
    const moduleName = path.basename(rel).replace(/\.ts\.md$/, "").replace(/\.md$/, "")

    // A barrel documents the module *group*, not a symbol: fold it into the
    // directory's index page instead of giving it a page of its own.
    if (moduleName === "index") {
      barrels.set(dirs.join("/"), stripOverviewHeading(head))
      continue
    }

    const slug = ["reference", pkg, ...dirs, kebabOf(moduleName)].join("/")
    pages.push({
      pkg,
      dirs,
      moduleName,
      url: `${BASE}/${slug}/`,
      outPath: path.join(OUT_DIR, pkg, ...dirs, `${kebabOf(moduleName)}.md`),
      head: stripOverviewHeading(head),
      body,
      symbols: symbolsOf(body)
    })
  }

  return { pages, barrels, excluded }
}

/** Map every `## Symbol (kind)` heading of a page to its anchor. */
const symbolsOf = (body) => {
  const symbols = new Map()
  let inFence = false
  for (const line of body) {
    if (isFence(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const heading = /^##\s+(.+?)\s*$/.exec(line)
    if (heading === null) continue
    const text = heading[1]
    // Headings are demoted by one level on output, but anchors follow the text.
    symbols.set(text.replace(SYMBOL_KIND_SUFFIX, ""), anchorOf(text))
  }
  return symbols
}

// ------------------------------------------------------------ link resolution

/**
 * Resolve docgen's `{@link ...}` JSDoc references against the generated pages.
 * Anything that does not resolve degrades to inline code rather than a dead link.
 */
const makeLinkResolver = (pages) => {
  const byModule = new Map(pages.map((page) => [page.moduleName, page]))
  /** Bare symbol name → pages that define it (ambiguous names stay unlinked). */
  const bySymbol = new Map()
  for (const page of pages) {
    for (const symbol of page.symbols.keys()) {
      const found = bySymbol.get(symbol)
      if (found === undefined) bySymbol.set(symbol, [page])
      else found.push(page)
    }
  }

  const link = (text, page, anchor) =>
    `[\`${text}\`](${page.url}${anchor === undefined ? "" : `#${anchor}`})`

  return (raw, current) => {
    const target = raw.trim()
    const code = (text) => `\`${text}\``

    // A leading `!` is TypeDoc's "resolve outside this project" escape.
    if (target.startsWith("!")) return code(target.slice(1))

    // `{@link https://… Label}` — an external URL with optional link text.
    const external = /^(https?:\/\/\S+)(?:\s+(.+))?$/.exec(target)
    if (external !== null) return `[${external[2] ?? external[1]}](${external[1]})`

    const ref = target.replace(/^module:/, "")
    const [first, second] = ref.split(".")

    // 1. `{@link someExport}` inside the module that declares it.
    if (current.symbols.has(ref)) return link(ref, current, current.symbols.get(ref))

    // 2. `{@link Interface.member}` — anchor to the declaring symbol.
    if (second !== undefined && current.symbols.has(first)) {
      return link(ref, current, current.symbols.get(first))
    }

    // 3. `{@link module:Other.Symbol}` / `{@link Other.Symbol}`.
    const other = byModule.get(first)
    if (other !== undefined) {
      if (second === undefined) return link(first, other)
      return link(ref, other, other.symbols.get(second))
    }

    // 4. A bare name declared in exactly one other module.
    for (const candidate of [ref, first]) {
      const hits = bySymbol.get(candidate)
      if (hits?.length === 1) return link(ref, hits[0], hits[0].symbols.get(candidate))
    }

    return code(ref)
  }
}

// ---------------------------------------------------------------- rendering

/** Demote every heading one level so the frontmatter title owns the only `h1`. */
const demoteHeadings = (lines) =>
  mapOutsideFences(lines, (line) => (/^#{1,5}\s/.test(line) ? `#${line}` : line))

const renderPage = (page, resolveLink) => {
  const content = demoteHeadings([...page.head, "", ...page.body])
  // Prose gets real links; the JSDoc left inside a printed signature can only be
  // unwrapped to the bare symbol name.
  const resolved = mapLines(content, (line, inFence) =>
    line.replaceAll(/\{@link\s+([^}]+)\}/g, (_, ref) =>
      inFence ? ref.trim().replace(/^!/, "").replace(/^module:/, "") : resolveLink(ref, page)
    )
  )

  const description = descriptionFrom(page.head)
  const frontmatter = [
    "---",
    `title: ${quoteYaml(page.moduleName)}`,
    ...(description === undefined ? [] : [`description: ${quoteYaml(description)}`]),
    // The reference is generated; "edit this page" would point at nothing.
    "editUrl: false",
    "---"
  ]

  return `${[...frontmatter, "", ...stripBlankEdges(resolved), ""].join("\n")}`
}

/** Index page for a package (or a subpath module group) with its module list. */
const renderIndex = ({ title, description, overview, entries, note, resolveLink }) => {
  const lead =
    resolveLink === undefined
      ? overview
      : mapLines(overview, (line, inFence) =>
          line.replaceAll(/\{@link\s+([^}]+)\}/g, (_, ref) =>
            inFence
              ? ref.trim().replace(/^!/, "").replace(/^module:/, "")
              : resolveLink(ref, { symbols: new Map() })
          )
        )

  return [
    "---",
    `title: ${quoteYaml(title)}`,
    ...(description === undefined ? [] : [`description: ${quoteYaml(description)}`]),
    "editUrl: false",
    "sidebar:",
    "  order: 0",
    "---",
    "",
    ...(lead.length > 0 ? [...demoteHeadings(lead), ""] : []),
    ...(note === undefined ? [] : [note, ""]),
    ...entries,
    ""
  ].join("\n")
}

const entryLine = (page) => {
  const description = descriptionFrom(page.head)
  return `- [\`${page.moduleName}\`](${page.url})${description === undefined ? "" : ` — ${description}`}`
}

// --------------------------------------------------------------------- main

const clean = () => fs.rm(OUT_DIR, { recursive: true, force: true })

const main = async () => {
  if (process.argv.includes("--clean")) {
    await clean()
    console.warn("[sync-api-reference] removed generated reference")
    return
  }

  const dirEntries = await fs.readdir(PACKAGES_DIR, { withFileTypes: true })
  const packages = dirEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => {
      const ai = PACKAGE_ORDER.indexOf(a)
      const bi = PACKAGE_ORDER.indexOf(b)
      return (ai === -1 ? Number.MAX_SAFE_INTEGER : ai) - (bi === -1 ? Number.MAX_SAFE_INTEGER : bi)
    })

  const collected = []
  for (const pkg of packages) collected.push({ pkg, ...(await collectPackage(pkg)) })

  const withDocs = collected.filter((entry) => entry.pages.length > 0)
  if (withDocs.length === 0) {
    throw new Error(
      "No docgen output found under packages/*/docs/modules. Run `pnpm docgen` at the repo root first."
    )
  }

  const allPages = withDocs.flatMap((entry) => entry.pages)
  const resolveLink = makeLinkResolver(allPages)

  await clean()

  for (const page of allPages) {
    await fs.mkdir(path.dirname(page.outPath), { recursive: true })
    await fs.writeFile(page.outPath, renderPage(page, resolveLink), "utf8")
  }

  // Package + module-group index pages, built from the `index.ts` barrels.
  for (const { pkg, pages, barrels, excluded } of withDocs) {
    const groups = new Set(pages.map((page) => page.dirs.join("/")))
    for (const group of groups) {
      const dirs = group === "" ? [] : group.split("/")
      const inGroup = pages.filter((page) => page.dirs.join("/") === group)
      const subpath = dirs.length === 0 ? "" : `/${dirs.join("/")}`
      const title = `@fibergram/${pkg}${subpath}`
      const dropped = group === "" ? [] : excluded.filter((rel) => rel.startsWith(`${group}/`))

      await fs.writeFile(
        path.join(OUT_DIR, pkg, ...dirs, "index.md"),
        renderIndex({
          title,
          description: `API reference for the ${title} module group.`,
          overview: barrels.get(group) ?? [],
          entries: inGroup.map(entryLine),
          resolveLink,
          note:
            dropped.length === 0
              ? undefined
              : ":::note\nThe generated Bot API surface (`" +
                dropped.map((rel) => rel.replace(/\.ts\.md$/, "")).join("`, `") +
                "`) is derived mechanically from the official [Bot API spec](https://core.telegram.org/bots/api) " +
                "and is not reproduced here — consult Telegram's reference for the request and response shapes.\n:::"
        }),
        "utf8"
      )
    }
  }

  await fs.writeFile(
    path.join(OUT_DIR, "index.md"),
    renderIndex({
      title: "API reference",
      description: "Generated reference for every published fibergram module.",
      overview: [
        "Generated from the source with [`@effect/docgen`](https://github.com/Effect-TS/docgen): every",
        "entry below is a published export whose `@example` compiles as part of CI.",
        "",
        "Prefer the [guides](/guides/commands/) for narrative introductions — this section is the",
        "exhaustive listing."
      ],
      entries: withDocs.map(({ pkg, pages }) => `- [\`@fibergram/${pkg}\`](${BASE}/reference/${pkg}/) — ${pages.length} modules`)
    }),
    "utf8"
  )

  const droppedTotal = withDocs.reduce((n, entry) => n + entry.excluded.length, 0)
  console.warn(
    `[sync-api-reference] ${allPages.length} module pages from ${withDocs.length} packages` +
      (droppedTotal === 0 ? "" : ` (${droppedTotal} generated Bot API modules excluded)`)
  )
}

await main()
