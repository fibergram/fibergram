# fibergram

> Effect-native framework for Telegram bots.
> **Status:** pre-implementation / scaffold · **Target:** Effect **v4** (beta)

A handler is an `Effect<A, E, R>` with typed errors, DI via `Layer`, updates as a
`Stream`, and long-lived dialogs as durable entities. The differentiator is not the Bot
API types but the **runtime integration with Effect**.

Full design: [`docs-ai/fibergram-design.md`](./docs-ai/fibergram-design.md).

## Packages

| Package | Responsibility | v4 risk |
|---|---|---|
| [`@fibergram/client`](./packages/client) | `TelegramClient` (Tag+Layer over `HttpClient`) + Bot API Schema types | low |
| [`@fibergram/core`](./packages/core) | `Dialog`/decider, `receive`, `Decision`, `EntityManager`, `Router`, typed errors, `CallbackData` | low |
| [`@fibergram/polling`](./packages/polling) | ingestion Layer: long polling + offset management | low |
| [`@fibergram/webhook`](./packages/webhook) | ingestion Layer: HttpServer + secret-token validation | medium |
| [`@fibergram/durable`](./packages/durable) | backend for long-lived sessions (workflow/cluster behind a port) | high |
| [`@fibergram/testing`](./packages/testing) | `TestTelegram`, synthetic updates | low |

## Development

```bash
pnpm install
pnpm build       # turbo run build (tsc -b across the graph)
pnpm typecheck
pnpm test        # vitest + @effect/vitest
pnpm circular    # madge --circular
```

Requirements: Node ≥ 20, pnpm 10.

`effect` is pinned to a specific beta (`4.0.0-beta.92`) in the
[`pnpm-workspace.yaml`](./pnpm-workspace.yaml) catalog — upgraded deliberately per
changelog (design §9).

### Conventions

- **Naming boundary (§5.3).** Bot API returns `snake_case`. It lives **only** in the
  edge Schema inside `@fibergram/client`, which maps `snake_case → camelCase` on decode
  and back on encode. Everywhere else the code is camelCase only.
- **Docs gate (§14.2).** Every public export carries JSDoc with a description, a
  compiling `@example`, `@since`, and optional `@category`. `pnpm docgen` is a CI gate.
- **Versioning.** Public behavior changes ship with a changeset (`pnpm changeset`).

## License

[MIT](./LICENSE)
