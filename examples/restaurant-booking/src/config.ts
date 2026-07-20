/**
 * Runtime configuration, read once from the environment.
 *
 * The bot token itself is read by `TelegramClient.layer` (from `BOT_TOKEN`);
 * here we only carry the two knobs the handlers reference — the restaurant's
 * display name and the directory the durable `KeyValueStore` writes to.
 */
import { Config, Context, Effect, Layer } from "effect"

export interface AppConfigService {
  readonly restaurantName: string
  readonly dataDir: string
}

/** Ambient configuration service, provided once at the edge. */
export class AppConfig extends Context.Service<AppConfig, AppConfigService>()(
  "restaurant-booking/AppConfig"
) {}

const load: Effect.Effect<AppConfigService, Config.ConfigError> = Effect.gen(function* () {
  const restaurantName = yield* Config.string("RESTAURANT_NAME").pipe(
    Config.withDefault("Bella Vista")
  )
  const dataDir = yield* Config.string("DATA_DIR").pipe(Config.withDefault("./.data"))
  return { restaurantName, dataDir }
})

/** Builds {@link AppConfig} from `RESTAURANT_NAME` / `DATA_DIR` (both optional). */
export const layer: Layer.Layer<AppConfig, Config.ConfigError> = Layer.effect(AppConfig, load)

/** The restaurant name, for use inside handlers. */
export const restaurantName: Effect.Effect<string, never, AppConfig> = Effect.map(
  AppConfig,
  (c) => c.restaurantName
)
