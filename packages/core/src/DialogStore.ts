/**
 * `DialogStore` - the persistence port for folded dialog state, keyed by
 * {@link module:DialogAddress.toKey}. This ships the in-memory backend; the
 * durable backend (event-sourced, passivating) lands behind the same port
 * later (design section 6, section 8).
 *
 * State is stored as `unknown`: the {@link module:EntityManager.EntityManager}
 * owns the `Dialog` and therefore the concrete `State` type. A typed, schema-
 * migrated store is a later milestone.
 *
 * @since 0.1.0
 */
import { Context, Effect, HashMap, Layer, Ref } from "effect"

import type { Option} from "effect";

/**
 * The persistence port: load and save the folded state for a dialog address key.
 *
 * @category models
 * @since 0.1.0
 */
export interface DialogStoreService {
  readonly load: (key: string) => Effect.Effect<Option.Option<unknown>>
  readonly save: (key: string, state: unknown) => Effect.Effect<void>
}

/**
 * The `DialogStore` service tag.
 *
 * @example
 * import { DialogStore } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const store = yield* DialogStore.DialogStore
 *   yield* store.save("default:1::", { count: 1 })
 * })
 *
 * @category services
 * @since 0.1.0
 */
export class DialogStore extends Context.Service<DialogStore, DialogStoreService>()(
  "@fibergram/core/DialogStore"
) {}

/**
 * An in-memory {@link DialogStore} backed by a `Ref<HashMap>`. State is lost on
 * restart - good for tests and stateless/short dialogs, not for durable
 * sessions.
 *
 * @example
 * import { DialogStore } from "@fibergram/core"
 * import { Layer } from "effect"
 *
 * const layer: Layer.Layer<DialogStore.DialogStore> = DialogStore.layerMemory
 *
 * @category layers
 * @since 0.1.0
 */
export const layerMemory: Layer.Layer<DialogStore> = Layer.effect(
  DialogStore,
  Effect.map(Ref.make(HashMap.empty<string, unknown>()), (ref) => ({
    load: (key) => Effect.map(Ref.get(ref), (map) => HashMap.get(map, key)),
    save: (key, state) => Ref.update(ref, HashMap.set(key, state))
  }))
)
