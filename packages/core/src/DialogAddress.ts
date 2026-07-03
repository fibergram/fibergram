/**
 * Dialog addressing - a dialog is a virtual actor with a stable address
 *. The address is the mailbox key: ordering is guaranteed *within*
 * an address, concurrency is allowed *between* addresses.
 *
 * The `KeyExtractor` is pluggable because different bots want different address
 * shapes (per-chat, per-user, per-thread).
 *
 * @since 0.1.0
 */
import { Option } from "effect"

import type { BotApi } from "@fibergram/client"

/**
 * The stable identity of a dialog. `kind` distinguishes co-located dialog types
 * (e.g. `"registration"` vs `"combat"`) in the same chat; `threadId` shards by
 * Forum Topic; `fromId` opts into per-user (rather than per-chat) dialogs.
 *
 * @category models
 * @since 0.1.0
 */
export interface DialogAddress {
  readonly chatId: number
  readonly threadId?: number
  readonly fromId?: number
  readonly kind: string
}

/**
 * Extracts the {@link DialogAddress} an update belongs to, or `None` to drop the
 * update. Pluggable per bot.
 *
 * @category models
 * @since 0.1.0
 */
export type KeyExtractor = (update: BotApi.Update) => Option.Option<DialogAddress>

/**
 * A stable, collision-free string key for a {@link DialogAddress} - the mailbox
 * identity used by the {@link module:EntityManager.EntityManager}.
 *
 * @example
 * import { DialogAddress } from "@fibergram/core"
 *
 * DialogAddress.toKey({ chatId: 1, kind: "default" }) // "default:1::"
 *
 * @category combinators
 * @since 0.1.0
 */
export const toKey = (address: DialogAddress): string =>
  `${address.kind}:${address.chatId}:${address.threadId ?? ""}:${address.fromId ?? ""}`

/**
 * The message an update carries, if any (`message`, `editedMessage`, or the
 * message a `callbackQuery` was attached to).
 *
 * @category combinators
 * @since 0.1.0
 */
export const messageOf = (update: BotApi.Update): Option.Option<BotApi.Message> =>
  update.message !== undefined
    ? Option.some(update.message)
    : update.editedMessage !== undefined
      ? Option.some(update.editedMessage)
      : update.callbackQuery?.message !== undefined
        ? Option.some(update.callbackQuery.message)
        : Option.none()

/**
 * The sender of an update, if any - from a message, an edited message, or a
 * callback query (whose `from` is always present).
 *
 * @category combinators
 * @since 0.1.0
 */
export const senderOf = (update: BotApi.Update): Option.Option<BotApi.User> => {
  const user = update.message?.from ??
    update.editedMessage?.from ??
    update.callbackQuery?.from
  return Option.fromNullishOr(user)
}

/**
 * The default per-chat extractor. Addresses by `chatId` (plus Forum Topic
 * `threadId` when present); drops updates that carry no message. Pass a `kind`
 * to namespace the dialog type.
 *
 * @example
 * import { DialogAddress } from "@fibergram/core"
 *
 * const extract = DialogAddress.byChat("registration")
 *
 * @category constructors
 * @since 0.1.0
 */
export const byChat = (kind = "default"): KeyExtractor =>
  (update) =>
    Option.map(messageOf(update), (message) => ({
      chatId: message.chat.id,
      ...(message.messageThreadId !== undefined ? { threadId: message.messageThreadId } : {}),
      kind
    }))

/**
 * A per-user extractor: addresses by `(chatId, fromId)`, so each user in a group
 * gets an independent dialog. Drops updates with no sender.
 *
 * @example
 * import { DialogAddress } from "@fibergram/core"
 *
 * const extract = DialogAddress.byUser("survey")
 *
 * @category constructors
 * @since 0.1.0
 */
export const byUser = (kind = "default"): KeyExtractor =>
  (update) =>
    Option.flatMap(messageOf(update), (message) =>
      Option.map(senderOf(update), (sender) => ({
        chatId: message.chat.id,
        fromId: sender.id,
        ...(message.messageThreadId !== undefined ? { threadId: message.messageThreadId } : {}),
        kind
      })))

/**
 * The synthetic `chatId` used for `poll` updates, which carry neither a chat nor
 * a user (Telegram sends them only for polls the bot itself created).
 *
 * @category constructors
 * @since 0.1.0
 */
export const POLL_SYSTEM_CHAT_ID = -1

/**
 * The chat + sender identity an update belongs to, with the fields
 * {@link byUpdate} turns into a {@link DialogAddress}. `chatId` is always present:
 * chatless updates (inline/pre-checkout/shipping/chosen-inline) borrow the
 * sender's id, and `poll` uses {@link POLL_SYSTEM_CHAT_ID}.
 *
 * @category models
 * @since 0.1.0
 */
export interface Identity {
  readonly chatId: number
  readonly fromId?: number
  readonly threadId?: number
}

const identity = (chatId: number, fromId?: number, threadId?: number): Identity => ({
  chatId,
  ...(fromId !== undefined ? { fromId } : {}),
  ...(threadId !== undefined ? { threadId } : {})
})

const messageIdentity = (message: BotApi.Message): Identity =>
  identity(message.chat.id, message.from?.id, message.messageThreadId)

/**
 * Resolves the {@link Identity} of **any** update kind, not just message-bearing
 * ones - the total extraction that lets every update kind reach a handler.
 * Chat-bearing updates address by their chat; chatless updates (inline query,
 * pre-checkout, shipping, chosen inline result, purchased paid media) borrow the
 * sender's id as a synthetic chat; `poll` uses {@link POLL_SYSTEM_CHAT_ID}. `None`
 * only for an update carrying no recognised payload.
 *
 * @example
 * import { DialogAddress } from "@fibergram/core"
 * import { Option } from "effect"
 *
 * const id = DialogAddress.identityOf({
 *   updateId: 1,
 *   inlineQuery: { id: "q", from: { id: 42, isBot: false, firstName: "Ada" }, query: "hi", offset: "" }
 * })
 * // Option.some({ chatId: 42, fromId: 42 })
 * Option.getOrNull(id)
 *
 * @category combinators
 * @since 0.1.0
 */
export const identityOf = (update: BotApi.Update): Option.Option<Identity> => {
  const message = update.message ??
    update.editedMessage ??
    update.channelPost ??
    update.editedChannelPost ??
    update.businessMessage ??
    update.editedBusinessMessage ??
    update.guestMessage
  if (message !== undefined) return Option.some(messageIdentity(message))
  if (update.callbackQuery !== undefined) {
    const query = update.callbackQuery
    const chatId = query.message?.chat.id ?? query.from.id
    return Option.some(identity(chatId, query.from.id))
  }
  if (update.messageReaction !== undefined) {
    return Option.some(identity(update.messageReaction.chat.id, update.messageReaction.user?.id))
  }
  if (update.messageReactionCount !== undefined) {
    return Option.some(identity(update.messageReactionCount.chat.id))
  }
  if (update.myChatMember !== undefined) {
    return Option.some(identity(update.myChatMember.chat.id, update.myChatMember.from.id))
  }
  if (update.chatMember !== undefined) {
    return Option.some(identity(update.chatMember.chat.id, update.chatMember.from.id))
  }
  if (update.chatJoinRequest !== undefined) {
    return Option.some(identity(update.chatJoinRequest.chat.id, update.chatJoinRequest.from.id))
  }
  if (update.chatBoost !== undefined) return Option.some(identity(update.chatBoost.chat.id))
  if (update.removedChatBoost !== undefined) {
    return Option.some(identity(update.removedChatBoost.chat.id))
  }
  if (update.inlineQuery !== undefined) {
    return Option.some(identity(update.inlineQuery.from.id, update.inlineQuery.from.id))
  }
  if (update.chosenInlineResult !== undefined) {
    return Option.some(identity(update.chosenInlineResult.from.id, update.chosenInlineResult.from.id))
  }
  if (update.shippingQuery !== undefined) {
    return Option.some(identity(update.shippingQuery.from.id, update.shippingQuery.from.id))
  }
  if (update.preCheckoutQuery !== undefined) {
    return Option.some(identity(update.preCheckoutQuery.from.id, update.preCheckoutQuery.from.id))
  }
  if (update.purchasedPaidMedia !== undefined) {
    return Option.some(identity(update.purchasedPaidMedia.from.id, update.purchasedPaidMedia.from.id))
  }
  if (update.businessConnection !== undefined) {
    return Option.some(identity(update.businessConnection.userChatId, update.businessConnection.user.id))
  }
  if (update.pollAnswer !== undefined) {
    const fromId = update.pollAnswer.user?.id
    const chatId = update.pollAnswer.voterChat?.id ?? fromId ?? POLL_SYSTEM_CHAT_ID
    return Option.some(identity(chatId, fromId))
  }
  if (update.poll !== undefined) return Option.some(identity(POLL_SYSTEM_CHAT_ID))
  return Option.none()
}

/**
 * The chat id of any update, if it can be addressed at all - the `chatId` of
 * {@link identityOf}.
 *
 * @example
 * import { DialogAddress } from "@fibergram/core"
 * import { Option } from "effect"
 *
 * const chatId = DialogAddress.chatIdOf({
 *   updateId: 1,
 *   message: { messageId: 1, date: 0, chat: { id: 55, type: "private" }, text: "hi" }
 * })
 * Option.getOrNull(chatId) // 55
 *
 * @category combinators
 * @since 0.1.0
 */
export const chatIdOf = (update: BotApi.Update): Option.Option<number> =>
  Option.map(identityOf(update), (id) => id.chatId)

/**
 * The **total** per-chat extractor: addresses *every* update kind, not just
 * message-bearing ones (unlike {@link byChat}, which drops the rest). This is the
 * default the dispatcher installs, so `Router.on("inlineQuery")`,
 * `Router.reaction`, `Router.chatMember` and friends actually receive their
 * updates. Chatless updates address by their sender; `poll` by a system id.
 *
 * @example
 * import { DialogAddress } from "@fibergram/core"
 *
 * const extract = DialogAddress.byUpdate("router")
 *
 * @category constructors
 * @since 0.1.0
 */
export const byUpdate = (kind = "default"): KeyExtractor =>
  (update) => Option.map(identityOf(update), (id) => ({ ...id, kind }))
