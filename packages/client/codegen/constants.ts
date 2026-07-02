/**
 * Codegen constants: the manual-suffix marker, the hand-provided types the generator
 * must skip, and the discriminator heuristic used to narrow union members.
 */

/** Everything from this line to EOF in a target file is hand-written and preserved. */
export const MANUAL_MARKER = "// === MANUAL — not regenerated below (codegen) ==="

/** Telegram types provided by hand in the manual suffix, never generated as a struct. */
export const SKIP_TYPES: ReadonlySet<string> = new Set(["InputFile"])

/** Discriminator constant embedded in a field description, e.g. `... always "photo"`. */
export const DISCRIMINATOR_RE = /(?:always|must be)\s+["“]?([a-z0-9_]+)/
