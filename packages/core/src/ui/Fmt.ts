/**
 * `Fmt` - builds a formatted message as an entity tree instead of a marked-up
 * string, so there is no `parse_mode` and nothing to escape. Every node produces a
 * {@link FmtString} (`{ text, entities }`); nesting and concatenation recompute the
 * `MessageEntity` offsets for you. Feed the result straight to
 * {@link module:Chat.reply} (it accepts `{ text, entities }`) - no `parseMode`.
 *
 * Two composition styles, mirroring grammY's `fmt` and aiogram's `formatting`:
 * the {@link fmt} tagged template for inline interpolation, and the node
 * constructors ({@link bold}, {@link link}, …) for structured trees.
 *
 * Offsets are UTF-16 code units (Telegram's convention, which matches JS string
 * indexing), so concatenation is plain `string` length arithmetic.
 *
 * @since 0.1.0
 */
import type { BotApi } from "../client/index.js"

/**
 * A piece of formatted text: the rendered `text` and the `entities` that mark it.
 * Structurally a {@link module:Chat.FormattedText}, so it feeds `Chat.reply`
 * directly.
 *
 * @category models
 * @since 0.1.0
 */
export interface FmtString {
  /** The rendered text. */
  readonly text: string
  /** The entities marking spans of {@link text} (UTF-16 offsets). */
  readonly entities: ReadonlyArray<BotApi.MessageEntity>
}

/**
 * A node child: a plain `string` (unformatted) or a nested {@link FmtString}.
 *
 * @category models
 * @since 0.1.0
 */
export type Content = string | FmtString

const toFmt = (content: Content): FmtString =>
  typeof content === "string" ? { text: content, entities: [] } : content

/**
 * Concatenate parts into one {@link FmtString}, shifting each part's entity
 * offsets by the preceding text length.
 *
 * @example
 * import { Fmt } from "@fibergram/core/ui"
 *
 * const line = Fmt.concat("Hello, ", Fmt.bold("world"), "!")
 * line.text // "Hello, world!"
 *
 * @category combinators
 * @since 0.1.0
 */
export const concat = (...parts: ReadonlyArray<Content>): FmtString => {
  let text = ""
  const entities: Array<BotApi.MessageEntity> = []
  for (const part of parts) {
    const fmtPart = toFmt(part)
    const shift = text.length
    for (const entity of fmtPart.entities) {
      entities.push({ ...entity, offset: entity.offset + shift })
    }
    text += fmtPart.text
  }
  return { text, entities }
}

/**
 * Join `parts` with a separator (default none), like `Array#join` but preserving
 * entities.
 *
 * @example
 * import { Fmt } from "@fibergram/core/ui"
 *
 * const list = Fmt.join([Fmt.bold("a"), Fmt.bold("b"), Fmt.bold("c")], ", ")
 * list.text // "a, b, c"
 *
 * @category combinators
 * @since 0.1.0
 */
export const join = (parts: ReadonlyArray<Content>, separator: Content = ""): FmtString => {
  const interleaved: Array<Content> = []
  for (const [index, part] of parts.entries()) {
    if (index > 0) interleaved.push(separator)
    interleaved.push(part)
  }
  return concat(...interleaved)
}

/**
 * A tagged template that interpolates {@link Content} values into text, computing
 * entity offsets as it goes (grammY's `fmt`).
 *
 * @example
 * import { Fmt } from "@fibergram/core/ui"
 *
 * const message = Fmt.fmt`Welcome, ${Fmt.bold("Ada")}! Read the ${Fmt.link("docs", "https://effect.website")}.`
 * message.text // "Welcome, Ada! Read the docs."
 *
 * @category combinators
 * @since 0.1.0
 */
export const fmt = (strings: TemplateStringsArray, ...values: ReadonlyArray<Content>): FmtString => {
  const parts: Array<Content> = []
  for (const [index, chunk] of strings.entries()) {
    parts.push(chunk)
    const value = values[index]
    if (value !== undefined) parts.push(value)
  }
  return concat(...parts)
}

const wrap = (type: string) => (...content: ReadonlyArray<Content>): FmtString => {
  const inner = concat(...content)
  const entity: BotApi.MessageEntity = { type, offset: 0, length: inner.text.length }
  return { text: inner.text, entities: [entity, ...inner.entities] }
}

/**
 * Bold text.
 *
 * @example
 * import { Fmt } from "@fibergram/core/ui"
 *
 * const node = Fmt.bold("important")
 *
 * @category constructors
 * @since 0.1.0
 */
export const bold: (...content: ReadonlyArray<Content>) => FmtString = wrap("bold")

/**
 * Italic text.
 *
 * @example
 * import { Fmt } from "@fibergram/core/ui"
 *
 * const node = Fmt.italic("emphasis")
 *
 * @category constructors
 * @since 0.1.0
 */
export const italic: (...content: ReadonlyArray<Content>) => FmtString = wrap("italic")

/**
 * Underlined text.
 *
 * @example
 * import { Fmt } from "@fibergram/core/ui"
 *
 * const node = Fmt.underline("underlined")
 *
 * @category constructors
 * @since 0.1.0
 */
export const underline: (...content: ReadonlyArray<Content>) => FmtString = wrap("underline")

/**
 * Strikethrough text.
 *
 * @example
 * import { Fmt } from "@fibergram/core/ui"
 *
 * const node = Fmt.strikethrough("removed")
 *
 * @category constructors
 * @since 0.1.0
 */
export const strikethrough: (...content: ReadonlyArray<Content>) => FmtString = wrap("strikethrough")

/**
 * Spoiler text (hidden until tapped).
 *
 * @example
 * import { Fmt } from "@fibergram/core/ui"
 *
 * const node = Fmt.spoiler("the butler did it")
 *
 * @category constructors
 * @since 0.1.0
 */
export const spoiler: (...content: ReadonlyArray<Content>) => FmtString = wrap("spoiler")

/**
 * A block quotation.
 *
 * @example
 * import { Fmt } from "@fibergram/core/ui"
 *
 * const node = Fmt.blockquote("to be, or not to be")
 *
 * @category constructors
 * @since 0.1.0
 */
export const blockquote: (...content: ReadonlyArray<Content>) => FmtString = wrap("blockquote")

/**
 * A collapsible block quotation.
 *
 * @example
 * import { Fmt } from "@fibergram/core/ui"
 *
 * const node = Fmt.expandableBlockquote("a very long quote…")
 *
 * @category constructors
 * @since 0.1.0
 */
export const expandableBlockquote: (...content: ReadonlyArray<Content>) => FmtString = wrap("expandable_blockquote")

/**
 * Inline monospace code. Code spans cannot nest, so this takes a plain `string`.
 *
 * @example
 * import { Fmt } from "@fibergram/core/ui"
 *
 * const node = Fmt.code("npm install")
 *
 * @category constructors
 * @since 0.1.0
 */
export const code = (text: string): FmtString => ({
  text,
  entities: [{ type: "code", offset: 0, length: text.length }]
})

/**
 * A pre-formatted code block, with an optional language for syntax highlighting.
 *
 * @example
 * import { Fmt } from "@fibergram/core/ui"
 *
 * const node = Fmt.pre("const x = 1", "typescript")
 *
 * @category constructors
 * @since 0.1.0
 */
export const pre = (text: string, language?: string): FmtString => ({
  text,
  entities: [{ type: "pre", offset: 0, length: text.length, ...(language !== undefined ? { language } : {}) }]
})

/**
 * A text link (`text_link`) - `content` rendered as a hyperlink to `url`.
 *
 * @example
 * import { Fmt } from "@fibergram/core/ui"
 *
 * const node = Fmt.link("Effect", "https://effect.website")
 *
 * @category constructors
 * @since 0.1.0
 */
export const link = (content: Content, url: string): FmtString => {
  const inner = toFmt(content)
  return {
    text: inner.text,
    entities: [{ type: "text_link", offset: 0, length: inner.text.length, url }, ...inner.entities]
  }
}

/**
 * A text mention (`text_mention`) - `content` rendered as a mention of `user`
 * (works for users with no username).
 *
 * @example
 * import { Fmt } from "@fibergram/core/ui"
 *
 * const node = Fmt.mention("Ada", { id: 42, isBot: false, firstName: "Ada" })
 *
 * @category constructors
 * @since 0.1.0
 */
export const mention = (content: Content, user: BotApi.User): FmtString => {
  const inner = toFmt(content)
  return {
    text: inner.text,
    entities: [{ type: "text_mention", offset: 0, length: inner.text.length, user }, ...inner.entities]
  }
}

/**
 * A custom emoji (`custom_emoji`) - `placeholder` is the fallback shown by clients
 * that cannot render the emoji `customEmojiId`.
 *
 * @example
 * import { Fmt } from "@fibergram/core/ui"
 *
 * const node = Fmt.customEmoji("🔥", "5368324170671202286")
 *
 * @category constructors
 * @since 0.1.0
 */
export const customEmoji = (placeholder: string, customEmojiId: string): FmtString => ({
  text: placeholder,
  entities: [{ type: "custom_emoji", offset: 0, length: placeholder.length, customEmojiId }]
})
