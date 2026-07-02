/**
 * Bot API method request-parameter schemas, generated from the spec.
 *
 * Same `snake_case` boundary as {@link module:generated/types} — request params encode
 * `camelCase` → `snake_case` on the way out.
 *
 * @since 0.1.0
 */
import { Schema } from "effect"
import * as T from "./types.js"

// Auto-generated from the Telegram Bot API spec (Bot API 10.1).
// Do NOT edit above the MANUAL marker — run `pnpm codegen` to regenerate.
/**
 * Request parameters for `addStickerToSet`. Use this method to add a new sticker to a set created by the bot. Emoji sticker sets can have up to 200 stickers. Other sticker sets can have up to 120 stickers. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const AddStickerToSetParams = Schema.Struct({
  userId: Schema.Number,
  name: Schema.String,
  sticker: T.InputSticker
}).pipe(
  Schema.encodeKeys({
    userId: "user_id"
  })
)

/**
 * `AddStickerToSetParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type AddStickerToSetParams = Schema.Schema.Type<typeof AddStickerToSetParams>

/**
 * Request parameters for `answerCallbackQuery`. Use this method to send answers to callback queries sent from inline keyboards. The answer will be displayed to the user as a notification at the top of the chat screen or as an alert. On success, True is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const AnswerCallbackQueryParams = Schema.Struct({
  callbackQueryId: Schema.String,
  text: Schema.optionalKey(Schema.String),
  showAlert: Schema.optionalKey(Schema.Boolean),
  url: Schema.optionalKey(Schema.String),
  cacheTime: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    callbackQueryId: "callback_query_id",
    showAlert: "show_alert",
    cacheTime: "cache_time"
  })
)

/**
 * `AnswerCallbackQueryParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type AnswerCallbackQueryParams = Schema.Schema.Type<typeof AnswerCallbackQueryParams>

/**
 * Request parameters for `answerChatJoinRequestQuery`. Use this method to process a received chat join request query. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const AnswerChatJoinRequestQueryParams = Schema.Struct({
  chatJoinRequestQueryId: Schema.String,
  result: Schema.String
}).pipe(
  Schema.encodeKeys({
    chatJoinRequestQueryId: "chat_join_request_query_id"
  })
)

/**
 * `AnswerChatJoinRequestQueryParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type AnswerChatJoinRequestQueryParams = Schema.Schema.Type<typeof AnswerChatJoinRequestQueryParams>

/**
 * Request parameters for `answerGuestQuery`. Use this method to reply to a received guest message. On success, a SentGuestMessage object is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const AnswerGuestQueryParams = Schema.Struct({
  guestQueryId: Schema.String,
  result: T.InlineQueryResult
}).pipe(
  Schema.encodeKeys({
    guestQueryId: "guest_query_id"
  })
)

/**
 * `AnswerGuestQueryParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type AnswerGuestQueryParams = Schema.Schema.Type<typeof AnswerGuestQueryParams>

/**
 * Request parameters for `answerInlineQuery`. Use this method to send answers to an inline query. On success, True is returned. No more than 50 results per query are allowed.
 *
 * @category params
 * @since 0.1.0
 */
export const AnswerInlineQueryParams = Schema.Struct({
  inlineQueryId: Schema.String,
  results: Schema.Array(T.InlineQueryResult),
  cacheTime: Schema.optionalKey(Schema.Number),
  isPersonal: Schema.optionalKey(Schema.Boolean),
  nextOffset: Schema.optionalKey(Schema.String),
  button: Schema.optionalKey(T.InlineQueryResultsButton)
}).pipe(
  Schema.encodeKeys({
    inlineQueryId: "inline_query_id",
    cacheTime: "cache_time",
    isPersonal: "is_personal",
    nextOffset: "next_offset"
  })
)

/**
 * `AnswerInlineQueryParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type AnswerInlineQueryParams = Schema.Schema.Type<typeof AnswerInlineQueryParams>

/**
 * Request parameters for `answerPreCheckoutQuery`. Once the user has confirmed their payment and shipping details, the Bot API sends the final confirmation in the form of an Update with the field pre_checkout_query. Use this method to respond to such pre-checkout queries. On success, True is returned. Note: The Bot API must receive an answer within 10 seconds after the pre-checkout query was sent.
 *
 * @category params
 * @since 0.1.0
 */
export const AnswerPreCheckoutQueryParams = Schema.Struct({
  preCheckoutQueryId: Schema.String,
  ok: Schema.Boolean,
  errorMessage: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    preCheckoutQueryId: "pre_checkout_query_id",
    errorMessage: "error_message"
  })
)

/**
 * `AnswerPreCheckoutQueryParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type AnswerPreCheckoutQueryParams = Schema.Schema.Type<typeof AnswerPreCheckoutQueryParams>

/**
 * Request parameters for `answerShippingQuery`. If you sent an invoice requesting a shipping address and the parameter is_flexible was specified, the Bot API will send an Update with a shipping_query field to the bot. Use this method to reply to shipping queries. On success, True is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const AnswerShippingQueryParams = Schema.Struct({
  shippingQueryId: Schema.String,
  ok: Schema.Boolean,
  shippingOptions: Schema.optionalKey(Schema.Array(T.ShippingOption)),
  errorMessage: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    shippingQueryId: "shipping_query_id",
    shippingOptions: "shipping_options",
    errorMessage: "error_message"
  })
)

/**
 * `AnswerShippingQueryParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type AnswerShippingQueryParams = Schema.Schema.Type<typeof AnswerShippingQueryParams>

/**
 * Request parameters for `answerWebAppQuery`. Use this method to set the result of an interaction with a Web App and send a corresponding message on behalf of the user to the chat from which the query originated. On success, a SentWebAppMessage object is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const AnswerWebAppQueryParams = Schema.Struct({
  webAppQueryId: Schema.String,
  result: T.InlineQueryResult
}).pipe(
  Schema.encodeKeys({
    webAppQueryId: "web_app_query_id"
  })
)

/**
 * `AnswerWebAppQueryParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type AnswerWebAppQueryParams = Schema.Schema.Type<typeof AnswerWebAppQueryParams>

/**
 * Request parameters for `approveChatJoinRequest`. Use this method to approve a chat join request. The bot must be an administrator in the chat for this to work and must have the can_invite_users administrator right. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const ApproveChatJoinRequestParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  userId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    userId: "user_id"
  })
)

/**
 * `ApproveChatJoinRequestParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type ApproveChatJoinRequestParams = Schema.Schema.Type<typeof ApproveChatJoinRequestParams>

/**
 * Request parameters for `approveSuggestedPost`. Use this method to approve a suggested post in a direct messages chat. The bot must have the 'can_post_messages' administrator right in the corresponding channel chat. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const ApproveSuggestedPostParams = Schema.Struct({
  chatId: Schema.Number,
  messageId: Schema.Number,
  sendDate: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageId: "message_id",
    sendDate: "send_date"
  })
)

/**
 * `ApproveSuggestedPostParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type ApproveSuggestedPostParams = Schema.Schema.Type<typeof ApproveSuggestedPostParams>

/**
 * Request parameters for `banChatMember`. Use this method to ban a user in a group, a supergroup or a channel. In the case of supergroups and channels, the user will not be able to return to the chat on their own using invite links, etc., unless unbanned first. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const BanChatMemberParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  userId: Schema.Number,
  untilDate: Schema.optionalKey(Schema.Number),
  revokeMessages: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    userId: "user_id",
    untilDate: "until_date",
    revokeMessages: "revoke_messages"
  })
)

/**
 * `BanChatMemberParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type BanChatMemberParams = Schema.Schema.Type<typeof BanChatMemberParams>

/**
 * Request parameters for `banChatSenderChat`. Use this method to ban a channel chat in a supergroup or a channel. Until the chat is unbanned, the owner of the banned chat won't be able to send messages on behalf of any of their channels. The bot must be an administrator in the supergroup or channel for this to work and must have the appropriate administrator rights. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const BanChatSenderChatParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  senderChatId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    senderChatId: "sender_chat_id"
  })
)

/**
 * `BanChatSenderChatParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type BanChatSenderChatParams = Schema.Schema.Type<typeof BanChatSenderChatParams>

/**
 * Request parameters for `closeForumTopic`. Use this method to close an open topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights, unless it is the creator of the topic. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const CloseForumTopicParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageThreadId: "message_thread_id"
  })
)

/**
 * `CloseForumTopicParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type CloseForumTopicParams = Schema.Schema.Type<typeof CloseForumTopicParams>

/**
 * Request parameters for `closeGeneralForumTopic`. Use this method to close an open 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const CloseGeneralForumTopicParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String])
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `CloseGeneralForumTopicParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type CloseGeneralForumTopicParams = Schema.Schema.Type<typeof CloseGeneralForumTopicParams>

/**
 * Request parameters for `convertGiftToStars`. Converts a given regular gift to Telegram Stars. Requires the can_convert_gifts_to_stars business bot right. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const ConvertGiftToStarsParams = Schema.Struct({
  businessConnectionId: Schema.String,
  ownedGiftId: Schema.String
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    ownedGiftId: "owned_gift_id"
  })
)

/**
 * `ConvertGiftToStarsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type ConvertGiftToStarsParams = Schema.Schema.Type<typeof ConvertGiftToStarsParams>

/**
 * Request parameters for `copyMessage`. Use this method to copy messages of any kind. Service messages, paid media messages, giveaway messages, giveaway winners messages, and invoice messages can't be copied. A quiz poll can be copied only if the value of the field correct_option_id is known to the bot. The method is analogous to the method forwardMessage, but the copied message doesn't have a link to the original message. Returns the MessageId of the sent message on success.
 *
 * @category params
 * @since 0.1.0
 */
export const CopyMessageParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  fromChatId: Schema.Union([Schema.Number, Schema.String]),
  messageId: Schema.Number,
  videoStartTimestamp: Schema.optionalKey(Schema.Number),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    fromChatId: "from_chat_id",
    messageId: "message_id",
    videoStartTimestamp: "video_start_timestamp",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `CopyMessageParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type CopyMessageParams = Schema.Schema.Type<typeof CopyMessageParams>

/**
 * Request parameters for `copyMessages`. Use this method to copy messages of any kind. If some of the specified messages can't be found or copied, they are skipped. Service messages, paid media messages, giveaway messages, giveaway winners messages, and invoice messages can't be copied. A quiz poll can be copied only if the value of the field correct_option_id is known to the bot. The method is analogous to the method forwardMessages, but the copied messages don't have a link to the original message. Album grouping is kept for copied messages. On success, an array of MessageId of the sent messages is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const CopyMessagesParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  fromChatId: Schema.Union([Schema.Number, Schema.String]),
  messageIds: Schema.Array(Schema.Number),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  removeCaption: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    fromChatId: "from_chat_id",
    messageIds: "message_ids",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    removeCaption: "remove_caption"
  })
)

/**
 * `CopyMessagesParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type CopyMessagesParams = Schema.Schema.Type<typeof CopyMessagesParams>

/**
 * Request parameters for `createChatInviteLink`. Use this method to create an additional invite link for a chat. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. The link can be revoked using the method revokeChatInviteLink. Returns the new invite link as ChatInviteLink object.
 *
 * @category params
 * @since 0.1.0
 */
export const CreateChatInviteLinkParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  name: Schema.optionalKey(Schema.String),
  expireDate: Schema.optionalKey(Schema.Number),
  memberLimit: Schema.optionalKey(Schema.Number),
  createsJoinRequest: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    expireDate: "expire_date",
    memberLimit: "member_limit",
    createsJoinRequest: "creates_join_request"
  })
)

/**
 * `CreateChatInviteLinkParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type CreateChatInviteLinkParams = Schema.Schema.Type<typeof CreateChatInviteLinkParams>

/**
 * Request parameters for `createChatSubscriptionInviteLink`. Use this method to create a subscription invite link for a channel chat. The bot must have the can_invite_users administrator rights. The link can be edited using the method editChatSubscriptionInviteLink or revoked using the method revokeChatInviteLink. Returns the new invite link as a ChatInviteLink object.
 *
 * @category params
 * @since 0.1.0
 */
export const CreateChatSubscriptionInviteLinkParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  name: Schema.optionalKey(Schema.String),
  subscriptionPeriod: Schema.Number,
  subscriptionPrice: Schema.Number
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    subscriptionPeriod: "subscription_period",
    subscriptionPrice: "subscription_price"
  })
)

/**
 * `CreateChatSubscriptionInviteLinkParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type CreateChatSubscriptionInviteLinkParams = Schema.Schema.Type<typeof CreateChatSubscriptionInviteLinkParams>

/**
 * Request parameters for `createForumTopic`. Use this method to create a topic in a forum supergroup chat or a private chat with a user. In the case of a supergroup chat the bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator right. Returns information about the created topic as a ForumTopic object.
 *
 * @category params
 * @since 0.1.0
 */
export const CreateForumTopicParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  name: Schema.String,
  iconColor: Schema.optionalKey(Schema.Number),
  iconCustomEmojiId: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    iconColor: "icon_color",
    iconCustomEmojiId: "icon_custom_emoji_id"
  })
)

/**
 * `CreateForumTopicParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type CreateForumTopicParams = Schema.Schema.Type<typeof CreateForumTopicParams>

/**
 * Request parameters for `createInvoiceLink`. Use this method to create a link for an invoice. Returns the created invoice link as String on success.
 *
 * @category params
 * @since 0.1.0
 */
export const CreateInvoiceLinkParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  title: Schema.String,
  description: Schema.String,
  payload: Schema.String,
  providerToken: Schema.optionalKey(Schema.String),
  currency: Schema.String,
  prices: Schema.Array(T.LabeledPrice),
  subscriptionPeriod: Schema.optionalKey(Schema.Number),
  maxTipAmount: Schema.optionalKey(Schema.Number),
  suggestedTipAmounts: Schema.optionalKey(Schema.Array(Schema.Number)),
  providerData: Schema.optionalKey(Schema.String),
  photoUrl: Schema.optionalKey(Schema.String),
  photoSize: Schema.optionalKey(Schema.Number),
  photoWidth: Schema.optionalKey(Schema.Number),
  photoHeight: Schema.optionalKey(Schema.Number),
  needName: Schema.optionalKey(Schema.Boolean),
  needPhoneNumber: Schema.optionalKey(Schema.Boolean),
  needEmail: Schema.optionalKey(Schema.Boolean),
  needShippingAddress: Schema.optionalKey(Schema.Boolean),
  sendPhoneNumberToProvider: Schema.optionalKey(Schema.Boolean),
  sendEmailToProvider: Schema.optionalKey(Schema.Boolean),
  isFlexible: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    providerToken: "provider_token",
    subscriptionPeriod: "subscription_period",
    maxTipAmount: "max_tip_amount",
    suggestedTipAmounts: "suggested_tip_amounts",
    providerData: "provider_data",
    photoUrl: "photo_url",
    photoSize: "photo_size",
    photoWidth: "photo_width",
    photoHeight: "photo_height",
    needName: "need_name",
    needPhoneNumber: "need_phone_number",
    needEmail: "need_email",
    needShippingAddress: "need_shipping_address",
    sendPhoneNumberToProvider: "send_phone_number_to_provider",
    sendEmailToProvider: "send_email_to_provider",
    isFlexible: "is_flexible"
  })
)

/**
 * `CreateInvoiceLinkParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type CreateInvoiceLinkParams = Schema.Schema.Type<typeof CreateInvoiceLinkParams>

/**
 * Request parameters for `createNewStickerSet`. Use this method to create a new sticker set owned by a user. The bot will be able to edit the sticker set thus created. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const CreateNewStickerSetParams = Schema.Struct({
  userId: Schema.Number,
  name: Schema.String,
  title: Schema.String,
  stickers: Schema.Array(T.InputSticker),
  stickerType: Schema.optionalKey(Schema.String),
  needsRepainting: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    userId: "user_id",
    stickerType: "sticker_type",
    needsRepainting: "needs_repainting"
  })
)

/**
 * `CreateNewStickerSetParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type CreateNewStickerSetParams = Schema.Schema.Type<typeof CreateNewStickerSetParams>

/**
 * Request parameters for `declineChatJoinRequest`. Use this method to decline a chat join request. The bot must be an administrator in the chat for this to work and must have the can_invite_users administrator right. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const DeclineChatJoinRequestParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  userId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    userId: "user_id"
  })
)

/**
 * `DeclineChatJoinRequestParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type DeclineChatJoinRequestParams = Schema.Schema.Type<typeof DeclineChatJoinRequestParams>

/**
 * Request parameters for `declineSuggestedPost`. Use this method to decline a suggested post in a direct messages chat. The bot must have the 'can_manage_direct_messages' administrator right in the corresponding channel chat. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const DeclineSuggestedPostParams = Schema.Struct({
  chatId: Schema.Number,
  messageId: Schema.Number,
  comment: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageId: "message_id"
  })
)

/**
 * `DeclineSuggestedPostParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type DeclineSuggestedPostParams = Schema.Schema.Type<typeof DeclineSuggestedPostParams>

/**
 * Request parameters for `deleteAllMessageReactions`. Use this method to remove up to 10000 recent reactions in a group or a supergroup chat added by a given user or chat. The bot must have the 'can_delete_messages' administrator right in the chat. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const DeleteAllMessageReactionsParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  userId: Schema.optionalKey(Schema.Number),
  actorChatId: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    userId: "user_id",
    actorChatId: "actor_chat_id"
  })
)

/**
 * `DeleteAllMessageReactionsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type DeleteAllMessageReactionsParams = Schema.Schema.Type<typeof DeleteAllMessageReactionsParams>

/**
 * Request parameters for `deleteBusinessMessages`. Delete messages on behalf of a business account. Requires the can_delete_sent_messages business bot right to delete messages sent by the bot itself, or the can_delete_all_messages business bot right to delete any message. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const DeleteBusinessMessagesParams = Schema.Struct({
  businessConnectionId: Schema.String,
  messageIds: Schema.Array(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    messageIds: "message_ids"
  })
)

/**
 * `DeleteBusinessMessagesParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type DeleteBusinessMessagesParams = Schema.Schema.Type<typeof DeleteBusinessMessagesParams>

/**
 * Request parameters for `deleteChatPhoto`. Use this method to delete a chat photo. Photos can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const DeleteChatPhotoParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String])
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `DeleteChatPhotoParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type DeleteChatPhotoParams = Schema.Schema.Type<typeof DeleteChatPhotoParams>

/**
 * Request parameters for `deleteChatStickerSet`. Use this method to delete a group sticker set from a supergroup. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Use the field can_set_sticker_set optionally returned in getChat requests to check if the bot can use this method. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const DeleteChatStickerSetParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String])
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `DeleteChatStickerSetParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type DeleteChatStickerSetParams = Schema.Schema.Type<typeof DeleteChatStickerSetParams>

/**
 * Request parameters for `deleteForumTopic`. Use this method to delete a forum topic along with all its messages in a forum supergroup chat or a private chat with a user. In the case of a supergroup chat the bot must be an administrator in the chat for this to work and must have the can_delete_messages administrator rights. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const DeleteForumTopicParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageThreadId: "message_thread_id"
  })
)

/**
 * `DeleteForumTopicParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type DeleteForumTopicParams = Schema.Schema.Type<typeof DeleteForumTopicParams>

/**
 * Request parameters for `deleteMessage`. Use this method to delete a message, including service messages, with the following limitations: - A message can only be deleted if it was sent less than 48 hours ago. - Service messages about a supergroup, channel, or forum topic creation can't be deleted. - A dice message in a private chat can only be deleted if it was sent more than 24 hours ago. - Bots can delete outgoing messages in private chats, groups, and supergroups. - Bots can delete incoming messages in private chats. - Bots granted can_post_messages permissions can delete outgoing messages in channels. - If the bot is an administrator of a group, it can delete any message there. - If the bot has can_delete_messages administrator right in a supergroup or a channel, it can delete any message there. - If the bot has can_manage_direct_messages administrator right in a channel, it can delete any message in the corresponding direct messages chat. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const DeleteMessageParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageId: "message_id"
  })
)

/**
 * `DeleteMessageParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type DeleteMessageParams = Schema.Schema.Type<typeof DeleteMessageParams>

/**
 * Request parameters for `deleteMessageReaction`. Use this method to remove a reaction from a message in a group or a supergroup chat. The bot must have the 'can_delete_messages' administrator right in the chat. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const DeleteMessageReactionParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageId: Schema.Number,
  userId: Schema.optionalKey(Schema.Number),
  actorChatId: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageId: "message_id",
    userId: "user_id",
    actorChatId: "actor_chat_id"
  })
)

/**
 * `DeleteMessageReactionParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type DeleteMessageReactionParams = Schema.Schema.Type<typeof DeleteMessageReactionParams>

/**
 * Request parameters for `deleteMessages`. Use this method to delete multiple messages simultaneously. If some of the specified messages can't be found, they are skipped. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const DeleteMessagesParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageIds: Schema.Array(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageIds: "message_ids"
  })
)

/**
 * `DeleteMessagesParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type DeleteMessagesParams = Schema.Schema.Type<typeof DeleteMessagesParams>

/**
 * Request parameters for `deleteMyCommands`. Use this method to delete the list of the bot's commands for the given scope and user language. After deletion, higher level commands will be shown to affected users. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const DeleteMyCommandsParams = Schema.Struct({
  scope: Schema.optionalKey(T.BotCommandScope),
  languageCode: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    languageCode: "language_code"
  })
)

/**
 * `DeleteMyCommandsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type DeleteMyCommandsParams = Schema.Schema.Type<typeof DeleteMyCommandsParams>

/**
 * Request parameters for `deleteStickerFromSet`. Use this method to delete a sticker from a set created by the bot. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const DeleteStickerFromSetParams = Schema.Struct({
  sticker: Schema.String
})

/**
 * `DeleteStickerFromSetParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type DeleteStickerFromSetParams = Schema.Schema.Type<typeof DeleteStickerFromSetParams>

/**
 * Request parameters for `deleteStickerSet`. Use this method to delete a sticker set that was created by the bot. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const DeleteStickerSetParams = Schema.Struct({
  name: Schema.String
})

/**
 * `DeleteStickerSetParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type DeleteStickerSetParams = Schema.Schema.Type<typeof DeleteStickerSetParams>

/**
 * Request parameters for `deleteStory`. Deletes a story previously posted by the bot on behalf of a managed business account. Requires the can_manage_stories business bot right. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const DeleteStoryParams = Schema.Struct({
  businessConnectionId: Schema.String,
  storyId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    storyId: "story_id"
  })
)

/**
 * `DeleteStoryParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type DeleteStoryParams = Schema.Schema.Type<typeof DeleteStoryParams>

/**
 * Request parameters for `deleteWebhook`. Use this method to remove webhook integration if you decide to switch back to getUpdates. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const DeleteWebhookParams = Schema.Struct({
  dropPendingUpdates: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    dropPendingUpdates: "drop_pending_updates"
  })
)

/**
 * `DeleteWebhookParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type DeleteWebhookParams = Schema.Schema.Type<typeof DeleteWebhookParams>

/**
 * Request parameters for `editChatInviteLink`. Use this method to edit a non-primary invite link created by the bot. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns the edited invite link as a ChatInviteLink object.
 *
 * @category params
 * @since 0.1.0
 */
export const EditChatInviteLinkParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  inviteLink: Schema.String,
  name: Schema.optionalKey(Schema.String),
  expireDate: Schema.optionalKey(Schema.Number),
  memberLimit: Schema.optionalKey(Schema.Number),
  createsJoinRequest: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    inviteLink: "invite_link",
    expireDate: "expire_date",
    memberLimit: "member_limit",
    createsJoinRequest: "creates_join_request"
  })
)

/**
 * `EditChatInviteLinkParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type EditChatInviteLinkParams = Schema.Schema.Type<typeof EditChatInviteLinkParams>

/**
 * Request parameters for `editChatSubscriptionInviteLink`. Use this method to edit a subscription invite link created by the bot. The bot must have the can_invite_users administrator rights. Returns the edited invite link as a ChatInviteLink object.
 *
 * @category params
 * @since 0.1.0
 */
export const EditChatSubscriptionInviteLinkParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  inviteLink: Schema.String,
  name: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    inviteLink: "invite_link"
  })
)

/**
 * `EditChatSubscriptionInviteLinkParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type EditChatSubscriptionInviteLinkParams = Schema.Schema.Type<typeof EditChatSubscriptionInviteLinkParams>

/**
 * Request parameters for `editForumTopic`. Use this method to edit name and icon of a topic in a forum supergroup chat or a private chat with a user. In the case of a supergroup chat the bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights, unless it is the creator of the topic. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const EditForumTopicParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.Number,
  name: Schema.optionalKey(Schema.String),
  iconCustomEmojiId: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    iconCustomEmojiId: "icon_custom_emoji_id"
  })
)

/**
 * `EditForumTopicParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type EditForumTopicParams = Schema.Schema.Type<typeof EditForumTopicParams>

/**
 * Request parameters for `editGeneralForumTopic`. Use this method to edit the name of the 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const EditGeneralForumTopicParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  name: Schema.String
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `EditGeneralForumTopicParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type EditGeneralForumTopicParams = Schema.Schema.Type<typeof EditGeneralForumTopicParams>

/**
 * Request parameters for `editMessageCaption`. Use this method to edit captions of messages. On success, if the edited message is not an inline message, the edited Message is returned, otherwise True is returned. Note that business messages that were not sent by the bot and do not contain an inline keyboard can only be edited within 48 hours from the time they were sent.
 *
 * @category params
 * @since 0.1.0
 */
export const EditMessageCaptionParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.optionalKey(Schema.Union([Schema.Number, Schema.String])),
  messageId: Schema.optionalKey(Schema.Number),
  inlineMessageId: Schema.optionalKey(Schema.String),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  replyMarkup: Schema.optionalKey(T.InlineKeyboardMarkup)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageId: "message_id",
    inlineMessageId: "inline_message_id",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    replyMarkup: "reply_markup"
  })
)

/**
 * `EditMessageCaptionParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type EditMessageCaptionParams = Schema.Schema.Type<typeof EditMessageCaptionParams>

/**
 * Request parameters for `editMessageChecklist`. Use this method to edit a checklist on behalf of a connected business account. On success, the edited Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const EditMessageChecklistParams = Schema.Struct({
  businessConnectionId: Schema.String,
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageId: Schema.Number,
  checklist: T.InputChecklist,
  replyMarkup: Schema.optionalKey(T.InlineKeyboardMarkup)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageId: "message_id",
    replyMarkup: "reply_markup"
  })
)

/**
 * `EditMessageChecklistParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type EditMessageChecklistParams = Schema.Schema.Type<typeof EditMessageChecklistParams>

/**
 * Request parameters for `editMessageLiveLocation`. Use this method to edit live location messages. A location can be edited until its live_period expires or editing is explicitly disabled by a call to stopMessageLiveLocation. On success, if the edited message is not an inline message, the edited Message is returned, otherwise True is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const EditMessageLiveLocationParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.optionalKey(Schema.Union([Schema.Number, Schema.String])),
  messageId: Schema.optionalKey(Schema.Number),
  inlineMessageId: Schema.optionalKey(Schema.String),
  latitude: Schema.Number,
  longitude: Schema.Number,
  livePeriod: Schema.optionalKey(Schema.Number),
  horizontalAccuracy: Schema.optionalKey(Schema.Number),
  heading: Schema.optionalKey(Schema.Number),
  proximityAlertRadius: Schema.optionalKey(Schema.Number),
  replyMarkup: Schema.optionalKey(T.InlineKeyboardMarkup)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageId: "message_id",
    inlineMessageId: "inline_message_id",
    livePeriod: "live_period",
    horizontalAccuracy: "horizontal_accuracy",
    proximityAlertRadius: "proximity_alert_radius",
    replyMarkup: "reply_markup"
  })
)

/**
 * `EditMessageLiveLocationParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type EditMessageLiveLocationParams = Schema.Schema.Type<typeof EditMessageLiveLocationParams>

/**
 * Request parameters for `editMessageMedia`. Use this method to edit animation, audio, document, live photo, photo, or video messages, or to replace a text or a rich message with a media. If a message is part of a message album, then it can be edited only to an audio for audio albums, only to a document for document albums and to a photo, a live photo, or a video otherwise. When an inline message is edited, a new file can't be uploaded; use a previously uploaded file via its file_id or specify a URL. On success, if the edited message is not an inline message, the edited Message is returned, otherwise True is returned. Note that business messages that were not sent by the bot and do not contain an inline keyboard can only be edited within 48 hours from the time they were sent.
 *
 * @category params
 * @since 0.1.0
 */
export const EditMessageMediaParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.optionalKey(Schema.Union([Schema.Number, Schema.String])),
  messageId: Schema.optionalKey(Schema.Number),
  inlineMessageId: Schema.optionalKey(Schema.String),
  media: T.InputMedia,
  replyMarkup: Schema.optionalKey(T.InlineKeyboardMarkup)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageId: "message_id",
    inlineMessageId: "inline_message_id",
    replyMarkup: "reply_markup"
  })
)

/**
 * `EditMessageMediaParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type EditMessageMediaParams = Schema.Schema.Type<typeof EditMessageMediaParams>

/**
 * Request parameters for `editMessageReplyMarkup`. Use this method to edit only the reply markup of messages. On success, if the edited message is not an inline message, the edited Message is returned, otherwise True is returned. Note that business messages that were not sent by the bot and do not contain an inline keyboard can only be edited within 48 hours from the time they were sent.
 *
 * @category params
 * @since 0.1.0
 */
export const EditMessageReplyMarkupParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.optionalKey(Schema.Union([Schema.Number, Schema.String])),
  messageId: Schema.optionalKey(Schema.Number),
  inlineMessageId: Schema.optionalKey(Schema.String),
  replyMarkup: Schema.optionalKey(T.InlineKeyboardMarkup)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageId: "message_id",
    inlineMessageId: "inline_message_id",
    replyMarkup: "reply_markup"
  })
)

/**
 * `EditMessageReplyMarkupParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type EditMessageReplyMarkupParams = Schema.Schema.Type<typeof EditMessageReplyMarkupParams>

/**
 * Request parameters for `editMessageText`. Use this method to edit text, rich and game messages. On success, if the edited message is not an inline message, the edited Message is returned, otherwise True is returned. Note that business messages that were not sent by the bot and do not contain an inline keyboard can only be edited within 48 hours from the time they were sent.
 *
 * @category params
 * @since 0.1.0
 */
export const EditMessageTextParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.optionalKey(Schema.Union([Schema.Number, Schema.String])),
  messageId: Schema.optionalKey(Schema.Number),
  inlineMessageId: Schema.optionalKey(Schema.String),
  text: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  entities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  linkPreviewOptions: Schema.optionalKey(T.LinkPreviewOptions),
  richMessage: Schema.optionalKey(T.InputRichMessage),
  replyMarkup: Schema.optionalKey(T.InlineKeyboardMarkup)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageId: "message_id",
    inlineMessageId: "inline_message_id",
    parseMode: "parse_mode",
    linkPreviewOptions: "link_preview_options",
    richMessage: "rich_message",
    replyMarkup: "reply_markup"
  })
)

/**
 * `EditMessageTextParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type EditMessageTextParams = Schema.Schema.Type<typeof EditMessageTextParams>

/**
 * Request parameters for `editStory`. Edits a story previously posted by the bot on behalf of a managed business account. Requires the can_manage_stories business bot right. Returns Story on success.
 *
 * @category params
 * @since 0.1.0
 */
export const EditStoryParams = Schema.Struct({
  businessConnectionId: Schema.String,
  storyId: Schema.Number,
  content: T.InputStoryContent,
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  areas: Schema.optionalKey(Schema.Array(T.StoryArea))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    storyId: "story_id",
    parseMode: "parse_mode",
    captionEntities: "caption_entities"
  })
)

/**
 * `EditStoryParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type EditStoryParams = Schema.Schema.Type<typeof EditStoryParams>

/**
 * Request parameters for `editUserStarSubscription`. Allows the bot to cancel or re-enable extension of a subscription paid in Telegram Stars. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const EditUserStarSubscriptionParams = Schema.Struct({
  userId: Schema.Number,
  telegramPaymentChargeId: Schema.String,
  isCanceled: Schema.Boolean
}).pipe(
  Schema.encodeKeys({
    userId: "user_id",
    telegramPaymentChargeId: "telegram_payment_charge_id",
    isCanceled: "is_canceled"
  })
)

/**
 * `EditUserStarSubscriptionParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type EditUserStarSubscriptionParams = Schema.Schema.Type<typeof EditUserStarSubscriptionParams>

/**
 * Request parameters for `exportChatInviteLink`. Use this method to generate a new primary invite link for a chat; any previously generated primary link is revoked. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns the new invite link as String on success.
 *
 * @category params
 * @since 0.1.0
 */
export const ExportChatInviteLinkParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String])
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `ExportChatInviteLinkParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type ExportChatInviteLinkParams = Schema.Schema.Type<typeof ExportChatInviteLinkParams>

/**
 * Request parameters for `forwardMessage`. Use this method to forward messages of any kind. Service messages and messages with protected content can't be forwarded. On success, the sent Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const ForwardMessageParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  fromChatId: Schema.Union([Schema.Number, Schema.String]),
  videoStartTimestamp: Schema.optionalKey(Schema.Number),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  messageId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    fromChatId: "from_chat_id",
    videoStartTimestamp: "video_start_timestamp",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    messageId: "message_id"
  })
)

/**
 * `ForwardMessageParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type ForwardMessageParams = Schema.Schema.Type<typeof ForwardMessageParams>

/**
 * Request parameters for `forwardMessages`. Use this method to forward multiple messages of any kind. If some of the specified messages can't be found or forwarded, they are skipped. Service messages and messages with protected content can't be forwarded. Album grouping is kept for forwarded messages. On success, an array of MessageId of the sent messages is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const ForwardMessagesParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  fromChatId: Schema.Union([Schema.Number, Schema.String]),
  messageIds: Schema.Array(Schema.Number),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    fromChatId: "from_chat_id",
    messageIds: "message_ids",
    disableNotification: "disable_notification",
    protectContent: "protect_content"
  })
)

/**
 * `ForwardMessagesParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type ForwardMessagesParams = Schema.Schema.Type<typeof ForwardMessagesParams>

/**
 * Request parameters for `getBusinessAccountGifts`. Returns the gifts received and owned by a managed business account. Requires the can_view_gifts_and_stars business bot right. Returns OwnedGifts on success.
 *
 * @category params
 * @since 0.1.0
 */
export const GetBusinessAccountGiftsParams = Schema.Struct({
  businessConnectionId: Schema.String,
  excludeUnsaved: Schema.optionalKey(Schema.Boolean),
  excludeSaved: Schema.optionalKey(Schema.Boolean),
  excludeUnlimited: Schema.optionalKey(Schema.Boolean),
  excludeLimitedUpgradable: Schema.optionalKey(Schema.Boolean),
  excludeLimitedNonUpgradable: Schema.optionalKey(Schema.Boolean),
  excludeUnique: Schema.optionalKey(Schema.Boolean),
  excludeFromBlockchain: Schema.optionalKey(Schema.Boolean),
  sortByPrice: Schema.optionalKey(Schema.Boolean),
  offset: Schema.optionalKey(Schema.String),
  limit: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    excludeUnsaved: "exclude_unsaved",
    excludeSaved: "exclude_saved",
    excludeUnlimited: "exclude_unlimited",
    excludeLimitedUpgradable: "exclude_limited_upgradable",
    excludeLimitedNonUpgradable: "exclude_limited_non_upgradable",
    excludeUnique: "exclude_unique",
    excludeFromBlockchain: "exclude_from_blockchain",
    sortByPrice: "sort_by_price"
  })
)

/**
 * `GetBusinessAccountGiftsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetBusinessAccountGiftsParams = Schema.Schema.Type<typeof GetBusinessAccountGiftsParams>

/**
 * Request parameters for `getBusinessAccountStarBalance`. Returns the amount of Telegram Stars owned by a managed business account. Requires the can_view_gifts_and_stars business bot right. Returns StarAmount on success.
 *
 * @category params
 * @since 0.1.0
 */
export const GetBusinessAccountStarBalanceParams = Schema.Struct({
  businessConnectionId: Schema.String
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id"
  })
)

/**
 * `GetBusinessAccountStarBalanceParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetBusinessAccountStarBalanceParams = Schema.Schema.Type<typeof GetBusinessAccountStarBalanceParams>

/**
 * Request parameters for `getBusinessConnection`. Use this method to get information about the connection of the bot with a business account. Returns a BusinessConnection object on success.
 *
 * @category params
 * @since 0.1.0
 */
export const GetBusinessConnectionParams = Schema.Struct({
  businessConnectionId: Schema.String
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id"
  })
)

/**
 * `GetBusinessConnectionParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetBusinessConnectionParams = Schema.Schema.Type<typeof GetBusinessConnectionParams>

/**
 * Request parameters for `getChat`. Use this method to get up-to-date information about the chat. Returns a ChatFullInfo object on success.
 *
 * @category params
 * @since 0.1.0
 */
export const GetChatParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String])
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `GetChatParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetChatParams = Schema.Schema.Type<typeof GetChatParams>

/**
 * Request parameters for `getChatAdministrators`. Use this method to get a list of administrators in a chat. Returns an Array of ChatMember objects.
 *
 * @category params
 * @since 0.1.0
 */
export const GetChatAdministratorsParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  returnBots: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    returnBots: "return_bots"
  })
)

/**
 * `GetChatAdministratorsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetChatAdministratorsParams = Schema.Schema.Type<typeof GetChatAdministratorsParams>

/**
 * Request parameters for `getChatGifts`. Returns the gifts owned by a chat. Returns OwnedGifts on success.
 *
 * @category params
 * @since 0.1.0
 */
export const GetChatGiftsParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  excludeUnsaved: Schema.optionalKey(Schema.Boolean),
  excludeSaved: Schema.optionalKey(Schema.Boolean),
  excludeUnlimited: Schema.optionalKey(Schema.Boolean),
  excludeLimitedUpgradable: Schema.optionalKey(Schema.Boolean),
  excludeLimitedNonUpgradable: Schema.optionalKey(Schema.Boolean),
  excludeFromBlockchain: Schema.optionalKey(Schema.Boolean),
  excludeUnique: Schema.optionalKey(Schema.Boolean),
  sortByPrice: Schema.optionalKey(Schema.Boolean),
  offset: Schema.optionalKey(Schema.String),
  limit: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    excludeUnsaved: "exclude_unsaved",
    excludeSaved: "exclude_saved",
    excludeUnlimited: "exclude_unlimited",
    excludeLimitedUpgradable: "exclude_limited_upgradable",
    excludeLimitedNonUpgradable: "exclude_limited_non_upgradable",
    excludeFromBlockchain: "exclude_from_blockchain",
    excludeUnique: "exclude_unique",
    sortByPrice: "sort_by_price"
  })
)

/**
 * `GetChatGiftsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetChatGiftsParams = Schema.Schema.Type<typeof GetChatGiftsParams>

/**
 * Request parameters for `getChatMember`. Use this method to get information about a member of a chat. The method is only guaranteed to work for other users if the bot is an administrator in the chat. Returns a ChatMember object on success.
 *
 * @category params
 * @since 0.1.0
 */
export const GetChatMemberParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  userId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    userId: "user_id"
  })
)

/**
 * `GetChatMemberParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetChatMemberParams = Schema.Schema.Type<typeof GetChatMemberParams>

/**
 * Request parameters for `getChatMemberCount`. Use this method to get the number of members in a chat. Returns Int on success.
 *
 * @category params
 * @since 0.1.0
 */
export const GetChatMemberCountParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String])
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `GetChatMemberCountParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetChatMemberCountParams = Schema.Schema.Type<typeof GetChatMemberCountParams>

/**
 * Request parameters for `getChatMenuButton`. Use this method to get the current value of the bot's menu button in a private chat, or the default menu button. Returns MenuButton on success.
 *
 * @category params
 * @since 0.1.0
 */
export const GetChatMenuButtonParams = Schema.Struct({
  chatId: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `GetChatMenuButtonParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetChatMenuButtonParams = Schema.Schema.Type<typeof GetChatMenuButtonParams>

/**
 * Request parameters for `getCustomEmojiStickers`. Use this method to get information about custom emoji stickers by their identifiers. Returns an Array of Sticker objects.
 *
 * @category params
 * @since 0.1.0
 */
export const GetCustomEmojiStickersParams = Schema.Struct({
  customEmojiIds: Schema.Array(Schema.String)
}).pipe(
  Schema.encodeKeys({
    customEmojiIds: "custom_emoji_ids"
  })
)

/**
 * `GetCustomEmojiStickersParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetCustomEmojiStickersParams = Schema.Schema.Type<typeof GetCustomEmojiStickersParams>

/**
 * Request parameters for `getFile`. Use this method to get basic information about a file and prepare it for downloading. For the moment, bots can download files of up to 20MB in size. On success, a File object is returned. The file can then be downloaded via the link https://api.telegram.org/file/bot<token>/<file_path>, where <file_path> is taken from the response. It is guaranteed that the link will be valid for at least 1 hour. When the link expires, a new one can be requested by calling getFile again. Note: This function may not preserve the original file name and MIME type. You should save the file's MIME type and name (if available) when the File object is received.
 *
 * @category params
 * @since 0.1.0
 */
export const GetFileParams = Schema.Struct({
  fileId: Schema.String
}).pipe(
  Schema.encodeKeys({
    fileId: "file_id"
  })
)

/**
 * `GetFileParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetFileParams = Schema.Schema.Type<typeof GetFileParams>

/**
 * Request parameters for `getGameHighScores`. Use this method to get data for high score tables. Will return the score of the specified user and several of their neighbors in a game. Returns an Array of GameHighScore objects.
 *
 * @category params
 * @since 0.1.0
 */
export const GetGameHighScoresParams = Schema.Struct({
  userId: Schema.Number,
  chatId: Schema.optionalKey(Schema.Number),
  messageId: Schema.optionalKey(Schema.Number),
  inlineMessageId: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    userId: "user_id",
    chatId: "chat_id",
    messageId: "message_id",
    inlineMessageId: "inline_message_id"
  })
)

/**
 * `GetGameHighScoresParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetGameHighScoresParams = Schema.Schema.Type<typeof GetGameHighScoresParams>

/**
 * Request parameters for `getManagedBotAccessSettings`. Use this method to get the access settings of a managed bot. Returns a BotAccessSettings object on success.
 *
 * @category params
 * @since 0.1.0
 */
export const GetManagedBotAccessSettingsParams = Schema.Struct({
  userId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    userId: "user_id"
  })
)

/**
 * `GetManagedBotAccessSettingsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetManagedBotAccessSettingsParams = Schema.Schema.Type<typeof GetManagedBotAccessSettingsParams>

/**
 * Request parameters for `getManagedBotToken`. Use this method to get the token of a managed bot. Returns the token as String on success.
 *
 * @category params
 * @since 0.1.0
 */
export const GetManagedBotTokenParams = Schema.Struct({
  userId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    userId: "user_id"
  })
)

/**
 * `GetManagedBotTokenParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetManagedBotTokenParams = Schema.Schema.Type<typeof GetManagedBotTokenParams>

/**
 * Request parameters for `getMyCommands`. Use this method to get the current list of the bot's commands for the given scope and user language. Returns an Array of BotCommand objects. If commands aren't set, an empty list is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const GetMyCommandsParams = Schema.Struct({
  scope: Schema.optionalKey(T.BotCommandScope),
  languageCode: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    languageCode: "language_code"
  })
)

/**
 * `GetMyCommandsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetMyCommandsParams = Schema.Schema.Type<typeof GetMyCommandsParams>

/**
 * Request parameters for `getMyDefaultAdministratorRights`. Use this method to get the current default administrator rights of the bot. Returns ChatAdministratorRights on success.
 *
 * @category params
 * @since 0.1.0
 */
export const GetMyDefaultAdministratorRightsParams = Schema.Struct({
  forChannels: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    forChannels: "for_channels"
  })
)

/**
 * `GetMyDefaultAdministratorRightsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetMyDefaultAdministratorRightsParams = Schema.Schema.Type<typeof GetMyDefaultAdministratorRightsParams>

/**
 * Request parameters for `getMyDescription`. Use this method to get the current bot description for the given user language. Returns BotDescription on success.
 *
 * @category params
 * @since 0.1.0
 */
export const GetMyDescriptionParams = Schema.Struct({
  languageCode: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    languageCode: "language_code"
  })
)

/**
 * `GetMyDescriptionParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetMyDescriptionParams = Schema.Schema.Type<typeof GetMyDescriptionParams>

/**
 * Request parameters for `getMyName`. Use this method to get the current bot name for the given user language. Returns BotName on success.
 *
 * @category params
 * @since 0.1.0
 */
export const GetMyNameParams = Schema.Struct({
  languageCode: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    languageCode: "language_code"
  })
)

/**
 * `GetMyNameParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetMyNameParams = Schema.Schema.Type<typeof GetMyNameParams>

/**
 * Request parameters for `getMyShortDescription`. Use this method to get the current bot short description for the given user language. Returns BotShortDescription on success.
 *
 * @category params
 * @since 0.1.0
 */
export const GetMyShortDescriptionParams = Schema.Struct({
  languageCode: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    languageCode: "language_code"
  })
)

/**
 * `GetMyShortDescriptionParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetMyShortDescriptionParams = Schema.Schema.Type<typeof GetMyShortDescriptionParams>

/**
 * Request parameters for `getStarTransactions`. Returns the bot's Telegram Star transactions in chronological order. On success, returns a StarTransactions object.
 *
 * @category params
 * @since 0.1.0
 */
export const GetStarTransactionsParams = Schema.Struct({
  offset: Schema.optionalKey(Schema.Number),
  limit: Schema.optionalKey(Schema.Number)
})

/**
 * `GetStarTransactionsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetStarTransactionsParams = Schema.Schema.Type<typeof GetStarTransactionsParams>

/**
 * Request parameters for `getStickerSet`. Use this method to get a sticker set. On success, a StickerSet object is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const GetStickerSetParams = Schema.Struct({
  name: Schema.String
})

/**
 * `GetStickerSetParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetStickerSetParams = Schema.Schema.Type<typeof GetStickerSetParams>

/**
 * Request parameters for `getUpdates`. Use this method to receive incoming updates using long polling (wiki). Returns an Array of Update objects.
 *
 * @category params
 * @since 0.1.0
 */
export const GetUpdatesParams = Schema.Struct({
  offset: Schema.optionalKey(Schema.Number),
  limit: Schema.optionalKey(Schema.Number),
  timeout: Schema.optionalKey(Schema.Number),
  allowedUpdates: Schema.optionalKey(Schema.Array(Schema.String))
}).pipe(
  Schema.encodeKeys({
    allowedUpdates: "allowed_updates"
  })
)

/**
 * `GetUpdatesParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetUpdatesParams = Schema.Schema.Type<typeof GetUpdatesParams>

/**
 * Request parameters for `getUserChatBoosts`. Use this method to get the list of boosts added to a chat by a user. Requires administrator rights in the chat. Returns a UserChatBoosts object.
 *
 * @category params
 * @since 0.1.0
 */
export const GetUserChatBoostsParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  userId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    userId: "user_id"
  })
)

/**
 * `GetUserChatBoostsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetUserChatBoostsParams = Schema.Schema.Type<typeof GetUserChatBoostsParams>

/**
 * Request parameters for `getUserGifts`. Returns the gifts owned and hosted by a user. Returns OwnedGifts on success.
 *
 * @category params
 * @since 0.1.0
 */
export const GetUserGiftsParams = Schema.Struct({
  userId: Schema.Number,
  excludeUnlimited: Schema.optionalKey(Schema.Boolean),
  excludeLimitedUpgradable: Schema.optionalKey(Schema.Boolean),
  excludeLimitedNonUpgradable: Schema.optionalKey(Schema.Boolean),
  excludeFromBlockchain: Schema.optionalKey(Schema.Boolean),
  excludeUnique: Schema.optionalKey(Schema.Boolean),
  sortByPrice: Schema.optionalKey(Schema.Boolean),
  offset: Schema.optionalKey(Schema.String),
  limit: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    userId: "user_id",
    excludeUnlimited: "exclude_unlimited",
    excludeLimitedUpgradable: "exclude_limited_upgradable",
    excludeLimitedNonUpgradable: "exclude_limited_non_upgradable",
    excludeFromBlockchain: "exclude_from_blockchain",
    excludeUnique: "exclude_unique",
    sortByPrice: "sort_by_price"
  })
)

/**
 * `GetUserGiftsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetUserGiftsParams = Schema.Schema.Type<typeof GetUserGiftsParams>

/**
 * Request parameters for `getUserPersonalChatMessages`. Use this method to get the last messages from the personal chat (i.e., the chat currently added to their profile) of a given user. On success, an array of Message objects is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const GetUserPersonalChatMessagesParams = Schema.Struct({
  userId: Schema.Number,
  limit: Schema.Number
}).pipe(
  Schema.encodeKeys({
    userId: "user_id"
  })
)

/**
 * `GetUserPersonalChatMessagesParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetUserPersonalChatMessagesParams = Schema.Schema.Type<typeof GetUserPersonalChatMessagesParams>

/**
 * Request parameters for `getUserProfileAudios`. Use this method to get a list of profile audios for a user. Returns a UserProfileAudios object.
 *
 * @category params
 * @since 0.1.0
 */
export const GetUserProfileAudiosParams = Schema.Struct({
  userId: Schema.Number,
  offset: Schema.optionalKey(Schema.Number),
  limit: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    userId: "user_id"
  })
)

/**
 * `GetUserProfileAudiosParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetUserProfileAudiosParams = Schema.Schema.Type<typeof GetUserProfileAudiosParams>

/**
 * Request parameters for `getUserProfilePhotos`. Use this method to get a list of profile pictures for a user. Returns a UserProfilePhotos object.
 *
 * @category params
 * @since 0.1.0
 */
export const GetUserProfilePhotosParams = Schema.Struct({
  userId: Schema.Number,
  offset: Schema.optionalKey(Schema.Number),
  limit: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    userId: "user_id"
  })
)

/**
 * `GetUserProfilePhotosParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GetUserProfilePhotosParams = Schema.Schema.Type<typeof GetUserProfilePhotosParams>

/**
 * Request parameters for `giftPremiumSubscription`. Gifts a Telegram Premium subscription to the given user. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const GiftPremiumSubscriptionParams = Schema.Struct({
  userId: Schema.Number,
  monthCount: Schema.Number,
  starCount: Schema.Number,
  text: Schema.optionalKey(Schema.String),
  textParseMode: Schema.optionalKey(Schema.String),
  textEntities: Schema.optionalKey(Schema.Array(T.MessageEntity))
}).pipe(
  Schema.encodeKeys({
    userId: "user_id",
    monthCount: "month_count",
    starCount: "star_count",
    textParseMode: "text_parse_mode",
    textEntities: "text_entities"
  })
)

/**
 * `GiftPremiumSubscriptionParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type GiftPremiumSubscriptionParams = Schema.Schema.Type<typeof GiftPremiumSubscriptionParams>

/**
 * Request parameters for `hideGeneralForumTopic`. Use this method to hide the 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights. The topic will be automatically closed if it was open. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const HideGeneralForumTopicParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String])
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `HideGeneralForumTopicParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type HideGeneralForumTopicParams = Schema.Schema.Type<typeof HideGeneralForumTopicParams>

/**
 * Request parameters for `leaveChat`. Use this method for your bot to leave a group, supergroup or channel. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const LeaveChatParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String])
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `LeaveChatParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type LeaveChatParams = Schema.Schema.Type<typeof LeaveChatParams>

/**
 * Request parameters for `pinChatMessage`. Use this method to add a message to the list of pinned messages in a chat. In private chats and channel direct messages chats, all non-service messages can be pinned. Conversely, the bot must be an administrator with the 'can_pin_messages' right or the 'can_edit_messages' right to pin messages in groups and channels respectively. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const PinChatMessageParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageId: Schema.Number,
  disableNotification: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageId: "message_id",
    disableNotification: "disable_notification"
  })
)

/**
 * `PinChatMessageParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type PinChatMessageParams = Schema.Schema.Type<typeof PinChatMessageParams>

/**
 * Request parameters for `postStory`. Posts a story on behalf of a managed business account. Requires the can_manage_stories business bot right. Returns Story on success.
 *
 * @category params
 * @since 0.1.0
 */
export const PostStoryParams = Schema.Struct({
  businessConnectionId: Schema.String,
  content: T.InputStoryContent,
  activePeriod: Schema.Number,
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  areas: Schema.optionalKey(Schema.Array(T.StoryArea)),
  postToChatPage: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    activePeriod: "active_period",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    postToChatPage: "post_to_chat_page",
    protectContent: "protect_content"
  })
)

/**
 * `PostStoryParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type PostStoryParams = Schema.Schema.Type<typeof PostStoryParams>

/**
 * Request parameters for `promoteChatMember`. Use this method to promote or demote a user in a supergroup or a channel. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Pass False for all boolean parameters to demote a user. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const PromoteChatMemberParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  userId: Schema.Number,
  isAnonymous: Schema.optionalKey(Schema.Boolean),
  canManageChat: Schema.optionalKey(Schema.Boolean),
  canDeleteMessages: Schema.optionalKey(Schema.Boolean),
  canManageVideoChats: Schema.optionalKey(Schema.Boolean),
  canRestrictMembers: Schema.optionalKey(Schema.Boolean),
  canPromoteMembers: Schema.optionalKey(Schema.Boolean),
  canChangeInfo: Schema.optionalKey(Schema.Boolean),
  canInviteUsers: Schema.optionalKey(Schema.Boolean),
  canPostStories: Schema.optionalKey(Schema.Boolean),
  canEditStories: Schema.optionalKey(Schema.Boolean),
  canDeleteStories: Schema.optionalKey(Schema.Boolean),
  canPostMessages: Schema.optionalKey(Schema.Boolean),
  canEditMessages: Schema.optionalKey(Schema.Boolean),
  canPinMessages: Schema.optionalKey(Schema.Boolean),
  canManageTopics: Schema.optionalKey(Schema.Boolean),
  canManageDirectMessages: Schema.optionalKey(Schema.Boolean),
  canManageTags: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    userId: "user_id",
    isAnonymous: "is_anonymous",
    canManageChat: "can_manage_chat",
    canDeleteMessages: "can_delete_messages",
    canManageVideoChats: "can_manage_video_chats",
    canRestrictMembers: "can_restrict_members",
    canPromoteMembers: "can_promote_members",
    canChangeInfo: "can_change_info",
    canInviteUsers: "can_invite_users",
    canPostStories: "can_post_stories",
    canEditStories: "can_edit_stories",
    canDeleteStories: "can_delete_stories",
    canPostMessages: "can_post_messages",
    canEditMessages: "can_edit_messages",
    canPinMessages: "can_pin_messages",
    canManageTopics: "can_manage_topics",
    canManageDirectMessages: "can_manage_direct_messages",
    canManageTags: "can_manage_tags"
  })
)

/**
 * `PromoteChatMemberParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type PromoteChatMemberParams = Schema.Schema.Type<typeof PromoteChatMemberParams>

/**
 * Request parameters for `readBusinessMessage`. Marks incoming message as read on behalf of a business account. Requires the can_read_messages business bot right. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const ReadBusinessMessageParams = Schema.Struct({
  businessConnectionId: Schema.String,
  chatId: Schema.Number,
  messageId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageId: "message_id"
  })
)

/**
 * `ReadBusinessMessageParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type ReadBusinessMessageParams = Schema.Schema.Type<typeof ReadBusinessMessageParams>

/**
 * Request parameters for `refundStarPayment`. Refunds a successful payment in Telegram Stars. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const RefundStarPaymentParams = Schema.Struct({
  userId: Schema.Number,
  telegramPaymentChargeId: Schema.String
}).pipe(
  Schema.encodeKeys({
    userId: "user_id",
    telegramPaymentChargeId: "telegram_payment_charge_id"
  })
)

/**
 * `RefundStarPaymentParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type RefundStarPaymentParams = Schema.Schema.Type<typeof RefundStarPaymentParams>

/**
 * Request parameters for `removeBusinessAccountProfilePhoto`. Removes the current profile photo of a managed business account. Requires the can_edit_profile_photo business bot right. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const RemoveBusinessAccountProfilePhotoParams = Schema.Struct({
  businessConnectionId: Schema.String,
  isPublic: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    isPublic: "is_public"
  })
)

/**
 * `RemoveBusinessAccountProfilePhotoParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type RemoveBusinessAccountProfilePhotoParams = Schema.Schema.Type<typeof RemoveBusinessAccountProfilePhotoParams>

/**
 * Request parameters for `removeChatVerification`. Removes verification from a chat that is currently verified on behalf of the organization represented by the bot. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const RemoveChatVerificationParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String])
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `RemoveChatVerificationParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type RemoveChatVerificationParams = Schema.Schema.Type<typeof RemoveChatVerificationParams>

/**
 * Request parameters for `removeUserVerification`. Removes verification from a user who is currently verified on behalf of the organization represented by the bot. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const RemoveUserVerificationParams = Schema.Struct({
  userId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    userId: "user_id"
  })
)

/**
 * `RemoveUserVerificationParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type RemoveUserVerificationParams = Schema.Schema.Type<typeof RemoveUserVerificationParams>

/**
 * Request parameters for `reopenForumTopic`. Use this method to reopen a closed topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights, unless it is the creator of the topic. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const ReopenForumTopicParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageThreadId: "message_thread_id"
  })
)

/**
 * `ReopenForumTopicParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type ReopenForumTopicParams = Schema.Schema.Type<typeof ReopenForumTopicParams>

/**
 * Request parameters for `reopenGeneralForumTopic`. Use this method to reopen a closed 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights. The topic will be automatically unhidden if it was hidden. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const ReopenGeneralForumTopicParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String])
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `ReopenGeneralForumTopicParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type ReopenGeneralForumTopicParams = Schema.Schema.Type<typeof ReopenGeneralForumTopicParams>

/**
 * Request parameters for `replaceManagedBotToken`. Use this method to revoke the current token of a managed bot and generate a new one. Returns the new token as String on success.
 *
 * @category params
 * @since 0.1.0
 */
export const ReplaceManagedBotTokenParams = Schema.Struct({
  userId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    userId: "user_id"
  })
)

/**
 * `ReplaceManagedBotTokenParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type ReplaceManagedBotTokenParams = Schema.Schema.Type<typeof ReplaceManagedBotTokenParams>

/**
 * Request parameters for `replaceStickerInSet`. Use this method to replace an existing sticker in a sticker set with a new one. The method is equivalent to calling deleteStickerFromSet, then addStickerToSet, then setStickerPositionInSet. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const ReplaceStickerInSetParams = Schema.Struct({
  userId: Schema.Number,
  name: Schema.String,
  oldSticker: Schema.String,
  sticker: T.InputSticker
}).pipe(
  Schema.encodeKeys({
    userId: "user_id",
    oldSticker: "old_sticker"
  })
)

/**
 * `ReplaceStickerInSetParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type ReplaceStickerInSetParams = Schema.Schema.Type<typeof ReplaceStickerInSetParams>

/**
 * Request parameters for `repostStory`. Reposts a story on behalf of a business account from another business account. Both business accounts must be managed by the same bot, and the story on the source account must have been posted (or reposted) by the bot. Requires the can_manage_stories business bot right for both business accounts. Returns Story on success.
 *
 * @category params
 * @since 0.1.0
 */
export const RepostStoryParams = Schema.Struct({
  businessConnectionId: Schema.String,
  fromChatId: Schema.Number,
  fromStoryId: Schema.Number,
  activePeriod: Schema.Number,
  postToChatPage: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    fromChatId: "from_chat_id",
    fromStoryId: "from_story_id",
    activePeriod: "active_period",
    postToChatPage: "post_to_chat_page",
    protectContent: "protect_content"
  })
)

/**
 * `RepostStoryParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type RepostStoryParams = Schema.Schema.Type<typeof RepostStoryParams>

/**
 * Request parameters for `restrictChatMember`. Use this method to restrict a user in a supergroup. The bot must be an administrator in the supergroup for this to work and must have the appropriate administrator rights. Pass True for all permissions to lift restrictions from a user. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const RestrictChatMemberParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  userId: Schema.Number,
  permissions: T.ChatPermissions,
  useIndependentChatPermissions: Schema.optionalKey(Schema.Boolean),
  untilDate: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    userId: "user_id",
    useIndependentChatPermissions: "use_independent_chat_permissions",
    untilDate: "until_date"
  })
)

/**
 * `RestrictChatMemberParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type RestrictChatMemberParams = Schema.Schema.Type<typeof RestrictChatMemberParams>

/**
 * Request parameters for `revokeChatInviteLink`. Use this method to revoke an invite link created by the bot. If the primary link is revoked, a new link is automatically generated. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns the revoked invite link as ChatInviteLink object.
 *
 * @category params
 * @since 0.1.0
 */
export const RevokeChatInviteLinkParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  inviteLink: Schema.String
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    inviteLink: "invite_link"
  })
)

/**
 * `RevokeChatInviteLinkParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type RevokeChatInviteLinkParams = Schema.Schema.Type<typeof RevokeChatInviteLinkParams>

/**
 * Request parameters for `savePreparedInlineMessage`. Stores a message that can be sent by a user of a Mini App. Returns a PreparedInlineMessage object.
 *
 * @category params
 * @since 0.1.0
 */
export const SavePreparedInlineMessageParams = Schema.Struct({
  userId: Schema.Number,
  result: T.InlineQueryResult,
  allowUserChats: Schema.optionalKey(Schema.Boolean),
  allowBotChats: Schema.optionalKey(Schema.Boolean),
  allowGroupChats: Schema.optionalKey(Schema.Boolean),
  allowChannelChats: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    userId: "user_id",
    allowUserChats: "allow_user_chats",
    allowBotChats: "allow_bot_chats",
    allowGroupChats: "allow_group_chats",
    allowChannelChats: "allow_channel_chats"
  })
)

/**
 * `SavePreparedInlineMessageParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SavePreparedInlineMessageParams = Schema.Schema.Type<typeof SavePreparedInlineMessageParams>

/**
 * Request parameters for `savePreparedKeyboardButton`. Stores a keyboard button that can be used by a user within a Mini App. Returns a PreparedKeyboardButton object.
 *
 * @category params
 * @since 0.1.0
 */
export const SavePreparedKeyboardButtonParams = Schema.Struct({
  userId: Schema.Number,
  button: T.KeyboardButton
}).pipe(
  Schema.encodeKeys({
    userId: "user_id"
  })
)

/**
 * `SavePreparedKeyboardButtonParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SavePreparedKeyboardButtonParams = Schema.Schema.Type<typeof SavePreparedKeyboardButtonParams>

/**
 * Request parameters for `sendAnimation`. Use this method to send animation files (GIF or H.264/MPEG-4 AVC video without sound). On success, the sent Message is returned. Bots can currently send animation files of up to 50 MB in size, this limit may be changed in the future.
 *
 * @category params
 * @since 0.1.0
 */
export const SendAnimationParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  animation: Schema.Union([T.InputFile, Schema.String]),
  duration: Schema.optionalKey(Schema.Number),
  width: Schema.optionalKey(Schema.Number),
  height: Schema.optionalKey(Schema.Number),
  thumbnail: Schema.optionalKey(Schema.Union([T.InputFile, Schema.String])),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  hasSpoiler: Schema.optionalKey(Schema.Boolean),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    hasSpoiler: "has_spoiler",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendAnimationParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendAnimationParams = Schema.Schema.Type<typeof SendAnimationParams>

/**
 * Request parameters for `sendAudio`. Use this method to send audio files, if you want Telegram clients to display them in the music player. Your audio must be in the .MP3 or .M4A format. On success, the sent Message is returned. Bots can currently send audio files of up to 50 MB in size, this limit may be changed in the future. For sending voice messages, use the sendVoice method instead.
 *
 * @category params
 * @since 0.1.0
 */
export const SendAudioParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  audio: Schema.Union([T.InputFile, Schema.String]),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  duration: Schema.optionalKey(Schema.Number),
  performer: Schema.optionalKey(Schema.String),
  title: Schema.optionalKey(Schema.String),
  thumbnail: Schema.optionalKey(Schema.Union([T.InputFile, Schema.String])),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendAudioParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendAudioParams = Schema.Schema.Type<typeof SendAudioParams>

/**
 * Request parameters for `sendChatAction`. Use this method when you need to tell the user that something is happening on the bot's side. The status is set for 5 seconds or less (when a message arrives from your bot, Telegram clients clear its typing status). Returns True on success. We only recommend using this method when a response from the bot will take a noticeable amount of time to arrive.
 *
 * @category params
 * @since 0.1.0
 */
export const SendChatActionParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  action: Schema.String
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id"
  })
)

/**
 * `SendChatActionParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendChatActionParams = Schema.Schema.Type<typeof SendChatActionParams>

/**
 * Request parameters for `sendChatJoinRequestWebApp`. Use this method to process a received chat join request query by showing a Mini App to the user before deciding the outcome. Call answerChatJoinRequestQuery to resolve the join request query based on the user interaction with the Mini App. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SendChatJoinRequestWebAppParams = Schema.Struct({
  chatJoinRequestQueryId: Schema.String,
  webAppUrl: Schema.String
}).pipe(
  Schema.encodeKeys({
    chatJoinRequestQueryId: "chat_join_request_query_id",
    webAppUrl: "web_app_url"
  })
)

/**
 * `SendChatJoinRequestWebAppParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendChatJoinRequestWebAppParams = Schema.Schema.Type<typeof SendChatJoinRequestWebAppParams>

/**
 * Request parameters for `sendChecklist`. Use this method to send a checklist on behalf of a connected business account. On success, the sent Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const SendChecklistParams = Schema.Struct({
  businessConnectionId: Schema.String,
  chatId: Schema.Union([Schema.Number, Schema.String]),
  checklist: T.InputChecklist,
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(T.InlineKeyboardMarkup)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    messageEffectId: "message_effect_id",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendChecklistParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendChecklistParams = Schema.Schema.Type<typeof SendChecklistParams>

/**
 * Request parameters for `sendContact`. Use this method to send phone contacts. On success, the sent Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const SendContactParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  phoneNumber: Schema.String,
  firstName: Schema.String,
  lastName: Schema.optionalKey(Schema.String),
  vcard: Schema.optionalKey(Schema.String),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    phoneNumber: "phone_number",
    firstName: "first_name",
    lastName: "last_name",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendContactParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendContactParams = Schema.Schema.Type<typeof SendContactParams>

/**
 * Request parameters for `sendDice`. Use this method to send an animated emoji that will display a random value. On success, the sent Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const SendDiceParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  emoji: Schema.optionalKey(Schema.String),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendDiceParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendDiceParams = Schema.Schema.Type<typeof SendDiceParams>

/**
 * Request parameters for `sendDocument`. Use this method to send general files. On success, the sent Message is returned. Bots can currently send files of any type of up to 50 MB in size, this limit may be changed in the future.
 *
 * @category params
 * @since 0.1.0
 */
export const SendDocumentParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  document: Schema.Union([T.InputFile, Schema.String]),
  thumbnail: Schema.optionalKey(Schema.Union([T.InputFile, Schema.String])),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  disableContentTypeDetection: Schema.optionalKey(Schema.Boolean),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    disableContentTypeDetection: "disable_content_type_detection",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendDocumentParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendDocumentParams = Schema.Schema.Type<typeof SendDocumentParams>

/**
 * Request parameters for `sendGame`. Use this method to send a game. On success, the sent Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const SendGameParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  gameShortName: Schema.String,
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(T.InlineKeyboardMarkup)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    gameShortName: "game_short_name",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendGameParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendGameParams = Schema.Schema.Type<typeof SendGameParams>

/**
 * Request parameters for `sendGift`. Sends a gift to the given user or channel chat. The gift can't be converted to Telegram Stars by the receiver. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SendGiftParams = Schema.Struct({
  userId: Schema.optionalKey(Schema.Number),
  chatId: Schema.optionalKey(Schema.Union([Schema.Number, Schema.String])),
  giftId: Schema.String,
  payForUpgrade: Schema.optionalKey(Schema.Boolean),
  text: Schema.optionalKey(Schema.String),
  textParseMode: Schema.optionalKey(Schema.String),
  textEntities: Schema.optionalKey(Schema.Array(T.MessageEntity))
}).pipe(
  Schema.encodeKeys({
    userId: "user_id",
    chatId: "chat_id",
    giftId: "gift_id",
    payForUpgrade: "pay_for_upgrade",
    textParseMode: "text_parse_mode",
    textEntities: "text_entities"
  })
)

/**
 * `SendGiftParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendGiftParams = Schema.Schema.Type<typeof SendGiftParams>

/**
 * Request parameters for `sendInvoice`. Use this method to send invoices. On success, the sent Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const SendInvoiceParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  title: Schema.String,
  description: Schema.String,
  payload: Schema.String,
  providerToken: Schema.optionalKey(Schema.String),
  currency: Schema.String,
  prices: Schema.Array(T.LabeledPrice),
  maxTipAmount: Schema.optionalKey(Schema.Number),
  suggestedTipAmounts: Schema.optionalKey(Schema.Array(Schema.Number)),
  startParameter: Schema.optionalKey(Schema.String),
  providerData: Schema.optionalKey(Schema.String),
  photoUrl: Schema.optionalKey(Schema.String),
  photoSize: Schema.optionalKey(Schema.Number),
  photoWidth: Schema.optionalKey(Schema.Number),
  photoHeight: Schema.optionalKey(Schema.Number),
  needName: Schema.optionalKey(Schema.Boolean),
  needPhoneNumber: Schema.optionalKey(Schema.Boolean),
  needEmail: Schema.optionalKey(Schema.Boolean),
  needShippingAddress: Schema.optionalKey(Schema.Boolean),
  sendPhoneNumberToProvider: Schema.optionalKey(Schema.Boolean),
  sendEmailToProvider: Schema.optionalKey(Schema.Boolean),
  isFlexible: Schema.optionalKey(Schema.Boolean),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(T.InlineKeyboardMarkup)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    providerToken: "provider_token",
    maxTipAmount: "max_tip_amount",
    suggestedTipAmounts: "suggested_tip_amounts",
    startParameter: "start_parameter",
    providerData: "provider_data",
    photoUrl: "photo_url",
    photoSize: "photo_size",
    photoWidth: "photo_width",
    photoHeight: "photo_height",
    needName: "need_name",
    needPhoneNumber: "need_phone_number",
    needEmail: "need_email",
    needShippingAddress: "need_shipping_address",
    sendPhoneNumberToProvider: "send_phone_number_to_provider",
    sendEmailToProvider: "send_email_to_provider",
    isFlexible: "is_flexible",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendInvoiceParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendInvoiceParams = Schema.Schema.Type<typeof SendInvoiceParams>

/**
 * Request parameters for `sendLivePhoto`. Use this method to send live photos. On success, the sent Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const SendLivePhotoParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  livePhoto: Schema.Union([T.InputFile, Schema.String]),
  photo: Schema.Union([T.InputFile, Schema.String]),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  hasSpoiler: Schema.optionalKey(Schema.Boolean),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    livePhoto: "live_photo",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    hasSpoiler: "has_spoiler",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendLivePhotoParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendLivePhotoParams = Schema.Schema.Type<typeof SendLivePhotoParams>

/**
 * Request parameters for `sendLocation`. Use this method to send point on the map. On success, the sent Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const SendLocationParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  latitude: Schema.Number,
  longitude: Schema.Number,
  horizontalAccuracy: Schema.optionalKey(Schema.Number),
  livePeriod: Schema.optionalKey(Schema.Number),
  heading: Schema.optionalKey(Schema.Number),
  proximityAlertRadius: Schema.optionalKey(Schema.Number),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    horizontalAccuracy: "horizontal_accuracy",
    livePeriod: "live_period",
    proximityAlertRadius: "proximity_alert_radius",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendLocationParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendLocationParams = Schema.Schema.Type<typeof SendLocationParams>

/**
 * Request parameters for `sendMediaGroup`. Use this method to send a group of photos, live photos, videos, documents or audios as an album. Documents and audio files can be only grouped in an album with messages of the same type. On success, an array of Message objects that were sent is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const SendMediaGroupParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  media: Schema.Array(Schema.Union([T.InputMediaAudio, T.InputMediaDocument, T.InputMediaLivePhoto, T.InputMediaPhoto, T.InputMediaVideo])),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  replyParameters: Schema.optionalKey(T.ReplyParameters)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    replyParameters: "reply_parameters"
  })
)

/**
 * `SendMediaGroupParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendMediaGroupParams = Schema.Schema.Type<typeof SendMediaGroupParams>

/**
 * Request parameters for `sendMessage`. Use this method to send text messages. On success, the sent Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const SendMessageParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  text: Schema.String,
  parseMode: Schema.optionalKey(Schema.String),
  entities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  linkPreviewOptions: Schema.optionalKey(T.LinkPreviewOptions),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    parseMode: "parse_mode",
    linkPreviewOptions: "link_preview_options",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendMessageParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendMessageParams = Schema.Schema.Type<typeof SendMessageParams>

/**
 * Request parameters for `sendMessageDraft`. Use this method to stream a partial message to a user while the message is being generated. Note that the streamed draft is ephemeral and acts as a temporary 30-second preview - once the output is finalized, you must call sendMessage with the complete message to persist it in the user's chat. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SendMessageDraftParams = Schema.Struct({
  chatId: Schema.Number,
  messageThreadId: Schema.optionalKey(Schema.Number),
  draftId: Schema.Number,
  text: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  entities: Schema.optionalKey(Schema.Array(T.MessageEntity))
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    draftId: "draft_id",
    parseMode: "parse_mode"
  })
)

/**
 * `SendMessageDraftParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendMessageDraftParams = Schema.Schema.Type<typeof SendMessageDraftParams>

/**
 * Request parameters for `sendPaidMedia`. Use this method to send paid media. On success, the sent Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const SendPaidMediaParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  starCount: Schema.Number,
  media: Schema.Array(T.InputPaidMedia),
  payload: Schema.optionalKey(Schema.String),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    starCount: "star_count",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendPaidMediaParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendPaidMediaParams = Schema.Schema.Type<typeof SendPaidMediaParams>

/**
 * Request parameters for `sendPhoto`. Use this method to send photos. On success, the sent Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const SendPhotoParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  photo: Schema.Union([T.InputFile, Schema.String]),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  hasSpoiler: Schema.optionalKey(Schema.Boolean),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    hasSpoiler: "has_spoiler",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendPhotoParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendPhotoParams = Schema.Schema.Type<typeof SendPhotoParams>

/**
 * Request parameters for `sendPoll`. Use this method to send a native poll. On success, the sent Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const SendPollParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  question: Schema.String,
  questionParseMode: Schema.optionalKey(Schema.String),
  questionEntities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  options: Schema.Array(T.InputPollOption),
  isAnonymous: Schema.optionalKey(Schema.Boolean),
  type: Schema.optionalKey(Schema.String),
  allowsMultipleAnswers: Schema.optionalKey(Schema.Boolean),
  allowsRevoting: Schema.optionalKey(Schema.Boolean),
  shuffleOptions: Schema.optionalKey(Schema.Boolean),
  allowAddingOptions: Schema.optionalKey(Schema.Boolean),
  hideResultsUntilCloses: Schema.optionalKey(Schema.Boolean),
  membersOnly: Schema.optionalKey(Schema.Boolean),
  countryCodes: Schema.optionalKey(Schema.Array(Schema.String)),
  correctOptionIds: Schema.optionalKey(Schema.Array(Schema.Number)),
  explanation: Schema.optionalKey(Schema.String),
  explanationParseMode: Schema.optionalKey(Schema.String),
  explanationEntities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  explanationMedia: Schema.optionalKey(T.InputPollMedia),
  openPeriod: Schema.optionalKey(Schema.Number),
  closeDate: Schema.optionalKey(Schema.Number),
  isClosed: Schema.optionalKey(Schema.Boolean),
  description: Schema.optionalKey(Schema.String),
  descriptionParseMode: Schema.optionalKey(Schema.String),
  descriptionEntities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  media: Schema.optionalKey(T.InputPollMedia),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    questionParseMode: "question_parse_mode",
    questionEntities: "question_entities",
    isAnonymous: "is_anonymous",
    allowsMultipleAnswers: "allows_multiple_answers",
    allowsRevoting: "allows_revoting",
    shuffleOptions: "shuffle_options",
    allowAddingOptions: "allow_adding_options",
    hideResultsUntilCloses: "hide_results_until_closes",
    membersOnly: "members_only",
    countryCodes: "country_codes",
    correctOptionIds: "correct_option_ids",
    explanationParseMode: "explanation_parse_mode",
    explanationEntities: "explanation_entities",
    explanationMedia: "explanation_media",
    openPeriod: "open_period",
    closeDate: "close_date",
    isClosed: "is_closed",
    descriptionParseMode: "description_parse_mode",
    descriptionEntities: "description_entities",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendPollParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendPollParams = Schema.Schema.Type<typeof SendPollParams>

/**
 * Request parameters for `sendRichMessage`. Use this method to send rich messages. If the message contains a block with a media element, then the bot must have the right to send the media to the chat. On success, the sent Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const SendRichMessageParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  richMessage: T.InputRichMessage,
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    richMessage: "rich_message",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendRichMessageParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendRichMessageParams = Schema.Schema.Type<typeof SendRichMessageParams>

/**
 * Request parameters for `sendRichMessageDraft`. Use this method to stream a partial rich message to a user while the message is being generated. Note that the streamed draft is ephemeral and acts as a temporary 30-second preview - once the output is finalized, you must call sendRichMessage with the complete message to persist it in the user's chat. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SendRichMessageDraftParams = Schema.Struct({
  chatId: Schema.Number,
  messageThreadId: Schema.optionalKey(Schema.Number),
  draftId: Schema.Number,
  richMessage: T.InputRichMessage
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    draftId: "draft_id",
    richMessage: "rich_message"
  })
)

/**
 * `SendRichMessageDraftParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendRichMessageDraftParams = Schema.Schema.Type<typeof SendRichMessageDraftParams>

/**
 * Request parameters for `sendSticker`. Use this method to send static .WEBP, animated .TGS, or video .WEBM stickers. On success, the sent Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const SendStickerParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  sticker: Schema.Union([T.InputFile, Schema.String]),
  emoji: Schema.optionalKey(Schema.String),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendStickerParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendStickerParams = Schema.Schema.Type<typeof SendStickerParams>

/**
 * Request parameters for `sendVenue`. Use this method to send information about a venue. On success, the sent Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const SendVenueParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  latitude: Schema.Number,
  longitude: Schema.Number,
  title: Schema.String,
  address: Schema.String,
  foursquareId: Schema.optionalKey(Schema.String),
  foursquareType: Schema.optionalKey(Schema.String),
  googlePlaceId: Schema.optionalKey(Schema.String),
  googlePlaceType: Schema.optionalKey(Schema.String),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    foursquareId: "foursquare_id",
    foursquareType: "foursquare_type",
    googlePlaceId: "google_place_id",
    googlePlaceType: "google_place_type",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendVenueParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendVenueParams = Schema.Schema.Type<typeof SendVenueParams>

/**
 * Request parameters for `sendVideo`. Use this method to send video files, Telegram clients support MPEG4 videos (other formats may be sent as Document). On success, the sent Message is returned. Bots can currently send video files of up to 50 MB in size, this limit may be changed in the future.
 *
 * @category params
 * @since 0.1.0
 */
export const SendVideoParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  video: Schema.Union([T.InputFile, Schema.String]),
  duration: Schema.optionalKey(Schema.Number),
  width: Schema.optionalKey(Schema.Number),
  height: Schema.optionalKey(Schema.Number),
  thumbnail: Schema.optionalKey(Schema.Union([T.InputFile, Schema.String])),
  cover: Schema.optionalKey(Schema.Union([T.InputFile, Schema.String])),
  startTimestamp: Schema.optionalKey(Schema.Number),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  hasSpoiler: Schema.optionalKey(Schema.Boolean),
  supportsStreaming: Schema.optionalKey(Schema.Boolean),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    startTimestamp: "start_timestamp",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    hasSpoiler: "has_spoiler",
    supportsStreaming: "supports_streaming",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendVideoParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendVideoParams = Schema.Schema.Type<typeof SendVideoParams>

/**
 * Request parameters for `sendVideoNote`. As of v.4.0, Telegram clients support rounded square MPEG4 videos of up to 1 minute long. Use this method to send video messages. On success, the sent Message is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const SendVideoNoteParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  videoNote: Schema.Union([T.InputFile, Schema.String]),
  duration: Schema.optionalKey(Schema.Number),
  length: Schema.optionalKey(Schema.Number),
  thumbnail: Schema.optionalKey(Schema.Union([T.InputFile, Schema.String])),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    videoNote: "video_note",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendVideoNoteParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendVideoNoteParams = Schema.Schema.Type<typeof SendVideoNoteParams>

/**
 * Request parameters for `sendVoice`. Use this method to send audio files, if you want Telegram clients to display the file as a playable voice message. For this to work, your audio must be in an .OGG file encoded with OPUS, or in .MP3 format, or in .M4A format (other formats may be sent as Audio or Document). On success, the sent Message is returned. Bots can currently send voice messages of up to 50 MB in size, this limit may be changed in the future.
 *
 * @category params
 * @since 0.1.0
 */
export const SendVoiceParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopicId: Schema.optionalKey(Schema.Number),
  voice: Schema.Union([T.InputFile, Schema.String]),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(T.MessageEntity)),
  duration: Schema.optionalKey(Schema.Number),
  disableNotification: Schema.optionalKey(Schema.Boolean),
  protectContent: Schema.optionalKey(Schema.Boolean),
  allowPaidBroadcast: Schema.optionalKey(Schema.Boolean),
  messageEffectId: Schema.optionalKey(Schema.String),
  suggestedPostParameters: Schema.optionalKey(T.SuggestedPostParameters),
  replyParameters: Schema.optionalKey(T.ReplyParameters),
  replyMarkup: Schema.optionalKey(Schema.Union([T.InlineKeyboardMarkup, T.ReplyKeyboardMarkup, T.ReplyKeyboardRemove, T.ForceReply]))
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageThreadId: "message_thread_id",
    directMessagesTopicId: "direct_messages_topic_id",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    disableNotification: "disable_notification",
    protectContent: "protect_content",
    allowPaidBroadcast: "allow_paid_broadcast",
    messageEffectId: "message_effect_id",
    suggestedPostParameters: "suggested_post_parameters",
    replyParameters: "reply_parameters",
    replyMarkup: "reply_markup"
  })
)

/**
 * `SendVoiceParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SendVoiceParams = Schema.Schema.Type<typeof SendVoiceParams>

/**
 * Request parameters for `setBusinessAccountBio`. Changes the bio of a managed business account. Requires the can_change_bio business bot right. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetBusinessAccountBioParams = Schema.Struct({
  businessConnectionId: Schema.String,
  bio: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id"
  })
)

/**
 * `SetBusinessAccountBioParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetBusinessAccountBioParams = Schema.Schema.Type<typeof SetBusinessAccountBioParams>

/**
 * Request parameters for `setBusinessAccountGiftSettings`. Changes the privacy settings pertaining to incoming gifts in a managed business account. Requires the can_change_gift_settings business bot right. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetBusinessAccountGiftSettingsParams = Schema.Struct({
  businessConnectionId: Schema.String,
  showGiftButton: Schema.Boolean,
  acceptedGiftTypes: T.AcceptedGiftTypes
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    showGiftButton: "show_gift_button",
    acceptedGiftTypes: "accepted_gift_types"
  })
)

/**
 * `SetBusinessAccountGiftSettingsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetBusinessAccountGiftSettingsParams = Schema.Schema.Type<typeof SetBusinessAccountGiftSettingsParams>

/**
 * Request parameters for `setBusinessAccountName`. Changes the first and last name of a managed business account. Requires the can_change_name business bot right. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetBusinessAccountNameParams = Schema.Struct({
  businessConnectionId: Schema.String,
  firstName: Schema.String,
  lastName: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    firstName: "first_name",
    lastName: "last_name"
  })
)

/**
 * `SetBusinessAccountNameParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetBusinessAccountNameParams = Schema.Schema.Type<typeof SetBusinessAccountNameParams>

/**
 * Request parameters for `setBusinessAccountProfilePhoto`. Changes the profile photo of a managed business account. Requires the can_edit_profile_photo business bot right. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetBusinessAccountProfilePhotoParams = Schema.Struct({
  businessConnectionId: Schema.String,
  photo: T.InputProfilePhoto,
  isPublic: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    isPublic: "is_public"
  })
)

/**
 * `SetBusinessAccountProfilePhotoParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetBusinessAccountProfilePhotoParams = Schema.Schema.Type<typeof SetBusinessAccountProfilePhotoParams>

/**
 * Request parameters for `setBusinessAccountUsername`. Changes the username of a managed business account. Requires the can_change_username business bot right. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetBusinessAccountUsernameParams = Schema.Struct({
  businessConnectionId: Schema.String,
  username: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id"
  })
)

/**
 * `SetBusinessAccountUsernameParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetBusinessAccountUsernameParams = Schema.Schema.Type<typeof SetBusinessAccountUsernameParams>

/**
 * Request parameters for `setChatAdministratorCustomTitle`. Use this method to set a custom title for an administrator in a supergroup promoted by the bot. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetChatAdministratorCustomTitleParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  userId: Schema.Number,
  customTitle: Schema.String
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    userId: "user_id",
    customTitle: "custom_title"
  })
)

/**
 * `SetChatAdministratorCustomTitleParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetChatAdministratorCustomTitleParams = Schema.Schema.Type<typeof SetChatAdministratorCustomTitleParams>

/**
 * Request parameters for `setChatDescription`. Use this method to change the description of a group, a supergroup or a channel. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetChatDescriptionParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  description: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `SetChatDescriptionParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetChatDescriptionParams = Schema.Schema.Type<typeof SetChatDescriptionParams>

/**
 * Request parameters for `setChatMemberTag`. Use this method to set a tag for a regular member in a group or a supergroup. The bot must be an administrator in the chat for this to work and must have the can_manage_tags administrator right. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetChatMemberTagParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  userId: Schema.Number,
  tag: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    userId: "user_id"
  })
)

/**
 * `SetChatMemberTagParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetChatMemberTagParams = Schema.Schema.Type<typeof SetChatMemberTagParams>

/**
 * Request parameters for `setChatMenuButton`. Use this method to change the bot's menu button in a private chat, or the default menu button. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetChatMenuButtonParams = Schema.Struct({
  chatId: Schema.optionalKey(Schema.Number),
  menuButton: Schema.optionalKey(T.MenuButton)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    menuButton: "menu_button"
  })
)

/**
 * `SetChatMenuButtonParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetChatMenuButtonParams = Schema.Schema.Type<typeof SetChatMenuButtonParams>

/**
 * Request parameters for `setChatPermissions`. Use this method to set default chat permissions for all members. The bot must be an administrator in the group or a supergroup for this to work and must have the can_restrict_members administrator rights. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetChatPermissionsParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  permissions: T.ChatPermissions,
  useIndependentChatPermissions: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    useIndependentChatPermissions: "use_independent_chat_permissions"
  })
)

/**
 * `SetChatPermissionsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetChatPermissionsParams = Schema.Schema.Type<typeof SetChatPermissionsParams>

/**
 * Request parameters for `setChatPhoto`. Use this method to set a new profile photo for the chat. Photos can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetChatPhotoParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  photo: T.InputFile
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `SetChatPhotoParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetChatPhotoParams = Schema.Schema.Type<typeof SetChatPhotoParams>

/**
 * Request parameters for `setChatStickerSet`. Use this method to set a new group sticker set for a supergroup. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Use the field can_set_sticker_set optionally returned in getChat requests to check if the bot can use this method. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetChatStickerSetParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  stickerSetName: Schema.String
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    stickerSetName: "sticker_set_name"
  })
)

/**
 * `SetChatStickerSetParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetChatStickerSetParams = Schema.Schema.Type<typeof SetChatStickerSetParams>

/**
 * Request parameters for `setChatTitle`. Use this method to change the title of a chat. Titles can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetChatTitleParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  title: Schema.String
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `SetChatTitleParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetChatTitleParams = Schema.Schema.Type<typeof SetChatTitleParams>

/**
 * Request parameters for `setCustomEmojiStickerSetThumbnail`. Use this method to set the thumbnail of a custom emoji sticker set. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetCustomEmojiStickerSetThumbnailParams = Schema.Struct({
  name: Schema.String,
  customEmojiId: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    customEmojiId: "custom_emoji_id"
  })
)

/**
 * `SetCustomEmojiStickerSetThumbnailParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetCustomEmojiStickerSetThumbnailParams = Schema.Schema.Type<typeof SetCustomEmojiStickerSetThumbnailParams>

/**
 * Request parameters for `setGameScore`. Use this method to set the score of the specified user in a game message. On success, if the message is not an inline message, the Message is returned, otherwise True is returned. Returns an error, if the new score is not greater than the user's current score in the chat and force is False.
 *
 * @category params
 * @since 0.1.0
 */
export const SetGameScoreParams = Schema.Struct({
  userId: Schema.Number,
  score: Schema.Number,
  force: Schema.optionalKey(Schema.Boolean),
  disableEditMessage: Schema.optionalKey(Schema.Boolean),
  chatId: Schema.optionalKey(Schema.Number),
  messageId: Schema.optionalKey(Schema.Number),
  inlineMessageId: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    userId: "user_id",
    disableEditMessage: "disable_edit_message",
    chatId: "chat_id",
    messageId: "message_id",
    inlineMessageId: "inline_message_id"
  })
)

/**
 * `SetGameScoreParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetGameScoreParams = Schema.Schema.Type<typeof SetGameScoreParams>

/**
 * Request parameters for `setManagedBotAccessSettings`. Use this method to change the access settings of a managed bot. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetManagedBotAccessSettingsParams = Schema.Struct({
  userId: Schema.Number,
  isAccessRestricted: Schema.Boolean,
  addedUserIds: Schema.optionalKey(Schema.Array(Schema.Number))
}).pipe(
  Schema.encodeKeys({
    userId: "user_id",
    isAccessRestricted: "is_access_restricted",
    addedUserIds: "added_user_ids"
  })
)

/**
 * `SetManagedBotAccessSettingsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetManagedBotAccessSettingsParams = Schema.Schema.Type<typeof SetManagedBotAccessSettingsParams>

/**
 * Request parameters for `setMessageReaction`. Use this method to change the chosen reactions on a message. Service messages of some types can't be reacted to. Automatically forwarded messages from a channel to its discussion group have the same available reactions as messages in the channel. Bots can't use paid reactions. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetMessageReactionParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageId: Schema.Number,
  reaction: Schema.optionalKey(Schema.Array(T.ReactionType)),
  isBig: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageId: "message_id",
    isBig: "is_big"
  })
)

/**
 * `SetMessageReactionParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetMessageReactionParams = Schema.Schema.Type<typeof SetMessageReactionParams>

/**
 * Request parameters for `setMyCommands`. Use this method to change the list of the bot's commands. See this manual for more details about bot commands. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetMyCommandsParams = Schema.Struct({
  commands: Schema.Array(T.BotCommand),
  scope: Schema.optionalKey(T.BotCommandScope),
  languageCode: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    languageCode: "language_code"
  })
)

/**
 * `SetMyCommandsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetMyCommandsParams = Schema.Schema.Type<typeof SetMyCommandsParams>

/**
 * Request parameters for `setMyDefaultAdministratorRights`. Use this method to change the default administrator rights requested by the bot when it's added as an administrator to groups or channels. These rights will be suggested to users, but they are free to modify the list before adding the bot. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetMyDefaultAdministratorRightsParams = Schema.Struct({
  rights: Schema.optionalKey(T.ChatAdministratorRights),
  forChannels: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    forChannels: "for_channels"
  })
)

/**
 * `SetMyDefaultAdministratorRightsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetMyDefaultAdministratorRightsParams = Schema.Schema.Type<typeof SetMyDefaultAdministratorRightsParams>

/**
 * Request parameters for `setMyDescription`. Use this method to change the bot's description, which is shown in the chat with the bot if the chat is empty. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetMyDescriptionParams = Schema.Struct({
  description: Schema.optionalKey(Schema.String),
  languageCode: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    languageCode: "language_code"
  })
)

/**
 * `SetMyDescriptionParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetMyDescriptionParams = Schema.Schema.Type<typeof SetMyDescriptionParams>

/**
 * Request parameters for `setMyName`. Use this method to change the bot's name. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetMyNameParams = Schema.Struct({
  name: Schema.optionalKey(Schema.String),
  languageCode: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    languageCode: "language_code"
  })
)

/**
 * `SetMyNameParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetMyNameParams = Schema.Schema.Type<typeof SetMyNameParams>

/**
 * Request parameters for `setMyProfilePhoto`. Changes the profile photo of the bot. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetMyProfilePhotoParams = Schema.Struct({
  photo: T.InputProfilePhoto
})

/**
 * `SetMyProfilePhotoParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetMyProfilePhotoParams = Schema.Schema.Type<typeof SetMyProfilePhotoParams>

/**
 * Request parameters for `setMyShortDescription`. Use this method to change the bot's short description, which is shown on the bot's profile page and is sent together with the link when users share the bot. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetMyShortDescriptionParams = Schema.Struct({
  shortDescription: Schema.optionalKey(Schema.String),
  languageCode: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    shortDescription: "short_description",
    languageCode: "language_code"
  })
)

/**
 * `SetMyShortDescriptionParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetMyShortDescriptionParams = Schema.Schema.Type<typeof SetMyShortDescriptionParams>

/**
 * Request parameters for `setPassportDataErrors`. Informs a user that some of the Telegram Passport elements they provided contains errors. The user will not be able to re-submit their Passport to you until the errors are fixed (the contents of the field for which you returned the error must change). Returns True on success. Use this if the data submitted by the user doesn't satisfy the standards your service requires for any reason. For example, if a birthday date seems invalid, a submitted document is blurry, a scan shows evidence of tampering, etc. Supply some details in the error message to make sure the user knows how to correct the issues.
 *
 * @category params
 * @since 0.1.0
 */
export const SetPassportDataErrorsParams = Schema.Struct({
  userId: Schema.Number,
  errors: Schema.Array(T.PassportElementError)
}).pipe(
  Schema.encodeKeys({
    userId: "user_id"
  })
)

/**
 * `SetPassportDataErrorsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetPassportDataErrorsParams = Schema.Schema.Type<typeof SetPassportDataErrorsParams>

/**
 * Request parameters for `setStickerEmojiList`. Use this method to change the list of emoji assigned to a regular or custom emoji sticker. The sticker must belong to a sticker set created by the bot. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetStickerEmojiListParams = Schema.Struct({
  sticker: Schema.String,
  emojiList: Schema.Array(Schema.String)
}).pipe(
  Schema.encodeKeys({
    emojiList: "emoji_list"
  })
)

/**
 * `SetStickerEmojiListParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetStickerEmojiListParams = Schema.Schema.Type<typeof SetStickerEmojiListParams>

/**
 * Request parameters for `setStickerKeywords`. Use this method to change search keywords assigned to a regular or custom emoji sticker. The sticker must belong to a sticker set created by the bot. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetStickerKeywordsParams = Schema.Struct({
  sticker: Schema.String,
  keywords: Schema.optionalKey(Schema.Array(Schema.String))
})

/**
 * `SetStickerKeywordsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetStickerKeywordsParams = Schema.Schema.Type<typeof SetStickerKeywordsParams>

/**
 * Request parameters for `setStickerMaskPosition`. Use this method to change the mask position of a mask sticker. The sticker must belong to a sticker set that was created by the bot. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetStickerMaskPositionParams = Schema.Struct({
  sticker: Schema.String,
  maskPosition: Schema.optionalKey(T.MaskPosition)
}).pipe(
  Schema.encodeKeys({
    maskPosition: "mask_position"
  })
)

/**
 * `SetStickerMaskPositionParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetStickerMaskPositionParams = Schema.Schema.Type<typeof SetStickerMaskPositionParams>

/**
 * Request parameters for `setStickerPositionInSet`. Use this method to move a sticker in a set created by the bot to a specific position. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetStickerPositionInSetParams = Schema.Struct({
  sticker: Schema.String,
  position: Schema.Number
})

/**
 * `SetStickerPositionInSetParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetStickerPositionInSetParams = Schema.Schema.Type<typeof SetStickerPositionInSetParams>

/**
 * Request parameters for `setStickerSetThumbnail`. Use this method to set the thumbnail of a regular or mask sticker set. The format of the thumbnail file must match the format of the stickers in the set. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetStickerSetThumbnailParams = Schema.Struct({
  name: Schema.String,
  userId: Schema.Number,
  thumbnail: Schema.optionalKey(Schema.Union([T.InputFile, Schema.String])),
  format: Schema.String
}).pipe(
  Schema.encodeKeys({
    userId: "user_id"
  })
)

/**
 * `SetStickerSetThumbnailParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetStickerSetThumbnailParams = Schema.Schema.Type<typeof SetStickerSetThumbnailParams>

/**
 * Request parameters for `setStickerSetTitle`. Use this method to set the title of a created sticker set. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetStickerSetTitleParams = Schema.Struct({
  name: Schema.String,
  title: Schema.String
})

/**
 * `SetStickerSetTitleParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetStickerSetTitleParams = Schema.Schema.Type<typeof SetStickerSetTitleParams>

/**
 * Request parameters for `setUserEmojiStatus`. Changes the emoji status for a given user that previously allowed the bot to manage their emoji status via the Mini App method requestEmojiStatusAccess. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const SetUserEmojiStatusParams = Schema.Struct({
  userId: Schema.Number,
  emojiStatusCustomEmojiId: Schema.optionalKey(Schema.String),
  emojiStatusExpirationDate: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    userId: "user_id",
    emojiStatusCustomEmojiId: "emoji_status_custom_emoji_id",
    emojiStatusExpirationDate: "emoji_status_expiration_date"
  })
)

/**
 * `SetUserEmojiStatusParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetUserEmojiStatusParams = Schema.Schema.Type<typeof SetUserEmojiStatusParams>

/**
 * Request parameters for `setWebhook`. Use this method to specify a URL and receive incoming updates via an outgoing webhook. Whenever there is an update for the bot, we will send an HTTPS POST request to the specified URL, containing a JSON-serialized Update. In case of an unsuccessful request (a request with response HTTP status code different from 2XY), we will repeat the request and give up after a reasonable amount of attempts. Returns True on success. If you'd like to make sure that the webhook was set by you, you can specify secret data in the parameter secret_token. If specified, the request will contain a header "X-Telegram-Bot-Api-Secret-Token" with the secret token as content.
 *
 * @category params
 * @since 0.1.0
 */
export const SetWebhookParams = Schema.Struct({
  url: Schema.String,
  certificate: Schema.optionalKey(T.InputFile),
  ipAddress: Schema.optionalKey(Schema.String),
  maxConnections: Schema.optionalKey(Schema.Number),
  allowedUpdates: Schema.optionalKey(Schema.Array(Schema.String)),
  dropPendingUpdates: Schema.optionalKey(Schema.Boolean),
  secretToken: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    ipAddress: "ip_address",
    maxConnections: "max_connections",
    allowedUpdates: "allowed_updates",
    dropPendingUpdates: "drop_pending_updates",
    secretToken: "secret_token"
  })
)

/**
 * `SetWebhookParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type SetWebhookParams = Schema.Schema.Type<typeof SetWebhookParams>

/**
 * Request parameters for `stopMessageLiveLocation`. Use this method to stop updating a live location message before live_period expires. On success, if the message is not an inline message, the edited Message is returned, otherwise True is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const StopMessageLiveLocationParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.optionalKey(Schema.Union([Schema.Number, Schema.String])),
  messageId: Schema.optionalKey(Schema.Number),
  inlineMessageId: Schema.optionalKey(Schema.String),
  replyMarkup: Schema.optionalKey(T.InlineKeyboardMarkup)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageId: "message_id",
    inlineMessageId: "inline_message_id",
    replyMarkup: "reply_markup"
  })
)

/**
 * `StopMessageLiveLocationParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type StopMessageLiveLocationParams = Schema.Schema.Type<typeof StopMessageLiveLocationParams>

/**
 * Request parameters for `stopPoll`. Use this method to stop a poll which was sent by the bot. On success, the stopped Poll is returned.
 *
 * @category params
 * @since 0.1.0
 */
export const StopPollParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageId: Schema.Number,
  replyMarkup: Schema.optionalKey(T.InlineKeyboardMarkup)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageId: "message_id",
    replyMarkup: "reply_markup"
  })
)

/**
 * `StopPollParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type StopPollParams = Schema.Schema.Type<typeof StopPollParams>

/**
 * Request parameters for `transferBusinessAccountStars`. Transfers Telegram Stars from the business account balance to the bot's balance. Requires the can_transfer_stars business bot right. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const TransferBusinessAccountStarsParams = Schema.Struct({
  businessConnectionId: Schema.String,
  starCount: Schema.Number
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    starCount: "star_count"
  })
)

/**
 * `TransferBusinessAccountStarsParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type TransferBusinessAccountStarsParams = Schema.Schema.Type<typeof TransferBusinessAccountStarsParams>

/**
 * Request parameters for `transferGift`. Transfers an owned unique gift to another user. Requires the can_transfer_and_upgrade_gifts business bot right. Requires can_transfer_stars business bot right if the transfer is paid. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const TransferGiftParams = Schema.Struct({
  businessConnectionId: Schema.String,
  ownedGiftId: Schema.String,
  newOwnerChatId: Schema.Number,
  starCount: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    ownedGiftId: "owned_gift_id",
    newOwnerChatId: "new_owner_chat_id",
    starCount: "star_count"
  })
)

/**
 * `TransferGiftParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type TransferGiftParams = Schema.Schema.Type<typeof TransferGiftParams>

/**
 * Request parameters for `unbanChatMember`. Use this method to unban a previously banned user in a supergroup or channel. The user will not return to the group or channel automatically, but will be able to join via link, etc. The bot must be an administrator for this to work. By default, this method guarantees that after the call the user is not a member of the chat, but will be able to join it. So if the user is a member of the chat they will also be removed from the chat. If you don't want this, use the parameter only_if_banned. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const UnbanChatMemberParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  userId: Schema.Number,
  onlyIfBanned: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    userId: "user_id",
    onlyIfBanned: "only_if_banned"
  })
)

/**
 * `UnbanChatMemberParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type UnbanChatMemberParams = Schema.Schema.Type<typeof UnbanChatMemberParams>

/**
 * Request parameters for `unbanChatSenderChat`. Use this method to unban a previously banned channel chat in a supergroup or channel. The bot must be an administrator for this to work and must have the appropriate administrator rights. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const UnbanChatSenderChatParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  senderChatId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    senderChatId: "sender_chat_id"
  })
)

/**
 * `UnbanChatSenderChatParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type UnbanChatSenderChatParams = Schema.Schema.Type<typeof UnbanChatSenderChatParams>

/**
 * Request parameters for `unhideGeneralForumTopic`. Use this method to unhide the 'General' topic in a forum supergroup chat. The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const UnhideGeneralForumTopicParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String])
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `UnhideGeneralForumTopicParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type UnhideGeneralForumTopicParams = Schema.Schema.Type<typeof UnhideGeneralForumTopicParams>

/**
 * Request parameters for `unpinAllChatMessages`. Use this method to clear the list of pinned messages in a chat. In private chats and channel direct messages chats, no additional rights are required to unpin all pinned messages. Conversely, the bot must be an administrator with the 'can_pin_messages' right or the 'can_edit_messages' right to unpin all pinned messages in groups and channels respectively. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const UnpinAllChatMessagesParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String])
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `UnpinAllChatMessagesParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type UnpinAllChatMessagesParams = Schema.Schema.Type<typeof UnpinAllChatMessagesParams>

/**
 * Request parameters for `unpinAllForumTopicMessages`. Use this method to clear the list of pinned messages in a forum topic in a forum supergroup chat or a private chat with a user. In the case of a supergroup chat the bot must be an administrator in the chat for this to work and must have the can_pin_messages administrator right in the supergroup. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const UnpinAllForumTopicMessagesParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageThreadId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    messageThreadId: "message_thread_id"
  })
)

/**
 * `UnpinAllForumTopicMessagesParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type UnpinAllForumTopicMessagesParams = Schema.Schema.Type<typeof UnpinAllForumTopicMessagesParams>

/**
 * Request parameters for `unpinAllGeneralForumTopicMessages`. Use this method to clear the list of pinned messages in a General forum topic. The bot must be an administrator in the chat for this to work and must have the can_pin_messages administrator right in the supergroup. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const UnpinAllGeneralForumTopicMessagesParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String])
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * `UnpinAllGeneralForumTopicMessagesParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type UnpinAllGeneralForumTopicMessagesParams = Schema.Schema.Type<typeof UnpinAllGeneralForumTopicMessagesParams>

/**
 * Request parameters for `unpinChatMessage`. Use this method to remove a message from the list of pinned messages in a chat. In private chats and channel direct messages chats, all messages can be unpinned. Conversely, the bot must be an administrator with the 'can_pin_messages' right or the 'can_edit_messages' right to unpin messages in groups and channels respectively. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const UnpinChatMessageParams = Schema.Struct({
  businessConnectionId: Schema.optionalKey(Schema.String),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  messageId: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    chatId: "chat_id",
    messageId: "message_id"
  })
)

/**
 * `UnpinChatMessageParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type UnpinChatMessageParams = Schema.Schema.Type<typeof UnpinChatMessageParams>

/**
 * Request parameters for `upgradeGift`. Upgrades a given regular gift to a unique gift. Requires the can_transfer_and_upgrade_gifts business bot right. Additionally requires the can_transfer_stars business bot right if the upgrade is paid. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const UpgradeGiftParams = Schema.Struct({
  businessConnectionId: Schema.String,
  ownedGiftId: Schema.String,
  keepOriginalDetails: Schema.optionalKey(Schema.Boolean),
  starCount: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    ownedGiftId: "owned_gift_id",
    keepOriginalDetails: "keep_original_details",
    starCount: "star_count"
  })
)

/**
 * `UpgradeGiftParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type UpgradeGiftParams = Schema.Schema.Type<typeof UpgradeGiftParams>

/**
 * Request parameters for `uploadStickerFile`. Use this method to upload a file with a sticker for later use in the createNewStickerSet, addStickerToSet, or replaceStickerInSet methods (the file can be used multiple times). Returns the uploaded File on success.
 *
 * @category params
 * @since 0.1.0
 */
export const UploadStickerFileParams = Schema.Struct({
  userId: Schema.Number,
  sticker: T.InputFile,
  stickerFormat: Schema.String
}).pipe(
  Schema.encodeKeys({
    userId: "user_id",
    stickerFormat: "sticker_format"
  })
)

/**
 * `UploadStickerFileParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type UploadStickerFileParams = Schema.Schema.Type<typeof UploadStickerFileParams>

/**
 * Request parameters for `verifyChat`. Verifies a chat on behalf of the organization which is represented by the bot. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const VerifyChatParams = Schema.Struct({
  chatId: Schema.Union([Schema.Number, Schema.String]),
  customDescription: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    customDescription: "custom_description"
  })
)

/**
 * `VerifyChatParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type VerifyChatParams = Schema.Schema.Type<typeof VerifyChatParams>

/**
 * Request parameters for `verifyUser`. Verifies a user on behalf of the organization which is represented by the bot. Returns True on success.
 *
 * @category params
 * @since 0.1.0
 */
export const VerifyUserParams = Schema.Struct({
  userId: Schema.Number,
  customDescription: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    userId: "user_id",
    customDescription: "custom_description"
  })
)

/**
 * `VerifyUserParams` (`camelCase`).
 *
 * @category models
 * @since 0.1.0
 */
export type VerifyUserParams = Schema.Schema.Type<typeof VerifyUserParams>
