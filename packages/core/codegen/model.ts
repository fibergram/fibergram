/**
 * The resolved generation model: a {@link Spec} plus the set of generated type names
 * and the set of *recursive* types (found by SCC analysis). All queries are pure
 * functions over a {@link Model} value — no mutable generator object.
 *
 * Kept free of rendering concerns: it answers "is this recursive?", "in what order do
 * types emit?", and "what is the `Schema`/TS expression for this field's type list?".
 */
import { SKIP_TYPES } from "./constants.ts"
import { parseAtom, type TypeAtom } from "./atom.ts"
import type { Spec } from "./spec.ts"

/** An `ArrayOf` atom, narrowed for the collapse-of-arrays cases below. */
type ArrayAtom = Extract<TypeAtom, { readonly _tag: "ArrayOf" }>

/** Immutable view of the spec paired with its derived name/recursion sets. */
export interface Model {
  readonly spec: Spec
  readonly typeNames: ReadonlySet<string>
  readonly recursive: ReadonlySet<string>
}

/** Build a {@link Model}, computing the recursive-type set once up front. */
export const make = (spec: Spec, typeNames: ReadonlySet<string>): Model => ({
  spec,
  typeNames,
  recursive: computeRecursive(spec, typeNames)
})

/** Whether `name` participates in a reference cycle (needs `Schema.suspend` + an interface). */
export const isRecursive = (model: Model, name: string): boolean => model.recursive.has(name)

/** Whether `name` is a generated type (as opposed to a skipped/manual one). */
export const hasType = (model: Model, name: string): boolean => model.typeNames.has(name)

/** The recursive type names, sorted — for the run summary. */
export const recursiveNames = (model: Model): ReadonlyArray<string> => [...model.recursive].sort()

/** Emission order: topo-sort over edges to *non-recursive* targets (a DAG). */
export const emissionOrder = (model: Model, names: ReadonlyArray<string>): ReadonlyArray<string> => {
  const visited = new Set<string>()
  const order: Array<string> = []
  const visit = (name: string): void => {
    if (visited.has(name)) return
    visited.add(name)
    for (const dep of plainDeps(model.spec, model.typeNames, name)) {
      if (model.typeNames.has(dep)) visit(dep)
    }
    order.push(name)
  }
  for (const name of names) visit(name)
  return order
}

// --- schema expression ------------------------------------------------------

/**
 * Schema expression for a field's type list.
 * `ns` prefixes references to generated types (e.g. "T."); `suspendRecursive`
 * wraps recursive references in `Schema.suspend` (needed only inside types.ts).
 */
export const schemaOf = (
  model: Model,
  types: ReadonlyArray<string>,
  ns: string,
  suspendRecursive: boolean
): string => {
  if (types.length === 1) return schemaAtom(model, parseAtom(types[0]!), ns, suspendRecursive)
  // Multi-type field. `Array of A | Array of B | ...` collapses to Array(Union(...)).
  const atoms = types.map(parseAtom)
  if (atoms.every((a) => a._tag === "ArrayOf")) {
    const inners = atoms.map((a) => schemaAtom(model, (a as ArrayAtom).inner, ns, suspendRecursive))
    return `Schema.Array(Schema.Union([${inners.join(", ")}]))`
  }
  const members = atoms.map((a) => schemaAtom(model, a, ns, suspendRecursive))
  return `Schema.Union([${members.join(", ")}])`
}

const schemaAtom = (model: Model, atom: TypeAtom, ns: string, suspendRecursive: boolean): string => {
  switch (atom._tag) {
    case "Primitive":
      return atom.schema
    case "ArrayOf":
      return `Schema.Array(${schemaAtom(model, atom.inner, ns, suspendRecursive)})`
    case "Named": {
      const name = atom.name
      if (SKIP_TYPES.has(name)) return `${ns}${name}`
      if (suspendRecursive && model.recursive.has(name)) {
        return `Schema.suspend((): Schema.Codec<${ns}${name}, unknown> => ${ns}${name})`
      }
      return `${ns}${name}`
    }
  }
}

// --- decoded TS type (only needed for recursive interfaces) -----------------

/** Decoded TS type for a field's type list (`ns` prefixes named references). */
export const tsOf = (types: ReadonlyArray<string>, ns: string): string => {
  if (types.length === 1) return tsAtom(parseAtom(types[0]!), ns)
  const atoms = types.map(parseAtom)
  if (atoms.every((a) => a._tag === "ArrayOf")) {
    const inners = atoms.map((a) => tsAtom((a as ArrayAtom).inner, ns))
    return `ReadonlyArray<${inners.join(" | ")}>`
  }
  return atoms.map((a) => tsAtom(a, ns)).join(" | ")
}

const tsAtom = (atom: TypeAtom, ns: string): string => {
  switch (atom._tag) {
    case "Primitive":
      return atom.ts
    case "ArrayOf":
      return `ReadonlyArray<${tsAtom(atom.inner, ns)}>`
    case "Named":
      return SKIP_TYPES.has(atom.name) ? "unknown" : `${ns}${atom.name}`
  }
}

// --- recursive-set computation (Tarjan SCC + self-loops) --------------------

/** Direct references from `name` to other *generated* types (subtypes + field types). */
const plainDeps = (spec: Spec, typeNames: ReadonlySet<string>, name: string): Set<string> => {
  const t = spec.types[name]
  const deps = new Set<string>()
  if (!t) return deps
  for (const sub of t.subtypes ?? []) if (typeNames.has(sub)) deps.add(sub)
  for (const f of t.fields ?? []) {
    for (const ts of f.types) {
      let atom = parseAtom(ts)
      while (atom._tag === "ArrayOf") atom = atom.inner
      if (atom._tag === "Named" && typeNames.has(atom.name)) deps.add(atom.name)
    }
  }
  return deps
}

/** Types on a reference cycle: non-trivial SCCs (size > 1) plus direct self-loops. */
const computeRecursive = (spec: Spec, typeNames: ReadonlySet<string>): ReadonlySet<string> => {
  const index = new Map<string, number>()
  const low = new Map<string, number>()
  const onStack = new Set<string>()
  const stack: Array<string> = []
  const recursive = new Set<string>()
  let counter = 0

  const strongConnect = (v: string): void => {
    index.set(v, counter)
    low.set(v, counter)
    counter++
    stack.push(v)
    onStack.add(v)
    const deps = plainDeps(spec, typeNames, v)
    if (deps.has(v)) recursive.add(v) // self-loop
    for (const w of deps) {
      if (!index.has(w)) {
        strongConnect(w)
        low.set(v, Math.min(low.get(v)!, low.get(w)!))
      } else if (onStack.has(w)) {
        low.set(v, Math.min(low.get(v)!, index.get(w)!))
      }
    }
    if (low.get(v) === index.get(v)) {
      const comp: Array<string> = []
      let w: string
      do {
        w = stack.pop()!
        onStack.delete(w)
        comp.push(w)
      } while (w !== v)
      if (comp.length > 1) for (const n of comp) recursive.add(n)
    }
  }

  for (const name of typeNames) if (!index.has(name)) strongConnect(name)
  return recursive
}
