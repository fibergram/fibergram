/**
 * The fully-typed `TelegramClientService` shape (every Bot API method) plus the
 * {@link makeMethods} factory that wires each method to a transport `call`. Generated
 * from the spec; the `call` seam (HTTP, token, error mapping) is provided by hand in
 * {@link module:TelegramClient}.
 *
 * @since 0.1.0
 */
import { Schema, type Effect } from "effect"
import type * as TelegramError from "../TelegramError.js"
import * as M from "./methods.js"
import * as T from "./types.js"

// Auto-generated from the Telegram Bot API spec (Bot API 10.1).
// Do NOT edit above the MANUAL marker — run `pnpm codegen` to regenerate.
/**
 * Low-level transport used by {@link makeMethods}: encodes params (if any) via `paramsSchema`, POSTs `method`, decodes the result via `resultSchema`.
 *
 * @category models
 * @since 0.1.0
 */
export type Call = <A>(
  method: string,
  paramsSchema: Schema.Codec<any, any, never, never> | null,
  resultSchema: Schema.Codec<A, any, never, never>,
  params: unknown
) => Effect.Effect<A, TelegramError.TelegramError>

/**
 * The Bot API surface: one `Effect` per method, failing with the typed Telegram error union.
 *
 * @category models
 * @since 0.1.0
 */
export interface TelegramClientService {
  /**
   * Use this method to add a new sticker to a set created by the bot. Emoji sticker sets can have up to 200 stickers. Other sticker sets can have up to 120 stickers. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly addStickerToSet: (params: M.AddStickerToSetParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to send answers to callback queries sent from inline keyboards. The answer will be displayed to the user as a notification at the top of the chat screen or as an alert. On success, True is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly answerCallbackQuery: (params: M.AnswerCallbackQueryParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to process a received chat join request query. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly answerChatJoinRequestQuery: (params: M.AnswerChatJoinRequestQueryParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to reply to a received guest message. On success, a SentGuestMessage object is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly answerGuestQuery: (params: M.AnswerGuestQueryParams) => Effect.Effect<T.SentGuestMessage, TelegramError.TelegramError>
  /**
   * Use this method to send answers to an inline query. On success, True is returned. No more than 50 results per query are allowed.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly answerInlineQuery: (params: M.AnswerInlineQueryParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Once the user has confirmed their payment and shipping details, the Bot API sends the final confirmation in the form of an Update with the field pre_checkout_query. Use this method to respond to such pre-checkout queries. On success, True is returned. Note: The Bot API must receive an answer within 10 seconds after the pre-checkout query was sent.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly answerPreCheckoutQuery: (params: M.AnswerPreCheckoutQueryParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * If you sent an invoice requesting a shipping address and the parameter is_flexible was specified, the Bot API will send an Update with a shipping_query field to the bot. Use this method to reply to shipping queries. On success, True is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly answerShippingQuery: (params: M.AnswerShippingQueryParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to set the result of an interaction with a Web App and send a corresponding message on behalf of the user to the chat from which the query originated. On success, a SentWebAppMessage object is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly answerWebAppQuery: (params: M.AnswerWebAppQueryParams) => Effect.Effect<T.SentWebAppMessage, TelegramError.TelegramError>
  /**
   * Use this method to approve a chat join request. The bot must be an administrator in the chat for this to work and must have the can_invite_users administrator right. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly approveChatJoinRequest: (params: M.ApproveChatJoinRequestParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to approve a suggested post in a direct messages chat. The bot must have the 'can_post_messages' administrator right in the corresponding channel chat. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly approveSuggestedPost: (params: M.ApproveSuggestedPostParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to ban a user in a group, a supergroup or a channel. In the case of supergroups and channels, the user will not be able to return to the chat on their own using invite links, etc., unless unbanned first. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly banChatMember: (params: M.BanChatMemberParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to ban a channel chat in a supergroup or a channel. Until the chat is unbanned, the owner of the banned chat won't be able to send messages on behalf of any of their channels. The bot must be an administrator in the supergroup or channel for this to work and must have the appropriate administrator rights. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly banChatSenderChat: (params: M.BanChatSenderChatParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to close the bot instance before moving it from one local server to another. You need to delete the webhook before calling this method to ensure that the bot isn't launched again after server restart. The method will return error 429 in the first 10 minutes after the bot is launched. Returns True on success. Requires no parameters.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly close: () => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to close an open topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights, unless it is the creator of the topic. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly closeForumTopic: (params: M.CloseForumTopicParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to close an open 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly closeGeneralForumTopic: (params: M.CloseGeneralForumTopicParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Converts a given regular gift to Telegram Stars. Requires the can_convert_gifts_to_stars business bot right. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly convertGiftToStars: (params: M.ConvertGiftToStarsParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to copy messages of any kind. Service messages, paid media messages, giveaway messages, giveaway winners messages, and invoice messages can't be copied. A quiz poll can be copied only if the value of the field correct_option_id is known to the bot. The method is analogous to the method forwardMessage, but the copied message doesn't have a link to the original message. Returns the MessageId of the sent message on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly copyMessage: (params: M.CopyMessageParams) => Effect.Effect<T.MessageId, TelegramError.TelegramError>
  /**
   * Use this method to copy messages of any kind. If some of the specified messages can't be found or copied, they are skipped. Service messages, paid media messages, giveaway messages, giveaway winners messages, and invoice messages can't be copied. A quiz poll can be copied only if the value of the field correct_option_id is known to the bot. The method is analogous to the method forwardMessages, but the copied messages don't have a link to the original message. Album grouping is kept for copied messages. On success, an array of MessageId of the sent messages is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly copyMessages: (params: M.CopyMessagesParams) => Effect.Effect<ReadonlyArray<T.MessageId>, TelegramError.TelegramError>
  /**
   * Use this method to create an additional invite link for a chat. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. The link can be revoked using the method revokeChatInviteLink. Returns the new invite link as ChatInviteLink object.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly createChatInviteLink: (params: M.CreateChatInviteLinkParams) => Effect.Effect<T.ChatInviteLink, TelegramError.TelegramError>
  /**
   * Use this method to create a subscription invite link for a channel chat. The bot must have the can_invite_users administrator rights. The link can be edited using the method editChatSubscriptionInviteLink or revoked using the method revokeChatInviteLink. Returns the new invite link as a ChatInviteLink object.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly createChatSubscriptionInviteLink: (params: M.CreateChatSubscriptionInviteLinkParams) => Effect.Effect<T.ChatInviteLink, TelegramError.TelegramError>
  /**
   * Use this method to create a topic in a forum supergroup chat or a private chat with a user. In the case of a supergroup chat the bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator right. Returns information about the created topic as a ForumTopic object.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly createForumTopic: (params: M.CreateForumTopicParams) => Effect.Effect<T.ForumTopic, TelegramError.TelegramError>
  /**
   * Use this method to create a link for an invoice. Returns the created invoice link as String on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly createInvoiceLink: (params: M.CreateInvoiceLinkParams) => Effect.Effect<string, TelegramError.TelegramError>
  /**
   * Use this method to create a new sticker set owned by a user. The bot will be able to edit the sticker set thus created. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly createNewStickerSet: (params: M.CreateNewStickerSetParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to decline a chat join request. The bot must be an administrator in the chat for this to work and must have the can_invite_users administrator right. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly declineChatJoinRequest: (params: M.DeclineChatJoinRequestParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to decline a suggested post in a direct messages chat. The bot must have the 'can_manage_direct_messages' administrator right in the corresponding channel chat. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly declineSuggestedPost: (params: M.DeclineSuggestedPostParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to remove up to 10000 recent reactions in a group or a supergroup chat added by a given user or chat. The bot must have the 'can_delete_messages' administrator right in the chat. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly deleteAllMessageReactions: (params: M.DeleteAllMessageReactionsParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Delete messages on behalf of a business account. Requires the can_delete_sent_messages business bot right to delete messages sent by the bot itself, or the can_delete_all_messages business bot right to delete any message. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly deleteBusinessMessages: (params: M.DeleteBusinessMessagesParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to delete a chat photo. Photos can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly deleteChatPhoto: (params: M.DeleteChatPhotoParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to delete a group sticker set from a supergroup. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Use the field can_set_sticker_set optionally returned in getChat requests to check if the bot can use this method. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly deleteChatStickerSet: (params: M.DeleteChatStickerSetParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to delete a forum topic along with all its messages in a forum supergroup chat or a private chat with a user. In the case of a supergroup chat the bot must be an administrator in the chat for this to work and must have the can_delete_messages administrator rights. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly deleteForumTopic: (params: M.DeleteForumTopicParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to delete a message, including service messages, with the following limitations: - A message can only be deleted if it was sent less than 48 hours ago. - Service messages about a supergroup, channel, or forum topic creation can't be deleted. - A dice message in a private chat can only be deleted if it was sent more than 24 hours ago. - Bots can delete outgoing messages in private chats, groups, and supergroups. - Bots can delete incoming messages in private chats. - Bots granted can_post_messages permissions can delete outgoing messages in channels. - If the bot is an administrator of a group, it can delete any message there. - If the bot has can_delete_messages administrator right in a supergroup or a channel, it can delete any message there. - If the bot has can_manage_direct_messages administrator right in a channel, it can delete any message in the corresponding direct messages chat. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly deleteMessage: (params: M.DeleteMessageParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to remove a reaction from a message in a group or a supergroup chat. The bot must have the 'can_delete_messages' administrator right in the chat. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly deleteMessageReaction: (params: M.DeleteMessageReactionParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to delete multiple messages simultaneously. If some of the specified messages can't be found, they are skipped. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly deleteMessages: (params: M.DeleteMessagesParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to delete the list of the bot's commands for the given scope and user language. After deletion, higher level commands will be shown to affected users. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly deleteMyCommands: (params?: M.DeleteMyCommandsParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to delete a sticker from a set created by the bot. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly deleteStickerFromSet: (params: M.DeleteStickerFromSetParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to delete a sticker set that was created by the bot. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly deleteStickerSet: (params: M.DeleteStickerSetParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Deletes a story previously posted by the bot on behalf of a managed business account. Requires the can_manage_stories business bot right. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly deleteStory: (params: M.DeleteStoryParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to remove webhook integration if you decide to switch back to getUpdates. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly deleteWebhook: (params?: M.DeleteWebhookParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to edit a non-primary invite link created by the bot. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns the edited invite link as a ChatInviteLink object.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly editChatInviteLink: (params: M.EditChatInviteLinkParams) => Effect.Effect<T.ChatInviteLink, TelegramError.TelegramError>
  /**
   * Use this method to edit a subscription invite link created by the bot. The bot must have the can_invite_users administrator rights. Returns the edited invite link as a ChatInviteLink object.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly editChatSubscriptionInviteLink: (params: M.EditChatSubscriptionInviteLinkParams) => Effect.Effect<T.ChatInviteLink, TelegramError.TelegramError>
  /**
   * Use this method to edit name and icon of a topic in a forum supergroup chat or a private chat with a user. In the case of a supergroup chat the bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights, unless it is the creator of the topic. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly editForumTopic: (params: M.EditForumTopicParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to edit the name of the 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly editGeneralForumTopic: (params: M.EditGeneralForumTopicParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to edit captions of messages. On success, if the edited message is not an inline message, the edited Message is returned, otherwise True is returned. Note that business messages that were not sent by the bot and do not contain an inline keyboard can only be edited within 48 hours from the time they were sent.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly editMessageCaption: (params?: M.EditMessageCaptionParams) => Effect.Effect<T.Message | boolean, TelegramError.TelegramError>
  /**
   * Use this method to edit a checklist on behalf of a connected business account. On success, the edited Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly editMessageChecklist: (params: M.EditMessageChecklistParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to edit live location messages. A location can be edited until its live_period expires or editing is explicitly disabled by a call to stopMessageLiveLocation. On success, if the edited message is not an inline message, the edited Message is returned, otherwise True is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly editMessageLiveLocation: (params: M.EditMessageLiveLocationParams) => Effect.Effect<T.Message | boolean, TelegramError.TelegramError>
  /**
   * Use this method to edit animation, audio, document, live photo, photo, or video messages, or to replace a text or a rich message with a media. If a message is part of a message album, then it can be edited only to an audio for audio albums, only to a document for document albums and to a photo, a live photo, or a video otherwise. When an inline message is edited, a new file can't be uploaded; use a previously uploaded file via its file_id or specify a URL. On success, if the edited message is not an inline message, the edited Message is returned, otherwise True is returned. Note that business messages that were not sent by the bot and do not contain an inline keyboard can only be edited within 48 hours from the time they were sent.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly editMessageMedia: (params: M.EditMessageMediaParams) => Effect.Effect<T.Message | boolean, TelegramError.TelegramError>
  /**
   * Use this method to edit only the reply markup of messages. On success, if the edited message is not an inline message, the edited Message is returned, otherwise True is returned. Note that business messages that were not sent by the bot and do not contain an inline keyboard can only be edited within 48 hours from the time they were sent.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly editMessageReplyMarkup: (params?: M.EditMessageReplyMarkupParams) => Effect.Effect<T.Message | boolean, TelegramError.TelegramError>
  /**
   * Use this method to edit text, rich and game messages. On success, if the edited message is not an inline message, the edited Message is returned, otherwise True is returned. Note that business messages that were not sent by the bot and do not contain an inline keyboard can only be edited within 48 hours from the time they were sent.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly editMessageText: (params?: M.EditMessageTextParams) => Effect.Effect<T.Message | boolean, TelegramError.TelegramError>
  /**
   * Edits a story previously posted by the bot on behalf of a managed business account. Requires the can_manage_stories business bot right. Returns Story on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly editStory: (params: M.EditStoryParams) => Effect.Effect<T.Story, TelegramError.TelegramError>
  /**
   * Allows the bot to cancel or re-enable extension of a subscription paid in Telegram Stars. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly editUserStarSubscription: (params: M.EditUserStarSubscriptionParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to generate a new primary invite link for a chat; any previously generated primary link is revoked. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns the new invite link as String on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly exportChatInviteLink: (params: M.ExportChatInviteLinkParams) => Effect.Effect<string, TelegramError.TelegramError>
  /**
   * Use this method to forward messages of any kind. Service messages and messages with protected content can't be forwarded. On success, the sent Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly forwardMessage: (params: M.ForwardMessageParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to forward multiple messages of any kind. If some of the specified messages can't be found or forwarded, they are skipped. Service messages and messages with protected content can't be forwarded. Album grouping is kept for forwarded messages. On success, an array of MessageId of the sent messages is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly forwardMessages: (params: M.ForwardMessagesParams) => Effect.Effect<ReadonlyArray<T.MessageId>, TelegramError.TelegramError>
  /**
   * Returns the list of gifts that can be sent by the bot to users and channel chats. Requires no parameters. Returns a Gifts object.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getAvailableGifts: () => Effect.Effect<T.Gifts, TelegramError.TelegramError>
  /**
   * Returns the gifts received and owned by a managed business account. Requires the can_view_gifts_and_stars business bot right. Returns OwnedGifts on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getBusinessAccountGifts: (params: M.GetBusinessAccountGiftsParams) => Effect.Effect<T.OwnedGifts, TelegramError.TelegramError>
  /**
   * Returns the amount of Telegram Stars owned by a managed business account. Requires the can_view_gifts_and_stars business bot right. Returns StarAmount on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getBusinessAccountStarBalance: (params: M.GetBusinessAccountStarBalanceParams) => Effect.Effect<T.StarAmount, TelegramError.TelegramError>
  /**
   * Use this method to get information about the connection of the bot with a business account. Returns a BusinessConnection object on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getBusinessConnection: (params: M.GetBusinessConnectionParams) => Effect.Effect<T.BusinessConnection, TelegramError.TelegramError>
  /**
   * Use this method to get up-to-date information about the chat. Returns a ChatFullInfo object on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getChat: (params: M.GetChatParams) => Effect.Effect<T.ChatFullInfo, TelegramError.TelegramError>
  /**
   * Use this method to get a list of administrators in a chat. Returns an Array of ChatMember objects.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getChatAdministrators: (params: M.GetChatAdministratorsParams) => Effect.Effect<ReadonlyArray<T.ChatMember>, TelegramError.TelegramError>
  /**
   * Returns the gifts owned by a chat. Returns OwnedGifts on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getChatGifts: (params: M.GetChatGiftsParams) => Effect.Effect<T.OwnedGifts, TelegramError.TelegramError>
  /**
   * Use this method to get information about a member of a chat. The method is only guaranteed to work for other users if the bot is an administrator in the chat. Returns a ChatMember object on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getChatMember: (params: M.GetChatMemberParams) => Effect.Effect<T.ChatMember, TelegramError.TelegramError>
  /**
   * Use this method to get the number of members in a chat. Returns Int on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getChatMemberCount: (params: M.GetChatMemberCountParams) => Effect.Effect<number, TelegramError.TelegramError>
  /**
   * Use this method to get the current value of the bot's menu button in a private chat, or the default menu button. Returns MenuButton on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getChatMenuButton: (params?: M.GetChatMenuButtonParams) => Effect.Effect<T.MenuButton, TelegramError.TelegramError>
  /**
   * Use this method to get information about custom emoji stickers by their identifiers. Returns an Array of Sticker objects.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getCustomEmojiStickers: (params: M.GetCustomEmojiStickersParams) => Effect.Effect<ReadonlyArray<T.Sticker>, TelegramError.TelegramError>
  /**
   * Use this method to get basic information about a file and prepare it for downloading. For the moment, bots can download files of up to 20MB in size. On success, a File object is returned. The file can then be downloaded via the link https://api.telegram.org/file/bot<token>/<file_path>, where <file_path> is taken from the response. It is guaranteed that the link will be valid for at least 1 hour. When the link expires, a new one can be requested by calling getFile again. Note: This function may not preserve the original file name and MIME type. You should save the file's MIME type and name (if available) when the File object is received.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getFile: (params: M.GetFileParams) => Effect.Effect<T.File, TelegramError.TelegramError>
  /**
   * Use this method to get custom emoji stickers, which can be used as a forum topic icon by any user. Requires no parameters. Returns an Array of Sticker objects.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getForumTopicIconStickers: () => Effect.Effect<ReadonlyArray<T.Sticker>, TelegramError.TelegramError>
  /**
   * Use this method to get data for high score tables. Will return the score of the specified user and several of their neighbors in a game. Returns an Array of GameHighScore objects.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getGameHighScores: (params: M.GetGameHighScoresParams) => Effect.Effect<ReadonlyArray<T.GameHighScore>, TelegramError.TelegramError>
  /**
   * Use this method to get the access settings of a managed bot. Returns a BotAccessSettings object on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getManagedBotAccessSettings: (params: M.GetManagedBotAccessSettingsParams) => Effect.Effect<T.BotAccessSettings, TelegramError.TelegramError>
  /**
   * Use this method to get the token of a managed bot. Returns the token as String on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getManagedBotToken: (params: M.GetManagedBotTokenParams) => Effect.Effect<string, TelegramError.TelegramError>
  /**
   * A simple method for testing your bot's authentication token. Requires no parameters. Returns basic information about the bot in form of a User object.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getMe: () => Effect.Effect<T.User, TelegramError.TelegramError>
  /**
   * Use this method to get the current list of the bot's commands for the given scope and user language. Returns an Array of BotCommand objects. If commands aren't set, an empty list is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getMyCommands: (params?: M.GetMyCommandsParams) => Effect.Effect<ReadonlyArray<T.BotCommand>, TelegramError.TelegramError>
  /**
   * Use this method to get the current default administrator rights of the bot. Returns ChatAdministratorRights on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getMyDefaultAdministratorRights: (params?: M.GetMyDefaultAdministratorRightsParams) => Effect.Effect<T.ChatAdministratorRights, TelegramError.TelegramError>
  /**
   * Use this method to get the current bot description for the given user language. Returns BotDescription on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getMyDescription: (params?: M.GetMyDescriptionParams) => Effect.Effect<T.BotDescription, TelegramError.TelegramError>
  /**
   * Use this method to get the current bot name for the given user language. Returns BotName on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getMyName: (params?: M.GetMyNameParams) => Effect.Effect<T.BotName, TelegramError.TelegramError>
  /**
   * Use this method to get the current bot short description for the given user language. Returns BotShortDescription on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getMyShortDescription: (params?: M.GetMyShortDescriptionParams) => Effect.Effect<T.BotShortDescription, TelegramError.TelegramError>
  /**
   * A method to get the current Telegram Stars balance of the bot. Requires no parameters. On success, returns a StarAmount object.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getMyStarBalance: () => Effect.Effect<T.StarAmount, TelegramError.TelegramError>
  /**
   * Returns the bot's Telegram Star transactions in chronological order. On success, returns a StarTransactions object.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getStarTransactions: (params?: M.GetStarTransactionsParams) => Effect.Effect<T.StarTransactions, TelegramError.TelegramError>
  /**
   * Use this method to get a sticker set. On success, a StickerSet object is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getStickerSet: (params: M.GetStickerSetParams) => Effect.Effect<T.StickerSet, TelegramError.TelegramError>
  /**
   * Use this method to receive incoming updates using long polling (wiki). Returns an Array of Update objects.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getUpdates: (params?: M.GetUpdatesParams) => Effect.Effect<ReadonlyArray<T.Update>, TelegramError.TelegramError>
  /**
   * Use this method to get the list of boosts added to a chat by a user. Requires administrator rights in the chat. Returns a UserChatBoosts object.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getUserChatBoosts: (params: M.GetUserChatBoostsParams) => Effect.Effect<T.UserChatBoosts, TelegramError.TelegramError>
  /**
   * Returns the gifts owned and hosted by a user. Returns OwnedGifts on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getUserGifts: (params: M.GetUserGiftsParams) => Effect.Effect<T.OwnedGifts, TelegramError.TelegramError>
  /**
   * Use this method to get the last messages from the personal chat (i.e., the chat currently added to their profile) of a given user. On success, an array of Message objects is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getUserPersonalChatMessages: (params: M.GetUserPersonalChatMessagesParams) => Effect.Effect<ReadonlyArray<T.Message>, TelegramError.TelegramError>
  /**
   * Use this method to get a list of profile audios for a user. Returns a UserProfileAudios object.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getUserProfileAudios: (params: M.GetUserProfileAudiosParams) => Effect.Effect<T.UserProfileAudios, TelegramError.TelegramError>
  /**
   * Use this method to get a list of profile pictures for a user. Returns a UserProfilePhotos object.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getUserProfilePhotos: (params: M.GetUserProfilePhotosParams) => Effect.Effect<T.UserProfilePhotos, TelegramError.TelegramError>
  /**
   * Use this method to get current webhook status. Requires no parameters. On success, returns a WebhookInfo object. If the bot is using getUpdates, will return an object with the url field empty.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly getWebhookInfo: () => Effect.Effect<T.WebhookInfo, TelegramError.TelegramError>
  /**
   * Gifts a Telegram Premium subscription to the given user. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly giftPremiumSubscription: (params: M.GiftPremiumSubscriptionParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to hide the 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights. The topic will be automatically closed if it was open. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly hideGeneralForumTopic: (params: M.HideGeneralForumTopicParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method for your bot to leave a group, supergroup or channel. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly leaveChat: (params: M.LeaveChatParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to log out from the cloud Bot API server before launching the bot locally. You must log out the bot before running it locally, otherwise there is no guarantee that the bot will receive updates. After a successful call, you can immediately log in on a local server, but will not be able to log in back to the cloud Bot API server for 10 minutes. Returns True on success. Requires no parameters.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly logOut: () => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to add a message to the list of pinned messages in a chat. In private chats and channel direct messages chats, all non-service messages can be pinned. Conversely, the bot must be an administrator with the 'can_pin_messages' right or the 'can_edit_messages' right to pin messages in groups and channels respectively. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly pinChatMessage: (params: M.PinChatMessageParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Posts a story on behalf of a managed business account. Requires the can_manage_stories business bot right. Returns Story on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly postStory: (params: M.PostStoryParams) => Effect.Effect<T.Story, TelegramError.TelegramError>
  /**
   * Use this method to promote or demote a user in a supergroup or a channel. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Pass False for all boolean parameters to demote a user. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly promoteChatMember: (params: M.PromoteChatMemberParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Marks incoming message as read on behalf of a business account. Requires the can_read_messages business bot right. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly readBusinessMessage: (params: M.ReadBusinessMessageParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Refunds a successful payment in Telegram Stars. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly refundStarPayment: (params: M.RefundStarPaymentParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Removes the current profile photo of a managed business account. Requires the can_edit_profile_photo business bot right. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly removeBusinessAccountProfilePhoto: (params: M.RemoveBusinessAccountProfilePhotoParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Removes verification from a chat that is currently verified on behalf of the organization represented by the bot. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly removeChatVerification: (params: M.RemoveChatVerificationParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Removes the profile photo of the bot. Requires no parameters. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly removeMyProfilePhoto: () => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Removes verification from a user who is currently verified on behalf of the organization represented by the bot. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly removeUserVerification: (params: M.RemoveUserVerificationParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to reopen a closed topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights, unless it is the creator of the topic. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly reopenForumTopic: (params: M.ReopenForumTopicParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to reopen a closed 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights. The topic will be automatically unhidden if it was hidden. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly reopenGeneralForumTopic: (params: M.ReopenGeneralForumTopicParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to revoke the current token of a managed bot and generate a new one. Returns the new token as String on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly replaceManagedBotToken: (params: M.ReplaceManagedBotTokenParams) => Effect.Effect<string, TelegramError.TelegramError>
  /**
   * Use this method to replace an existing sticker in a sticker set with a new one. The method is equivalent to calling deleteStickerFromSet, then addStickerToSet, then setStickerPositionInSet. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly replaceStickerInSet: (params: M.ReplaceStickerInSetParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Reposts a story on behalf of a business account from another business account. Both business accounts must be managed by the same bot, and the story on the source account must have been posted (or reposted) by the bot. Requires the can_manage_stories business bot right for both business accounts. Returns Story on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly repostStory: (params: M.RepostStoryParams) => Effect.Effect<T.Story, TelegramError.TelegramError>
  /**
   * Use this method to restrict a user in a supergroup. The bot must be an administrator in the supergroup for this to work and must have the appropriate administrator rights. Pass True for all permissions to lift restrictions from a user. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly restrictChatMember: (params: M.RestrictChatMemberParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to revoke an invite link created by the bot. If the primary link is revoked, a new link is automatically generated. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns the revoked invite link as ChatInviteLink object.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly revokeChatInviteLink: (params: M.RevokeChatInviteLinkParams) => Effect.Effect<T.ChatInviteLink, TelegramError.TelegramError>
  /**
   * Stores a message that can be sent by a user of a Mini App. Returns a PreparedInlineMessage object.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly savePreparedInlineMessage: (params: M.SavePreparedInlineMessageParams) => Effect.Effect<T.PreparedInlineMessage, TelegramError.TelegramError>
  /**
   * Stores a keyboard button that can be used by a user within a Mini App. Returns a PreparedKeyboardButton object.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly savePreparedKeyboardButton: (params: M.SavePreparedKeyboardButtonParams) => Effect.Effect<T.PreparedKeyboardButton, TelegramError.TelegramError>
  /**
   * Use this method to send animation files (GIF or H.264/MPEG-4 AVC video without sound). On success, the sent Message is returned. Bots can currently send animation files of up to 50 MB in size, this limit may be changed in the future.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendAnimation: (params: M.SendAnimationParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to send audio files, if you want Telegram clients to display them in the music player. Your audio must be in the .MP3 or .M4A format. On success, the sent Message is returned. Bots can currently send audio files of up to 50 MB in size, this limit may be changed in the future. For sending voice messages, use the sendVoice method instead.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendAudio: (params: M.SendAudioParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method when you need to tell the user that something is happening on the bot's side. The status is set for 5 seconds or less (when a message arrives from your bot, Telegram clients clear its typing status). Returns True on success. We only recommend using this method when a response from the bot will take a noticeable amount of time to arrive.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendChatAction: (params: M.SendChatActionParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to process a received chat join request query by showing a Mini App to the user before deciding the outcome. Call answerChatJoinRequestQuery to resolve the join request query based on the user interaction with the Mini App. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendChatJoinRequestWebApp: (params: M.SendChatJoinRequestWebAppParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to send a checklist on behalf of a connected business account. On success, the sent Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendChecklist: (params: M.SendChecklistParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to send phone contacts. On success, the sent Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendContact: (params: M.SendContactParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to send an animated emoji that will display a random value. On success, the sent Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendDice: (params: M.SendDiceParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to send general files. On success, the sent Message is returned. Bots can currently send files of any type of up to 50 MB in size, this limit may be changed in the future.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendDocument: (params: M.SendDocumentParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to send a game. On success, the sent Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendGame: (params: M.SendGameParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Sends a gift to the given user or channel chat. The gift can't be converted to Telegram Stars by the receiver. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendGift: (params: M.SendGiftParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to send invoices. On success, the sent Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendInvoice: (params: M.SendInvoiceParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to send live photos. On success, the sent Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendLivePhoto: (params: M.SendLivePhotoParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to send point on the map. On success, the sent Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendLocation: (params: M.SendLocationParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to send a group of photos, live photos, videos, documents or audios as an album. Documents and audio files can be only grouped in an album with messages of the same type. On success, an array of Message objects that were sent is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendMediaGroup: (params: M.SendMediaGroupParams) => Effect.Effect<ReadonlyArray<T.Message>, TelegramError.TelegramError>
  /**
   * Use this method to send text messages. On success, the sent Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendMessage: (params: M.SendMessageParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to stream a partial message to a user while the message is being generated. Note that the streamed draft is ephemeral and acts as a temporary 30-second preview - once the output is finalized, you must call sendMessage with the complete message to persist it in the user's chat. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendMessageDraft: (params: M.SendMessageDraftParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to send paid media. On success, the sent Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendPaidMedia: (params: M.SendPaidMediaParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to send photos. On success, the sent Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendPhoto: (params: M.SendPhotoParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to send a native poll. On success, the sent Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendPoll: (params: M.SendPollParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to send rich messages. If the message contains a block with a media element, then the bot must have the right to send the media to the chat. On success, the sent Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendRichMessage: (params: M.SendRichMessageParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to stream a partial rich message to a user while the message is being generated. Note that the streamed draft is ephemeral and acts as a temporary 30-second preview - once the output is finalized, you must call sendRichMessage with the complete message to persist it in the user's chat. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendRichMessageDraft: (params: M.SendRichMessageDraftParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to send static .WEBP, animated .TGS, or video .WEBM stickers. On success, the sent Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendSticker: (params: M.SendStickerParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to send information about a venue. On success, the sent Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendVenue: (params: M.SendVenueParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to send video files, Telegram clients support MPEG4 videos (other formats may be sent as Document). On success, the sent Message is returned. Bots can currently send video files of up to 50 MB in size, this limit may be changed in the future.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendVideo: (params: M.SendVideoParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * As of v.4.0, Telegram clients support rounded square MPEG4 videos of up to 1 minute long. Use this method to send video messages. On success, the sent Message is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendVideoNote: (params: M.SendVideoNoteParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Use this method to send audio files, if you want Telegram clients to display the file as a playable voice message. For this to work, your audio must be in an .OGG file encoded with OPUS, or in .MP3 format, or in .M4A format (other formats may be sent as Audio or Document). On success, the sent Message is returned. Bots can currently send voice messages of up to 50 MB in size, this limit may be changed in the future.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly sendVoice: (params: M.SendVoiceParams) => Effect.Effect<T.Message, TelegramError.TelegramError>
  /**
   * Changes the bio of a managed business account. Requires the can_change_bio business bot right. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setBusinessAccountBio: (params: M.SetBusinessAccountBioParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Changes the privacy settings pertaining to incoming gifts in a managed business account. Requires the can_change_gift_settings business bot right. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setBusinessAccountGiftSettings: (params: M.SetBusinessAccountGiftSettingsParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Changes the first and last name of a managed business account. Requires the can_change_name business bot right. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setBusinessAccountName: (params: M.SetBusinessAccountNameParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Changes the profile photo of a managed business account. Requires the can_edit_profile_photo business bot right. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setBusinessAccountProfilePhoto: (params: M.SetBusinessAccountProfilePhotoParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Changes the username of a managed business account. Requires the can_change_username business bot right. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setBusinessAccountUsername: (params: M.SetBusinessAccountUsernameParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to set a custom title for an administrator in a supergroup promoted by the bot. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setChatAdministratorCustomTitle: (params: M.SetChatAdministratorCustomTitleParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to change the description of a group, a supergroup or a channel. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setChatDescription: (params: M.SetChatDescriptionParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to set a tag for a regular member in a group or a supergroup. The bot must be an administrator in the chat for this to work and must have the can_manage_tags administrator right. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setChatMemberTag: (params: M.SetChatMemberTagParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to change the bot's menu button in a private chat, or the default menu button. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setChatMenuButton: (params?: M.SetChatMenuButtonParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to set default chat permissions for all members. The bot must be an administrator in the group or a supergroup for this to work and must have the can_restrict_members administrator rights. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setChatPermissions: (params: M.SetChatPermissionsParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to set a new profile photo for the chat. Photos can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setChatPhoto: (params: M.SetChatPhotoParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to set a new group sticker set for a supergroup. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Use the field can_set_sticker_set optionally returned in getChat requests to check if the bot can use this method. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setChatStickerSet: (params: M.SetChatStickerSetParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to change the title of a chat. Titles can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setChatTitle: (params: M.SetChatTitleParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to set the thumbnail of a custom emoji sticker set. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setCustomEmojiStickerSetThumbnail: (params: M.SetCustomEmojiStickerSetThumbnailParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to set the score of the specified user in a game message. On success, if the message is not an inline message, the Message is returned, otherwise True is returned. Returns an error, if the new score is not greater than the user's current score in the chat and force is False.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setGameScore: (params: M.SetGameScoreParams) => Effect.Effect<T.Message | boolean, TelegramError.TelegramError>
  /**
   * Use this method to change the access settings of a managed bot. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setManagedBotAccessSettings: (params: M.SetManagedBotAccessSettingsParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to change the chosen reactions on a message. Service messages of some types can't be reacted to. Automatically forwarded messages from a channel to its discussion group have the same available reactions as messages in the channel. Bots can't use paid reactions. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setMessageReaction: (params: M.SetMessageReactionParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to change the list of the bot's commands. See this manual for more details about bot commands. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setMyCommands: (params: M.SetMyCommandsParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to change the default administrator rights requested by the bot when it's added as an administrator to groups or channels. These rights will be suggested to users, but they are free to modify the list before adding the bot. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setMyDefaultAdministratorRights: (params?: M.SetMyDefaultAdministratorRightsParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to change the bot's description, which is shown in the chat with the bot if the chat is empty. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setMyDescription: (params?: M.SetMyDescriptionParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to change the bot's name. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setMyName: (params?: M.SetMyNameParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Changes the profile photo of the bot. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setMyProfilePhoto: (params: M.SetMyProfilePhotoParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to change the bot's short description, which is shown on the bot's profile page and is sent together with the link when users share the bot. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setMyShortDescription: (params?: M.SetMyShortDescriptionParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Informs a user that some of the Telegram Passport elements they provided contains errors. The user will not be able to re-submit their Passport to you until the errors are fixed (the contents of the field for which you returned the error must change). Returns True on success. Use this if the data submitted by the user doesn't satisfy the standards your service requires for any reason. For example, if a birthday date seems invalid, a submitted document is blurry, a scan shows evidence of tampering, etc. Supply some details in the error message to make sure the user knows how to correct the issues.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setPassportDataErrors: (params: M.SetPassportDataErrorsParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to change the list of emoji assigned to a regular or custom emoji sticker. The sticker must belong to a sticker set created by the bot. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setStickerEmojiList: (params: M.SetStickerEmojiListParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to change search keywords assigned to a regular or custom emoji sticker. The sticker must belong to a sticker set created by the bot. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setStickerKeywords: (params: M.SetStickerKeywordsParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to change the mask position of a mask sticker. The sticker must belong to a sticker set that was created by the bot. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setStickerMaskPosition: (params: M.SetStickerMaskPositionParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to move a sticker in a set created by the bot to a specific position. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setStickerPositionInSet: (params: M.SetStickerPositionInSetParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to set the thumbnail of a regular or mask sticker set. The format of the thumbnail file must match the format of the stickers in the set. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setStickerSetThumbnail: (params: M.SetStickerSetThumbnailParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to set the title of a created sticker set. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setStickerSetTitle: (params: M.SetStickerSetTitleParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Changes the emoji status for a given user that previously allowed the bot to manage their emoji status via the Mini App method requestEmojiStatusAccess. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setUserEmojiStatus: (params: M.SetUserEmojiStatusParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to specify a URL and receive incoming updates via an outgoing webhook. Whenever there is an update for the bot, we will send an HTTPS POST request to the specified URL, containing a JSON-serialized Update. In case of an unsuccessful request (a request with response HTTP status code different from 2XY), we will repeat the request and give up after a reasonable amount of attempts. Returns True on success. If you'd like to make sure that the webhook was set by you, you can specify secret data in the parameter secret_token. If specified, the request will contain a header "X-Telegram-Bot-Api-Secret-Token" with the secret token as content.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly setWebhook: (params: M.SetWebhookParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to stop updating a live location message before live_period expires. On success, if the message is not an inline message, the edited Message is returned, otherwise True is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly stopMessageLiveLocation: (params?: M.StopMessageLiveLocationParams) => Effect.Effect<T.Message | boolean, TelegramError.TelegramError>
  /**
   * Use this method to stop a poll which was sent by the bot. On success, the stopped Poll is returned.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly stopPoll: (params: M.StopPollParams) => Effect.Effect<T.Poll, TelegramError.TelegramError>
  /**
   * Transfers Telegram Stars from the business account balance to the bot's balance. Requires the can_transfer_stars business bot right. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly transferBusinessAccountStars: (params: M.TransferBusinessAccountStarsParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Transfers an owned unique gift to another user. Requires the can_transfer_and_upgrade_gifts business bot right. Requires can_transfer_stars business bot right if the transfer is paid. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly transferGift: (params: M.TransferGiftParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to unban a previously banned user in a supergroup or channel. The user will not return to the group or channel automatically, but will be able to join via link, etc. The bot must be an administrator for this to work. By default, this method guarantees that after the call the user is not a member of the chat, but will be able to join it. So if the user is a member of the chat they will also be removed from the chat. If you don't want this, use the parameter only_if_banned. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly unbanChatMember: (params: M.UnbanChatMemberParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to unban a previously banned channel chat in a supergroup or channel. The bot must be an administrator for this to work and must have the appropriate administrator rights. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly unbanChatSenderChat: (params: M.UnbanChatSenderChatParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to unhide the 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly unhideGeneralForumTopic: (params: M.UnhideGeneralForumTopicParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to clear the list of pinned messages in a chat. In private chats and channel direct messages chats, no additional rights are required to unpin all pinned messages. Conversely, the bot must be an administrator with the 'can_pin_messages' right or the 'can_edit_messages' right to unpin all pinned messages in groups and channels respectively. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly unpinAllChatMessages: (params: M.UnpinAllChatMessagesParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to clear the list of pinned messages in a forum topic in a forum supergroup chat or a private chat with a user. In the case of a supergroup chat the bot must be an administrator in the chat for this to work and must have the can_pin_messages administrator right in the supergroup. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly unpinAllForumTopicMessages: (params: M.UnpinAllForumTopicMessagesParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to clear the list of pinned messages in a General forum topic. The bot must be an administrator in the chat for this to work and must have the can_pin_messages administrator right in the supergroup. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly unpinAllGeneralForumTopicMessages: (params: M.UnpinAllGeneralForumTopicMessagesParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to remove a message from the list of pinned messages in a chat. In private chats and channel direct messages chats, all messages can be unpinned. Conversely, the bot must be an administrator with the 'can_pin_messages' right or the 'can_edit_messages' right to unpin messages in groups and channels respectively. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly unpinChatMessage: (params: M.UnpinChatMessageParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Upgrades a given regular gift to a unique gift. Requires the can_transfer_and_upgrade_gifts business bot right. Additionally requires the can_transfer_stars business bot right if the upgrade is paid. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly upgradeGift: (params: M.UpgradeGiftParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Use this method to upload a file with a sticker for later use in the createNewStickerSet, addStickerToSet, or replaceStickerInSet methods (the file can be used multiple times). Returns the uploaded File on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly uploadStickerFile: (params: M.UploadStickerFileParams) => Effect.Effect<T.File, TelegramError.TelegramError>
  /**
   * Verifies a chat on behalf of the organization which is represented by the bot. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly verifyChat: (params: M.VerifyChatParams) => Effect.Effect<boolean, TelegramError.TelegramError>
  /**
   * Verifies a user on behalf of the organization which is represented by the bot. Returns True on success.
   *
   * @category methods
   * @since 0.1.0
   */
  readonly verifyUser: (params: M.VerifyUserParams) => Effect.Effect<boolean, TelegramError.TelegramError>
}

/**
 * Builds the {@link TelegramClientService} from a transport {@link Call}.
 *
 * @category constructors
 * @since 0.1.0
 */
export const makeMethods = (call: Call): TelegramClientService => ({
  addStickerToSet: (params) => call("addStickerToSet", M.AddStickerToSetParams, Schema.Boolean, params),
  answerCallbackQuery: (params) => call("answerCallbackQuery", M.AnswerCallbackQueryParams, Schema.Boolean, params),
  answerChatJoinRequestQuery: (params) => call("answerChatJoinRequestQuery", M.AnswerChatJoinRequestQueryParams, Schema.Boolean, params),
  answerGuestQuery: (params) => call("answerGuestQuery", M.AnswerGuestQueryParams, T.SentGuestMessage, params),
  answerInlineQuery: (params) => call("answerInlineQuery", M.AnswerInlineQueryParams, Schema.Boolean, params),
  answerPreCheckoutQuery: (params) => call("answerPreCheckoutQuery", M.AnswerPreCheckoutQueryParams, Schema.Boolean, params),
  answerShippingQuery: (params) => call("answerShippingQuery", M.AnswerShippingQueryParams, Schema.Boolean, params),
  answerWebAppQuery: (params) => call("answerWebAppQuery", M.AnswerWebAppQueryParams, T.SentWebAppMessage, params),
  approveChatJoinRequest: (params) => call("approveChatJoinRequest", M.ApproveChatJoinRequestParams, Schema.Boolean, params),
  approveSuggestedPost: (params) => call("approveSuggestedPost", M.ApproveSuggestedPostParams, Schema.Boolean, params),
  banChatMember: (params) => call("banChatMember", M.BanChatMemberParams, Schema.Boolean, params),
  banChatSenderChat: (params) => call("banChatSenderChat", M.BanChatSenderChatParams, Schema.Boolean, params),
  close: () => call("close", null, Schema.Boolean, undefined),
  closeForumTopic: (params) => call("closeForumTopic", M.CloseForumTopicParams, Schema.Boolean, params),
  closeGeneralForumTopic: (params) => call("closeGeneralForumTopic", M.CloseGeneralForumTopicParams, Schema.Boolean, params),
  convertGiftToStars: (params) => call("convertGiftToStars", M.ConvertGiftToStarsParams, Schema.Boolean, params),
  copyMessage: (params) => call("copyMessage", M.CopyMessageParams, T.MessageId, params),
  copyMessages: (params) => call("copyMessages", M.CopyMessagesParams, Schema.Array(T.MessageId), params),
  createChatInviteLink: (params) => call("createChatInviteLink", M.CreateChatInviteLinkParams, T.ChatInviteLink, params),
  createChatSubscriptionInviteLink: (params) => call("createChatSubscriptionInviteLink", M.CreateChatSubscriptionInviteLinkParams, T.ChatInviteLink, params),
  createForumTopic: (params) => call("createForumTopic", M.CreateForumTopicParams, T.ForumTopic, params),
  createInvoiceLink: (params) => call("createInvoiceLink", M.CreateInvoiceLinkParams, Schema.String, params),
  createNewStickerSet: (params) => call("createNewStickerSet", M.CreateNewStickerSetParams, Schema.Boolean, params),
  declineChatJoinRequest: (params) => call("declineChatJoinRequest", M.DeclineChatJoinRequestParams, Schema.Boolean, params),
  declineSuggestedPost: (params) => call("declineSuggestedPost", M.DeclineSuggestedPostParams, Schema.Boolean, params),
  deleteAllMessageReactions: (params) => call("deleteAllMessageReactions", M.DeleteAllMessageReactionsParams, Schema.Boolean, params),
  deleteBusinessMessages: (params) => call("deleteBusinessMessages", M.DeleteBusinessMessagesParams, Schema.Boolean, params),
  deleteChatPhoto: (params) => call("deleteChatPhoto", M.DeleteChatPhotoParams, Schema.Boolean, params),
  deleteChatStickerSet: (params) => call("deleteChatStickerSet", M.DeleteChatStickerSetParams, Schema.Boolean, params),
  deleteForumTopic: (params) => call("deleteForumTopic", M.DeleteForumTopicParams, Schema.Boolean, params),
  deleteMessage: (params) => call("deleteMessage", M.DeleteMessageParams, Schema.Boolean, params),
  deleteMessageReaction: (params) => call("deleteMessageReaction", M.DeleteMessageReactionParams, Schema.Boolean, params),
  deleteMessages: (params) => call("deleteMessages", M.DeleteMessagesParams, Schema.Boolean, params),
  deleteMyCommands: (params) => call("deleteMyCommands", M.DeleteMyCommandsParams, Schema.Boolean, params),
  deleteStickerFromSet: (params) => call("deleteStickerFromSet", M.DeleteStickerFromSetParams, Schema.Boolean, params),
  deleteStickerSet: (params) => call("deleteStickerSet", M.DeleteStickerSetParams, Schema.Boolean, params),
  deleteStory: (params) => call("deleteStory", M.DeleteStoryParams, Schema.Boolean, params),
  deleteWebhook: (params) => call("deleteWebhook", M.DeleteWebhookParams, Schema.Boolean, params),
  editChatInviteLink: (params) => call("editChatInviteLink", M.EditChatInviteLinkParams, T.ChatInviteLink, params),
  editChatSubscriptionInviteLink: (params) => call("editChatSubscriptionInviteLink", M.EditChatSubscriptionInviteLinkParams, T.ChatInviteLink, params),
  editForumTopic: (params) => call("editForumTopic", M.EditForumTopicParams, Schema.Boolean, params),
  editGeneralForumTopic: (params) => call("editGeneralForumTopic", M.EditGeneralForumTopicParams, Schema.Boolean, params),
  editMessageCaption: (params) => call("editMessageCaption", M.EditMessageCaptionParams, Schema.Union([T.Message, Schema.Boolean]), params),
  editMessageChecklist: (params) => call("editMessageChecklist", M.EditMessageChecklistParams, T.Message, params),
  editMessageLiveLocation: (params) => call("editMessageLiveLocation", M.EditMessageLiveLocationParams, Schema.Union([T.Message, Schema.Boolean]), params),
  editMessageMedia: (params) => call("editMessageMedia", M.EditMessageMediaParams, Schema.Union([T.Message, Schema.Boolean]), params),
  editMessageReplyMarkup: (params) => call("editMessageReplyMarkup", M.EditMessageReplyMarkupParams, Schema.Union([T.Message, Schema.Boolean]), params),
  editMessageText: (params) => call("editMessageText", M.EditMessageTextParams, Schema.Union([T.Message, Schema.Boolean]), params),
  editStory: (params) => call("editStory", M.EditStoryParams, T.Story, params),
  editUserStarSubscription: (params) => call("editUserStarSubscription", M.EditUserStarSubscriptionParams, Schema.Boolean, params),
  exportChatInviteLink: (params) => call("exportChatInviteLink", M.ExportChatInviteLinkParams, Schema.String, params),
  forwardMessage: (params) => call("forwardMessage", M.ForwardMessageParams, T.Message, params),
  forwardMessages: (params) => call("forwardMessages", M.ForwardMessagesParams, Schema.Array(T.MessageId), params),
  getAvailableGifts: () => call("getAvailableGifts", null, T.Gifts, undefined),
  getBusinessAccountGifts: (params) => call("getBusinessAccountGifts", M.GetBusinessAccountGiftsParams, T.OwnedGifts, params),
  getBusinessAccountStarBalance: (params) => call("getBusinessAccountStarBalance", M.GetBusinessAccountStarBalanceParams, T.StarAmount, params),
  getBusinessConnection: (params) => call("getBusinessConnection", M.GetBusinessConnectionParams, T.BusinessConnection, params),
  getChat: (params) => call("getChat", M.GetChatParams, T.ChatFullInfo, params),
  getChatAdministrators: (params) => call("getChatAdministrators", M.GetChatAdministratorsParams, Schema.Array(T.ChatMember), params),
  getChatGifts: (params) => call("getChatGifts", M.GetChatGiftsParams, T.OwnedGifts, params),
  getChatMember: (params) => call("getChatMember", M.GetChatMemberParams, T.ChatMember, params),
  getChatMemberCount: (params) => call("getChatMemberCount", M.GetChatMemberCountParams, Schema.Number, params),
  getChatMenuButton: (params) => call("getChatMenuButton", M.GetChatMenuButtonParams, T.MenuButton, params),
  getCustomEmojiStickers: (params) => call("getCustomEmojiStickers", M.GetCustomEmojiStickersParams, Schema.Array(T.Sticker), params),
  getFile: (params) => call("getFile", M.GetFileParams, T.File, params),
  getForumTopicIconStickers: () => call("getForumTopicIconStickers", null, Schema.Array(T.Sticker), undefined),
  getGameHighScores: (params) => call("getGameHighScores", M.GetGameHighScoresParams, Schema.Array(T.GameHighScore), params),
  getManagedBotAccessSettings: (params) => call("getManagedBotAccessSettings", M.GetManagedBotAccessSettingsParams, T.BotAccessSettings, params),
  getManagedBotToken: (params) => call("getManagedBotToken", M.GetManagedBotTokenParams, Schema.String, params),
  getMe: () => call("getMe", null, T.User, undefined),
  getMyCommands: (params) => call("getMyCommands", M.GetMyCommandsParams, Schema.Array(T.BotCommand), params),
  getMyDefaultAdministratorRights: (params) => call("getMyDefaultAdministratorRights", M.GetMyDefaultAdministratorRightsParams, T.ChatAdministratorRights, params),
  getMyDescription: (params) => call("getMyDescription", M.GetMyDescriptionParams, T.BotDescription, params),
  getMyName: (params) => call("getMyName", M.GetMyNameParams, T.BotName, params),
  getMyShortDescription: (params) => call("getMyShortDescription", M.GetMyShortDescriptionParams, T.BotShortDescription, params),
  getMyStarBalance: () => call("getMyStarBalance", null, T.StarAmount, undefined),
  getStarTransactions: (params) => call("getStarTransactions", M.GetStarTransactionsParams, T.StarTransactions, params),
  getStickerSet: (params) => call("getStickerSet", M.GetStickerSetParams, T.StickerSet, params),
  getUpdates: (params) => call("getUpdates", M.GetUpdatesParams, Schema.Array(T.Update), params),
  getUserChatBoosts: (params) => call("getUserChatBoosts", M.GetUserChatBoostsParams, T.UserChatBoosts, params),
  getUserGifts: (params) => call("getUserGifts", M.GetUserGiftsParams, T.OwnedGifts, params),
  getUserPersonalChatMessages: (params) => call("getUserPersonalChatMessages", M.GetUserPersonalChatMessagesParams, Schema.Array(T.Message), params),
  getUserProfileAudios: (params) => call("getUserProfileAudios", M.GetUserProfileAudiosParams, T.UserProfileAudios, params),
  getUserProfilePhotos: (params) => call("getUserProfilePhotos", M.GetUserProfilePhotosParams, T.UserProfilePhotos, params),
  getWebhookInfo: () => call("getWebhookInfo", null, T.WebhookInfo, undefined),
  giftPremiumSubscription: (params) => call("giftPremiumSubscription", M.GiftPremiumSubscriptionParams, Schema.Boolean, params),
  hideGeneralForumTopic: (params) => call("hideGeneralForumTopic", M.HideGeneralForumTopicParams, Schema.Boolean, params),
  leaveChat: (params) => call("leaveChat", M.LeaveChatParams, Schema.Boolean, params),
  logOut: () => call("logOut", null, Schema.Boolean, undefined),
  pinChatMessage: (params) => call("pinChatMessage", M.PinChatMessageParams, Schema.Boolean, params),
  postStory: (params) => call("postStory", M.PostStoryParams, T.Story, params),
  promoteChatMember: (params) => call("promoteChatMember", M.PromoteChatMemberParams, Schema.Boolean, params),
  readBusinessMessage: (params) => call("readBusinessMessage", M.ReadBusinessMessageParams, Schema.Boolean, params),
  refundStarPayment: (params) => call("refundStarPayment", M.RefundStarPaymentParams, Schema.Boolean, params),
  removeBusinessAccountProfilePhoto: (params) => call("removeBusinessAccountProfilePhoto", M.RemoveBusinessAccountProfilePhotoParams, Schema.Boolean, params),
  removeChatVerification: (params) => call("removeChatVerification", M.RemoveChatVerificationParams, Schema.Boolean, params),
  removeMyProfilePhoto: () => call("removeMyProfilePhoto", null, Schema.Boolean, undefined),
  removeUserVerification: (params) => call("removeUserVerification", M.RemoveUserVerificationParams, Schema.Boolean, params),
  reopenForumTopic: (params) => call("reopenForumTopic", M.ReopenForumTopicParams, Schema.Boolean, params),
  reopenGeneralForumTopic: (params) => call("reopenGeneralForumTopic", M.ReopenGeneralForumTopicParams, Schema.Boolean, params),
  replaceManagedBotToken: (params) => call("replaceManagedBotToken", M.ReplaceManagedBotTokenParams, Schema.String, params),
  replaceStickerInSet: (params) => call("replaceStickerInSet", M.ReplaceStickerInSetParams, Schema.Boolean, params),
  repostStory: (params) => call("repostStory", M.RepostStoryParams, T.Story, params),
  restrictChatMember: (params) => call("restrictChatMember", M.RestrictChatMemberParams, Schema.Boolean, params),
  revokeChatInviteLink: (params) => call("revokeChatInviteLink", M.RevokeChatInviteLinkParams, T.ChatInviteLink, params),
  savePreparedInlineMessage: (params) => call("savePreparedInlineMessage", M.SavePreparedInlineMessageParams, T.PreparedInlineMessage, params),
  savePreparedKeyboardButton: (params) => call("savePreparedKeyboardButton", M.SavePreparedKeyboardButtonParams, T.PreparedKeyboardButton, params),
  sendAnimation: (params) => call("sendAnimation", M.SendAnimationParams, T.Message, params),
  sendAudio: (params) => call("sendAudio", M.SendAudioParams, T.Message, params),
  sendChatAction: (params) => call("sendChatAction", M.SendChatActionParams, Schema.Boolean, params),
  sendChatJoinRequestWebApp: (params) => call("sendChatJoinRequestWebApp", M.SendChatJoinRequestWebAppParams, Schema.Boolean, params),
  sendChecklist: (params) => call("sendChecklist", M.SendChecklistParams, T.Message, params),
  sendContact: (params) => call("sendContact", M.SendContactParams, T.Message, params),
  sendDice: (params) => call("sendDice", M.SendDiceParams, T.Message, params),
  sendDocument: (params) => call("sendDocument", M.SendDocumentParams, T.Message, params),
  sendGame: (params) => call("sendGame", M.SendGameParams, T.Message, params),
  sendGift: (params) => call("sendGift", M.SendGiftParams, Schema.Boolean, params),
  sendInvoice: (params) => call("sendInvoice", M.SendInvoiceParams, T.Message, params),
  sendLivePhoto: (params) => call("sendLivePhoto", M.SendLivePhotoParams, T.Message, params),
  sendLocation: (params) => call("sendLocation", M.SendLocationParams, T.Message, params),
  sendMediaGroup: (params) => call("sendMediaGroup", M.SendMediaGroupParams, Schema.Array(T.Message), params),
  sendMessage: (params) => call("sendMessage", M.SendMessageParams, T.Message, params),
  sendMessageDraft: (params) => call("sendMessageDraft", M.SendMessageDraftParams, Schema.Boolean, params),
  sendPaidMedia: (params) => call("sendPaidMedia", M.SendPaidMediaParams, T.Message, params),
  sendPhoto: (params) => call("sendPhoto", M.SendPhotoParams, T.Message, params),
  sendPoll: (params) => call("sendPoll", M.SendPollParams, T.Message, params),
  sendRichMessage: (params) => call("sendRichMessage", M.SendRichMessageParams, T.Message, params),
  sendRichMessageDraft: (params) => call("sendRichMessageDraft", M.SendRichMessageDraftParams, Schema.Boolean, params),
  sendSticker: (params) => call("sendSticker", M.SendStickerParams, T.Message, params),
  sendVenue: (params) => call("sendVenue", M.SendVenueParams, T.Message, params),
  sendVideo: (params) => call("sendVideo", M.SendVideoParams, T.Message, params),
  sendVideoNote: (params) => call("sendVideoNote", M.SendVideoNoteParams, T.Message, params),
  sendVoice: (params) => call("sendVoice", M.SendVoiceParams, T.Message, params),
  setBusinessAccountBio: (params) => call("setBusinessAccountBio", M.SetBusinessAccountBioParams, Schema.Boolean, params),
  setBusinessAccountGiftSettings: (params) => call("setBusinessAccountGiftSettings", M.SetBusinessAccountGiftSettingsParams, Schema.Boolean, params),
  setBusinessAccountName: (params) => call("setBusinessAccountName", M.SetBusinessAccountNameParams, Schema.Boolean, params),
  setBusinessAccountProfilePhoto: (params) => call("setBusinessAccountProfilePhoto", M.SetBusinessAccountProfilePhotoParams, Schema.Boolean, params),
  setBusinessAccountUsername: (params) => call("setBusinessAccountUsername", M.SetBusinessAccountUsernameParams, Schema.Boolean, params),
  setChatAdministratorCustomTitle: (params) => call("setChatAdministratorCustomTitle", M.SetChatAdministratorCustomTitleParams, Schema.Boolean, params),
  setChatDescription: (params) => call("setChatDescription", M.SetChatDescriptionParams, Schema.Boolean, params),
  setChatMemberTag: (params) => call("setChatMemberTag", M.SetChatMemberTagParams, Schema.Boolean, params),
  setChatMenuButton: (params) => call("setChatMenuButton", M.SetChatMenuButtonParams, Schema.Boolean, params),
  setChatPermissions: (params) => call("setChatPermissions", M.SetChatPermissionsParams, Schema.Boolean, params),
  setChatPhoto: (params) => call("setChatPhoto", M.SetChatPhotoParams, Schema.Boolean, params),
  setChatStickerSet: (params) => call("setChatStickerSet", M.SetChatStickerSetParams, Schema.Boolean, params),
  setChatTitle: (params) => call("setChatTitle", M.SetChatTitleParams, Schema.Boolean, params),
  setCustomEmojiStickerSetThumbnail: (params) => call("setCustomEmojiStickerSetThumbnail", M.SetCustomEmojiStickerSetThumbnailParams, Schema.Boolean, params),
  setGameScore: (params) => call("setGameScore", M.SetGameScoreParams, Schema.Union([T.Message, Schema.Boolean]), params),
  setManagedBotAccessSettings: (params) => call("setManagedBotAccessSettings", M.SetManagedBotAccessSettingsParams, Schema.Boolean, params),
  setMessageReaction: (params) => call("setMessageReaction", M.SetMessageReactionParams, Schema.Boolean, params),
  setMyCommands: (params) => call("setMyCommands", M.SetMyCommandsParams, Schema.Boolean, params),
  setMyDefaultAdministratorRights: (params) => call("setMyDefaultAdministratorRights", M.SetMyDefaultAdministratorRightsParams, Schema.Boolean, params),
  setMyDescription: (params) => call("setMyDescription", M.SetMyDescriptionParams, Schema.Boolean, params),
  setMyName: (params) => call("setMyName", M.SetMyNameParams, Schema.Boolean, params),
  setMyProfilePhoto: (params) => call("setMyProfilePhoto", M.SetMyProfilePhotoParams, Schema.Boolean, params),
  setMyShortDescription: (params) => call("setMyShortDescription", M.SetMyShortDescriptionParams, Schema.Boolean, params),
  setPassportDataErrors: (params) => call("setPassportDataErrors", M.SetPassportDataErrorsParams, Schema.Boolean, params),
  setStickerEmojiList: (params) => call("setStickerEmojiList", M.SetStickerEmojiListParams, Schema.Boolean, params),
  setStickerKeywords: (params) => call("setStickerKeywords", M.SetStickerKeywordsParams, Schema.Boolean, params),
  setStickerMaskPosition: (params) => call("setStickerMaskPosition", M.SetStickerMaskPositionParams, Schema.Boolean, params),
  setStickerPositionInSet: (params) => call("setStickerPositionInSet", M.SetStickerPositionInSetParams, Schema.Boolean, params),
  setStickerSetThumbnail: (params) => call("setStickerSetThumbnail", M.SetStickerSetThumbnailParams, Schema.Boolean, params),
  setStickerSetTitle: (params) => call("setStickerSetTitle", M.SetStickerSetTitleParams, Schema.Boolean, params),
  setUserEmojiStatus: (params) => call("setUserEmojiStatus", M.SetUserEmojiStatusParams, Schema.Boolean, params),
  setWebhook: (params) => call("setWebhook", M.SetWebhookParams, Schema.Boolean, params),
  stopMessageLiveLocation: (params) => call("stopMessageLiveLocation", M.StopMessageLiveLocationParams, Schema.Union([T.Message, Schema.Boolean]), params),
  stopPoll: (params) => call("stopPoll", M.StopPollParams, T.Poll, params),
  transferBusinessAccountStars: (params) => call("transferBusinessAccountStars", M.TransferBusinessAccountStarsParams, Schema.Boolean, params),
  transferGift: (params) => call("transferGift", M.TransferGiftParams, Schema.Boolean, params),
  unbanChatMember: (params) => call("unbanChatMember", M.UnbanChatMemberParams, Schema.Boolean, params),
  unbanChatSenderChat: (params) => call("unbanChatSenderChat", M.UnbanChatSenderChatParams, Schema.Boolean, params),
  unhideGeneralForumTopic: (params) => call("unhideGeneralForumTopic", M.UnhideGeneralForumTopicParams, Schema.Boolean, params),
  unpinAllChatMessages: (params) => call("unpinAllChatMessages", M.UnpinAllChatMessagesParams, Schema.Boolean, params),
  unpinAllForumTopicMessages: (params) => call("unpinAllForumTopicMessages", M.UnpinAllForumTopicMessagesParams, Schema.Boolean, params),
  unpinAllGeneralForumTopicMessages: (params) => call("unpinAllGeneralForumTopicMessages", M.UnpinAllGeneralForumTopicMessagesParams, Schema.Boolean, params),
  unpinChatMessage: (params) => call("unpinChatMessage", M.UnpinChatMessageParams, Schema.Boolean, params),
  upgradeGift: (params) => call("upgradeGift", M.UpgradeGiftParams, Schema.Boolean, params),
  uploadStickerFile: (params) => call("uploadStickerFile", M.UploadStickerFileParams, T.File, params),
  verifyChat: (params) => call("verifyChat", M.VerifyChatParams, Schema.Boolean, params),
  verifyUser: (params) => call("verifyUser", M.VerifyUserParams, Schema.Boolean, params)
})
