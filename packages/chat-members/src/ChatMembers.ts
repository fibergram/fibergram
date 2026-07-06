/**
 * `ChatMembers` - a chat-membership cache fed by `chat_member` updates (the
 * analogue of grammY's `@grammyjs/chat-members` plugin).
 *
 * Telegram only pushes a `chat_member` update when a membership *changes*, so a
 * bot that wants to answer "is this user in the chat / an admin?" without an API
 * round-trip has to remember what it has seen. This package does exactly that:
 * {@link route} is a core `Router` route that folds every `chat_member` update
 * into a `KeyValueStore`-backed cache, and the {@link ChatMembers} service reads
 * it back - {@link ChatMembersService.get} for a pure cache lookup,
 * {@link ChatMembersService.resolve} for cache-or-`getChatMember` with
 * write-back.
 *
 * The store port is `effect/unstable/persistence`'s `KeyValueStore` - the same
 * port `@fibergram/durable` uses for dialog snapshots - so the cache is
 * in-memory, on disk, or in SQL purely by Layer choice. Keys are namespaced
 * under {@link keyPrefix}; values are the decoded `camelCase`
 * {@link module:BotApi.ChatMember} as JSON. A store or (de)serialization failure
 * becomes a defect (`orDie`), mirroring the `DialogStore` port contract.
 *
 * Note that `chat_member` is not in Telegram's default update set - the bot must
 * subscribe explicitly. {@link route} carries `kinds: ["chatMember"]`, so a
 * router containing it derives the subscription automatically via
 * `Router.allowedUpdates`.
 *
 * @since 0.1.0
 */
import { Context, Effect, Layer, Option } from "effect"
import { KeyValueStore } from "effect/unstable/persistence"

import { Router } from "@fibergram/core"
import { TelegramClient } from "@fibergram/core/client"

import type { BotApi, TelegramError } from "@fibergram/core/client"

/**
 * The key namespace every cached membership is stored under, keeping fibergram's
 * keys from colliding with other users of the same `KeyValueStore`.
 *
 * @category constants
 * @since 0.1.0
 */
export const keyPrefix = "fibergram:chatMembers:" as const

/**
 * The cache surface: `get`/`set` talk to the store only, `resolve` falls back to
 * the `getChatMember` Bot API method on a miss and writes the answer back - so
 * it needs `TelegramClient` in `R` and can fail with `TelegramError`.
 *
 * A cached value is whatever status Telegram last reported, including `"left"`
 * and `"kicked"` - absence means "never seen", not "not a member".
 *
 * @category models
 * @since 0.1.0
 */
export interface ChatMembersService {
  /** The last membership seen for `userId` in `chatId`, if any. */
  readonly get: (
    chatId: number,
    userId: number
  ) => Effect.Effect<Option.Option<BotApi.ChatMember>>
  /** Overwrites the cached membership for `userId` in `chatId`. */
  readonly set: (
    chatId: number,
    userId: number,
    member: BotApi.ChatMember
  ) => Effect.Effect<void>
  /** {@link get}, falling back to `getChatMember` (and caching the answer) on a miss. */
  readonly resolve: (
    chatId: number,
    userId: number
  ) => Effect.Effect<
    BotApi.ChatMember,
    TelegramError.TelegramError,
    TelegramClient.TelegramClient
  >
}

/**
 * The `ChatMembers` service tag.
 *
 * @example
 * import { ChatMembers } from "@fibergram/chat-members"
 * import { Effect, Option } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const members = yield* ChatMembers.ChatMembers
 *   const cached = yield* members.get(-100, 42)
 *   return Option.isSome(cached)
 * }).pipe(Effect.provide(ChatMembers.layerMemory))
 *
 * @category services
 * @since 0.1.0
 */
export class ChatMembers extends Context.Service<ChatMembers, ChatMembersService>()(
  "@fibergram/chat-members/ChatMembers"
) {}

const keyOf = (chatId: number, userId: number): string => `${chatId}:${userId}`

/**
 * Builds a {@link ChatMembersService} over a `KeyValueStore`. Memberships are
 * JSON-encoded under {@link keyPrefix}. Store and JSON failures become defects.
 *
 * @example
 * import { ChatMembers } from "@fibergram/chat-members"
 * import { Effect } from "effect"
 * import { KeyValueStore } from "effect/unstable/persistence"
 *
 * const program = Effect.gen(function* () {
 *   const kvs = yield* KeyValueStore.KeyValueStore
 *   const members = ChatMembers.make(kvs)
 *   yield* members.set(-100, 42, {
 *     status: "member",
 *     user: { id: 42, isBot: false, firstName: "Ada" }
 *   })
 * }).pipe(Effect.provide(KeyValueStore.layerMemory))
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = (kvs: KeyValueStore.KeyValueStore): ChatMembersService => {
  const store = KeyValueStore.prefix(kvs, keyPrefix)

  const get = (
    chatId: number,
    userId: number
  ): Effect.Effect<Option.Option<BotApi.ChatMember>> =>
    store.get(keyOf(chatId, userId)).pipe(
      Effect.flatMap((raw) =>
        Option.match(Option.fromNullishOr(raw), {
          onNone: () => Effect.succeedNone,
          onSome: (json) =>
            Effect.map(
              Effect.try(() => JSON.parse(json) as unknown),
              (parsed) => Option.some(parsed as BotApi.ChatMember)
            )
        })),
      Effect.orDie
    )

  const set = (
    chatId: number,
    userId: number,
    member: BotApi.ChatMember
  ): Effect.Effect<void> =>
    Effect.try(() => JSON.stringify(member)).pipe(
      Effect.flatMap((json) => store.set(keyOf(chatId, userId), json)),
      Effect.orDie
    )

  const resolve = (
    chatId: number,
    userId: number
  ): Effect.Effect<
    BotApi.ChatMember,
    TelegramError.TelegramError,
    TelegramClient.TelegramClient
  > =>
    Effect.flatMap(
      get(chatId, userId),
      Option.match({
        onSome: Effect.succeed,
        onNone: () =>
          Effect.gen(function* () {
            const tg = yield* TelegramClient.TelegramClient
            const member = yield* tg.getChatMember({ chatId, userId })
            yield* set(chatId, userId, member)
            return member
          })
      })
    )

  return { get, set, resolve }
}

/**
 * A {@link ChatMembers} Layer backed by whatever `KeyValueStore` is in context -
 * compose it with a concrete store Layer (`KeyValueStore.layerFileSystem`,
 * `KeyValueStore.layerSql`, ...) for a cache that survives a restart.
 *
 * @example
 * import { ChatMembers } from "@fibergram/chat-members"
 * import { Layer } from "effect"
 * import { KeyValueStore } from "effect/unstable/persistence"
 *
 * const members: Layer.Layer<ChatMembers.ChatMembers> = ChatMembers.layer.pipe(
 *   Layer.provide(KeyValueStore.layerMemory)
 * )
 *
 * @category layers
 * @since 0.1.0
 */
export const layer: Layer.Layer<ChatMembers, never, KeyValueStore.KeyValueStore> =
  Layer.effect(ChatMembers, Effect.map(KeyValueStore.KeyValueStore, make))

/**
 * A self-contained {@link ChatMembers} Layer over an **in-memory**
 * `KeyValueStore`. The cache is lost on restart - fine, since {@link resolve}
 * refills it lazily from the API.
 *
 * @example
 * import { ChatMembers } from "@fibergram/chat-members"
 * import { Layer } from "effect"
 *
 * const members: Layer.Layer<ChatMembers.ChatMembers> = ChatMembers.layerMemory
 *
 * @category layers
 * @since 0.1.0
 */
export const layerMemory: Layer.Layer<ChatMembers> = layer.pipe(
  Layer.provide(KeyValueStore.layerMemory)
)

/**
 * The ingestion side of the cache: a core `Router` route that folds every
 * `chat_member` update into the store (`newChatMember`, keyed by chat and
 * affected user). Add it to the bot's router next to the business routes; since
 * it carries `kinds: ["chatMember"]`, `Router.allowedUpdates` derives the
 * `chat_member` subscription automatically.
 *
 * @example
 * import { ChatMembers } from "@fibergram/chat-members"
 * import { Router } from "@fibergram/core"
 *
 * const router = Router.make(ChatMembers.route)
 * // ["chat_member"] - the subscription is derived, not hand-written
 * const allowed = Router.allowedUpdates(router)
 *
 * @category routes
 * @since 0.1.0
 */
export const route: Router.Route<never, ChatMembers> = Router.on(
  "chatMember",
  (update) =>
    Effect.flatMap(ChatMembers, (members) =>
      members.set(update.chat.id, update.newChatMember.user.id, update.newChatMember))
)
