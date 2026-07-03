/**
 * Node platform bindings — the one impure, replaceable layer.
 *
 * effect-smol (beta) ships the CLI + platform *service definitions* but no bundled Node
 * platform layer, so `Command.run` (which requires the full `Environment`) needs these
 * hand-wired. FileSystem is backed by `node:fs/promises`; the rest are minimal (a codegen
 * tool needs args + logging, not a terminal or child processes). Delete this file once
 * effect ships a Node runtime.
 */
import { Effect, FileSystem, Layer, Path, Stdio, Terminal } from "effect"
import { ChildProcessSpawner } from "effect/unstable/process"
import * as NodeFs from "node:fs/promises"

const nodeFileSystem = FileSystem.makeNoop({
  exists: (path) => Effect.promise(() => NodeFs.access(path).then(() => true, () => false)),
  readFileString: (path) => Effect.promise(() => NodeFs.readFile(path, "utf8")),
  writeFileString: (path, data) => Effect.promise(() => NodeFs.writeFile(path, data))
})

const nodeTerminal = Terminal.make({
  columns: Effect.succeed(80),
  rows: Effect.succeed(24),
  // A codegen run is non-interactive: it never reads terminal input.
  readInput: Effect.die(new Error("fibergram-codegen: terminal input is not supported")),
  readLine: Effect.succeed(""),
  display: (text) =>
    Effect.sync(() => {
      process.stdout.write(text)
    })
})

/** Minimal Node `Environment` for `Command.run`: FileSystem, Path, argv, logging. */
export const NodeCli = Layer.mergeAll(
  Path.layer,
  Stdio.layerTest({ args: Effect.succeed(process.argv.slice(2)) }),
  Layer.succeed(FileSystem.FileSystem, nodeFileSystem),
  Layer.succeed(Terminal.Terminal, nodeTerminal),
  Layer.succeed(
    ChildProcessSpawner.ChildProcessSpawner,
    ChildProcessSpawner.make(() => {
      throw new Error("fibergram-codegen: child processes are not supported")
    })
  )
)
