import { it } from "@effect/vitest"
import { Effect } from "effect"
import { KeyValueStore } from "effect/unstable/persistence"
import * as NodeFs from "node:fs/promises"
import NodeOs from "node:os"
import NodePath from "node:path"
import { describe, expect } from "vitest"

import { FileKeyValueStore } from "@fibergram/durable"

const withTempDir = <A, E>(f: (dir: string) => Effect.Effect<A, E>): Effect.Effect<A, E> =>
  Effect.acquireUseRelease(
    Effect.promise(() => NodeFs.mkdtemp(NodePath.join(NodeOs.tmpdir(), "fibergram-kvs-"))),
    f,
    (dir) => Effect.promise(() => NodeFs.rm(dir, { recursive: true, force: true }))
  )

describe("FileKeyValueStore", () => {
  it.effect("round-trips string values through the store operations", () =>
    withTempDir((dir) =>
      Effect.gen(function* () {
        const store = FileKeyValueStore.make(dir)

        expect(yield* store.get("missing")).toBeUndefined()
        yield* store.set("a", "1")
        yield* store.set("b", "2")
        expect(yield* store.get("a")).toBe("1")
        expect(yield* store.has("b")).toBe(true)
        expect(yield* store.size).toBe(2)

        yield* store.remove("a")
        expect(yield* store.get("a")).toBeUndefined()
        expect(yield* store.size).toBe(1)

        yield* store.clear
        expect(yield* store.size).toBe(0)
      })))

  it.effect("escapes keys so slashes and colons are safe file names", () =>
    withTempDir((dir) =>
      Effect.gen(function* () {
        const store = FileKeyValueStore.make(dir)
        yield* store.set("session:user/42", "hi")
        expect(yield* store.get("session:user/42")).toBe("hi")
      })))

  it.effect("the layer creates the directory and persists across fresh stores", () =>
    withTempDir((parent) =>
      Effect.gen(function* () {
        const dir = NodePath.join(parent, "nested", "data")
        // First store writes through the layer (which creates `dir`).
        yield* Effect.provide(
          Effect.flatMap(KeyValueStore.KeyValueStore, (kvs) => kvs.set("k", "v")),
          FileKeyValueStore.layer(dir)
        )
        // A brand-new store over the same dir sees the persisted value.
        expect(yield* FileKeyValueStore.make(dir).get("k")).toBe("v")
      })))
})
