/**
 * Codegen constants: the manual-suffix marker, the hand-provided types the generator
 * must skip, and the discriminator heuristic used to narrow union members.
 */

/** Everything from this line to EOF in a target file is hand-written and preserved. */
export const MANUAL_MARKER = "// === MANUAL — not regenerated below (codegen) ==="

/** Telegram types provided by hand in the manual suffix, never generated as a struct. */
export const SKIP_TYPES: ReadonlySet<string> = new Set(["InputFile"])

/**
 * Discriminator constant embedded in a field description, e.g. `... always "photo"`
 * or `... must be photo`. The literal must be the **terminal** token of its clause
 * (followed by end-of-string or `.`/`,`/`;`, after an optional closing quote), so
 * prose constraints like `must be in JPEG format` or `must be an exact substring`
 * are not mistaken for a discriminator value.
 */
export const DISCRIMINATOR_RE = /(?:always|must be)\s+["“]?([a-z0-9_]+)["”]?(?:[.,;]|\s*$)/
