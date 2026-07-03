/**
 * The JSON-vs-multipart decision for an outgoing Bot API request. Internal to the
 * transport seam ({@link module:TelegramClient}): given an already-encoded
 * (`snake_case`) params object, {@link prepare} decides whether it can go as JSON
 * or must become `multipart/form-data` because it carries an uploaded
 * {@link module:InputFile.InputFile}.
 *
 * File values are wired through `attach://<id>` references (Telegram's convention),
 * so both top-level file fields and files nested inside a media array upload
 * uniformly. A {@link module:InputFile.Url} is inlined as a plain string and never
 * forces multipart.
 *
 * @since 0.1.0
 */
import { Effect } from "effect"

import * as InputFile from "./InputFile.js"

interface FileRef {
  readonly id: string
  readonly file: InputFile.InputFile
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)

/** Any uploaded file (not a URL) anywhere in the payload? */
const hasUpload = (value: unknown): boolean => {
  if (InputFile.isInputFile(value)) return InputFile.isUpload(value)
  if (Array.isArray(value)) return value.some(hasUpload)
  if (isPlainObject(value)) return Object.values(value).some(hasUpload)
  return false
}

/** Replace `Url` input files with their string; leave everything else untouched (JSON path). */
const inlineUrls = (value: unknown): unknown => {
  if (InputFile.isInputFile(value)) return value._tag === "Url" ? value.url : value
  if (Array.isArray(value)) return value.map(inlineUrls)
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = inlineUrls(v)
    return out
  }
  return value
}

/**
 * Replace every input file with a string: a `Url` with its URL, an upload with an
 * `attach://<id>` reference (registering the file in `files`).
 */
const attach = (value: unknown, files: Array<FileRef>, counter: { n: number }): unknown => {
  if (InputFile.isInputFile(value)) {
    if (value._tag === "Url") return value.url
    const id = `file${counter.n++}`
    files.push({ id, file: value })
    return `attach://${id}`
  }
  if (Array.isArray(value)) return value.map((v) => attach(v, files, counter))
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = attach(v, files, counter)
    return out
  }
  return value
}

/**
 * The prepared request body: either a JSON value or a ready-to-send `FormData`.
 *
 * @category models
 * @since 0.1.0
 */
export type Body =
  | { readonly _tag: "Json"; readonly json: unknown }
  | { readonly _tag: "FormData"; readonly formData: FormData }

/**
 * Decides how an encoded params object should be sent: JSON when it carries no
 * uploaded file, otherwise `multipart/form-data` with each file appended and
 * referenced via `attach://`.
 *
 * @example
 * import { InputFile, Multipart } from "@fibergram/core/client"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const body = yield* Multipart.prepare({ chat_id: 1, photo: InputFile.fromBytes(new Uint8Array([1])) })
 *   return body._tag
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const prepare = (encoded: unknown): Effect.Effect<Body> => {
  if (!hasUpload(encoded)) {
    return Effect.succeed({ _tag: "Json", json: inlineUrls(encoded) })
  }
  return Effect.gen(function* () {
    const files: Array<FileRef> = []
    const top = attach(encoded, files, { n: 0 })
    const formData = new FormData()
    if (isPlainObject(top)) {
      for (const [key, value] of Object.entries(top)) {
        if (value === undefined || value === null) continue
        if (typeof value === "string") formData.append(key, value)
        else if (typeof value === "number" || typeof value === "boolean") formData.append(key, String(value))
        else formData.append(key, JSON.stringify(value))
      }
    }
    for (const { file, id } of files) {
      const { blob, filename } = yield* InputFile.toBlob(file)
      formData.append(id, blob, filename)
    }
    return { _tag: "FormData", formData } as const
  })
}
