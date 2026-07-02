/**
 * fibergram Bot API code generator.
 *
 * Reads the machine-readable Telegram Bot API spec
 * (github.com/PaulSonOfLars/telegram-bot-api-spec, `api.json`) and regenerates the
 * *generated prefix* of three modules under `../src/generated/`:
 *
 *   - types.ts   — every Bot API object as an Effect v4 `Schema` (snake_case → camelCase)
 *   - methods.ts — every method's `*Params` schema
 *   - client.ts  — the fully-typed `TelegramClientService` interface + `makeMethods` factory
 *
 * Each target file keeps a hand-written *manual suffix* below the `MANUAL_MARKER` line;
 * the generator overwrites everything above and preserves everything from the marker to
 * EOF verbatim.
 *
 * This file is only the wiring; the work is split across sibling modules:
 *   - {@link module:spec} / {@link module:atom} — the input model + type-string parsing
 *   - {@link module:model} — recursion analysis, emission order, `Schema`/TS expressions
 *   - {@link module:render} — pure spec → source text
 *   - {@link module:program} — the Effect orchestration + CLI command
 *   - {@link module:runtime} — the isolated Node platform layer
 *
 * Run on native Node (no bundler): `node --experimental-strip-types codegen/generate.ts`.
 * Flags: `--spec <path>`, `--out-dir <path>`, `--check` (fail if output differs — CI).
 */
import { Effect } from "effect"
import { Command } from "effect/unstable/cli"
import { command } from "./program.ts"
import { NodeCli } from "./runtime.ts"

Command.run(command, { version: "0.1.0" }).pipe(
  Effect.provide(NodeCli),
  Effect.runPromise
).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
