/**
 * The codegen program: the Effect that reads the spec, renders the modules, splices each
 * body onto its preserved manual suffix, and either writes them or (`--check`) fails if
 * they drift. Wrapped as an `effect/unstable/cli` {@link command}. Pure orchestration —
 * the Node platform lives in {@link module:runtime}, the rendering in {@link module:render}.
 */
import { Data, Effect, FileSystem, Path } from "effect"
import { Command, Flag } from "effect/unstable/cli"
import { MANUAL_MARKER } from "./constants.ts"
import { type GeneratedFile, renderAll } from "./render.ts"
import { parseSpec, SpecError } from "./spec.ts"

/** `--check` found generated files that are out of date. */
class StaleOutputError extends Data.TaggedError("StaleOutputError")<{
  readonly files: ReadonlyArray<string>
}> {}

interface CodegenOptions {
  readonly spec: string
  readonly outDir: string
  readonly check: boolean
}

/**
 * Read a target file, splice the generated body above its preserved manual suffix,
 * and report whether the result differs from what is on disk.
 */
const materialize = (outDir: string, file: GeneratedFile) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    const full = path.join(outDir, file.name)
    const existing = (yield* fs.exists(full)) ? yield* fs.readFileString(full) : ""
    const markerAt = existing.indexOf(MANUAL_MARKER)
    const suffix = markerAt === -1 ? "" : "\n" + existing.slice(markerAt)
    const final = file.body + suffix
    return { path: full, final, changed: final !== existing }
  })

const run = (options: CodegenOptions) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const spec = yield* fs.readFileString(options.spec).pipe(
      Effect.mapError((cause) => new SpecError({ cause })),
      Effect.flatMap(parseSpec)
    )
    const { files, summary } = renderAll(spec)
    const targets = yield* Effect.forEach(files, (f) => materialize(options.outDir, f))

    if (options.check) {
      const stale = targets.filter((t) => t.changed).map((t) => t.path)
      if (stale.length > 0) {
        yield* Effect.logError(
          `Generated files are out of date — run \`pnpm codegen\`:\n  ${stale.join("\n  ")}`
        )
        return yield* new StaleOutputError({ files: stale })
      }
      return yield* Effect.log(`${summary} (check: up to date)`)
    }

    yield* Effect.forEach(targets, (t) => fs.writeFileString(t.path, t.final), { discard: true })
    yield* Effect.log(summary)
  })

const here = import.meta.dirname

/** The `fibergram-codegen` CLI: `--spec`, `--out-dir`, `--check`. */
export const command = Command.make(
  "fibergram-codegen",
  {
    spec: Flag.string("spec").pipe(
      Flag.withDefault(`${here}/api.json`),
      Flag.withDescription("Path to the Telegram Bot API spec (api.json).")
    ),
    outDir: Flag.string("out-dir").pipe(
      Flag.withDefault(`${here}/../src/generated`),
      Flag.withDescription("Directory to write the generated modules into.")
    ),
    check: Flag.boolean("check").pipe(
      Flag.withDescription("Do not write; fail if any generated file differs from disk (CI).")
    )
  },
  run
)
