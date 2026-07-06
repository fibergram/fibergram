/**
 * `@fibergram/chat-members` - a chat-membership cache over `chat_member`
 * updates behind the `KeyValueStore` port (the analogue of grammY's
 * `@grammyjs/chat-members`): {@link module:ChatMembers.route} feeds the cache
 * from the update stream, the {@link module:ChatMembers.ChatMembers} service
 * reads it back with an optional `getChatMember` fallback.
 *
 * @since 0.1.0
 */

/**
 * The membership cache: service, store-backed Layers, and the `Router` route
 * that feeds it from `chat_member` updates.
 *
 * @since 0.1.0
 */
export * as ChatMembers from "./ChatMembers.js"
