/**
 * `InputFile` - a file to upload to Telegram from the bot's side, as opposed to a
 * `file_id`/URL string the servers already know. It is a small tagged value
 * (never a mutated prototype): construct one with {@link fromPath} /
 * {@link fromBytes} / {@link fromStream} / {@link fromUrl} and pass it wherever a
 * Bot API method accepts a file (`sendPhoto`, `sendDocument`, media groups, ...).
 *
 * The transport seam in {@link module:TelegramClient} detects these values in an
 * outgoing payload and switches the request from JSON to `multipart/form-data`,
 * wiring nested references through `attach://`. Handler code never touches
 * multipart.
 *
 * @since 0.1.0
 */
import { Effect, Stream } from "effect"
import * as NodeFs from "node:fs"
import NodePath from "node:path"

const TypeId: unique symbol = Symbol.for("@fibergram/client/InputFile")

/**
 * The brand identifying an {@link InputFile} value at runtime.
 *
 * @category type ids
 * @since 0.1.0
 */
export type TypeId = typeof TypeId

const DEFAULT_FILENAME = "file"

/**
 * Common attributes for an uploaded {@link InputFile}: an optional `filename`
 * (what Telegram shows) and an explicit MIME `contentType`.
 *
 * @category models
 * @since 0.1.0
 */
export interface Options {
  /** The name Telegram displays for the file (defaults to the path basename or `"file"`). */
  readonly filename?: string
  /** The MIME type sent in the multipart part (e.g. `"image/png"`). */
  readonly contentType?: string
}

/**
 * A file to upload by filesystem path (resolved lazily at send time).
 *
 * @category models
 * @since 0.1.0
 */
export interface Path {
  readonly [TypeId]: TypeId
  readonly _tag: "Path"
  readonly path: string
  readonly filename?: string
  readonly contentType?: string
}

/**
 * A file to upload from an in-memory byte array.
 *
 * @category models
 * @since 0.1.0
 */
export interface Bytes {
  readonly [TypeId]: TypeId
  readonly _tag: "Bytes"
  readonly bytes: Uint8Array
  readonly filename?: string
  readonly contentType?: string
}

/**
 * A file to upload from a byte {@link Stream} (materialised at send time).
 *
 * @category models
 * @since 0.1.0
 */
export interface FromStream {
  readonly [TypeId]: TypeId
  readonly _tag: "Stream"
  readonly stream: Stream.Stream<Uint8Array, unknown>
  readonly filename?: string
  readonly contentType?: string
}

/**
 * A URL for Telegram to fetch server-side; sent inline as a string, never uploaded.
 *
 * @category models
 * @since 0.1.0
 */
export interface Url {
  readonly [TypeId]: TypeId
  readonly _tag: "Url"
  readonly url: string
}

/**
 * The contents of a file to send to Telegram: a path, bytes, a byte stream, or a
 * URL. The transport seam turns the first three into `multipart/form-data` parts
 * and leaves a {@link Url} as an inline string.
 *
 * @category models
 * @since 0.1.0
 */
export type InputFile = Path | Bytes | FromStream | Url

const withMeta = (options?: Options): { filename?: string; contentType?: string } => ({
  ...(options?.filename !== undefined ? { filename: options.filename } : {}),
  ...(options?.contentType !== undefined ? { contentType: options.contentType } : {})
})

/**
 * An {@link InputFile} read from a filesystem path. The file is opened lazily when
 * the request is sent, so nothing is buffered up front.
 *
 * @example
 * import { InputFile } from "@fibergram/client"
 *
 * const photo = InputFile.fromPath("./cat.png", { contentType: "image/png" })
 *
 * @category constructors
 * @since 0.1.0
 */
export const fromPath = (path: string, options?: Options): Path => ({
  [TypeId]: TypeId,
  _tag: "Path",
  path,
  ...withMeta(options)
})

/**
 * An {@link InputFile} from an in-memory byte array.
 *
 * @example
 * import { InputFile } from "@fibergram/client"
 *
 * const doc = InputFile.fromBytes(new Uint8Array([1, 2, 3]), { filename: "data.bin" })
 *
 * @category constructors
 * @since 0.1.0
 */
export const fromBytes = (bytes: Uint8Array, options?: Options): Bytes => ({
  [TypeId]: TypeId,
  _tag: "Bytes",
  bytes,
  ...withMeta(options)
})

/**
 * An {@link InputFile} from a byte {@link Stream}. The stream is drained when the
 * request is sent.
 *
 * @example
 * import { InputFile } from "@fibergram/client"
 * import { Stream } from "effect"
 *
 * const doc = InputFile.fromStream(
 *   Stream.make(new Uint8Array([1]), new Uint8Array([2])),
 *   { filename: "data.bin" }
 * )
 *
 * @category constructors
 * @since 0.1.0
 */
export const fromStream = (
  stream: Stream.Stream<Uint8Array, unknown>,
  options?: Options
): FromStream => ({
  [TypeId]: TypeId,
  _tag: "Stream",
  stream,
  ...withMeta(options)
})

/**
 * An {@link InputFile} that Telegram fetches from a URL server-side. Unlike the
 * other constructors this uploads nothing - it is sent inline as a string.
 *
 * @example
 * import { InputFile } from "@fibergram/client"
 *
 * const photo = InputFile.fromUrl("https://example.com/cat.png")
 *
 * @category constructors
 * @since 0.1.0
 */
export const fromUrl = (url: string): Url => ({
  [TypeId]: TypeId,
  _tag: "Url",
  url
})

/**
 * Type guard: is `u` an {@link InputFile}? Used by the transport seam to find
 * files anywhere in an encoded payload.
 *
 * @example
 * import { InputFile } from "@fibergram/client"
 *
 * const yes = InputFile.isInputFile(InputFile.fromUrl("https://example.com/a.png"))
 * const no = InputFile.isInputFile("file_id_123")
 *
 * @category guards
 * @since 0.1.0
 */
export const isInputFile = (u: unknown): u is InputFile =>
  typeof u === "object" && u !== null && TypeId in u

/**
 * Whether this file is uploaded as a multipart part (everything but {@link Url},
 * which is sent inline).
 *
 * @example
 * import { InputFile } from "@fibergram/client"
 *
 * const uploaded = InputFile.isUpload(InputFile.fromPath("./a.png"))
 *
 * @category refinements
 * @since 0.1.0
 */
export const isUpload = (file: InputFile): file is Path | Bytes | FromStream => file._tag !== "Url"

/**
 * Resolves an uploaded {@link InputFile} to a `Blob` and filename for a multipart
 * part. Dies if called on a {@link Url} (which is never uploaded) - the seam only
 * calls this after {@link isUpload}. Internal to the transport.
 *
 * @example
 * import { InputFile } from "@fibergram/client"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const part = yield* InputFile.toBlob(InputFile.fromBytes(new Uint8Array([1])))
 *   return part.filename
 * })
 *
 * @category destructors
 * @since 0.1.0
 */
export const toBlob = (
  file: InputFile
): Effect.Effect<{ readonly blob: Blob; readonly filename: string }> => {
  switch (file._tag) {
    case "Bytes":
      return Effect.sync(() => ({
        // Cast via `Blob`'s own signature: the generic `Uint8Array<ArrayBufferLike>` is a
        // `BufferSource` but not seen as a `BlobPart` under the DOM lib docgen uses. Naming
        // the constructor parameter (rather than the `BlobPart` global) works under both libs.
        blob: new Blob(
          [file.bytes] as ConstructorParameters<typeof Blob>[0],
          file.contentType !== undefined ? { type: file.contentType } : {}
        ),
        filename: file.filename ?? DEFAULT_FILENAME
      }))
    case "Path":
      return Effect.promise(() =>
        NodeFs.openAsBlob(file.path, file.contentType !== undefined ? { type: file.contentType } : undefined)
      ).pipe(
        Effect.map((blob) => ({
          blob,
          filename: file.filename ?? NodePath.basename(file.path)
        }))
      )
    case "Stream":
      return Effect.promise(() => new Response(Stream.toReadableStream(file.stream)).blob()).pipe(
        Effect.map((raw) => ({
          blob: file.contentType !== undefined ? new Blob([raw], { type: file.contentType }) : raw,
          filename: file.filename ?? DEFAULT_FILENAME
        }))
      )
    case "Url":
      return Effect.die(new Error("fibergram: InputFile.toBlob called on a URL input file"))
  }
}
