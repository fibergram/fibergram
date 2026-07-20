/**
 * Entry point: wire every layer and run the bot on long polling.
 *
 * The dependency graph, bottom to top:
 *   AppConfig ─▶ KeyValueStore (filesystem) ─▶ PersistedDialogStore + repositories
 *   TelegramClient ─▶ (FetchHttpClient)
 *
 * A single filesystem `KeyValueStore` backs *everything* durable — wizard
 * progress, the persisted language preference, open menu navigation, and the
 * domain data — so a restart resumes exactly where the conversation left off.
 * Swap `Storage.layer` for `KeyValueStore.layerMemory` (ephemeral) or a SQL /
 * Redis layer and the whole bot follows.
 *
 * Run with `BOT_TOKEN=... pnpm start` (optionally `RESTAURANT_NAME`, `DATA_DIR`).
 */
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

import { Dedup, Dispatcher, Router } from "@fibergram/core"
import { TelegramClient } from "@fibergram/core/client"
import { Polling } from "@fibergram/core/polling"
import { FileKeyValueStore, PersistedDialogStore } from "@fibergram/durable"

import { conversations, rootDialog } from "./app.js"
import * as Config from "./config.js"
import * as Domain from "./domain.js"

const program = Effect.gen(function* () {
  const client = yield* TelegramClient.TelegramClient
  const me = yield* client.getMe()
  yield* Effect.log(`Starting @${me.username ?? "bot"} …`)

  // Publish the command menu straight from the manager's router — no hand list.
  yield* Router.setMyCommands(conversations.router)

  const updates = yield* Polling.make()
  yield* Effect.log("Bot is running. Send /start to begin.")
  yield* Dispatcher.run({ updates, dialog: rootDialog })
})

/**
 * A filesystem `KeyValueStore` rooted at `AppConfig.dataDir` — one file per key,
 * no external service. Swap it for `KeyValueStore.layerMemory` / a SQL / Redis
 * layer and the whole bot follows.
 */
const storage = Layer.unwrap(
  Effect.map(Config.AppConfig, (config) => FileKeyValueStore.layer(config.dataDir))
)

/** Durable storage shared by dialogs, sessions, i18n, and the repositories. */
const infrastructure = Layer.mergeAll(PersistedDialogStore.layer, Domain.layer).pipe(
  Layer.provideMerge(storage),
  Layer.provideMerge(Config.layer)
)

const MainLayer = Layer.mergeAll(
  infrastructure,
  Dedup.layerMemory,
  TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
)

Effect.runPromise(program.pipe(Effect.scoped, Effect.provide(MainLayer))).catch((error) => {
  console.error(error)
  // eslint-disable-next-line unicorn/no-process-exit -- this is the CLI entry point
  process.exit(1)
})
