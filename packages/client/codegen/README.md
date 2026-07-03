# codegen

Regenerates the Bot API layer of `@fibergram/client` from the machine-readable
Telegram Bot API spec
([PaulSonOfLars/telegram-bot-api-spec](https://github.com/PaulSonOfLars/telegram-bot-api-spec)).

Generated output (do **not** hand-edit above the marker):

- `../src/generated/types.ts` — every Bot API object as an Effect v4 `Schema`
  (`snake_case` → `camelCase` via `Schema.encodeKeys`; recursive types via `Schema.suspend`)
- `../src/generated/methods.ts` — every method's `*Params` request schema
- `../src/generated/client.ts` — the fully-typed `TelegramClientService` interface +
  `makeMethods` factory (all 180 methods)

## Usage

From the repository root:

```bash
pnpm codegen:fetch   # download the latest api.json into packages/client/codegen/
pnpm codegen         # regenerate + rebuild @fibergram/client
```

Or from this package: `pnpm --filter @fibergram/client codegen` (runs
`node --experimental-strip-types codegen/generate.ts`).

## How it works

The generator (`generate.ts`) is an **Effect CLI** (`effect/unstable/cli`) run on
**native Node** — no bundler, no `tsx`:

```bash
node --experimental-strip-types codegen/generate.ts [flags]
```

Node ≥ 22.6 strips the type annotations at load time (Node ≥ 23.6 does it without the
flag). The script deliberately avoids TS features that need *transformation* rather than
*stripping* (parameter properties, enums, namespaces).

The whole program is an `Effect`: IO goes through the `FileSystem` service, failures are
typed (`SpecError`, `StaleOutputError`), and progress is an `Effect.log`. The Node
platform bindings (FileSystem over `node:fs`, plus minimal Stdio/Terminal) are the one
isolated `NodeCli` layer in `runtime.ts` — effect-smol (beta) ships the CLI but no bundled
Node runtime yet, so `Command.run` needs them hand-wired.

The generator is split into small, pure modules (imported by explicit `.ts` specifier —
type stripping does not rewrite import paths):

| Module | Responsibility |
|---|---|
| `constants.ts` | manual-suffix marker, skipped types, discriminator regex |
| `naming.ts` | `snake_case`↔`camelCase`, `oneLine`, `jsdoc` — pure `string → string` |
| `spec.ts` | raw `api.json` shape + `SpecError` + `parseSpec` (the input model) |
| `atom.ts` | classify a spec type-string into a tagged `TypeAtom` tree |
| `model.ts` | recursion analysis (Tarjan SCC), emission order, `Schema`/TS expressions |
| `render.ts` | pure spec → the three module bodies |
| `runtime.ts` | the isolated Node platform layer (`NodeCli`) |
| `program.ts` | the Effect orchestration + the `effect/unstable/cli` command |
| `generate.ts` | entry point: provide `NodeCli`, run the command |

**Flags** (`--help` for the full list):

| Flag | Default | Purpose |
|---|---|---|
| `--spec <path>` | `codegen/api.json` | Bot API spec to read |
| `--out-dir <path>` | `src/generated` | where to write the modules |
| `--check` | off | don't write; **exit 1** if any file differs from disk (CI) |

It reads `api.json`, builds an internal model, and emits Effect Schemas:

- **Naming boundary (design §5.3).** Structs are defined with `camelCase` keys; a
  `Schema.encodeKeys({...})` map renames back to `snake_case` on encode. `snake_case`
  exists **only** in the generated `encodeKeys` maps — nowhere else in the codebase.
- **Unions.** The 25 union types become `Schema.Union([...])`. Members with a literal
  discriminator (detected from `... always "x"` in the field description) narrow that
  field to `Schema.Literal("x")`, so the structural union decodes unambiguously.
- **Recursive types** (42 of them, e.g. `Message`, the `RichText`/`RichBlock` families)
  are found by SCC analysis. Back-references become
  `Schema.suspend((): Schema.Codec<T, unknown> => T)`; each gets one explicit decoded
  `interface`. `Codec`'s encoded param is covariant, so `unknown` accepts the real
  `snake_case` encoded shape without a second interface.
- **docgen gate.** Every generated export carries a `@since` tag (the only tag docgen
  enforces), plus a description and `@category`.

### `InputFile`

`InputFile` is not a real struct in the spec (it is in `SKIP_TYPES`), so the generator
emits it by hand — near the **top** of `types.ts`, bound to the hand-written
`../src/InputFile.js` module (`Schema.declare` passthrough guard). It must precede the
structs because the broadened `InputMedia*` file fields reference it.

Nested file fields (`InputMediaPhoto.media`, `InputMediaVideo.thumbnail`, ...) are typed
`String` in the spec but their prose documents multipart upload via `attach://`. The
renderer broadens any single-`String` field whose description mentions
`multipart/form-data` to `Schema.Union([InputFile, Schema.String])`, so an `InputFile`
can be nested in a media group and the transport seam can find it.

### Manual suffix

Each generated file preserves everything from the marker line to EOF verbatim:

```ts
// === MANUAL — not regenerated below (codegen) ===
```

The marker is currently a no-op tail (nothing below it); it stays so future by-hand
additions survive regeneration. The transport itself (HTTP `call`, token, multipart
switch, error mapping) lives by hand in `../src/TelegramClient.ts` and `../src/Multipart.ts`,
which consume the generated `makeMethods` factory.

## Bumping the Bot API version

1. `pnpm codegen:fetch`
2. `pnpm codegen`
3. `git diff packages/client/src/generated` — the diff should be new/changed types,
   params and methods only; the `InputFile` manual block must be untouched.
4. `pnpm typecheck && pnpm test` — fix any downstream call sites the new spec changed
   (e.g. a method whose return type or params were revised).
