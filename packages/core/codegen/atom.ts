/**
 * Classification of a spec type-string (e.g. `"Array of Integer"`, `"Message"`) into a
 * small tagged {@link TypeAtom} tree. Pure and self-contained: it knows nothing about
 * which named types are recursive — that lives in {@link module:model}.
 */

/** A parsed type-string: a primitive, a named reference, or an array of one. */
export type TypeAtom =
  | { readonly _tag: "Primitive"; readonly schema: string; readonly ts: string }
  | { readonly _tag: "Named"; readonly name: string }
  | { readonly _tag: "ArrayOf"; readonly inner: TypeAtom }

/** Spec primitive names → their Effect `Schema` expression and decoded TS type. */
const PRIMITIVES: Record<string, { readonly schema: string; readonly ts: string }> = {
  Integer: { schema: "Schema.Number", ts: "number" },
  Float: { schema: "Schema.Number", ts: "number" },
  "Float number": { schema: "Schema.Number", ts: "number" },
  String: { schema: "Schema.String", ts: "string" },
  Boolean: { schema: "Schema.Boolean", ts: "boolean" },
  True: { schema: "Schema.Literal(true)", ts: "true" }
}

/** Parse a single spec type-string into a {@link TypeAtom}. */
export const parseAtom = (t: string): TypeAtom => {
  if (t.startsWith("Array of ")) {
    return { _tag: "ArrayOf", inner: parseAtom(t.slice("Array of ".length)) }
  }
  const prim = PRIMITIVES[t]
  if (prim) return { _tag: "Primitive", schema: prim.schema, ts: prim.ts }
  return { _tag: "Named", name: t }
}
