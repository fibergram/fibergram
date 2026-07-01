/**
 * Dialog addressing - a dialog is a virtual actor with a stable address
 * (design section 4.2). The address is the mailbox key: ordering is guaranteed *within*
 * an address, concurrency is allowed *between* addresses (section 8).
 *
 * The `KeyExtractor` is pluggable because different bots want different address
 * shapes (per-chat, per-user, per-thread).
 *
 * @since 0.1.0
 */
import type { BotApi } from "@fibergram/client"
import { Option } from "effect"

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
 * update. Pluggable per bot (design section 4.2).
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
 * The message an update carries, if any (`message` or `editedMessage`).
 *
 * @category combinators
 * @since 0.1.0
 */
export const messageOf = (update: BotApi.Update): Option.Option<BotApi.Message> =>
  update.message !== undefined
    ? Option.some(update.message)
    : update.editedMessage !== undefined
      ? Option.some(update.editedMessage)
      : Option.none()

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
      message.from === undefined
        ? Option.none()
        : Option.some({
          chatId: message.chat.id,
          fromId: message.from.id,
          ...(message.messageThreadId !== undefined ? { threadId: message.messageThreadId } : {}),
          kind
        }))
