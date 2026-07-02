/**
 * Pure string helpers straddling the `snake_case`/`camelCase` boundary (design §5.3)
 * plus JSDoc block rendering. No IO, no Effect — just `string -> string`.
 */

/** `send_message` → `sendMessage`. */
export const camelCase = (snake: string): string =>
  snake.replace(/_([a-z0-9])/g, (_m, c: string) => c.toUpperCase())

/** Capitalise the first character (`sendMessage` → `SendMessage`). */
export const cap = (s: string): string => (s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1))

/** Collapse a description (array or string) to a single clean JSDoc line. */
export const oneLine = (desc: ReadonlyArray<string> | string | undefined): string => {
  // `Array.isArray` does not narrow `readonly` arrays; branch on `typeof` instead.
  const joined = desc === undefined ? "" : typeof desc === "string" ? desc : desc.join(" ")
  return joined.replace(/\s+/g, " ").replace(/\*\//g, "*​/").trim()
}

/** A `@category`/`@since`-tagged JSDoc block — docgen enforces both tags (design §14.2). */
export const jsdoc = (description: string, category: string): string => {
  const desc = description.length === 0 ? "" : ` * ${description}\n *\n`
  return `/**\n${desc} * @category ${category}\n * @since 0.1.0\n */\n`
}
