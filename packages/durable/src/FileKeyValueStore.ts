/**
 * `FileKeyValueStore` - a durable `KeyValueStore` backed by the local
 * filesystem: one file per key under a single directory, no external service.
 * The `KeyValueStore` port is what `PersistedDialogStore`, `@fibergram/i18n`,
 * `@fibergram/menu` and typical domain repositories persist through, so this one
 * layer makes an entire polling deployment survive a restart - wizard progress,
 * language preference, open menu state, domain data - with nothing to run.
 *
 * The pinned Effect beta ships a filesystem `KeyValueStore` layer, but it needs a
 * hand-wired `FileSystem` service (the beta has no bundled Node runtime layer).
 * Implementing the five string operations of `KeyValueStore.makeStringOnly`
 * directly over `node:fs/promises` is simpler and just as idiomatic -
 * `makeStringOnly` derives `has`/`isEmpty`/`modify` and base64-bridges the binary
 * API. Swap this layer for `KeyValueStore.layerMemory`, a SQL layer, or Redis and
 * the whole bot follows.
 *
 * @since 0.1.0
 */
import { Effect, Layer } from "effect"
import { KeyValueStore } from "effect/unstable/persistence"
import * as NodeFs from "node:fs/promises"
import NodePath from "node:path"

const fail = (method: string, key: string, cause: unknown): KeyValueStore.KeyValueStoreError =>
  new KeyValueStore.KeyValueStoreError({
    method,
    key,
    message: `fibergram: filesystem key/value store: ${method} failed for ${key}`,
    cause
  })

const isNotFound = (cause: unknown): boolean =>
  typeof cause === "object" && cause !== null && (cause as { code?: string }).code === "ENOENT"

/**
 * Builds a filesystem-backed {@link !KeyValueStore.KeyValueStore} rooted at
 * `directory` (which must already exist - {@link layer} creates it for you). Keys
 * are `encodeURIComponent`-escaped into file names, so any string key is safe.
 *
 * @example
 * import { FileKeyValueStore } from "@fibergram/durable"
 *
 * const store = FileKeyValueStore.make("./.data")
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = (directory: string): KeyValueStore.KeyValueStore => {
  const pathFor = (key: string): string => NodePath.join(directory, encodeURIComponent(key))

  return KeyValueStore.makeStringOnly({
    get: (key) =>
      Effect.tryPromise({
        try: () => NodeFs.readFile(pathFor(key), "utf8"),
        catch: (cause) => fail("get", key, cause)
      }).pipe(Effect.catchIf(
        (error) => isNotFound(error.cause),
        // A missing file is simply an absent key.
        () => Effect.undefined
      )),
    set: (key, value) =>
      Effect.tryPromise({
        try: () => NodeFs.writeFile(pathFor(key), value, "utf8"),
        catch: (cause) => fail("set", key, cause)
      }),
    remove: (key) =>
      Effect.tryPromise({
        try: () => NodeFs.rm(pathFor(key), { force: true }),
        catch: (cause) => fail("remove", key, cause)
      }),
    clear: Effect.tryPromise({
      try: async () => {
        await NodeFs.rm(directory, { recursive: true, force: true })
        await NodeFs.mkdir(directory, { recursive: true })
      },
      catch: (cause) => fail("clear", "*", cause)
    }),
    size: Effect.tryPromise({
      try: () => NodeFs.readdir(directory),
      catch: (cause) => fail("size", "*", cause)
    }).pipe(Effect.map((entries) => entries.length))
  })
}

/**
 * A filesystem-backed {@link !KeyValueStore.KeyValueStore} `Layer` rooted at
 * `directory`. The directory (and any parents) is created when the layer builds,
 * so it works on a fresh machine with no setup.
 *
 * @example
 * import { FileKeyValueStore } from "@fibergram/durable"
 * import { PersistedDialogStore } from "@fibergram/durable"
 * import { Layer } from "effect"
 *
 * const storage = FileKeyValueStore.layer("./.data")
 * const dialogs = PersistedDialogStore.layer.pipe(Layer.provide(storage))
 *
 * @category layers
 * @since 0.1.0
 */
export const layer = (directory: string): Layer.Layer<KeyValueStore.KeyValueStore> =>
  Layer.effect(
    KeyValueStore.KeyValueStore,
    Effect.as(
      Effect.promise(() => NodeFs.mkdir(directory, { recursive: true })),
      make(directory)
    )
  )
