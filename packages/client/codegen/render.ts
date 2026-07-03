/**
 * Pure spec → source-text rendering. Every function here is `Model + spec node → string`
 * (or the whole spec → the three file bodies via {@link renderAll}); the manual suffix is
 * spliced on later by the orchestrator. No IO, no Effect.
 */
import { DISCRIMINATOR_RE, SKIP_TYPES } from "./constants.ts"
import { camelCase, cap, jsdoc, oneLine } from "./naming.ts"
import * as Model from "./model.ts"
import type { RawField, RawMethod, RawType, Spec } from "./spec.ts"

// --- shared struct fragments ------------------------------------------------

/** A `camelCase → snake_case` rename entry for `Schema.encodeKeys`. */
interface Rename {
  readonly camel: string
  readonly snake: string
}

/** A struct field: its `camelCase` key, `Schema` expression and optionality. */
interface StructField extends Rename {
  readonly schema: string
  readonly optional: boolean
}

/** Render the body of a `Schema.Struct({...})` (indented `camel: schema` lines). */
const structBody = (fields: ReadonlyArray<StructField>): string =>
  fields
    .map((f) => `  ${f.camel}: ${f.optional ? `Schema.optionalKey(${f.schema})` : f.schema}`)
    .join(",\n")

/** Render the trailing `.pipe(Schema.encodeKeys({...}))`, or `""` when no key differs. */
const encodeKeysBlock = (renames: ReadonlyArray<Rename>): string =>
  renames.length === 0
    ? ""
    : `.pipe(\n  Schema.encodeKeys({\n${
      renames.map((f) => `    ${f.camel}: ${JSON.stringify(f.snake)}`).join(",\n")
    }\n  })\n)`

// --- struct / union rendering -----------------------------------------------

/** The `Schema` expression + decoded TS type for a single struct field. */
const fieldSchemaTs = (model: Model.Model, f: RawField): { readonly schema: string; readonly ts: string } => {
  if (f.types.length === 1 && f.types[0] === "True") return { schema: "Schema.Literal(true)", ts: "true" }
  const disc = f.types.length === 1 && f.types[0] === "String"
    ? DISCRIMINATOR_RE.exec(f.description ?? "")
    : null
  if (disc) return { schema: `Schema.Literal(${JSON.stringify(disc[1])})`, ts: JSON.stringify(disc[1]) }
  return { schema: Model.schemaOf(model, f.types, "", true), ts: Model.tsOf(f.types, "") }
}

interface FieldInfo extends StructField {
  readonly ts: string
}

const fieldInfo = (model: Model.Model, f: RawField): FieldInfo => ({
  snake: f.name,
  camel: camelCase(f.name),
  ...fieldSchemaTs(model, f),
  optional: !f.required
})

/** A struct type: `export const X = Schema.Struct({...}).pipe(encodeKeys(...))` + type/interface. */
const renderStruct = (model: Model.Model, t: RawType): string => {
  const fields = (t.fields ?? []).map((f) => fieldInfo(model, f))
  const renames = fields.filter((f) => f.camel !== f.snake)
  const struct = fields.length === 0 ? "Schema.Struct({})" : `Schema.Struct({\n${structBody(fields)}\n})`
  const encodeKeys = encodeKeysBlock(renames)

  const doc = jsdoc(oneLine(t.description), "schemas")
  const modelDoc = jsdoc(`Decoded \`camelCase\` ${t.name}.`, "models")

  if (Model.isRecursive(model, t.name)) {
    const ifaceBody = fields
      .map((f) => `  readonly ${f.camel}${f.optional ? "?" : ""}: ${f.ts}`)
      .join("\n")
    const iface = fields.length === 0
      ? `export interface ${t.name} {}\n`
      : `export interface ${t.name} {\n${ifaceBody}\n}\n`
    return (
      modelDoc + iface + "\n" +
      doc +
      `export const ${t.name}: Schema.Codec<${t.name}, unknown> = ${struct}${encodeKeys}\n`
    )
  }
  return (
    doc +
    `export const ${t.name} = ${struct}${encodeKeys}\n\n` +
    modelDoc +
    `export type ${t.name} = Schema.Schema.Type<typeof ${t.name}>\n`
  )
}

/** A union type: `export const U = Schema.Union([...members])` + type/interface. */
const renderUnion = (model: Model.Model, t: RawType): string => {
  const members = (t.subtypes ?? []).filter((s) => Model.hasType(model, s))
  const memberSchemas = members.map((m) =>
    Model.isRecursive(model, m)
      ? `Schema.suspend((): Schema.Codec<${m}, unknown> => ${m})`
      : m
  )
  const union = `Schema.Union([${memberSchemas.join(", ")}])`
  const doc = jsdoc(oneLine(t.description), "schemas")
  const modelDoc = jsdoc(`Decoded \`camelCase\` ${t.name} (union).`, "models")

  if (Model.isRecursive(model, t.name)) {
    const alias = `export type ${t.name} = ${members.join(" | ")}\n`
    return modelDoc + alias + "\n" + doc + `export const ${t.name}: Schema.Codec<${t.name}, unknown> = ${union}\n`
  }
  return doc + `export const ${t.name} = ${union}\n\n` + modelDoc + `export type ${t.name} = Schema.Schema.Type<typeof ${t.name}>\n`
}

// --- method param + client rendering ----------------------------------------

const paramsName = (method: string): string => `${cap(method)}Params`

/** `export const SendMessageParams = Schema.Struct({...})...` in methods.ts (ns = "T."). */
const renderMethodParams = (model: Model.Model, m: RawMethod): string | null => {
  const fields = m.fields ?? []
  if (fields.length === 0) return null
  const infos: ReadonlyArray<StructField> = fields.map((f) => ({
    snake: f.name,
    camel: camelCase(f.name),
    schema: Model.schemaOf(model, f.types, "T.", false),
    optional: !f.required
  }))
  const renames = infos.filter((f) => f.camel !== f.snake)
  const name = paramsName(m.name)
  const doc = jsdoc(`Request parameters for \`${m.name}\`. ${oneLine(m.description)}`, "params")
  const modelDoc = jsdoc(`\`${name}\` (\`camelCase\`).`, "models")
  return (
    doc +
    `export const ${name} = Schema.Struct({\n${structBody(infos)}\n})${encodeKeysBlock(renames)}\n\n` +
    modelDoc +
    `export type ${name} = Schema.Schema.Type<typeof ${name}>\n`
  )
}

/** The fully-typed service interface + a factory wiring all methods to a low-level `call`. */
const renderClient = (
  model: Model.Model,
  methods: ReadonlyArray<RawMethod>,
  banner: (extra: string) => string
): string => {
  const returnType = (m: RawMethod): string => Model.tsOf(m.returns, "T.")
  const resultSchema = (m: RawMethod): string => Model.schemaOf(model, m.returns, "T.", false)

  const ifaceMembers = methods.map((m) => {
    const doc = `  /**\n   * ${oneLine(m.description)}\n   *\n   * @category methods\n   * @since 0.1.0\n   */\n`
    const hasParams = (m.fields ?? []).length > 0
    const allOptional = hasParams && (m.fields ?? []).every((f) => !f.required)
    const params = hasParams
      ? `params${allOptional ? "?" : ""}: M.${paramsName(m.name)}`
      : ""
    return `${doc}  readonly ${m.name}: (${params}) => Effect.Effect<${returnType(m)}, TelegramError.TelegramError>`
  })

  const factoryEntries = methods.map((m) => {
    const hasParams = (m.fields ?? []).length > 0
    const paramsSchema = hasParams ? `M.${paramsName(m.name)}` : "null"
    const arg = hasParams ? "params" : "undefined"
    const lhs = hasParams ? "(params) =>" : "() =>"
    return `  ${m.name}: ${lhs} call(${JSON.stringify(m.name)}, ${paramsSchema}, ${resultSchema(m)}, ${arg})`
  })

  const header =
    `/**\n * The fully-typed \`TelegramClientService\` shape (every Bot API method) plus the\n` +
    ` * {@link makeMethods} factory that wires each method to a transport \`call\`. Generated\n` +
    ` * from the spec; the \`call\` seam (HTTP, token, error mapping) is provided by hand in\n` +
    ` * {@link module:TelegramClient}.\n *\n * @since 0.1.0\n */\n` +
    `import { Schema, type Effect } from "effect"\n` +
    `import type * as TelegramError from "../TelegramError.js"\n` +
    `import * as M from "./methods.js"\n` +
    `import * as T from "./types.js"\n\n`

  const callDoc = jsdoc(
    "Low-level transport used by {@link makeMethods}: encodes params (if any) via " +
      "`paramsSchema`, POSTs `method`, decodes the result via `resultSchema`.",
    "models"
  )
  const callType =
    `export type Call = <A>(\n` +
    `  method: string,\n` +
    `  paramsSchema: Schema.Codec<any, any, never, never> | null,\n` +
    `  resultSchema: Schema.Codec<A, any, never, never>,\n` +
    `  params: unknown\n` +
    `) => Effect.Effect<A, TelegramError.TelegramError>\n`

  const iface =
    jsdoc("The Bot API surface: one `Effect` per method, failing with the typed Telegram error union.", "models") +
    `export interface TelegramClientService {\n${ifaceMembers.join("\n")}\n}\n`

  const factory =
    jsdoc("Builds the {@link TelegramClientService} from a transport {@link Call}.", "constructors") +
    `export const makeMethods = (call: Call): TelegramClientService => ({\n${factoryEntries.join(",\n")}\n})\n`

  return header + banner("") + callDoc + callType + "\n" + iface + "\n" + factory
}

// --- pure spec -> file bodies -----------------------------------------------

/** One generated module body (without its preserved manual suffix). */
export interface GeneratedFile {
  readonly name: string
  readonly body: string
}

/** All generated bodies plus a one-line run summary. */
export interface RenderResult {
  readonly files: ReadonlyArray<GeneratedFile>
  readonly summary: string
}

/**
 * Turn a parsed spec into the three generated file bodies (the manual suffix is
 * appended later, per file, by the orchestrator). Pure.
 */
export const renderAll = (spec: Spec): RenderResult => {
  const typeNames = new Set(Object.keys(spec.types).filter((n) => !SKIP_TYPES.has(n)))
  const model = Model.make(spec, typeNames)

  const rawTypes = [...typeNames].map((n) => spec.types[n]!).sort((a, b) => a.name.localeCompare(b.name))
  const unions = rawTypes.filter((t) => t.subtypes)
  const structs = rawTypes.filter((t) => !t.subtypes)
  const methods = Object.values(spec.methods).sort((a, b) => a.name.localeCompare(b.name))

  const order = Model.emissionOrder(model, rawTypes.map((t) => t.name))
  const byName = new Map(rawTypes.map((t) => [t.name, t]))
  const typeDecls = order.map((name) => {
    const t = byName.get(name)!
    return t.subtypes ? renderUnion(model, t) : renderStruct(model, t)
  })

  const banner = (extra: string) =>
    `// Auto-generated from the Telegram Bot API spec (${spec.version}).\n` +
    `// Do NOT edit above the MANUAL marker — run \`pnpm codegen\` to regenerate.\n` +
    (extra ? extra + "\n" : "")

  const typesHeader =
    `/**\n * Bot API object schemas, generated from the Telegram Bot API spec.\n *\n` +
    ` * This is the **only** place \`snake_case\` is allowed: each schema's\n` +
    ` * decoded \`Type\` is \`camelCase\`, its \`Encoded\` shape is the raw \`snake_case\` Telegram\n` +
    ` * speaks, wired via {@link Schema.encodeKeys}. Decoding is lenient — unknown fields drop.\n *\n` +
    ` * @since 0.1.0\n */\n` +
    `import { Schema } from "effect"\n\n`
  const typesContent = typesHeader + banner("") + typeDecls.join("\n")

  const methodParams = methods.map((m) => renderMethodParams(model, m)).filter((s): s is string => s !== null)
  const methodsHeader =
    `/**\n * Bot API method request-parameter schemas, generated from the spec.\n *\n` +
    ` * Same \`snake_case\` boundary as {@link module:generated/types} — request params encode\n` +
    ` * \`camelCase\` → \`snake_case\` on the way out.\n *\n * @since 0.1.0\n */\n` +
    `import { Schema } from "effect"\nimport * as T from "./types.js"\n\n`
  const methodsContent = methodsHeader + banner("") + methodParams.join("\n")

  const clientContent = renderClient(model, methods, banner)

  return {
    files: [
      { name: "types.ts", body: typesContent },
      { name: "methods.ts", body: methodsContent },
      { name: "client.ts", body: clientContent }
    ],
    summary:
      `Generated ${structs.length} structs, ${unions.length} unions ` +
      `(${Model.recursiveNames(model).length} recursive), ${methods.length} methods for ${spec.version}.`
  }
}
