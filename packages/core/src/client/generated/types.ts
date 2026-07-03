/**
 * Bot API object schemas, generated from the Telegram Bot API spec.
 *
 * This is the **only** place `snake_case` is allowed: each schema's
 * decoded `Type` is `camelCase`, its `Encoded` shape is the raw `snake_case` Telegram
 * speaks, wired via {@link Schema.encodeKeys}. Decoding is lenient — unknown fields drop.
 *
 * @since 0.1.0
 */
import { Schema } from "effect"

import * as InputFileModule from "../InputFile.js"

// Auto-generated from the Telegram Bot API spec (Bot API 10.1).
// Do NOT edit above the MANUAL marker — run `pnpm codegen` to regenerate.
/**
 * The contents of a file to be uploaded, as a tagged {@link module:InputFile.InputFile}
 * value (path / bytes / stream / URL).
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputFile: Schema.declare<InputFileModule.InputFile> = Schema.declare<InputFileModule.InputFile>(
  InputFileModule.isInputFile,
  { title: "InputFile" }
)

/**
 * A file to upload — see {@link module:InputFile.InputFile}.
 *
 * @category models
 * @since 0.1.0
 */
export type InputFile = InputFileModule.InputFile

/**
 * This object describes the types of gifts that can be gifted to a user or a chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const AcceptedGiftTypes = Schema.Struct({
  unlimitedGifts: Schema.Boolean,
  limitedGifts: Schema.Boolean,
  uniqueGifts: Schema.Boolean,
  premiumSubscription: Schema.Boolean,
  giftsFromChannels: Schema.Boolean
}).pipe(
  Schema.encodeKeys({
    unlimitedGifts: "unlimited_gifts",
    limitedGifts: "limited_gifts",
    uniqueGifts: "unique_gifts",
    premiumSubscription: "premium_subscription",
    giftsFromChannels: "gifts_from_channels"
  })
)

/**
 * Decoded `camelCase` AcceptedGiftTypes.
 *
 * @category models
 * @since 0.1.0
 */
export type AcceptedGiftTypes = Schema.Schema.Type<typeof AcceptedGiftTypes>

/**
 * This object represents a Telegram user or bot.
 *
 * @category schemas
 * @since 0.1.0
 */
export const User = Schema.Struct({
  id: Schema.Number,
  isBot: Schema.Boolean,
  firstName: Schema.String,
  lastName: Schema.optionalKey(Schema.String),
  username: Schema.optionalKey(Schema.String),
  languageCode: Schema.optionalKey(Schema.String),
  isPremium: Schema.optionalKey(Schema.Boolean),
  addedToAttachmentMenu: Schema.optionalKey(Schema.Boolean),
  canJoinGroups: Schema.optionalKey(Schema.Boolean),
  canReadAllGroupMessages: Schema.optionalKey(Schema.Boolean),
  supportsGuestQueries: Schema.optionalKey(Schema.Boolean),
  supportsInlineQueries: Schema.optionalKey(Schema.Boolean),
  canConnectToBusiness: Schema.optionalKey(Schema.Boolean),
  hasMainWebApp: Schema.optionalKey(Schema.Boolean),
  hasTopicsEnabled: Schema.optionalKey(Schema.Boolean),
  allowsUsersToCreateTopics: Schema.optionalKey(Schema.Boolean),
  canManageBots: Schema.optionalKey(Schema.Boolean),
  supportsJoinRequestQueries: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    isBot: "is_bot",
    firstName: "first_name",
    lastName: "last_name",
    languageCode: "language_code",
    isPremium: "is_premium",
    addedToAttachmentMenu: "added_to_attachment_menu",
    canJoinGroups: "can_join_groups",
    canReadAllGroupMessages: "can_read_all_group_messages",
    supportsGuestQueries: "supports_guest_queries",
    supportsInlineQueries: "supports_inline_queries",
    canConnectToBusiness: "can_connect_to_business",
    hasMainWebApp: "has_main_web_app",
    hasTopicsEnabled: "has_topics_enabled",
    allowsUsersToCreateTopics: "allows_users_to_create_topics",
    canManageBots: "can_manage_bots",
    supportsJoinRequestQueries: "supports_join_request_queries"
  })
)

/**
 * Decoded `camelCase` User.
 *
 * @category models
 * @since 0.1.0
 */
export type User = Schema.Schema.Type<typeof User>

/**
 * This object represents a chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Chat = Schema.Struct({
  id: Schema.Number,
  type: Schema.String,
  title: Schema.optionalKey(Schema.String),
  username: Schema.optionalKey(Schema.String),
  firstName: Schema.optionalKey(Schema.String),
  lastName: Schema.optionalKey(Schema.String),
  isForum: Schema.optionalKey(Schema.Boolean),
  isDirectMessages: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    firstName: "first_name",
    lastName: "last_name",
    isForum: "is_forum",
    isDirectMessages: "is_direct_messages"
  })
)

/**
 * Decoded `camelCase` Chat.
 *
 * @category models
 * @since 0.1.0
 */
export type Chat = Schema.Schema.Type<typeof Chat>

/**
 * Contains information about the affiliate that received a commission via this transaction.
 *
 * @category schemas
 * @since 0.1.0
 */
export const AffiliateInfo = Schema.Struct({
  affiliateUser: Schema.optionalKey(User),
  affiliateChat: Schema.optionalKey(Chat),
  commissionPerMille: Schema.Number,
  amount: Schema.Number,
  nanostarAmount: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    affiliateUser: "affiliate_user",
    affiliateChat: "affiliate_chat",
    commissionPerMille: "commission_per_mille",
    nanostarAmount: "nanostar_amount"
  })
)

/**
 * Decoded `camelCase` AffiliateInfo.
 *
 * @category models
 * @since 0.1.0
 */
export type AffiliateInfo = Schema.Schema.Type<typeof AffiliateInfo>

/**
 * This object represents one size of a photo or a file / sticker thumbnail.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PhotoSize = Schema.Struct({
  fileId: Schema.String,
  fileUniqueId: Schema.String,
  width: Schema.Number,
  height: Schema.Number,
  fileSize: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    fileId: "file_id",
    fileUniqueId: "file_unique_id",
    fileSize: "file_size"
  })
)

/**
 * Decoded `camelCase` PhotoSize.
 *
 * @category models
 * @since 0.1.0
 */
export type PhotoSize = Schema.Schema.Type<typeof PhotoSize>

/**
 * This object represents an animation file (GIF or H.264/MPEG-4 AVC video without sound).
 *
 * @category schemas
 * @since 0.1.0
 */
export const Animation = Schema.Struct({
  fileId: Schema.String,
  fileUniqueId: Schema.String,
  width: Schema.Number,
  height: Schema.Number,
  duration: Schema.Number,
  thumbnail: Schema.optionalKey(PhotoSize),
  fileName: Schema.optionalKey(Schema.String),
  mimeType: Schema.optionalKey(Schema.String),
  fileSize: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    fileId: "file_id",
    fileUniqueId: "file_unique_id",
    fileName: "file_name",
    mimeType: "mime_type",
    fileSize: "file_size"
  })
)

/**
 * Decoded `camelCase` Animation.
 *
 * @category models
 * @since 0.1.0
 */
export type Animation = Schema.Schema.Type<typeof Animation>

/**
 * This object represents an audio file to be treated as music by the Telegram clients.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Audio = Schema.Struct({
  fileId: Schema.String,
  fileUniqueId: Schema.String,
  duration: Schema.Number,
  performer: Schema.optionalKey(Schema.String),
  title: Schema.optionalKey(Schema.String),
  fileName: Schema.optionalKey(Schema.String),
  mimeType: Schema.optionalKey(Schema.String),
  fileSize: Schema.optionalKey(Schema.Number),
  thumbnail: Schema.optionalKey(PhotoSize)
}).pipe(
  Schema.encodeKeys({
    fileId: "file_id",
    fileUniqueId: "file_unique_id",
    fileName: "file_name",
    mimeType: "mime_type",
    fileSize: "file_size"
  })
)

/**
 * Decoded `camelCase` Audio.
 *
 * @category models
 * @since 0.1.0
 */
export type Audio = Schema.Schema.Type<typeof Audio>

/**
 * The background is filled using the selected color.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BackgroundFillSolid = Schema.Struct({
  type: Schema.Literal("solid"),
  color: Schema.Number
})

/**
 * Decoded `camelCase` BackgroundFillSolid.
 *
 * @category models
 * @since 0.1.0
 */
export type BackgroundFillSolid = Schema.Schema.Type<typeof BackgroundFillSolid>

/**
 * The background is a gradient fill.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BackgroundFillGradient = Schema.Struct({
  type: Schema.Literal("gradient"),
  topColor: Schema.Number,
  bottomColor: Schema.Number,
  rotationAngle: Schema.Number
}).pipe(
  Schema.encodeKeys({
    topColor: "top_color",
    bottomColor: "bottom_color",
    rotationAngle: "rotation_angle"
  })
)

/**
 * Decoded `camelCase` BackgroundFillGradient.
 *
 * @category models
 * @since 0.1.0
 */
export type BackgroundFillGradient = Schema.Schema.Type<typeof BackgroundFillGradient>

/**
 * The background is a freeform gradient that rotates after every message in the chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BackgroundFillFreeformGradient = Schema.Struct({
  type: Schema.Literal("freeform_gradient"),
  colors: Schema.Array(Schema.Number)
})

/**
 * Decoded `camelCase` BackgroundFillFreeformGradient.
 *
 * @category models
 * @since 0.1.0
 */
export type BackgroundFillFreeformGradient = Schema.Schema.Type<typeof BackgroundFillFreeformGradient>

/**
 * This object describes the way a background is filled based on the selected colors. Currently, it can be one of - BackgroundFillSolid - BackgroundFillGradient - BackgroundFillFreeformGradient
 *
 * @category schemas
 * @since 0.1.0
 */
export const BackgroundFill = Schema.Union([BackgroundFillSolid, BackgroundFillGradient, BackgroundFillFreeformGradient])

/**
 * Decoded `camelCase` BackgroundFill (union).
 *
 * @category models
 * @since 0.1.0
 */
export type BackgroundFill = Schema.Schema.Type<typeof BackgroundFill>

/**
 * The background is automatically filled based on the selected colors.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BackgroundTypeFill = Schema.Struct({
  type: Schema.Literal("fill"),
  fill: BackgroundFill,
  darkThemeDimming: Schema.Number
}).pipe(
  Schema.encodeKeys({
    darkThemeDimming: "dark_theme_dimming"
  })
)

/**
 * Decoded `camelCase` BackgroundTypeFill.
 *
 * @category models
 * @since 0.1.0
 */
export type BackgroundTypeFill = Schema.Schema.Type<typeof BackgroundTypeFill>

/**
 * This object represents a general file (as opposed to photos, voice messages and audio files).
 *
 * @category schemas
 * @since 0.1.0
 */
export const Document = Schema.Struct({
  fileId: Schema.String,
  fileUniqueId: Schema.String,
  thumbnail: Schema.optionalKey(PhotoSize),
  fileName: Schema.optionalKey(Schema.String),
  mimeType: Schema.optionalKey(Schema.String),
  fileSize: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    fileId: "file_id",
    fileUniqueId: "file_unique_id",
    fileName: "file_name",
    mimeType: "mime_type",
    fileSize: "file_size"
  })
)

/**
 * Decoded `camelCase` Document.
 *
 * @category models
 * @since 0.1.0
 */
export type Document = Schema.Schema.Type<typeof Document>

/**
 * The background is a wallpaper in the JPEG format.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BackgroundTypeWallpaper = Schema.Struct({
  type: Schema.Literal("wallpaper"),
  document: Document,
  darkThemeDimming: Schema.Number,
  isBlurred: Schema.optionalKey(Schema.Boolean),
  isMoving: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    darkThemeDimming: "dark_theme_dimming",
    isBlurred: "is_blurred",
    isMoving: "is_moving"
  })
)

/**
 * Decoded `camelCase` BackgroundTypeWallpaper.
 *
 * @category models
 * @since 0.1.0
 */
export type BackgroundTypeWallpaper = Schema.Schema.Type<typeof BackgroundTypeWallpaper>

/**
 * The background is a .PNG or .TGV (gzipped subset of SVG with MIME type "application/x-tgwallpattern") pattern to be combined with the background fill chosen by the user.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BackgroundTypePattern = Schema.Struct({
  type: Schema.Literal("pattern"),
  document: Document,
  fill: BackgroundFill,
  intensity: Schema.Number,
  isInverted: Schema.optionalKey(Schema.Boolean),
  isMoving: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    isInverted: "is_inverted",
    isMoving: "is_moving"
  })
)

/**
 * Decoded `camelCase` BackgroundTypePattern.
 *
 * @category models
 * @since 0.1.0
 */
export type BackgroundTypePattern = Schema.Schema.Type<typeof BackgroundTypePattern>

/**
 * The background is taken directly from a built-in chat theme.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BackgroundTypeChatTheme = Schema.Struct({
  type: Schema.Literal("chat_theme"),
  themeName: Schema.String
}).pipe(
  Schema.encodeKeys({
    themeName: "theme_name"
  })
)

/**
 * Decoded `camelCase` BackgroundTypeChatTheme.
 *
 * @category models
 * @since 0.1.0
 */
export type BackgroundTypeChatTheme = Schema.Schema.Type<typeof BackgroundTypeChatTheme>

/**
 * This object describes the type of a background. Currently, it can be one of - BackgroundTypeFill - BackgroundTypeWallpaper - BackgroundTypePattern - BackgroundTypeChatTheme
 *
 * @category schemas
 * @since 0.1.0
 */
export const BackgroundType = Schema.Union([BackgroundTypeFill, BackgroundTypeWallpaper, BackgroundTypePattern, BackgroundTypeChatTheme])

/**
 * Decoded `camelCase` BackgroundType (union).
 *
 * @category models
 * @since 0.1.0
 */
export type BackgroundType = Schema.Schema.Type<typeof BackgroundType>

/**
 * Describes the birthdate of a user.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Birthdate = Schema.Struct({
  day: Schema.Number,
  month: Schema.Number,
  year: Schema.optionalKey(Schema.Number)
})

/**
 * Decoded `camelCase` Birthdate.
 *
 * @category models
 * @since 0.1.0
 */
export type Birthdate = Schema.Schema.Type<typeof Birthdate>

/**
 * This object describes the access settings of a bot.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BotAccessSettings = Schema.Struct({
  isAccessRestricted: Schema.Boolean,
  addedUsers: Schema.optionalKey(Schema.Array(User))
}).pipe(
  Schema.encodeKeys({
    isAccessRestricted: "is_access_restricted",
    addedUsers: "added_users"
  })
)

/**
 * Decoded `camelCase` BotAccessSettings.
 *
 * @category models
 * @since 0.1.0
 */
export type BotAccessSettings = Schema.Schema.Type<typeof BotAccessSettings>

/**
 * This object represents a bot command.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BotCommand = Schema.Struct({
  command: Schema.String,
  description: Schema.String
})

/**
 * Decoded `camelCase` BotCommand.
 *
 * @category models
 * @since 0.1.0
 */
export type BotCommand = Schema.Schema.Type<typeof BotCommand>

/**
 * Represents the default scope of bot commands. Default commands are used if no commands with a narrower scope are specified for the user.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BotCommandScopeDefault = Schema.Struct({
  type: Schema.Literal("default")
})

/**
 * Decoded `camelCase` BotCommandScopeDefault.
 *
 * @category models
 * @since 0.1.0
 */
export type BotCommandScopeDefault = Schema.Schema.Type<typeof BotCommandScopeDefault>

/**
 * Represents the scope of bot commands, covering all private chats.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BotCommandScopeAllPrivateChats = Schema.Struct({
  type: Schema.Literal("all_private_chats")
})

/**
 * Decoded `camelCase` BotCommandScopeAllPrivateChats.
 *
 * @category models
 * @since 0.1.0
 */
export type BotCommandScopeAllPrivateChats = Schema.Schema.Type<typeof BotCommandScopeAllPrivateChats>

/**
 * Represents the scope of bot commands, covering all group and supergroup chats.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BotCommandScopeAllGroupChats = Schema.Struct({
  type: Schema.Literal("all_group_chats")
})

/**
 * Decoded `camelCase` BotCommandScopeAllGroupChats.
 *
 * @category models
 * @since 0.1.0
 */
export type BotCommandScopeAllGroupChats = Schema.Schema.Type<typeof BotCommandScopeAllGroupChats>

/**
 * Represents the scope of bot commands, covering all group and supergroup chat administrators.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BotCommandScopeAllChatAdministrators = Schema.Struct({
  type: Schema.Literal("all_chat_administrators")
})

/**
 * Decoded `camelCase` BotCommandScopeAllChatAdministrators.
 *
 * @category models
 * @since 0.1.0
 */
export type BotCommandScopeAllChatAdministrators = Schema.Schema.Type<typeof BotCommandScopeAllChatAdministrators>

/**
 * Represents the scope of bot commands, covering a specific chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BotCommandScopeChat = Schema.Struct({
  type: Schema.Literal("chat"),
  chatId: Schema.Union([Schema.Number, Schema.String])
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * Decoded `camelCase` BotCommandScopeChat.
 *
 * @category models
 * @since 0.1.0
 */
export type BotCommandScopeChat = Schema.Schema.Type<typeof BotCommandScopeChat>

/**
 * Represents the scope of bot commands, covering all administrators of a specific group or supergroup chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BotCommandScopeChatAdministrators = Schema.Struct({
  type: Schema.Literal("chat_administrators"),
  chatId: Schema.Union([Schema.Number, Schema.String])
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id"
  })
)

/**
 * Decoded `camelCase` BotCommandScopeChatAdministrators.
 *
 * @category models
 * @since 0.1.0
 */
export type BotCommandScopeChatAdministrators = Schema.Schema.Type<typeof BotCommandScopeChatAdministrators>

/**
 * Represents the scope of bot commands, covering a specific member of a group or supergroup chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BotCommandScopeChatMember = Schema.Struct({
  type: Schema.Literal("chat_member"),
  chatId: Schema.Union([Schema.Number, Schema.String]),
  userId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    chatId: "chat_id",
    userId: "user_id"
  })
)

/**
 * Decoded `camelCase` BotCommandScopeChatMember.
 *
 * @category models
 * @since 0.1.0
 */
export type BotCommandScopeChatMember = Schema.Schema.Type<typeof BotCommandScopeChatMember>

/**
 * This object represents the scope to which bot commands are applied. Currently, the following 7 scopes are supported: - BotCommandScopeDefault - BotCommandScopeAllPrivateChats - BotCommandScopeAllGroupChats - BotCommandScopeAllChatAdministrators - BotCommandScopeChat - BotCommandScopeChatAdministrators - BotCommandScopeChatMember
 *
 * @category schemas
 * @since 0.1.0
 */
export const BotCommandScope = Schema.Union([BotCommandScopeDefault, BotCommandScopeAllPrivateChats, BotCommandScopeAllGroupChats, BotCommandScopeAllChatAdministrators, BotCommandScopeChat, BotCommandScopeChatAdministrators, BotCommandScopeChatMember])

/**
 * Decoded `camelCase` BotCommandScope (union).
 *
 * @category models
 * @since 0.1.0
 */
export type BotCommandScope = Schema.Schema.Type<typeof BotCommandScope>

/**
 * This object represents the bot's description.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BotDescription = Schema.Struct({
  description: Schema.String
})

/**
 * Decoded `camelCase` BotDescription.
 *
 * @category models
 * @since 0.1.0
 */
export type BotDescription = Schema.Schema.Type<typeof BotDescription>

/**
 * This object represents the bot's name.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BotName = Schema.Struct({
  name: Schema.String
})

/**
 * Decoded `camelCase` BotName.
 *
 * @category models
 * @since 0.1.0
 */
export type BotName = Schema.Schema.Type<typeof BotName>

/**
 * This object represents the bot's short description.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BotShortDescription = Schema.Struct({
  shortDescription: Schema.String
}).pipe(
  Schema.encodeKeys({
    shortDescription: "short_description"
  })
)

/**
 * Decoded `camelCase` BotShortDescription.
 *
 * @category models
 * @since 0.1.0
 */
export type BotShortDescription = Schema.Schema.Type<typeof BotShortDescription>

/**
 * Represents the rights of a business bot.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BusinessBotRights = Schema.Struct({
  canReply: Schema.optionalKey(Schema.Boolean),
  canReadMessages: Schema.optionalKey(Schema.Boolean),
  canDeleteSentMessages: Schema.optionalKey(Schema.Boolean),
  canDeleteAllMessages: Schema.optionalKey(Schema.Boolean),
  canEditName: Schema.optionalKey(Schema.Boolean),
  canEditBio: Schema.optionalKey(Schema.Boolean),
  canEditProfilePhoto: Schema.optionalKey(Schema.Boolean),
  canEditUsername: Schema.optionalKey(Schema.Boolean),
  canChangeGiftSettings: Schema.optionalKey(Schema.Boolean),
  canViewGiftsAndStars: Schema.optionalKey(Schema.Boolean),
  canConvertGiftsToStars: Schema.optionalKey(Schema.Boolean),
  canTransferAndUpgradeGifts: Schema.optionalKey(Schema.Boolean),
  canTransferStars: Schema.optionalKey(Schema.Boolean),
  canManageStories: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    canReply: "can_reply",
    canReadMessages: "can_read_messages",
    canDeleteSentMessages: "can_delete_sent_messages",
    canDeleteAllMessages: "can_delete_all_messages",
    canEditName: "can_edit_name",
    canEditBio: "can_edit_bio",
    canEditProfilePhoto: "can_edit_profile_photo",
    canEditUsername: "can_edit_username",
    canChangeGiftSettings: "can_change_gift_settings",
    canViewGiftsAndStars: "can_view_gifts_and_stars",
    canConvertGiftsToStars: "can_convert_gifts_to_stars",
    canTransferAndUpgradeGifts: "can_transfer_and_upgrade_gifts",
    canTransferStars: "can_transfer_stars",
    canManageStories: "can_manage_stories"
  })
)

/**
 * Decoded `camelCase` BusinessBotRights.
 *
 * @category models
 * @since 0.1.0
 */
export type BusinessBotRights = Schema.Schema.Type<typeof BusinessBotRights>

/**
 * Describes the connection of the bot with a business account.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BusinessConnection = Schema.Struct({
  id: Schema.String,
  user: User,
  userChatId: Schema.Number,
  date: Schema.Number,
  rights: Schema.optionalKey(BusinessBotRights),
  isEnabled: Schema.Boolean
}).pipe(
  Schema.encodeKeys({
    userChatId: "user_chat_id",
    isEnabled: "is_enabled"
  })
)

/**
 * Decoded `camelCase` BusinessConnection.
 *
 * @category models
 * @since 0.1.0
 */
export type BusinessConnection = Schema.Schema.Type<typeof BusinessConnection>

/**
 * This object represents a file ready to be downloaded. The file can be downloaded via the link https://api.telegram.org/file/bot<token>/<file_path>. It is guaranteed that the link will be valid for at least 1 hour. When the link expires, a new one can be requested by calling getFile.
 *
 * @category schemas
 * @since 0.1.0
 */
export const File = Schema.Struct({
  fileId: Schema.String,
  fileUniqueId: Schema.String,
  fileSize: Schema.optionalKey(Schema.Number),
  filePath: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    fileId: "file_id",
    fileUniqueId: "file_unique_id",
    fileSize: "file_size",
    filePath: "file_path"
  })
)

/**
 * Decoded `camelCase` File.
 *
 * @category models
 * @since 0.1.0
 */
export type File = Schema.Schema.Type<typeof File>

/**
 * This object describes the position on faces where a mask should be placed by default.
 *
 * @category schemas
 * @since 0.1.0
 */
export const MaskPosition = Schema.Struct({
  point: Schema.String,
  xShift: Schema.Number,
  yShift: Schema.Number,
  scale: Schema.Number
}).pipe(
  Schema.encodeKeys({
    xShift: "x_shift",
    yShift: "y_shift"
  })
)

/**
 * Decoded `camelCase` MaskPosition.
 *
 * @category models
 * @since 0.1.0
 */
export type MaskPosition = Schema.Schema.Type<typeof MaskPosition>

/**
 * This object represents a sticker.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Sticker = Schema.Struct({
  fileId: Schema.String,
  fileUniqueId: Schema.String,
  type: Schema.String,
  width: Schema.Number,
  height: Schema.Number,
  isAnimated: Schema.Boolean,
  isVideo: Schema.Boolean,
  thumbnail: Schema.optionalKey(PhotoSize),
  emoji: Schema.optionalKey(Schema.String),
  setName: Schema.optionalKey(Schema.String),
  premiumAnimation: Schema.optionalKey(File),
  maskPosition: Schema.optionalKey(MaskPosition),
  customEmojiId: Schema.optionalKey(Schema.String),
  needsRepainting: Schema.optionalKey(Schema.Boolean),
  fileSize: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    fileId: "file_id",
    fileUniqueId: "file_unique_id",
    isAnimated: "is_animated",
    isVideo: "is_video",
    setName: "set_name",
    premiumAnimation: "premium_animation",
    maskPosition: "mask_position",
    customEmojiId: "custom_emoji_id",
    needsRepainting: "needs_repainting",
    fileSize: "file_size"
  })
)

/**
 * Decoded `camelCase` Sticker.
 *
 * @category models
 * @since 0.1.0
 */
export type Sticker = Schema.Schema.Type<typeof Sticker>

/**
 * Contains information about the start page settings of a Telegram Business account.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BusinessIntro = Schema.Struct({
  title: Schema.optionalKey(Schema.String),
  message: Schema.optionalKey(Schema.String),
  sticker: Schema.optionalKey(Sticker)
})

/**
 * Decoded `camelCase` BusinessIntro.
 *
 * @category models
 * @since 0.1.0
 */
export type BusinessIntro = Schema.Schema.Type<typeof BusinessIntro>

/**
 * This object represents a point on the map.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Location = Schema.Struct({
  latitude: Schema.Number,
  longitude: Schema.Number,
  horizontalAccuracy: Schema.optionalKey(Schema.Number),
  livePeriod: Schema.optionalKey(Schema.Number),
  heading: Schema.optionalKey(Schema.Number),
  proximityAlertRadius: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    horizontalAccuracy: "horizontal_accuracy",
    livePeriod: "live_period",
    proximityAlertRadius: "proximity_alert_radius"
  })
)

/**
 * Decoded `camelCase` Location.
 *
 * @category models
 * @since 0.1.0
 */
export type Location = Schema.Schema.Type<typeof Location>

/**
 * Contains information about the location of a Telegram Business account.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BusinessLocation = Schema.Struct({
  address: Schema.String,
  location: Schema.optionalKey(Location)
})

/**
 * Decoded `camelCase` BusinessLocation.
 *
 * @category models
 * @since 0.1.0
 */
export type BusinessLocation = Schema.Schema.Type<typeof BusinessLocation>

/**
 * This object is received when messages are deleted from a connected business account.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BusinessMessagesDeleted = Schema.Struct({
  businessConnectionId: Schema.String,
  chat: Chat,
  messageIds: Schema.Array(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    businessConnectionId: "business_connection_id",
    messageIds: "message_ids"
  })
)

/**
 * Decoded `camelCase` BusinessMessagesDeleted.
 *
 * @category models
 * @since 0.1.0
 */
export type BusinessMessagesDeleted = Schema.Schema.Type<typeof BusinessMessagesDeleted>

/**
 * Describes an interval of time during which a business is open.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BusinessOpeningHoursInterval = Schema.Struct({
  openingMinute: Schema.Number,
  closingMinute: Schema.Number
}).pipe(
  Schema.encodeKeys({
    openingMinute: "opening_minute",
    closingMinute: "closing_minute"
  })
)

/**
 * Decoded `camelCase` BusinessOpeningHoursInterval.
 *
 * @category models
 * @since 0.1.0
 */
export type BusinessOpeningHoursInterval = Schema.Schema.Type<typeof BusinessOpeningHoursInterval>

/**
 * Describes the opening hours of a business.
 *
 * @category schemas
 * @since 0.1.0
 */
export const BusinessOpeningHours = Schema.Struct({
  timeZoneName: Schema.String,
  openingHours: Schema.Array(BusinessOpeningHoursInterval)
}).pipe(
  Schema.encodeKeys({
    timeZoneName: "time_zone_name",
    openingHours: "opening_hours"
  })
)

/**
 * Decoded `camelCase` BusinessOpeningHours.
 *
 * @category models
 * @since 0.1.0
 */
export type BusinessOpeningHours = Schema.Schema.Type<typeof BusinessOpeningHours>

/**
 * A placeholder, currently holds no information. Use BotFather to set up your game.
 *
 * @category schemas
 * @since 0.1.0
 */
export const CallbackGame = Schema.Struct({})

/**
 * Decoded `camelCase` CallbackGame.
 *
 * @category models
 * @since 0.1.0
 */
export type CallbackGame = Schema.Schema.Type<typeof CallbackGame>

/**
 * Describes a topic of a direct messages chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const DirectMessagesTopic = Schema.Struct({
  topicId: Schema.Number,
  user: Schema.optionalKey(User)
}).pipe(
  Schema.encodeKeys({
    topicId: "topic_id"
  })
)

/**
 * Decoded `camelCase` DirectMessagesTopic.
 *
 * @category models
 * @since 0.1.0
 */
export type DirectMessagesTopic = Schema.Schema.Type<typeof DirectMessagesTopic>

/**
 * The message was originally sent by a known user.
 *
 * @category schemas
 * @since 0.1.0
 */
export const MessageOriginUser = Schema.Struct({
  type: Schema.Literal("user"),
  date: Schema.Number,
  senderUser: User
}).pipe(
  Schema.encodeKeys({
    senderUser: "sender_user"
  })
)

/**
 * Decoded `camelCase` MessageOriginUser.
 *
 * @category models
 * @since 0.1.0
 */
export type MessageOriginUser = Schema.Schema.Type<typeof MessageOriginUser>

/**
 * The message was originally sent by an unknown user.
 *
 * @category schemas
 * @since 0.1.0
 */
export const MessageOriginHiddenUser = Schema.Struct({
  type: Schema.Literal("hidden_user"),
  date: Schema.Number,
  senderUserName: Schema.String
}).pipe(
  Schema.encodeKeys({
    senderUserName: "sender_user_name"
  })
)

/**
 * Decoded `camelCase` MessageOriginHiddenUser.
 *
 * @category models
 * @since 0.1.0
 */
export type MessageOriginHiddenUser = Schema.Schema.Type<typeof MessageOriginHiddenUser>

/**
 * The message was originally sent on behalf of a chat to a group chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const MessageOriginChat = Schema.Struct({
  type: Schema.Literal("chat"),
  date: Schema.Number,
  senderChat: Chat,
  authorSignature: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    senderChat: "sender_chat",
    authorSignature: "author_signature"
  })
)

/**
 * Decoded `camelCase` MessageOriginChat.
 *
 * @category models
 * @since 0.1.0
 */
export type MessageOriginChat = Schema.Schema.Type<typeof MessageOriginChat>

/**
 * The message was originally sent to a channel chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const MessageOriginChannel = Schema.Struct({
  type: Schema.Literal("channel"),
  date: Schema.Number,
  chat: Chat,
  messageId: Schema.Number,
  authorSignature: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    messageId: "message_id",
    authorSignature: "author_signature"
  })
)

/**
 * Decoded `camelCase` MessageOriginChannel.
 *
 * @category models
 * @since 0.1.0
 */
export type MessageOriginChannel = Schema.Schema.Type<typeof MessageOriginChannel>

/**
 * This object describes the origin of a message. It can be one of - MessageOriginUser - MessageOriginHiddenUser - MessageOriginChat - MessageOriginChannel
 *
 * @category schemas
 * @since 0.1.0
 */
export const MessageOrigin = Schema.Union([MessageOriginUser, MessageOriginHiddenUser, MessageOriginChat, MessageOriginChannel])

/**
 * Decoded `camelCase` MessageOrigin (union).
 *
 * @category models
 * @since 0.1.0
 */
export type MessageOrigin = Schema.Schema.Type<typeof MessageOrigin>

/**
 * Describes the options used for link preview generation.
 *
 * @category schemas
 * @since 0.1.0
 */
export const LinkPreviewOptions = Schema.Struct({
  isDisabled: Schema.optionalKey(Schema.Boolean),
  url: Schema.optionalKey(Schema.String),
  preferSmallMedia: Schema.optionalKey(Schema.Boolean),
  preferLargeMedia: Schema.optionalKey(Schema.Boolean),
  showAboveText: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    isDisabled: "is_disabled",
    preferSmallMedia: "prefer_small_media",
    preferLargeMedia: "prefer_large_media",
    showAboveText: "show_above_text"
  })
)

/**
 * Decoded `camelCase` LinkPreviewOptions.
 *
 * @category models
 * @since 0.1.0
 */
export type LinkPreviewOptions = Schema.Schema.Type<typeof LinkPreviewOptions>

/**
 * This object represents a live photo.
 *
 * @category schemas
 * @since 0.1.0
 */
export const LivePhoto = Schema.Struct({
  photo: Schema.optionalKey(Schema.Array(PhotoSize)),
  fileId: Schema.String,
  fileUniqueId: Schema.String,
  width: Schema.Number,
  height: Schema.Number,
  duration: Schema.Number,
  mimeType: Schema.optionalKey(Schema.String),
  fileSize: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    fileId: "file_id",
    fileUniqueId: "file_unique_id",
    mimeType: "mime_type",
    fileSize: "file_size"
  })
)

/**
 * Decoded `camelCase` LivePhoto.
 *
 * @category models
 * @since 0.1.0
 */
export type LivePhoto = Schema.Schema.Type<typeof LivePhoto>

/**
 * The paid media is a live photo.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PaidMediaLivePhoto = Schema.Struct({
  type: Schema.Literal("live_photo"),
  livePhoto: LivePhoto
}).pipe(
  Schema.encodeKeys({
    livePhoto: "live_photo"
  })
)

/**
 * Decoded `camelCase` PaidMediaLivePhoto.
 *
 * @category models
 * @since 0.1.0
 */
export type PaidMediaLivePhoto = Schema.Schema.Type<typeof PaidMediaLivePhoto>

/**
 * The paid media is a photo.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PaidMediaPhoto = Schema.Struct({
  type: Schema.Literal("photo"),
  photo: Schema.Array(PhotoSize)
})

/**
 * Decoded `camelCase` PaidMediaPhoto.
 *
 * @category models
 * @since 0.1.0
 */
export type PaidMediaPhoto = Schema.Schema.Type<typeof PaidMediaPhoto>

/**
 * The paid media isn't available before the payment.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PaidMediaPreview = Schema.Struct({
  type: Schema.Literal("preview"),
  width: Schema.optionalKey(Schema.Number),
  height: Schema.optionalKey(Schema.Number),
  duration: Schema.optionalKey(Schema.Number)
})

/**
 * Decoded `camelCase` PaidMediaPreview.
 *
 * @category models
 * @since 0.1.0
 */
export type PaidMediaPreview = Schema.Schema.Type<typeof PaidMediaPreview>

/**
 * This object represents a video file of a specific quality.
 *
 * @category schemas
 * @since 0.1.0
 */
export const VideoQuality = Schema.Struct({
  fileId: Schema.String,
  fileUniqueId: Schema.String,
  width: Schema.Number,
  height: Schema.Number,
  codec: Schema.String,
  fileSize: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    fileId: "file_id",
    fileUniqueId: "file_unique_id",
    fileSize: "file_size"
  })
)

/**
 * Decoded `camelCase` VideoQuality.
 *
 * @category models
 * @since 0.1.0
 */
export type VideoQuality = Schema.Schema.Type<typeof VideoQuality>

/**
 * This object represents a video file.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Video = Schema.Struct({
  fileId: Schema.String,
  fileUniqueId: Schema.String,
  width: Schema.Number,
  height: Schema.Number,
  duration: Schema.Number,
  thumbnail: Schema.optionalKey(PhotoSize),
  cover: Schema.optionalKey(Schema.Array(PhotoSize)),
  startTimestamp: Schema.optionalKey(Schema.Number),
  qualities: Schema.optionalKey(Schema.Array(VideoQuality)),
  fileName: Schema.optionalKey(Schema.String),
  mimeType: Schema.optionalKey(Schema.String),
  fileSize: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    fileId: "file_id",
    fileUniqueId: "file_unique_id",
    startTimestamp: "start_timestamp",
    fileName: "file_name",
    mimeType: "mime_type",
    fileSize: "file_size"
  })
)

/**
 * Decoded `camelCase` Video.
 *
 * @category models
 * @since 0.1.0
 */
export type Video = Schema.Schema.Type<typeof Video>

/**
 * The paid media is a video.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PaidMediaVideo = Schema.Struct({
  type: Schema.Literal("video"),
  video: Video
})

/**
 * Decoded `camelCase` PaidMediaVideo.
 *
 * @category models
 * @since 0.1.0
 */
export type PaidMediaVideo = Schema.Schema.Type<typeof PaidMediaVideo>

/**
 * This object describes paid media. Currently, it can be one of - PaidMediaLivePhoto - PaidMediaPhoto - PaidMediaPreview - PaidMediaVideo
 *
 * @category schemas
 * @since 0.1.0
 */
export const PaidMedia = Schema.Union([PaidMediaLivePhoto, PaidMediaPhoto, PaidMediaPreview, PaidMediaVideo])

/**
 * Decoded `camelCase` PaidMedia (union).
 *
 * @category models
 * @since 0.1.0
 */
export type PaidMedia = Schema.Schema.Type<typeof PaidMedia>

/**
 * Describes the paid media added to a message.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PaidMediaInfo = Schema.Struct({
  starCount: Schema.Number,
  paidMedia: Schema.Array(PaidMedia)
}).pipe(
  Schema.encodeKeys({
    starCount: "star_count",
    paidMedia: "paid_media"
  })
)

/**
 * Decoded `camelCase` PaidMediaInfo.
 *
 * @category models
 * @since 0.1.0
 */
export type PaidMediaInfo = Schema.Schema.Type<typeof PaidMediaInfo>

/**
 * This object represents a story.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Story = Schema.Struct({
  chat: Chat,
  id: Schema.Number
})

/**
 * Decoded `camelCase` Story.
 *
 * @category models
 * @since 0.1.0
 */
export type Story = Schema.Schema.Type<typeof Story>

/**
 * This object represents a video message (available in Telegram apps as of v.4.0).
 *
 * @category schemas
 * @since 0.1.0
 */
export const VideoNote = Schema.Struct({
  fileId: Schema.String,
  fileUniqueId: Schema.String,
  length: Schema.Number,
  duration: Schema.Number,
  thumbnail: Schema.optionalKey(PhotoSize),
  fileSize: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    fileId: "file_id",
    fileUniqueId: "file_unique_id",
    fileSize: "file_size"
  })
)

/**
 * Decoded `camelCase` VideoNote.
 *
 * @category models
 * @since 0.1.0
 */
export type VideoNote = Schema.Schema.Type<typeof VideoNote>

/**
 * This object represents a voice note.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Voice = Schema.Struct({
  fileId: Schema.String,
  fileUniqueId: Schema.String,
  duration: Schema.Number,
  mimeType: Schema.optionalKey(Schema.String),
  fileSize: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    fileId: "file_id",
    fileUniqueId: "file_unique_id",
    mimeType: "mime_type",
    fileSize: "file_size"
  })
)

/**
 * Decoded `camelCase` Voice.
 *
 * @category models
 * @since 0.1.0
 */
export type Voice = Schema.Schema.Type<typeof Voice>

/**
 * This object represents one special entity in a text message. For example, hashtags, usernames, URLs, etc.
 *
 * @category schemas
 * @since 0.1.0
 */
export const MessageEntity = Schema.Struct({
  type: Schema.String,
  offset: Schema.Number,
  length: Schema.Number,
  url: Schema.optionalKey(Schema.String),
  user: Schema.optionalKey(User),
  language: Schema.optionalKey(Schema.String),
  customEmojiId: Schema.optionalKey(Schema.String),
  unixTime: Schema.optionalKey(Schema.Number),
  dateTimeFormat: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    customEmojiId: "custom_emoji_id",
    unixTime: "unix_time",
    dateTimeFormat: "date_time_format"
  })
)

/**
 * Decoded `camelCase` MessageEntity.
 *
 * @category models
 * @since 0.1.0
 */
export type MessageEntity = Schema.Schema.Type<typeof MessageEntity>

/**
 * Describes a task in a checklist.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChecklistTask = Schema.Struct({
  id: Schema.Number,
  text: Schema.String,
  textEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  completedByUser: Schema.optionalKey(User),
  completedByChat: Schema.optionalKey(Chat),
  completionDate: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    textEntities: "text_entities",
    completedByUser: "completed_by_user",
    completedByChat: "completed_by_chat",
    completionDate: "completion_date"
  })
)

/**
 * Decoded `camelCase` ChecklistTask.
 *
 * @category models
 * @since 0.1.0
 */
export type ChecklistTask = Schema.Schema.Type<typeof ChecklistTask>

/**
 * Describes a checklist.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Checklist = Schema.Struct({
  title: Schema.String,
  titleEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  tasks: Schema.Array(ChecklistTask),
  othersCanAddTasks: Schema.optionalKey(Schema.Boolean),
  othersCanMarkTasksAsDone: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    titleEntities: "title_entities",
    othersCanAddTasks: "others_can_add_tasks",
    othersCanMarkTasksAsDone: "others_can_mark_tasks_as_done"
  })
)

/**
 * Decoded `camelCase` Checklist.
 *
 * @category models
 * @since 0.1.0
 */
export type Checklist = Schema.Schema.Type<typeof Checklist>

/**
 * This object represents a phone contact.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Contact = Schema.Struct({
  phoneNumber: Schema.String,
  firstName: Schema.String,
  lastName: Schema.optionalKey(Schema.String),
  userId: Schema.optionalKey(Schema.Number),
  vcard: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    phoneNumber: "phone_number",
    firstName: "first_name",
    lastName: "last_name",
    userId: "user_id"
  })
)

/**
 * Decoded `camelCase` Contact.
 *
 * @category models
 * @since 0.1.0
 */
export type Contact = Schema.Schema.Type<typeof Contact>

/**
 * This object represents an animated emoji that displays a random value.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Dice = Schema.Struct({
  emoji: Schema.String,
  value: Schema.Number
})

/**
 * Decoded `camelCase` Dice.
 *
 * @category models
 * @since 0.1.0
 */
export type Dice = Schema.Schema.Type<typeof Dice>

/**
 * This object represents a game. Use BotFather to create and edit games, their short names will act as unique identifiers.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Game = Schema.Struct({
  title: Schema.String,
  description: Schema.String,
  photo: Schema.Array(PhotoSize),
  text: Schema.optionalKey(Schema.String),
  textEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  animation: Schema.optionalKey(Animation)
}).pipe(
  Schema.encodeKeys({
    textEntities: "text_entities"
  })
)

/**
 * Decoded `camelCase` Game.
 *
 * @category models
 * @since 0.1.0
 */
export type Game = Schema.Schema.Type<typeof Game>

/**
 * This object represents a message about a scheduled giveaway.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Giveaway = Schema.Struct({
  chats: Schema.Array(Chat),
  winnersSelectionDate: Schema.Number,
  winnerCount: Schema.Number,
  onlyNewMembers: Schema.optionalKey(Schema.Boolean),
  hasPublicWinners: Schema.optionalKey(Schema.Boolean),
  prizeDescription: Schema.optionalKey(Schema.String),
  countryCodes: Schema.optionalKey(Schema.Array(Schema.String)),
  prizeStarCount: Schema.optionalKey(Schema.Number),
  premiumSubscriptionMonthCount: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    winnersSelectionDate: "winners_selection_date",
    winnerCount: "winner_count",
    onlyNewMembers: "only_new_members",
    hasPublicWinners: "has_public_winners",
    prizeDescription: "prize_description",
    countryCodes: "country_codes",
    prizeStarCount: "prize_star_count",
    premiumSubscriptionMonthCount: "premium_subscription_month_count"
  })
)

/**
 * Decoded `camelCase` Giveaway.
 *
 * @category models
 * @since 0.1.0
 */
export type Giveaway = Schema.Schema.Type<typeof Giveaway>

/**
 * This object represents a message about the completion of a giveaway with public winners.
 *
 * @category schemas
 * @since 0.1.0
 */
export const GiveawayWinners = Schema.Struct({
  chat: Chat,
  giveawayMessageId: Schema.Number,
  winnersSelectionDate: Schema.Number,
  winnerCount: Schema.Number,
  winners: Schema.Array(User),
  additionalChatCount: Schema.optionalKey(Schema.Number),
  prizeStarCount: Schema.optionalKey(Schema.Number),
  premiumSubscriptionMonthCount: Schema.optionalKey(Schema.Number),
  unclaimedPrizeCount: Schema.optionalKey(Schema.Number),
  onlyNewMembers: Schema.optionalKey(Schema.Boolean),
  wasRefunded: Schema.optionalKey(Schema.Boolean),
  prizeDescription: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    giveawayMessageId: "giveaway_message_id",
    winnersSelectionDate: "winners_selection_date",
    winnerCount: "winner_count",
    additionalChatCount: "additional_chat_count",
    prizeStarCount: "prize_star_count",
    premiumSubscriptionMonthCount: "premium_subscription_month_count",
    unclaimedPrizeCount: "unclaimed_prize_count",
    onlyNewMembers: "only_new_members",
    wasRefunded: "was_refunded",
    prizeDescription: "prize_description"
  })
)

/**
 * Decoded `camelCase` GiveawayWinners.
 *
 * @category models
 * @since 0.1.0
 */
export type GiveawayWinners = Schema.Schema.Type<typeof GiveawayWinners>

/**
 * This object contains basic information about an invoice.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Invoice = Schema.Struct({
  title: Schema.String,
  description: Schema.String,
  startParameter: Schema.String,
  currency: Schema.String,
  totalAmount: Schema.Number
}).pipe(
  Schema.encodeKeys({
    startParameter: "start_parameter",
    totalAmount: "total_amount"
  })
)

/**
 * Decoded `camelCase` Invoice.
 *
 * @category models
 * @since 0.1.0
 */
export type Invoice = Schema.Schema.Type<typeof Invoice>

/**
 * Represents an HTTP link.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Link = Schema.Struct({
  url: Schema.String
})

/**
 * Decoded `camelCase` Link.
 *
 * @category models
 * @since 0.1.0
 */
export type Link = Schema.Schema.Type<typeof Link>

/**
 * This object represents a venue.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Venue = Schema.Struct({
  location: Location,
  title: Schema.String,
  address: Schema.String,
  foursquareId: Schema.optionalKey(Schema.String),
  foursquareType: Schema.optionalKey(Schema.String),
  googlePlaceId: Schema.optionalKey(Schema.String),
  googlePlaceType: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    foursquareId: "foursquare_id",
    foursquareType: "foursquare_type",
    googlePlaceId: "google_place_id",
    googlePlaceType: "google_place_type"
  })
)

/**
 * Decoded `camelCase` Venue.
 *
 * @category models
 * @since 0.1.0
 */
export type Venue = Schema.Schema.Type<typeof Venue>

/**
 * At most one of the optional fields can be present in any given object.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PollMedia = Schema.Struct({
  animation: Schema.optionalKey(Animation),
  audio: Schema.optionalKey(Audio),
  document: Schema.optionalKey(Document),
  link: Schema.optionalKey(Link),
  livePhoto: Schema.optionalKey(LivePhoto),
  location: Schema.optionalKey(Location),
  photo: Schema.optionalKey(Schema.Array(PhotoSize)),
  sticker: Schema.optionalKey(Sticker),
  venue: Schema.optionalKey(Venue),
  video: Schema.optionalKey(Video)
}).pipe(
  Schema.encodeKeys({
    livePhoto: "live_photo"
  })
)

/**
 * Decoded `camelCase` PollMedia.
 *
 * @category models
 * @since 0.1.0
 */
export type PollMedia = Schema.Schema.Type<typeof PollMedia>

/**
 * This object contains information about one answer option in a poll.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PollOption = Schema.Struct({
  persistentId: Schema.String,
  text: Schema.String,
  textEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  media: Schema.optionalKey(PollMedia),
  voterCount: Schema.Number,
  addedByUser: Schema.optionalKey(User),
  addedByChat: Schema.optionalKey(Chat),
  additionDate: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    persistentId: "persistent_id",
    textEntities: "text_entities",
    voterCount: "voter_count",
    addedByUser: "added_by_user",
    addedByChat: "added_by_chat",
    additionDate: "addition_date"
  })
)

/**
 * Decoded `camelCase` PollOption.
 *
 * @category models
 * @since 0.1.0
 */
export type PollOption = Schema.Schema.Type<typeof PollOption>

/**
 * This object contains information about a poll.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Poll = Schema.Struct({
  id: Schema.String,
  question: Schema.String,
  questionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  options: Schema.Array(PollOption),
  totalVoterCount: Schema.Number,
  isClosed: Schema.Boolean,
  isAnonymous: Schema.Boolean,
  type: Schema.String,
  allowsMultipleAnswers: Schema.Boolean,
  allowsRevoting: Schema.Boolean,
  membersOnly: Schema.Boolean,
  countryCodes: Schema.optionalKey(Schema.Array(Schema.String)),
  correctOptionIds: Schema.optionalKey(Schema.Array(Schema.Number)),
  explanation: Schema.optionalKey(Schema.String),
  explanationEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  explanationMedia: Schema.optionalKey(PollMedia),
  openPeriod: Schema.optionalKey(Schema.Number),
  closeDate: Schema.optionalKey(Schema.Number),
  description: Schema.optionalKey(Schema.String),
  descriptionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  media: Schema.optionalKey(PollMedia)
}).pipe(
  Schema.encodeKeys({
    questionEntities: "question_entities",
    totalVoterCount: "total_voter_count",
    isClosed: "is_closed",
    isAnonymous: "is_anonymous",
    allowsMultipleAnswers: "allows_multiple_answers",
    allowsRevoting: "allows_revoting",
    membersOnly: "members_only",
    countryCodes: "country_codes",
    correctOptionIds: "correct_option_ids",
    explanationEntities: "explanation_entities",
    explanationMedia: "explanation_media",
    openPeriod: "open_period",
    closeDate: "close_date",
    descriptionEntities: "description_entities"
  })
)

/**
 * Decoded `camelCase` Poll.
 *
 * @category models
 * @since 0.1.0
 */
export type Poll = Schema.Schema.Type<typeof Poll>

/**
 * This object contains information about a message that is being replied to, which may come from another chat or forum topic.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ExternalReplyInfo = Schema.Struct({
  origin: MessageOrigin,
  chat: Schema.optionalKey(Chat),
  messageId: Schema.optionalKey(Schema.Number),
  linkPreviewOptions: Schema.optionalKey(LinkPreviewOptions),
  animation: Schema.optionalKey(Animation),
  audio: Schema.optionalKey(Audio),
  document: Schema.optionalKey(Document),
  livePhoto: Schema.optionalKey(LivePhoto),
  paidMedia: Schema.optionalKey(PaidMediaInfo),
  photo: Schema.optionalKey(Schema.Array(PhotoSize)),
  sticker: Schema.optionalKey(Sticker),
  story: Schema.optionalKey(Story),
  video: Schema.optionalKey(Video),
  videoNote: Schema.optionalKey(VideoNote),
  voice: Schema.optionalKey(Voice),
  hasMediaSpoiler: Schema.optionalKey(Schema.Boolean),
  checklist: Schema.optionalKey(Checklist),
  contact: Schema.optionalKey(Contact),
  dice: Schema.optionalKey(Dice),
  game: Schema.optionalKey(Game),
  giveaway: Schema.optionalKey(Giveaway),
  giveawayWinners: Schema.optionalKey(GiveawayWinners),
  invoice: Schema.optionalKey(Invoice),
  location: Schema.optionalKey(Location),
  poll: Schema.optionalKey(Poll),
  venue: Schema.optionalKey(Venue)
}).pipe(
  Schema.encodeKeys({
    messageId: "message_id",
    linkPreviewOptions: "link_preview_options",
    livePhoto: "live_photo",
    paidMedia: "paid_media",
    videoNote: "video_note",
    hasMediaSpoiler: "has_media_spoiler",
    giveawayWinners: "giveaway_winners"
  })
)

/**
 * Decoded `camelCase` ExternalReplyInfo.
 *
 * @category models
 * @since 0.1.0
 */
export type ExternalReplyInfo = Schema.Schema.Type<typeof ExternalReplyInfo>

/**
 * This object contains information about the quoted part of a message that is replied to by the given message.
 *
 * @category schemas
 * @since 0.1.0
 */
export const TextQuote = Schema.Struct({
  text: Schema.String,
  entities: Schema.optionalKey(Schema.Array(MessageEntity)),
  position: Schema.Number,
  isManual: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    isManual: "is_manual"
  })
)

/**
 * Decoded `camelCase` TextQuote.
 *
 * @category models
 * @since 0.1.0
 */
export type TextQuote = Schema.Schema.Type<typeof TextQuote>

/**
 * Describes the price of a suggested post.
 *
 * @category schemas
 * @since 0.1.0
 */
export const SuggestedPostPrice = Schema.Struct({
  currency: Schema.String,
  amount: Schema.Number
})

/**
 * Decoded `camelCase` SuggestedPostPrice.
 *
 * @category models
 * @since 0.1.0
 */
export type SuggestedPostPrice = Schema.Schema.Type<typeof SuggestedPostPrice>

/**
 * Contains information about a suggested post.
 *
 * @category schemas
 * @since 0.1.0
 */
export const SuggestedPostInfo = Schema.Struct({
  state: Schema.String,
  price: Schema.optionalKey(SuggestedPostPrice),
  sendDate: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    sendDate: "send_date"
  })
)

/**
 * Decoded `camelCase` SuggestedPostInfo.
 *
 * @category models
 * @since 0.1.0
 */
export type SuggestedPostInfo = Schema.Schema.Type<typeof SuggestedPostInfo>

/**
 * Decoded `camelCase` RichTextBold.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextBold {
  readonly type: "bold"
  readonly text: RichText
}

/**
 * A bold text.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextBold: Schema.Codec<RichTextBold, unknown> = Schema.Struct({
  type: Schema.Literal("bold"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText)
})

/**
 * Decoded `camelCase` RichTextItalic.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextItalic {
  readonly type: "italic"
  readonly text: RichText
}

/**
 * An italicized text.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextItalic: Schema.Codec<RichTextItalic, unknown> = Schema.Struct({
  type: Schema.Literal("italic"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText)
})

/**
 * Decoded `camelCase` RichTextUnderline.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextUnderline {
  readonly type: "underline"
  readonly text: RichText
}

/**
 * An underlined text.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextUnderline: Schema.Codec<RichTextUnderline, unknown> = Schema.Struct({
  type: Schema.Literal("underline"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText)
})

/**
 * Decoded `camelCase` RichTextStrikethrough.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextStrikethrough {
  readonly type: "strikethrough"
  readonly text: RichText
}

/**
 * A strikethrough text.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextStrikethrough: Schema.Codec<RichTextStrikethrough, unknown> = Schema.Struct({
  type: Schema.Literal("strikethrough"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText)
})

/**
 * Decoded `camelCase` RichTextSpoiler.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextSpoiler {
  readonly type: "spoiler"
  readonly text: RichText
}

/**
 * A text covered by a spoiler.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextSpoiler: Schema.Codec<RichTextSpoiler, unknown> = Schema.Struct({
  type: Schema.Literal("spoiler"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText)
})

/**
 * Decoded `camelCase` RichTextDateTime.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextDateTime {
  readonly type: "date_time"
  readonly text: RichText
  readonly unixTime: number
  readonly dateTimeFormat: string
}

/**
 * Formatted date and time.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextDateTime: Schema.Codec<RichTextDateTime, unknown> = Schema.Struct({
  type: Schema.Literal("date_time"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  unixTime: Schema.Number,
  dateTimeFormat: Schema.String
}).pipe(
  Schema.encodeKeys({
    unixTime: "unix_time",
    dateTimeFormat: "date_time_format"
  })
)

/**
 * Decoded `camelCase` RichTextTextMention.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextTextMention {
  readonly type: "text_mention"
  readonly text: RichText
  readonly user: User
}

/**
 * A mention of a Telegram user by their identifier.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextTextMention: Schema.Codec<RichTextTextMention, unknown> = Schema.Struct({
  type: Schema.Literal("text_mention"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  user: User
})

/**
 * Decoded `camelCase` RichTextSubscript.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextSubscript {
  readonly type: "subscript"
  readonly text: RichText
}

/**
 * A subscript text.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextSubscript: Schema.Codec<RichTextSubscript, unknown> = Schema.Struct({
  type: Schema.Literal("subscript"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText)
})

/**
 * Decoded `camelCase` RichTextSuperscript.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextSuperscript {
  readonly type: "superscript"
  readonly text: RichText
}

/**
 * A superscript text.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextSuperscript: Schema.Codec<RichTextSuperscript, unknown> = Schema.Struct({
  type: Schema.Literal("superscript"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText)
})

/**
 * Decoded `camelCase` RichTextMarked.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextMarked {
  readonly type: "marked"
  readonly text: RichText
}

/**
 * A marked text.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextMarked: Schema.Codec<RichTextMarked, unknown> = Schema.Struct({
  type: Schema.Literal("marked"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText)
})

/**
 * Decoded `camelCase` RichTextCode.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextCode {
  readonly type: "code"
  readonly text: RichText
}

/**
 * A monowidth text.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextCode: Schema.Codec<RichTextCode, unknown> = Schema.Struct({
  type: Schema.Literal("code"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText)
})

/**
 * A custom emoji.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextCustomEmoji = Schema.Struct({
  type: Schema.Literal("custom_emoji"),
  customEmojiId: Schema.String,
  alternativeText: Schema.String
}).pipe(
  Schema.encodeKeys({
    customEmojiId: "custom_emoji_id",
    alternativeText: "alternative_text"
  })
)

/**
 * Decoded `camelCase` RichTextCustomEmoji.
 *
 * @category models
 * @since 0.1.0
 */
export type RichTextCustomEmoji = Schema.Schema.Type<typeof RichTextCustomEmoji>

/**
 * A mathematical expression.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextMathematicalExpression = Schema.Struct({
  type: Schema.Literal("mathematical_expression"),
  expression: Schema.String
})

/**
 * Decoded `camelCase` RichTextMathematicalExpression.
 *
 * @category models
 * @since 0.1.0
 */
export type RichTextMathematicalExpression = Schema.Schema.Type<typeof RichTextMathematicalExpression>

/**
 * Decoded `camelCase` RichTextUrl.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextUrl {
  readonly type: "url"
  readonly text: RichText
  readonly url: string
}

/**
 * A text with a link.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextUrl: Schema.Codec<RichTextUrl, unknown> = Schema.Struct({
  type: Schema.Literal("url"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  url: Schema.String
})

/**
 * Decoded `camelCase` RichTextEmailAddress.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextEmailAddress {
  readonly type: "email_address"
  readonly text: RichText
  readonly emailAddress: string
}

/**
 * A text with an email address.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextEmailAddress: Schema.Codec<RichTextEmailAddress, unknown> = Schema.Struct({
  type: Schema.Literal("email_address"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  emailAddress: Schema.String
}).pipe(
  Schema.encodeKeys({
    emailAddress: "email_address"
  })
)

/**
 * Decoded `camelCase` RichTextPhoneNumber.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextPhoneNumber {
  readonly type: "phone_number"
  readonly text: RichText
  readonly phoneNumber: string
}

/**
 * A text with a phone number.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextPhoneNumber: Schema.Codec<RichTextPhoneNumber, unknown> = Schema.Struct({
  type: Schema.Literal("phone_number"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  phoneNumber: Schema.String
}).pipe(
  Schema.encodeKeys({
    phoneNumber: "phone_number"
  })
)

/**
 * Decoded `camelCase` RichTextBankCardNumber.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextBankCardNumber {
  readonly type: "bank_card_number"
  readonly text: RichText
  readonly bankCardNumber: string
}

/**
 * A text with a bank card number.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextBankCardNumber: Schema.Codec<RichTextBankCardNumber, unknown> = Schema.Struct({
  type: Schema.Literal("bank_card_number"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  bankCardNumber: Schema.String
}).pipe(
  Schema.encodeKeys({
    bankCardNumber: "bank_card_number"
  })
)

/**
 * Decoded `camelCase` RichTextMention.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextMention {
  readonly type: "mention"
  readonly text: RichText
  readonly username: string
}

/**
 * A mention by a username.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextMention: Schema.Codec<RichTextMention, unknown> = Schema.Struct({
  type: Schema.Literal("mention"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  username: Schema.String
})

/**
 * Decoded `camelCase` RichTextHashtag.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextHashtag {
  readonly type: "hashtag"
  readonly text: RichText
  readonly hashtag: string
}

/**
 * A hashtag.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextHashtag: Schema.Codec<RichTextHashtag, unknown> = Schema.Struct({
  type: Schema.Literal("hashtag"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  hashtag: Schema.String
})

/**
 * Decoded `camelCase` RichTextCashtag.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextCashtag {
  readonly type: "cashtag"
  readonly text: RichText
  readonly cashtag: string
}

/**
 * A cashtag.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextCashtag: Schema.Codec<RichTextCashtag, unknown> = Schema.Struct({
  type: Schema.Literal("cashtag"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  cashtag: Schema.String
})

/**
 * Decoded `camelCase` RichTextBotCommand.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextBotCommand {
  readonly type: "bot_command"
  readonly text: RichText
  readonly botCommand: string
}

/**
 * A bot command.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextBotCommand: Schema.Codec<RichTextBotCommand, unknown> = Schema.Struct({
  type: Schema.Literal("bot_command"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  botCommand: Schema.String
}).pipe(
  Schema.encodeKeys({
    botCommand: "bot_command"
  })
)

/**
 * An anchor.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextAnchor = Schema.Struct({
  type: Schema.Literal("anchor"),
  name: Schema.String
})

/**
 * Decoded `camelCase` RichTextAnchor.
 *
 * @category models
 * @since 0.1.0
 */
export type RichTextAnchor = Schema.Schema.Type<typeof RichTextAnchor>

/**
 * Decoded `camelCase` RichTextAnchorLink.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextAnchorLink {
  readonly type: "anchor_link"
  readonly text: RichText
  readonly anchorName: string
}

/**
 * A link to an anchor.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextAnchorLink: Schema.Codec<RichTextAnchorLink, unknown> = Schema.Struct({
  type: Schema.Literal("anchor_link"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  anchorName: Schema.String
}).pipe(
  Schema.encodeKeys({
    anchorName: "anchor_name"
  })
)

/**
 * Decoded `camelCase` RichTextReference.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextReference {
  readonly type: "reference"
  readonly text: RichText
  readonly name: string
}

/**
 * A reference.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextReference: Schema.Codec<RichTextReference, unknown> = Schema.Struct({
  type: Schema.Literal("reference"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  name: Schema.String
})

/**
 * Decoded `camelCase` RichTextReferenceLink.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichTextReferenceLink {
  readonly type: "reference_link"
  readonly text: RichText
  readonly referenceName: string
}

/**
 * A link to a reference.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichTextReferenceLink: Schema.Codec<RichTextReferenceLink, unknown> = Schema.Struct({
  type: Schema.Literal("reference_link"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  referenceName: Schema.String
}).pipe(
  Schema.encodeKeys({
    referenceName: "reference_name"
  })
)

/**
 * Decoded `camelCase` RichText (union).
 *
 * @category models
 * @since 0.1.0
 */
export type RichText = RichTextBold | RichTextItalic | RichTextUnderline | RichTextStrikethrough | RichTextSpoiler | RichTextDateTime | RichTextTextMention | RichTextSubscript | RichTextSuperscript | RichTextMarked | RichTextCode | RichTextCustomEmoji | RichTextMathematicalExpression | RichTextUrl | RichTextEmailAddress | RichTextPhoneNumber | RichTextBankCardNumber | RichTextMention | RichTextHashtag | RichTextCashtag | RichTextBotCommand | RichTextAnchor | RichTextAnchorLink | RichTextReference | RichTextReferenceLink

/**
 * This object represents a rich formatted text. Currently, it can be either a String for plain text, an Array of RichText, or any of the following types: - RichTextBold - RichTextItalic - RichTextUnderline - RichTextStrikethrough - RichTextSpoiler - RichTextDateTime - RichTextTextMention - RichTextSubscript - RichTextSuperscript - RichTextMarked - RichTextCode - RichTextCustomEmoji - RichTextMathematicalExpression - RichTextUrl - RichTextEmailAddress - RichTextPhoneNumber - RichTextBankCardNumber - RichTextMention - RichTextHashtag - RichTextCashtag - RichTextBotCommand - RichTextAnchor - RichTextAnchorLink - RichTextReference - RichTextReferenceLink
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichText: Schema.Codec<RichText, unknown> = Schema.Union([Schema.suspend((): Schema.Codec<RichTextBold, unknown> => RichTextBold), Schema.suspend((): Schema.Codec<RichTextItalic, unknown> => RichTextItalic), Schema.suspend((): Schema.Codec<RichTextUnderline, unknown> => RichTextUnderline), Schema.suspend((): Schema.Codec<RichTextStrikethrough, unknown> => RichTextStrikethrough), Schema.suspend((): Schema.Codec<RichTextSpoiler, unknown> => RichTextSpoiler), Schema.suspend((): Schema.Codec<RichTextDateTime, unknown> => RichTextDateTime), Schema.suspend((): Schema.Codec<RichTextTextMention, unknown> => RichTextTextMention), Schema.suspend((): Schema.Codec<RichTextSubscript, unknown> => RichTextSubscript), Schema.suspend((): Schema.Codec<RichTextSuperscript, unknown> => RichTextSuperscript), Schema.suspend((): Schema.Codec<RichTextMarked, unknown> => RichTextMarked), Schema.suspend((): Schema.Codec<RichTextCode, unknown> => RichTextCode), RichTextCustomEmoji, RichTextMathematicalExpression, Schema.suspend((): Schema.Codec<RichTextUrl, unknown> => RichTextUrl), Schema.suspend((): Schema.Codec<RichTextEmailAddress, unknown> => RichTextEmailAddress), Schema.suspend((): Schema.Codec<RichTextPhoneNumber, unknown> => RichTextPhoneNumber), Schema.suspend((): Schema.Codec<RichTextBankCardNumber, unknown> => RichTextBankCardNumber), Schema.suspend((): Schema.Codec<RichTextMention, unknown> => RichTextMention), Schema.suspend((): Schema.Codec<RichTextHashtag, unknown> => RichTextHashtag), Schema.suspend((): Schema.Codec<RichTextCashtag, unknown> => RichTextCashtag), Schema.suspend((): Schema.Codec<RichTextBotCommand, unknown> => RichTextBotCommand), RichTextAnchor, Schema.suspend((): Schema.Codec<RichTextAnchorLink, unknown> => RichTextAnchorLink), Schema.suspend((): Schema.Codec<RichTextReference, unknown> => RichTextReference), Schema.suspend((): Schema.Codec<RichTextReferenceLink, unknown> => RichTextReferenceLink)])

/**
 * A text paragraph, corresponding to the HTML tag <p>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockParagraph = Schema.Struct({
  type: Schema.Literal("paragraph"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText)
})

/**
 * Decoded `camelCase` RichBlockParagraph.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockParagraph = Schema.Schema.Type<typeof RichBlockParagraph>

/**
 * A section heading, corresponding to the HTML tags <h1>, <h2>, <h3>, <h4>, <h5>, or <h6>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockSectionHeading = Schema.Struct({
  type: Schema.Literal("heading"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  size: Schema.Number
})

/**
 * Decoded `camelCase` RichBlockSectionHeading.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockSectionHeading = Schema.Schema.Type<typeof RichBlockSectionHeading>

/**
 * A preformatted text block, corresponding to the nested HTML tags <pre> and <code>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockPreformatted = Schema.Struct({
  type: Schema.Literal("pre"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  language: Schema.optionalKey(Schema.String)
})

/**
 * Decoded `camelCase` RichBlockPreformatted.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockPreformatted = Schema.Schema.Type<typeof RichBlockPreformatted>

/**
 * A footer, corresponding to the HTML tag <footer>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockFooter = Schema.Struct({
  type: Schema.Literal("footer"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText)
})

/**
 * Decoded `camelCase` RichBlockFooter.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockFooter = Schema.Schema.Type<typeof RichBlockFooter>

/**
 * A divider, corresponding to the HTML tag <hr/>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockDivider = Schema.Struct({
  type: Schema.Literal("divider")
})

/**
 * Decoded `camelCase` RichBlockDivider.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockDivider = Schema.Schema.Type<typeof RichBlockDivider>

/**
 * A block with a mathematical expression in LaTeX format, corresponding to the custom HTML tag <tg-math-block>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockMathematicalExpression = Schema.Struct({
  type: Schema.Literal("mathematical_expression"),
  expression: Schema.String
})

/**
 * Decoded `camelCase` RichBlockMathematicalExpression.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockMathematicalExpression = Schema.Schema.Type<typeof RichBlockMathematicalExpression>

/**
 * A block with an anchor, corresponding to the HTML tag <a> with the attribute name.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockAnchor = Schema.Struct({
  type: Schema.Literal("anchor"),
  name: Schema.String
})

/**
 * Decoded `camelCase` RichBlockAnchor.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockAnchor = Schema.Schema.Type<typeof RichBlockAnchor>

/**
 * Decoded `camelCase` RichBlockListItem.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichBlockListItem {
  readonly label: string
  readonly blocks: ReadonlyArray<RichBlock>
  readonly hasCheckbox?: boolean
  readonly isChecked?: boolean
  readonly value?: number
  readonly type?: string
}

/**
 * An item of a list.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockListItem: Schema.Codec<RichBlockListItem, unknown> = Schema.Struct({
  label: Schema.String,
  blocks: Schema.Array(Schema.suspend((): Schema.Codec<RichBlock, unknown> => RichBlock)),
  hasCheckbox: Schema.optionalKey(Schema.Boolean),
  isChecked: Schema.optionalKey(Schema.Boolean),
  value: Schema.optionalKey(Schema.Number),
  type: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    hasCheckbox: "has_checkbox",
    isChecked: "is_checked"
  })
)

/**
 * Decoded `camelCase` RichBlockList.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichBlockList {
  readonly type: "list"
  readonly items: ReadonlyArray<RichBlockListItem>
}

/**
 * A list of blocks, corresponding to the HTML tag <ul> or <ol> with multiple nested tags <li>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockList: Schema.Codec<RichBlockList, unknown> = Schema.Struct({
  type: Schema.Literal("list"),
  items: Schema.Array(Schema.suspend((): Schema.Codec<RichBlockListItem, unknown> => RichBlockListItem))
})

/**
 * Decoded `camelCase` RichBlockBlockQuotation.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichBlockBlockQuotation {
  readonly type: "blockquote"
  readonly blocks: ReadonlyArray<RichBlock>
  readonly credit?: RichText
}

/**
 * A block quotation, corresponding to the HTML tag <blockquote>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockBlockQuotation: Schema.Codec<RichBlockBlockQuotation, unknown> = Schema.Struct({
  type: Schema.Literal("blockquote"),
  blocks: Schema.Array(Schema.suspend((): Schema.Codec<RichBlock, unknown> => RichBlock)),
  credit: Schema.optionalKey(Schema.suspend((): Schema.Codec<RichText, unknown> => RichText))
})

/**
 * A quotation with centered text, loosely corresponding to the HTML tag <aside>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockPullQuotation = Schema.Struct({
  type: Schema.Literal("pullquote"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  credit: Schema.optionalKey(Schema.suspend((): Schema.Codec<RichText, unknown> => RichText))
})

/**
 * Decoded `camelCase` RichBlockPullQuotation.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockPullQuotation = Schema.Schema.Type<typeof RichBlockPullQuotation>

/**
 * Caption of a rich formatted block.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockCaption = Schema.Struct({
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  credit: Schema.optionalKey(Schema.suspend((): Schema.Codec<RichText, unknown> => RichText))
})

/**
 * Decoded `camelCase` RichBlockCaption.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockCaption = Schema.Schema.Type<typeof RichBlockCaption>

/**
 * Decoded `camelCase` RichBlockCollage.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichBlockCollage {
  readonly type: "collage"
  readonly blocks: ReadonlyArray<RichBlock>
  readonly caption?: RichBlockCaption
}

/**
 * A collage, corresponding to the custom HTML tag <tg-collage>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockCollage: Schema.Codec<RichBlockCollage, unknown> = Schema.Struct({
  type: Schema.Literal("collage"),
  blocks: Schema.Array(Schema.suspend((): Schema.Codec<RichBlock, unknown> => RichBlock)),
  caption: Schema.optionalKey(RichBlockCaption)
})

/**
 * Decoded `camelCase` RichBlockSlideshow.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichBlockSlideshow {
  readonly type: "slideshow"
  readonly blocks: ReadonlyArray<RichBlock>
  readonly caption?: RichBlockCaption
}

/**
 * A slideshow, corresponding to the custom HTML tag <tg-slideshow>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockSlideshow: Schema.Codec<RichBlockSlideshow, unknown> = Schema.Struct({
  type: Schema.Literal("slideshow"),
  blocks: Schema.Array(Schema.suspend((): Schema.Codec<RichBlock, unknown> => RichBlock)),
  caption: Schema.optionalKey(RichBlockCaption)
})

/**
 * Cell in a table.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockTableCell = Schema.Struct({
  text: Schema.optionalKey(Schema.suspend((): Schema.Codec<RichText, unknown> => RichText)),
  isHeader: Schema.optionalKey(Schema.Boolean),
  colspan: Schema.optionalKey(Schema.Number),
  rowspan: Schema.optionalKey(Schema.Number),
  align: Schema.String,
  valign: Schema.String
}).pipe(
  Schema.encodeKeys({
    isHeader: "is_header"
  })
)

/**
 * Decoded `camelCase` RichBlockTableCell.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockTableCell = Schema.Schema.Type<typeof RichBlockTableCell>

/**
 * A table, corresponding to the HTML tag <table>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockTable = Schema.Struct({
  type: Schema.Literal("table"),
  cells: Schema.Array(Schema.Array(RichBlockTableCell)),
  isBordered: Schema.optionalKey(Schema.Boolean),
  isStriped: Schema.optionalKey(Schema.Boolean),
  caption: Schema.optionalKey(Schema.suspend((): Schema.Codec<RichText, unknown> => RichText))
}).pipe(
  Schema.encodeKeys({
    isBordered: "is_bordered",
    isStriped: "is_striped"
  })
)

/**
 * Decoded `camelCase` RichBlockTable.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockTable = Schema.Schema.Type<typeof RichBlockTable>

/**
 * Decoded `camelCase` RichBlockDetails.
 *
 * @category models
 * @since 0.1.0
 */
export interface RichBlockDetails {
  readonly type: "details"
  readonly summary: RichText
  readonly blocks: ReadonlyArray<RichBlock>
  readonly isOpen?: boolean
}

/**
 * An expandable block for details disclosure, corresponding to the HTML tag <details>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockDetails: Schema.Codec<RichBlockDetails, unknown> = Schema.Struct({
  type: Schema.Literal("details"),
  summary: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText),
  blocks: Schema.Array(Schema.suspend((): Schema.Codec<RichBlock, unknown> => RichBlock)),
  isOpen: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    isOpen: "is_open"
  })
)

/**
 * A block with a map, corresponding to the custom HTML tag <tg-map>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockMap = Schema.Struct({
  type: Schema.Literal("map"),
  location: Location,
  zoom: Schema.Number,
  width: Schema.Number,
  height: Schema.Number,
  caption: Schema.optionalKey(RichBlockCaption)
})

/**
 * Decoded `camelCase` RichBlockMap.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockMap = Schema.Schema.Type<typeof RichBlockMap>

/**
 * A block with an animation, corresponding to the HTML tag <video>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockAnimation = Schema.Struct({
  type: Schema.Literal("animation"),
  animation: Animation,
  hasSpoiler: Schema.optionalKey(Schema.Boolean),
  caption: Schema.optionalKey(RichBlockCaption)
}).pipe(
  Schema.encodeKeys({
    hasSpoiler: "has_spoiler"
  })
)

/**
 * Decoded `camelCase` RichBlockAnimation.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockAnimation = Schema.Schema.Type<typeof RichBlockAnimation>

/**
 * A block with a music file, corresponding to the HTML tag <audio>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockAudio = Schema.Struct({
  type: Schema.Literal("audio"),
  audio: Audio,
  caption: Schema.optionalKey(RichBlockCaption)
})

/**
 * Decoded `camelCase` RichBlockAudio.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockAudio = Schema.Schema.Type<typeof RichBlockAudio>

/**
 * A block with a photo, corresponding to the HTML tag <img>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockPhoto = Schema.Struct({
  type: Schema.Literal("photo"),
  photo: Schema.Array(PhotoSize),
  hasSpoiler: Schema.optionalKey(Schema.Boolean),
  caption: Schema.optionalKey(RichBlockCaption)
}).pipe(
  Schema.encodeKeys({
    hasSpoiler: "has_spoiler"
  })
)

/**
 * Decoded `camelCase` RichBlockPhoto.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockPhoto = Schema.Schema.Type<typeof RichBlockPhoto>

/**
 * A block with a video, corresponding to the HTML tag <video>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockVideo = Schema.Struct({
  type: Schema.Literal("video"),
  video: Video,
  hasSpoiler: Schema.optionalKey(Schema.Boolean),
  caption: Schema.optionalKey(RichBlockCaption)
}).pipe(
  Schema.encodeKeys({
    hasSpoiler: "has_spoiler"
  })
)

/**
 * Decoded `camelCase` RichBlockVideo.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockVideo = Schema.Schema.Type<typeof RichBlockVideo>

/**
 * A block with a voice note, corresponding to the HTML tag <audio>.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockVoiceNote = Schema.Struct({
  type: Schema.Literal("voice_note"),
  voiceNote: Voice,
  caption: Schema.optionalKey(RichBlockCaption)
}).pipe(
  Schema.encodeKeys({
    voiceNote: "voice_note"
  })
)

/**
 * Decoded `camelCase` RichBlockVoiceNote.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockVoiceNote = Schema.Schema.Type<typeof RichBlockVoiceNote>

/**
 * A block with a "Thinking..." placeholder, corresponding to the custom HTML tag <tg-thinking>. The block may be used only in sendRichMessageDraft, therefore it can't be received in messages. See https://t.me/addemoji/AIActions for examples of custom emoji, which are recommended for usage in the block.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlockThinking = Schema.Struct({
  type: Schema.Literal("thinking"),
  text: Schema.suspend((): Schema.Codec<RichText, unknown> => RichText)
})

/**
 * Decoded `camelCase` RichBlockThinking.
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlockThinking = Schema.Schema.Type<typeof RichBlockThinking>

/**
 * Decoded `camelCase` RichBlock (union).
 *
 * @category models
 * @since 0.1.0
 */
export type RichBlock = RichBlockParagraph | RichBlockSectionHeading | RichBlockPreformatted | RichBlockFooter | RichBlockDivider | RichBlockMathematicalExpression | RichBlockAnchor | RichBlockList | RichBlockBlockQuotation | RichBlockPullQuotation | RichBlockCollage | RichBlockSlideshow | RichBlockTable | RichBlockDetails | RichBlockMap | RichBlockAnimation | RichBlockAudio | RichBlockPhoto | RichBlockVideo | RichBlockVoiceNote | RichBlockThinking

/**
 * This object represents a block in a rich formatted message. Currently, it can be any of the following types: - RichBlockParagraph - RichBlockSectionHeading - RichBlockPreformatted - RichBlockFooter - RichBlockDivider - RichBlockMathematicalExpression - RichBlockAnchor - RichBlockList - RichBlockBlockQuotation - RichBlockPullQuotation - RichBlockCollage - RichBlockSlideshow - RichBlockTable - RichBlockDetails - RichBlockMap - RichBlockAnimation - RichBlockAudio - RichBlockPhoto - RichBlockVideo - RichBlockVoiceNote - RichBlockThinking
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichBlock: Schema.Codec<RichBlock, unknown> = Schema.Union([RichBlockParagraph, RichBlockSectionHeading, RichBlockPreformatted, RichBlockFooter, RichBlockDivider, RichBlockMathematicalExpression, RichBlockAnchor, Schema.suspend((): Schema.Codec<RichBlockList, unknown> => RichBlockList), Schema.suspend((): Schema.Codec<RichBlockBlockQuotation, unknown> => RichBlockBlockQuotation), RichBlockPullQuotation, Schema.suspend((): Schema.Codec<RichBlockCollage, unknown> => RichBlockCollage), Schema.suspend((): Schema.Codec<RichBlockSlideshow, unknown> => RichBlockSlideshow), RichBlockTable, Schema.suspend((): Schema.Codec<RichBlockDetails, unknown> => RichBlockDetails), RichBlockMap, RichBlockAnimation, RichBlockAudio, RichBlockPhoto, RichBlockVideo, RichBlockVoiceNote, RichBlockThinking])

/**
 * Rich formatted message.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RichMessage = Schema.Struct({
  blocks: Schema.Array(Schema.suspend((): Schema.Codec<RichBlock, unknown> => RichBlock)),
  isRtl: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    isRtl: "is_rtl"
  })
)

/**
 * Decoded `camelCase` RichMessage.
 *
 * @category models
 * @since 0.1.0
 */
export type RichMessage = Schema.Schema.Type<typeof RichMessage>

/**
 * Describes a service message about the chat owner leaving the chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatOwnerLeft = Schema.Struct({
  newOwner: Schema.optionalKey(User)
}).pipe(
  Schema.encodeKeys({
    newOwner: "new_owner"
  })
)

/**
 * Decoded `camelCase` ChatOwnerLeft.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatOwnerLeft = Schema.Schema.Type<typeof ChatOwnerLeft>

/**
 * Describes a service message about an ownership change in the chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatOwnerChanged = Schema.Struct({
  newOwner: User
}).pipe(
  Schema.encodeKeys({
    newOwner: "new_owner"
  })
)

/**
 * Decoded `camelCase` ChatOwnerChanged.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatOwnerChanged = Schema.Schema.Type<typeof ChatOwnerChanged>

/**
 * This object represents a service message about a change in auto-delete timer settings.
 *
 * @category schemas
 * @since 0.1.0
 */
export const MessageAutoDeleteTimerChanged = Schema.Struct({
  messageAutoDeleteTime: Schema.Number
}).pipe(
  Schema.encodeKeys({
    messageAutoDeleteTime: "message_auto_delete_time"
  })
)

/**
 * Decoded `camelCase` MessageAutoDeleteTimerChanged.
 *
 * @category models
 * @since 0.1.0
 */
export type MessageAutoDeleteTimerChanged = Schema.Schema.Type<typeof MessageAutoDeleteTimerChanged>

/**
 * This object represents a shipping address.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ShippingAddress = Schema.Struct({
  countryCode: Schema.String,
  state: Schema.String,
  city: Schema.String,
  streetLine1: Schema.String,
  streetLine2: Schema.String,
  postCode: Schema.String
}).pipe(
  Schema.encodeKeys({
    countryCode: "country_code",
    streetLine1: "street_line1",
    streetLine2: "street_line2",
    postCode: "post_code"
  })
)

/**
 * Decoded `camelCase` ShippingAddress.
 *
 * @category models
 * @since 0.1.0
 */
export type ShippingAddress = Schema.Schema.Type<typeof ShippingAddress>

/**
 * This object represents information about an order.
 *
 * @category schemas
 * @since 0.1.0
 */
export const OrderInfo = Schema.Struct({
  name: Schema.optionalKey(Schema.String),
  phoneNumber: Schema.optionalKey(Schema.String),
  email: Schema.optionalKey(Schema.String),
  shippingAddress: Schema.optionalKey(ShippingAddress)
}).pipe(
  Schema.encodeKeys({
    phoneNumber: "phone_number",
    shippingAddress: "shipping_address"
  })
)

/**
 * Decoded `camelCase` OrderInfo.
 *
 * @category models
 * @since 0.1.0
 */
export type OrderInfo = Schema.Schema.Type<typeof OrderInfo>

/**
 * This object contains basic information about a successful payment. Note that if the buyer initiates a chargeback with the relevant payment provider following this transaction, the funds may be debited from your balance. This is outside of Telegram's control.
 *
 * @category schemas
 * @since 0.1.0
 */
export const SuccessfulPayment = Schema.Struct({
  currency: Schema.String,
  totalAmount: Schema.Number,
  invoicePayload: Schema.String,
  subscriptionExpirationDate: Schema.optionalKey(Schema.Number),
  isRecurring: Schema.optionalKey(Schema.Boolean),
  isFirstRecurring: Schema.optionalKey(Schema.Boolean),
  shippingOptionId: Schema.optionalKey(Schema.String),
  orderInfo: Schema.optionalKey(OrderInfo),
  telegramPaymentChargeId: Schema.String,
  providerPaymentChargeId: Schema.String
}).pipe(
  Schema.encodeKeys({
    totalAmount: "total_amount",
    invoicePayload: "invoice_payload",
    subscriptionExpirationDate: "subscription_expiration_date",
    isRecurring: "is_recurring",
    isFirstRecurring: "is_first_recurring",
    shippingOptionId: "shipping_option_id",
    orderInfo: "order_info",
    telegramPaymentChargeId: "telegram_payment_charge_id",
    providerPaymentChargeId: "provider_payment_charge_id"
  })
)

/**
 * Decoded `camelCase` SuccessfulPayment.
 *
 * @category models
 * @since 0.1.0
 */
export type SuccessfulPayment = Schema.Schema.Type<typeof SuccessfulPayment>

/**
 * This object contains basic information about a refunded payment.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RefundedPayment = Schema.Struct({
  currency: Schema.String,
  totalAmount: Schema.Number,
  invoicePayload: Schema.String,
  telegramPaymentChargeId: Schema.String,
  providerPaymentChargeId: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    totalAmount: "total_amount",
    invoicePayload: "invoice_payload",
    telegramPaymentChargeId: "telegram_payment_charge_id",
    providerPaymentChargeId: "provider_payment_charge_id"
  })
)

/**
 * Decoded `camelCase` RefundedPayment.
 *
 * @category models
 * @since 0.1.0
 */
export type RefundedPayment = Schema.Schema.Type<typeof RefundedPayment>

/**
 * This object contains information about a user that was shared with the bot using a KeyboardButtonRequestUsers button.
 *
 * @category schemas
 * @since 0.1.0
 */
export const SharedUser = Schema.Struct({
  userId: Schema.Number,
  firstName: Schema.optionalKey(Schema.String),
  lastName: Schema.optionalKey(Schema.String),
  username: Schema.optionalKey(Schema.String),
  photo: Schema.optionalKey(Schema.Array(PhotoSize))
}).pipe(
  Schema.encodeKeys({
    userId: "user_id",
    firstName: "first_name",
    lastName: "last_name"
  })
)

/**
 * Decoded `camelCase` SharedUser.
 *
 * @category models
 * @since 0.1.0
 */
export type SharedUser = Schema.Schema.Type<typeof SharedUser>

/**
 * This object contains information about the users whose identifiers were shared with the bot using a KeyboardButtonRequestUsers button.
 *
 * @category schemas
 * @since 0.1.0
 */
export const UsersShared = Schema.Struct({
  requestId: Schema.Number,
  users: Schema.Array(SharedUser)
}).pipe(
  Schema.encodeKeys({
    requestId: "request_id"
  })
)

/**
 * Decoded `camelCase` UsersShared.
 *
 * @category models
 * @since 0.1.0
 */
export type UsersShared = Schema.Schema.Type<typeof UsersShared>

/**
 * This object contains information about a chat that was shared with the bot using a KeyboardButtonRequestChat button.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatShared = Schema.Struct({
  requestId: Schema.Number,
  chatId: Schema.Number,
  title: Schema.optionalKey(Schema.String),
  username: Schema.optionalKey(Schema.String),
  photo: Schema.optionalKey(Schema.Array(PhotoSize))
}).pipe(
  Schema.encodeKeys({
    requestId: "request_id",
    chatId: "chat_id"
  })
)

/**
 * Decoded `camelCase` ChatShared.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatShared = Schema.Schema.Type<typeof ChatShared>

/**
 * This object describes the background of a gift.
 *
 * @category schemas
 * @since 0.1.0
 */
export const GiftBackground = Schema.Struct({
  centerColor: Schema.Number,
  edgeColor: Schema.Number,
  textColor: Schema.Number
}).pipe(
  Schema.encodeKeys({
    centerColor: "center_color",
    edgeColor: "edge_color",
    textColor: "text_color"
  })
)

/**
 * Decoded `camelCase` GiftBackground.
 *
 * @category models
 * @since 0.1.0
 */
export type GiftBackground = Schema.Schema.Type<typeof GiftBackground>

/**
 * This object represents a gift that can be sent by the bot.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Gift = Schema.Struct({
  id: Schema.String,
  sticker: Sticker,
  starCount: Schema.Number,
  upgradeStarCount: Schema.optionalKey(Schema.Number),
  isPremium: Schema.optionalKey(Schema.Boolean),
  hasColors: Schema.optionalKey(Schema.Boolean),
  totalCount: Schema.optionalKey(Schema.Number),
  remainingCount: Schema.optionalKey(Schema.Number),
  personalTotalCount: Schema.optionalKey(Schema.Number),
  personalRemainingCount: Schema.optionalKey(Schema.Number),
  background: Schema.optionalKey(GiftBackground),
  uniqueGiftVariantCount: Schema.optionalKey(Schema.Number),
  publisherChat: Schema.optionalKey(Chat)
}).pipe(
  Schema.encodeKeys({
    starCount: "star_count",
    upgradeStarCount: "upgrade_star_count",
    isPremium: "is_premium",
    hasColors: "has_colors",
    totalCount: "total_count",
    remainingCount: "remaining_count",
    personalTotalCount: "personal_total_count",
    personalRemainingCount: "personal_remaining_count",
    uniqueGiftVariantCount: "unique_gift_variant_count",
    publisherChat: "publisher_chat"
  })
)

/**
 * Decoded `camelCase` Gift.
 *
 * @category models
 * @since 0.1.0
 */
export type Gift = Schema.Schema.Type<typeof Gift>

/**
 * Describes a service message about a regular gift that was sent or received.
 *
 * @category schemas
 * @since 0.1.0
 */
export const GiftInfo = Schema.Struct({
  gift: Gift,
  ownedGiftId: Schema.optionalKey(Schema.String),
  convertStarCount: Schema.optionalKey(Schema.Number),
  prepaidUpgradeStarCount: Schema.optionalKey(Schema.Number),
  isUpgradeSeparate: Schema.optionalKey(Schema.Boolean),
  canBeUpgraded: Schema.optionalKey(Schema.Boolean),
  text: Schema.optionalKey(Schema.String),
  entities: Schema.optionalKey(Schema.Array(MessageEntity)),
  isPrivate: Schema.optionalKey(Schema.Boolean),
  uniqueGiftNumber: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    ownedGiftId: "owned_gift_id",
    convertStarCount: "convert_star_count",
    prepaidUpgradeStarCount: "prepaid_upgrade_star_count",
    isUpgradeSeparate: "is_upgrade_separate",
    canBeUpgraded: "can_be_upgraded",
    isPrivate: "is_private",
    uniqueGiftNumber: "unique_gift_number"
  })
)

/**
 * Decoded `camelCase` GiftInfo.
 *
 * @category models
 * @since 0.1.0
 */
export type GiftInfo = Schema.Schema.Type<typeof GiftInfo>

/**
 * This object describes the model of a unique gift.
 *
 * @category schemas
 * @since 0.1.0
 */
export const UniqueGiftModel = Schema.Struct({
  name: Schema.String,
  sticker: Sticker,
  rarityPerMille: Schema.Number,
  rarity: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    rarityPerMille: "rarity_per_mille"
  })
)

/**
 * Decoded `camelCase` UniqueGiftModel.
 *
 * @category models
 * @since 0.1.0
 */
export type UniqueGiftModel = Schema.Schema.Type<typeof UniqueGiftModel>

/**
 * This object describes the symbol shown on the pattern of a unique gift.
 *
 * @category schemas
 * @since 0.1.0
 */
export const UniqueGiftSymbol = Schema.Struct({
  name: Schema.String,
  sticker: Sticker,
  rarityPerMille: Schema.Number
}).pipe(
  Schema.encodeKeys({
    rarityPerMille: "rarity_per_mille"
  })
)

/**
 * Decoded `camelCase` UniqueGiftSymbol.
 *
 * @category models
 * @since 0.1.0
 */
export type UniqueGiftSymbol = Schema.Schema.Type<typeof UniqueGiftSymbol>

/**
 * This object describes the colors of the backdrop of a unique gift.
 *
 * @category schemas
 * @since 0.1.0
 */
export const UniqueGiftBackdropColors = Schema.Struct({
  centerColor: Schema.Number,
  edgeColor: Schema.Number,
  symbolColor: Schema.Number,
  textColor: Schema.Number
}).pipe(
  Schema.encodeKeys({
    centerColor: "center_color",
    edgeColor: "edge_color",
    symbolColor: "symbol_color",
    textColor: "text_color"
  })
)

/**
 * Decoded `camelCase` UniqueGiftBackdropColors.
 *
 * @category models
 * @since 0.1.0
 */
export type UniqueGiftBackdropColors = Schema.Schema.Type<typeof UniqueGiftBackdropColors>

/**
 * This object describes the backdrop of a unique gift.
 *
 * @category schemas
 * @since 0.1.0
 */
export const UniqueGiftBackdrop = Schema.Struct({
  name: Schema.String,
  colors: UniqueGiftBackdropColors,
  rarityPerMille: Schema.Number
}).pipe(
  Schema.encodeKeys({
    rarityPerMille: "rarity_per_mille"
  })
)

/**
 * Decoded `camelCase` UniqueGiftBackdrop.
 *
 * @category models
 * @since 0.1.0
 */
export type UniqueGiftBackdrop = Schema.Schema.Type<typeof UniqueGiftBackdrop>

/**
 * This object contains information about the color scheme for a user's name, message replies and link previews based on a unique gift.
 *
 * @category schemas
 * @since 0.1.0
 */
export const UniqueGiftColors = Schema.Struct({
  modelCustomEmojiId: Schema.String,
  symbolCustomEmojiId: Schema.String,
  lightThemeMainColor: Schema.Number,
  lightThemeOtherColors: Schema.Array(Schema.Number),
  darkThemeMainColor: Schema.Number,
  darkThemeOtherColors: Schema.Array(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    modelCustomEmojiId: "model_custom_emoji_id",
    symbolCustomEmojiId: "symbol_custom_emoji_id",
    lightThemeMainColor: "light_theme_main_color",
    lightThemeOtherColors: "light_theme_other_colors",
    darkThemeMainColor: "dark_theme_main_color",
    darkThemeOtherColors: "dark_theme_other_colors"
  })
)

/**
 * Decoded `camelCase` UniqueGiftColors.
 *
 * @category models
 * @since 0.1.0
 */
export type UniqueGiftColors = Schema.Schema.Type<typeof UniqueGiftColors>

/**
 * This object describes a unique gift that was upgraded from a regular gift.
 *
 * @category schemas
 * @since 0.1.0
 */
export const UniqueGift = Schema.Struct({
  giftId: Schema.String,
  baseName: Schema.String,
  name: Schema.String,
  number: Schema.Number,
  model: UniqueGiftModel,
  symbol: UniqueGiftSymbol,
  backdrop: UniqueGiftBackdrop,
  isPremium: Schema.optionalKey(Schema.Boolean),
  isBurned: Schema.optionalKey(Schema.Boolean),
  isFromBlockchain: Schema.optionalKey(Schema.Boolean),
  colors: Schema.optionalKey(UniqueGiftColors),
  publisherChat: Schema.optionalKey(Chat)
}).pipe(
  Schema.encodeKeys({
    giftId: "gift_id",
    baseName: "base_name",
    isPremium: "is_premium",
    isBurned: "is_burned",
    isFromBlockchain: "is_from_blockchain",
    publisherChat: "publisher_chat"
  })
)

/**
 * Decoded `camelCase` UniqueGift.
 *
 * @category models
 * @since 0.1.0
 */
export type UniqueGift = Schema.Schema.Type<typeof UniqueGift>

/**
 * Describes a service message about a unique gift that was sent or received.
 *
 * @category schemas
 * @since 0.1.0
 */
export const UniqueGiftInfo = Schema.Struct({
  gift: UniqueGift,
  origin: Schema.String,
  lastResaleCurrency: Schema.optionalKey(Schema.String),
  lastResaleAmount: Schema.optionalKey(Schema.Number),
  ownedGiftId: Schema.optionalKey(Schema.String),
  transferStarCount: Schema.optionalKey(Schema.Number),
  nextTransferDate: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    lastResaleCurrency: "last_resale_currency",
    lastResaleAmount: "last_resale_amount",
    ownedGiftId: "owned_gift_id",
    transferStarCount: "transfer_star_count",
    nextTransferDate: "next_transfer_date"
  })
)

/**
 * Decoded `camelCase` UniqueGiftInfo.
 *
 * @category models
 * @since 0.1.0
 */
export type UniqueGiftInfo = Schema.Schema.Type<typeof UniqueGiftInfo>

/**
 * This object represents a service message about a user allowing a bot to write messages after adding it to the attachment menu, launching a Web App from a link, or accepting an explicit request from a Web App sent by the method requestWriteAccess.
 *
 * @category schemas
 * @since 0.1.0
 */
export const WriteAccessAllowed = Schema.Struct({
  fromRequest: Schema.optionalKey(Schema.Boolean),
  webAppName: Schema.optionalKey(Schema.String),
  fromAttachmentMenu: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    fromRequest: "from_request",
    webAppName: "web_app_name",
    fromAttachmentMenu: "from_attachment_menu"
  })
)

/**
 * Decoded `camelCase` WriteAccessAllowed.
 *
 * @category models
 * @since 0.1.0
 */
export type WriteAccessAllowed = Schema.Schema.Type<typeof WriteAccessAllowed>

/**
 * This object represents a file uploaded to Telegram Passport. Currently all Telegram Passport files are in JPEG format when decrypted and don't exceed 10MB.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PassportFile = Schema.Struct({
  fileId: Schema.String,
  fileUniqueId: Schema.String,
  fileSize: Schema.Number,
  fileDate: Schema.Number
}).pipe(
  Schema.encodeKeys({
    fileId: "file_id",
    fileUniqueId: "file_unique_id",
    fileSize: "file_size",
    fileDate: "file_date"
  })
)

/**
 * Decoded `camelCase` PassportFile.
 *
 * @category models
 * @since 0.1.0
 */
export type PassportFile = Schema.Schema.Type<typeof PassportFile>

/**
 * Describes documents or other Telegram Passport elements shared with the bot by the user.
 *
 * @category schemas
 * @since 0.1.0
 */
export const EncryptedPassportElement = Schema.Struct({
  type: Schema.String,
  data: Schema.optionalKey(Schema.String),
  phoneNumber: Schema.optionalKey(Schema.String),
  email: Schema.optionalKey(Schema.String),
  files: Schema.optionalKey(Schema.Array(PassportFile)),
  frontSide: Schema.optionalKey(PassportFile),
  reverseSide: Schema.optionalKey(PassportFile),
  selfie: Schema.optionalKey(PassportFile),
  translation: Schema.optionalKey(Schema.Array(PassportFile)),
  hash: Schema.String
}).pipe(
  Schema.encodeKeys({
    phoneNumber: "phone_number",
    frontSide: "front_side",
    reverseSide: "reverse_side"
  })
)

/**
 * Decoded `camelCase` EncryptedPassportElement.
 *
 * @category models
 * @since 0.1.0
 */
export type EncryptedPassportElement = Schema.Schema.Type<typeof EncryptedPassportElement>

/**
 * Describes data required for decrypting and authenticating EncryptedPassportElement. See the Telegram Passport Documentation for a complete description of the data decryption and authentication processes.
 *
 * @category schemas
 * @since 0.1.0
 */
export const EncryptedCredentials = Schema.Struct({
  data: Schema.String,
  hash: Schema.String,
  secret: Schema.String
})

/**
 * Decoded `camelCase` EncryptedCredentials.
 *
 * @category models
 * @since 0.1.0
 */
export type EncryptedCredentials = Schema.Schema.Type<typeof EncryptedCredentials>

/**
 * Describes Telegram Passport data shared with the bot by the user.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PassportData = Schema.Struct({
  data: Schema.Array(EncryptedPassportElement),
  credentials: EncryptedCredentials
})

/**
 * Decoded `camelCase` PassportData.
 *
 * @category models
 * @since 0.1.0
 */
export type PassportData = Schema.Schema.Type<typeof PassportData>

/**
 * This object represents the content of a service message, sent whenever a user in the chat triggers a proximity alert set by another user.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ProximityAlertTriggered = Schema.Struct({
  traveler: User,
  watcher: User,
  distance: Schema.Number
})

/**
 * Decoded `camelCase` ProximityAlertTriggered.
 *
 * @category models
 * @since 0.1.0
 */
export type ProximityAlertTriggered = Schema.Schema.Type<typeof ProximityAlertTriggered>

/**
 * This object represents a service message about a user boosting a chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatBoostAdded = Schema.Struct({
  boostCount: Schema.Number
}).pipe(
  Schema.encodeKeys({
    boostCount: "boost_count"
  })
)

/**
 * Decoded `camelCase` ChatBoostAdded.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatBoostAdded = Schema.Schema.Type<typeof ChatBoostAdded>

/**
 * This object represents a chat background.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatBackground = Schema.Struct({
  type: BackgroundType
})

/**
 * Decoded `camelCase` ChatBackground.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatBackground = Schema.Schema.Type<typeof ChatBackground>

/**
 * Decoded `camelCase` ChecklistTasksDone.
 *
 * @category models
 * @since 0.1.0
 */
export interface ChecklistTasksDone {
  readonly checklistMessage?: Message
  readonly markedAsDoneTaskIds?: ReadonlyArray<number>
  readonly markedAsNotDoneTaskIds?: ReadonlyArray<number>
}

/**
 * Describes a service message about checklist tasks marked as done or not done.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChecklistTasksDone: Schema.Codec<ChecklistTasksDone, unknown> = Schema.Struct({
  checklistMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  markedAsDoneTaskIds: Schema.optionalKey(Schema.Array(Schema.Number)),
  markedAsNotDoneTaskIds: Schema.optionalKey(Schema.Array(Schema.Number))
}).pipe(
  Schema.encodeKeys({
    checklistMessage: "checklist_message",
    markedAsDoneTaskIds: "marked_as_done_task_ids",
    markedAsNotDoneTaskIds: "marked_as_not_done_task_ids"
  })
)

/**
 * Decoded `camelCase` ChecklistTasksAdded.
 *
 * @category models
 * @since 0.1.0
 */
export interface ChecklistTasksAdded {
  readonly checklistMessage?: Message
  readonly tasks: ReadonlyArray<ChecklistTask>
}

/**
 * Describes a service message about tasks added to a checklist.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChecklistTasksAdded: Schema.Codec<ChecklistTasksAdded, unknown> = Schema.Struct({
  checklistMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  tasks: Schema.Array(ChecklistTask)
}).pipe(
  Schema.encodeKeys({
    checklistMessage: "checklist_message"
  })
)

/**
 * Describes a service message about a change in the price of direct messages sent to a channel chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const DirectMessagePriceChanged = Schema.Struct({
  areDirectMessagesEnabled: Schema.Boolean,
  directMessageStarCount: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    areDirectMessagesEnabled: "are_direct_messages_enabled",
    directMessageStarCount: "direct_message_star_count"
  })
)

/**
 * Decoded `camelCase` DirectMessagePriceChanged.
 *
 * @category models
 * @since 0.1.0
 */
export type DirectMessagePriceChanged = Schema.Schema.Type<typeof DirectMessagePriceChanged>

/**
 * This object represents a service message about a new forum topic created in the chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ForumTopicCreated = Schema.Struct({
  name: Schema.String,
  iconColor: Schema.Number,
  iconCustomEmojiId: Schema.optionalKey(Schema.String),
  isNameImplicit: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    iconColor: "icon_color",
    iconCustomEmojiId: "icon_custom_emoji_id",
    isNameImplicit: "is_name_implicit"
  })
)

/**
 * Decoded `camelCase` ForumTopicCreated.
 *
 * @category models
 * @since 0.1.0
 */
export type ForumTopicCreated = Schema.Schema.Type<typeof ForumTopicCreated>

/**
 * This object represents a service message about an edited forum topic.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ForumTopicEdited = Schema.Struct({
  name: Schema.optionalKey(Schema.String),
  iconCustomEmojiId: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    iconCustomEmojiId: "icon_custom_emoji_id"
  })
)

/**
 * Decoded `camelCase` ForumTopicEdited.
 *
 * @category models
 * @since 0.1.0
 */
export type ForumTopicEdited = Schema.Schema.Type<typeof ForumTopicEdited>

/**
 * This object represents a service message about a forum topic closed in the chat. Currently holds no information.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ForumTopicClosed = Schema.Struct({})

/**
 * Decoded `camelCase` ForumTopicClosed.
 *
 * @category models
 * @since 0.1.0
 */
export type ForumTopicClosed = Schema.Schema.Type<typeof ForumTopicClosed>

/**
 * This object represents a service message about a forum topic reopened in the chat. Currently holds no information.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ForumTopicReopened = Schema.Struct({})

/**
 * Decoded `camelCase` ForumTopicReopened.
 *
 * @category models
 * @since 0.1.0
 */
export type ForumTopicReopened = Schema.Schema.Type<typeof ForumTopicReopened>

/**
 * This object represents a service message about General forum topic hidden in the chat. Currently holds no information.
 *
 * @category schemas
 * @since 0.1.0
 */
export const GeneralForumTopicHidden = Schema.Struct({})

/**
 * Decoded `camelCase` GeneralForumTopicHidden.
 *
 * @category models
 * @since 0.1.0
 */
export type GeneralForumTopicHidden = Schema.Schema.Type<typeof GeneralForumTopicHidden>

/**
 * This object represents a service message about General forum topic unhidden in the chat. Currently holds no information.
 *
 * @category schemas
 * @since 0.1.0
 */
export const GeneralForumTopicUnhidden = Schema.Struct({})

/**
 * Decoded `camelCase` GeneralForumTopicUnhidden.
 *
 * @category models
 * @since 0.1.0
 */
export type GeneralForumTopicUnhidden = Schema.Schema.Type<typeof GeneralForumTopicUnhidden>

/**
 * This object represents a service message about the creation of a scheduled giveaway.
 *
 * @category schemas
 * @since 0.1.0
 */
export const GiveawayCreated = Schema.Struct({
  prizeStarCount: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    prizeStarCount: "prize_star_count"
  })
)

/**
 * Decoded `camelCase` GiveawayCreated.
 *
 * @category models
 * @since 0.1.0
 */
export type GiveawayCreated = Schema.Schema.Type<typeof GiveawayCreated>

/**
 * Decoded `camelCase` GiveawayCompleted.
 *
 * @category models
 * @since 0.1.0
 */
export interface GiveawayCompleted {
  readonly winnerCount: number
  readonly unclaimedPrizeCount?: number
  readonly giveawayMessage?: Message
  readonly isStarGiveaway?: boolean
}

/**
 * This object represents a service message about the completion of a giveaway without public winners.
 *
 * @category schemas
 * @since 0.1.0
 */
export const GiveawayCompleted: Schema.Codec<GiveawayCompleted, unknown> = Schema.Struct({
  winnerCount: Schema.Number,
  unclaimedPrizeCount: Schema.optionalKey(Schema.Number),
  giveawayMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  isStarGiveaway: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    winnerCount: "winner_count",
    unclaimedPrizeCount: "unclaimed_prize_count",
    giveawayMessage: "giveaway_message",
    isStarGiveaway: "is_star_giveaway"
  })
)

/**
 * This object contains information about the bot that was created to be managed by the current bot.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ManagedBotCreated = Schema.Struct({
  bot: User
})

/**
 * Decoded `camelCase` ManagedBotCreated.
 *
 * @category models
 * @since 0.1.0
 */
export type ManagedBotCreated = Schema.Schema.Type<typeof ManagedBotCreated>

/**
 * Describes a service message about a change in the price of paid messages within a chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PaidMessagePriceChanged = Schema.Struct({
  paidMessageStarCount: Schema.Number
}).pipe(
  Schema.encodeKeys({
    paidMessageStarCount: "paid_message_star_count"
  })
)

/**
 * Decoded `camelCase` PaidMessagePriceChanged.
 *
 * @category models
 * @since 0.1.0
 */
export type PaidMessagePriceChanged = Schema.Schema.Type<typeof PaidMessagePriceChanged>

/**
 * Decoded `camelCase` PollOptionAdded.
 *
 * @category models
 * @since 0.1.0
 */
export interface PollOptionAdded {
  readonly pollMessage?: MaybeInaccessibleMessage
  readonly optionPersistentId: string
  readonly optionText: string
  readonly optionTextEntities?: ReadonlyArray<MessageEntity>
}

/**
 * Describes a service message about an option added to a poll.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PollOptionAdded: Schema.Codec<PollOptionAdded, unknown> = Schema.Struct({
  pollMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<MaybeInaccessibleMessage, unknown> => MaybeInaccessibleMessage)),
  optionPersistentId: Schema.String,
  optionText: Schema.String,
  optionTextEntities: Schema.optionalKey(Schema.Array(MessageEntity))
}).pipe(
  Schema.encodeKeys({
    pollMessage: "poll_message",
    optionPersistentId: "option_persistent_id",
    optionText: "option_text",
    optionTextEntities: "option_text_entities"
  })
)

/**
 * Decoded `camelCase` PollOptionDeleted.
 *
 * @category models
 * @since 0.1.0
 */
export interface PollOptionDeleted {
  readonly pollMessage?: MaybeInaccessibleMessage
  readonly optionPersistentId: string
  readonly optionText: string
  readonly optionTextEntities?: ReadonlyArray<MessageEntity>
}

/**
 * Describes a service message about an option deleted from a poll.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PollOptionDeleted: Schema.Codec<PollOptionDeleted, unknown> = Schema.Struct({
  pollMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<MaybeInaccessibleMessage, unknown> => MaybeInaccessibleMessage)),
  optionPersistentId: Schema.String,
  optionText: Schema.String,
  optionTextEntities: Schema.optionalKey(Schema.Array(MessageEntity))
}).pipe(
  Schema.encodeKeys({
    pollMessage: "poll_message",
    optionPersistentId: "option_persistent_id",
    optionText: "option_text",
    optionTextEntities: "option_text_entities"
  })
)

/**
 * Decoded `camelCase` SuggestedPostApproved.
 *
 * @category models
 * @since 0.1.0
 */
export interface SuggestedPostApproved {
  readonly suggestedPostMessage?: Message
  readonly price?: SuggestedPostPrice
  readonly sendDate: number
}

/**
 * Describes a service message about the approval of a suggested post.
 *
 * @category schemas
 * @since 0.1.0
 */
export const SuggestedPostApproved: Schema.Codec<SuggestedPostApproved, unknown> = Schema.Struct({
  suggestedPostMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  price: Schema.optionalKey(SuggestedPostPrice),
  sendDate: Schema.Number
}).pipe(
  Schema.encodeKeys({
    suggestedPostMessage: "suggested_post_message",
    sendDate: "send_date"
  })
)

/**
 * Decoded `camelCase` SuggestedPostApprovalFailed.
 *
 * @category models
 * @since 0.1.0
 */
export interface SuggestedPostApprovalFailed {
  readonly suggestedPostMessage?: Message
  readonly price: SuggestedPostPrice
}

/**
 * Describes a service message about the failed approval of a suggested post. Currently, only caused by insufficient user funds at the time of approval.
 *
 * @category schemas
 * @since 0.1.0
 */
export const SuggestedPostApprovalFailed: Schema.Codec<SuggestedPostApprovalFailed, unknown> = Schema.Struct({
  suggestedPostMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  price: SuggestedPostPrice
}).pipe(
  Schema.encodeKeys({
    suggestedPostMessage: "suggested_post_message"
  })
)

/**
 * Decoded `camelCase` SuggestedPostDeclined.
 *
 * @category models
 * @since 0.1.0
 */
export interface SuggestedPostDeclined {
  readonly suggestedPostMessage?: Message
  readonly comment?: string
}

/**
 * Describes a service message about the rejection of a suggested post.
 *
 * @category schemas
 * @since 0.1.0
 */
export const SuggestedPostDeclined: Schema.Codec<SuggestedPostDeclined, unknown> = Schema.Struct({
  suggestedPostMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  comment: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    suggestedPostMessage: "suggested_post_message"
  })
)

/**
 * Describes an amount of Telegram Stars.
 *
 * @category schemas
 * @since 0.1.0
 */
export const StarAmount = Schema.Struct({
  amount: Schema.Number,
  nanostarAmount: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    nanostarAmount: "nanostar_amount"
  })
)

/**
 * Decoded `camelCase` StarAmount.
 *
 * @category models
 * @since 0.1.0
 */
export type StarAmount = Schema.Schema.Type<typeof StarAmount>

/**
 * Decoded `camelCase` SuggestedPostPaid.
 *
 * @category models
 * @since 0.1.0
 */
export interface SuggestedPostPaid {
  readonly suggestedPostMessage?: Message
  readonly currency: string
  readonly amount?: number
  readonly starAmount?: StarAmount
}

/**
 * Describes a service message about a successful payment for a suggested post.
 *
 * @category schemas
 * @since 0.1.0
 */
export const SuggestedPostPaid: Schema.Codec<SuggestedPostPaid, unknown> = Schema.Struct({
  suggestedPostMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  currency: Schema.String,
  amount: Schema.optionalKey(Schema.Number),
  starAmount: Schema.optionalKey(StarAmount)
}).pipe(
  Schema.encodeKeys({
    suggestedPostMessage: "suggested_post_message",
    starAmount: "star_amount"
  })
)

/**
 * Decoded `camelCase` SuggestedPostRefunded.
 *
 * @category models
 * @since 0.1.0
 */
export interface SuggestedPostRefunded {
  readonly suggestedPostMessage?: Message
  readonly reason: string
}

/**
 * Describes a service message about a payment refund for a suggested post.
 *
 * @category schemas
 * @since 0.1.0
 */
export const SuggestedPostRefunded: Schema.Codec<SuggestedPostRefunded, unknown> = Schema.Struct({
  suggestedPostMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  reason: Schema.String
}).pipe(
  Schema.encodeKeys({
    suggestedPostMessage: "suggested_post_message"
  })
)

/**
 * This object represents a service message about a video chat scheduled in the chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const VideoChatScheduled = Schema.Struct({
  startDate: Schema.Number
}).pipe(
  Schema.encodeKeys({
    startDate: "start_date"
  })
)

/**
 * Decoded `camelCase` VideoChatScheduled.
 *
 * @category models
 * @since 0.1.0
 */
export type VideoChatScheduled = Schema.Schema.Type<typeof VideoChatScheduled>

/**
 * This object represents a service message about a video chat started in the chat. Currently holds no information.
 *
 * @category schemas
 * @since 0.1.0
 */
export const VideoChatStarted = Schema.Struct({})

/**
 * Decoded `camelCase` VideoChatStarted.
 *
 * @category models
 * @since 0.1.0
 */
export type VideoChatStarted = Schema.Schema.Type<typeof VideoChatStarted>

/**
 * This object represents a service message about a video chat ended in the chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const VideoChatEnded = Schema.Struct({
  duration: Schema.Number
})

/**
 * Decoded `camelCase` VideoChatEnded.
 *
 * @category models
 * @since 0.1.0
 */
export type VideoChatEnded = Schema.Schema.Type<typeof VideoChatEnded>

/**
 * This object represents a service message about new members invited to a video chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const VideoChatParticipantsInvited = Schema.Struct({
  users: Schema.Array(User)
})

/**
 * Decoded `camelCase` VideoChatParticipantsInvited.
 *
 * @category models
 * @since 0.1.0
 */
export type VideoChatParticipantsInvited = Schema.Schema.Type<typeof VideoChatParticipantsInvited>

/**
 * Describes data sent from a Web App to the bot.
 *
 * @category schemas
 * @since 0.1.0
 */
export const WebAppData = Schema.Struct({
  data: Schema.String,
  buttonText: Schema.String
}).pipe(
  Schema.encodeKeys({
    buttonText: "button_text"
  })
)

/**
 * Decoded `camelCase` WebAppData.
 *
 * @category models
 * @since 0.1.0
 */
export type WebAppData = Schema.Schema.Type<typeof WebAppData>

/**
 * Describes a Web App.
 *
 * @category schemas
 * @since 0.1.0
 */
export const WebAppInfo = Schema.Struct({
  url: Schema.String
})

/**
 * Decoded `camelCase` WebAppInfo.
 *
 * @category models
 * @since 0.1.0
 */
export type WebAppInfo = Schema.Schema.Type<typeof WebAppInfo>

/**
 * This object represents a parameter of the inline keyboard button used to automatically authorize a user. Serves as a great replacement for the Telegram Login Widget when the user is coming from Telegram. All the user needs to do is tap/click a button and confirm that they want to log in: Telegram apps support these buttons as of version 5.7.
 *
 * @category schemas
 * @since 0.1.0
 */
export const LoginUrl = Schema.Struct({
  url: Schema.String,
  forwardText: Schema.optionalKey(Schema.String),
  botUsername: Schema.optionalKey(Schema.String),
  requestWriteAccess: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    forwardText: "forward_text",
    botUsername: "bot_username",
    requestWriteAccess: "request_write_access"
  })
)

/**
 * Decoded `camelCase` LoginUrl.
 *
 * @category models
 * @since 0.1.0
 */
export type LoginUrl = Schema.Schema.Type<typeof LoginUrl>

/**
 * This object represents an inline button that switches the current user to inline mode in a chosen chat, with an optional default inline query.
 *
 * @category schemas
 * @since 0.1.0
 */
export const SwitchInlineQueryChosenChat = Schema.Struct({
  query: Schema.optionalKey(Schema.String),
  allowUserChats: Schema.optionalKey(Schema.Boolean),
  allowBotChats: Schema.optionalKey(Schema.Boolean),
  allowGroupChats: Schema.optionalKey(Schema.Boolean),
  allowChannelChats: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    allowUserChats: "allow_user_chats",
    allowBotChats: "allow_bot_chats",
    allowGroupChats: "allow_group_chats",
    allowChannelChats: "allow_channel_chats"
  })
)

/**
 * Decoded `camelCase` SwitchInlineQueryChosenChat.
 *
 * @category models
 * @since 0.1.0
 */
export type SwitchInlineQueryChosenChat = Schema.Schema.Type<typeof SwitchInlineQueryChosenChat>

/**
 * This object represents an inline keyboard button that copies specified text to the clipboard.
 *
 * @category schemas
 * @since 0.1.0
 */
export const CopyTextButton = Schema.Struct({
  text: Schema.String
})

/**
 * Decoded `camelCase` CopyTextButton.
 *
 * @category models
 * @since 0.1.0
 */
export type CopyTextButton = Schema.Schema.Type<typeof CopyTextButton>

/**
 * This object represents one button of an inline keyboard. Exactly one of the fields other than text, icon_custom_emoji_id, and style must be used to specify the type of the button.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineKeyboardButton = Schema.Struct({
  text: Schema.String,
  iconCustomEmojiId: Schema.optionalKey(Schema.String),
  style: Schema.optionalKey(Schema.String),
  url: Schema.optionalKey(Schema.String),
  callbackData: Schema.optionalKey(Schema.String),
  webApp: Schema.optionalKey(WebAppInfo),
  loginUrl: Schema.optionalKey(LoginUrl),
  switchInlineQuery: Schema.optionalKey(Schema.String),
  switchInlineQueryCurrentChat: Schema.optionalKey(Schema.String),
  switchInlineQueryChosenChat: Schema.optionalKey(SwitchInlineQueryChosenChat),
  copyText: Schema.optionalKey(CopyTextButton),
  callbackGame: Schema.optionalKey(CallbackGame),
  pay: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    iconCustomEmojiId: "icon_custom_emoji_id",
    callbackData: "callback_data",
    webApp: "web_app",
    loginUrl: "login_url",
    switchInlineQuery: "switch_inline_query",
    switchInlineQueryCurrentChat: "switch_inline_query_current_chat",
    switchInlineQueryChosenChat: "switch_inline_query_chosen_chat",
    copyText: "copy_text",
    callbackGame: "callback_game"
  })
)

/**
 * Decoded `camelCase` InlineKeyboardButton.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineKeyboardButton = Schema.Schema.Type<typeof InlineKeyboardButton>

/**
 * This object represents an inline keyboard that appears right next to the message it belongs to.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineKeyboardMarkup = Schema.Struct({
  inlineKeyboard: Schema.Array(Schema.Array(InlineKeyboardButton))
}).pipe(
  Schema.encodeKeys({
    inlineKeyboard: "inline_keyboard"
  })
)

/**
 * Decoded `camelCase` InlineKeyboardMarkup.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineKeyboardMarkup = Schema.Schema.Type<typeof InlineKeyboardMarkup>

/**
 * Decoded `camelCase` Message.
 *
 * @category models
 * @since 0.1.0
 */
export interface Message {
  readonly messageId: number
  readonly messageThreadId?: number
  readonly directMessagesTopic?: DirectMessagesTopic
  readonly from?: User
  readonly senderChat?: Chat
  readonly senderBoostCount?: number
  readonly senderBusinessBot?: User
  readonly senderTag?: string
  readonly date: number
  readonly guestQueryId?: string
  readonly businessConnectionId?: string
  readonly chat: Chat
  readonly forwardOrigin?: MessageOrigin
  readonly isTopicMessage?: boolean
  readonly isAutomaticForward?: boolean
  readonly replyToMessage?: Message
  readonly externalReply?: ExternalReplyInfo
  readonly quote?: TextQuote
  readonly replyToStory?: Story
  readonly replyToChecklistTaskId?: number
  readonly replyToPollOptionId?: string
  readonly viaBot?: User
  readonly guestBotCallerUser?: User
  readonly guestBotCallerChat?: Chat
  readonly editDate?: number
  readonly hasProtectedContent?: boolean
  readonly isFromOffline?: boolean
  readonly isPaidPost?: boolean
  readonly mediaGroupId?: string
  readonly authorSignature?: string
  readonly paidStarCount?: number
  readonly text?: string
  readonly entities?: ReadonlyArray<MessageEntity>
  readonly linkPreviewOptions?: LinkPreviewOptions
  readonly suggestedPostInfo?: SuggestedPostInfo
  readonly effectId?: string
  readonly richMessage?: RichMessage
  readonly animation?: Animation
  readonly audio?: Audio
  readonly document?: Document
  readonly livePhoto?: LivePhoto
  readonly paidMedia?: PaidMediaInfo
  readonly photo?: ReadonlyArray<PhotoSize>
  readonly sticker?: Sticker
  readonly story?: Story
  readonly video?: Video
  readonly videoNote?: VideoNote
  readonly voice?: Voice
  readonly caption?: string
  readonly captionEntities?: ReadonlyArray<MessageEntity>
  readonly showCaptionAboveMedia?: boolean
  readonly hasMediaSpoiler?: boolean
  readonly checklist?: Checklist
  readonly contact?: Contact
  readonly dice?: Dice
  readonly game?: Game
  readonly poll?: Poll
  readonly venue?: Venue
  readonly location?: Location
  readonly newChatMembers?: ReadonlyArray<User>
  readonly leftChatMember?: User
  readonly chatOwnerLeft?: ChatOwnerLeft
  readonly chatOwnerChanged?: ChatOwnerChanged
  readonly newChatTitle?: string
  readonly newChatPhoto?: ReadonlyArray<PhotoSize>
  readonly deleteChatPhoto?: boolean
  readonly groupChatCreated?: boolean
  readonly supergroupChatCreated?: boolean
  readonly channelChatCreated?: boolean
  readonly messageAutoDeleteTimerChanged?: MessageAutoDeleteTimerChanged
  readonly migrateToChatId?: number
  readonly migrateFromChatId?: number
  readonly pinnedMessage?: MaybeInaccessibleMessage
  readonly invoice?: Invoice
  readonly successfulPayment?: SuccessfulPayment
  readonly refundedPayment?: RefundedPayment
  readonly usersShared?: UsersShared
  readonly chatShared?: ChatShared
  readonly gift?: GiftInfo
  readonly uniqueGift?: UniqueGiftInfo
  readonly giftUpgradeSent?: GiftInfo
  readonly connectedWebsite?: string
  readonly writeAccessAllowed?: WriteAccessAllowed
  readonly passportData?: PassportData
  readonly proximityAlertTriggered?: ProximityAlertTriggered
  readonly boostAdded?: ChatBoostAdded
  readonly chatBackgroundSet?: ChatBackground
  readonly checklistTasksDone?: ChecklistTasksDone
  readonly checklistTasksAdded?: ChecklistTasksAdded
  readonly directMessagePriceChanged?: DirectMessagePriceChanged
  readonly forumTopicCreated?: ForumTopicCreated
  readonly forumTopicEdited?: ForumTopicEdited
  readonly forumTopicClosed?: ForumTopicClosed
  readonly forumTopicReopened?: ForumTopicReopened
  readonly generalForumTopicHidden?: GeneralForumTopicHidden
  readonly generalForumTopicUnhidden?: GeneralForumTopicUnhidden
  readonly giveawayCreated?: GiveawayCreated
  readonly giveaway?: Giveaway
  readonly giveawayWinners?: GiveawayWinners
  readonly giveawayCompleted?: GiveawayCompleted
  readonly managedBotCreated?: ManagedBotCreated
  readonly paidMessagePriceChanged?: PaidMessagePriceChanged
  readonly pollOptionAdded?: PollOptionAdded
  readonly pollOptionDeleted?: PollOptionDeleted
  readonly suggestedPostApproved?: SuggestedPostApproved
  readonly suggestedPostApprovalFailed?: SuggestedPostApprovalFailed
  readonly suggestedPostDeclined?: SuggestedPostDeclined
  readonly suggestedPostPaid?: SuggestedPostPaid
  readonly suggestedPostRefunded?: SuggestedPostRefunded
  readonly videoChatScheduled?: VideoChatScheduled
  readonly videoChatStarted?: VideoChatStarted
  readonly videoChatEnded?: VideoChatEnded
  readonly videoChatParticipantsInvited?: VideoChatParticipantsInvited
  readonly webAppData?: WebAppData
  readonly replyMarkup?: InlineKeyboardMarkup
}

/**
 * This object represents a message.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Message: Schema.Codec<Message, unknown> = Schema.Struct({
  messageId: Schema.Number,
  messageThreadId: Schema.optionalKey(Schema.Number),
  directMessagesTopic: Schema.optionalKey(DirectMessagesTopic),
  from: Schema.optionalKey(User),
  senderChat: Schema.optionalKey(Chat),
  senderBoostCount: Schema.optionalKey(Schema.Number),
  senderBusinessBot: Schema.optionalKey(User),
  senderTag: Schema.optionalKey(Schema.String),
  date: Schema.Number,
  guestQueryId: Schema.optionalKey(Schema.String),
  businessConnectionId: Schema.optionalKey(Schema.String),
  chat: Chat,
  forwardOrigin: Schema.optionalKey(MessageOrigin),
  isTopicMessage: Schema.optionalKey(Schema.Boolean),
  isAutomaticForward: Schema.optionalKey(Schema.Boolean),
  replyToMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  externalReply: Schema.optionalKey(ExternalReplyInfo),
  quote: Schema.optionalKey(TextQuote),
  replyToStory: Schema.optionalKey(Story),
  replyToChecklistTaskId: Schema.optionalKey(Schema.Number),
  replyToPollOptionId: Schema.optionalKey(Schema.String),
  viaBot: Schema.optionalKey(User),
  guestBotCallerUser: Schema.optionalKey(User),
  guestBotCallerChat: Schema.optionalKey(Chat),
  editDate: Schema.optionalKey(Schema.Number),
  hasProtectedContent: Schema.optionalKey(Schema.Boolean),
  isFromOffline: Schema.optionalKey(Schema.Boolean),
  isPaidPost: Schema.optionalKey(Schema.Boolean),
  mediaGroupId: Schema.optionalKey(Schema.String),
  authorSignature: Schema.optionalKey(Schema.String),
  paidStarCount: Schema.optionalKey(Schema.Number),
  text: Schema.optionalKey(Schema.String),
  entities: Schema.optionalKey(Schema.Array(MessageEntity)),
  linkPreviewOptions: Schema.optionalKey(LinkPreviewOptions),
  suggestedPostInfo: Schema.optionalKey(SuggestedPostInfo),
  effectId: Schema.optionalKey(Schema.String),
  richMessage: Schema.optionalKey(RichMessage),
  animation: Schema.optionalKey(Animation),
  audio: Schema.optionalKey(Audio),
  document: Schema.optionalKey(Document),
  livePhoto: Schema.optionalKey(LivePhoto),
  paidMedia: Schema.optionalKey(PaidMediaInfo),
  photo: Schema.optionalKey(Schema.Array(PhotoSize)),
  sticker: Schema.optionalKey(Sticker),
  story: Schema.optionalKey(Story),
  video: Schema.optionalKey(Video),
  videoNote: Schema.optionalKey(VideoNote),
  voice: Schema.optionalKey(Voice),
  caption: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  hasMediaSpoiler: Schema.optionalKey(Schema.Boolean),
  checklist: Schema.optionalKey(Checklist),
  contact: Schema.optionalKey(Contact),
  dice: Schema.optionalKey(Dice),
  game: Schema.optionalKey(Game),
  poll: Schema.optionalKey(Poll),
  venue: Schema.optionalKey(Venue),
  location: Schema.optionalKey(Location),
  newChatMembers: Schema.optionalKey(Schema.Array(User)),
  leftChatMember: Schema.optionalKey(User),
  chatOwnerLeft: Schema.optionalKey(ChatOwnerLeft),
  chatOwnerChanged: Schema.optionalKey(ChatOwnerChanged),
  newChatTitle: Schema.optionalKey(Schema.String),
  newChatPhoto: Schema.optionalKey(Schema.Array(PhotoSize)),
  deleteChatPhoto: Schema.optionalKey(Schema.Boolean),
  groupChatCreated: Schema.optionalKey(Schema.Boolean),
  supergroupChatCreated: Schema.optionalKey(Schema.Boolean),
  channelChatCreated: Schema.optionalKey(Schema.Boolean),
  messageAutoDeleteTimerChanged: Schema.optionalKey(MessageAutoDeleteTimerChanged),
  migrateToChatId: Schema.optionalKey(Schema.Number),
  migrateFromChatId: Schema.optionalKey(Schema.Number),
  pinnedMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<MaybeInaccessibleMessage, unknown> => MaybeInaccessibleMessage)),
  invoice: Schema.optionalKey(Invoice),
  successfulPayment: Schema.optionalKey(SuccessfulPayment),
  refundedPayment: Schema.optionalKey(RefundedPayment),
  usersShared: Schema.optionalKey(UsersShared),
  chatShared: Schema.optionalKey(ChatShared),
  gift: Schema.optionalKey(GiftInfo),
  uniqueGift: Schema.optionalKey(UniqueGiftInfo),
  giftUpgradeSent: Schema.optionalKey(GiftInfo),
  connectedWebsite: Schema.optionalKey(Schema.String),
  writeAccessAllowed: Schema.optionalKey(WriteAccessAllowed),
  passportData: Schema.optionalKey(PassportData),
  proximityAlertTriggered: Schema.optionalKey(ProximityAlertTriggered),
  boostAdded: Schema.optionalKey(ChatBoostAdded),
  chatBackgroundSet: Schema.optionalKey(ChatBackground),
  checklistTasksDone: Schema.optionalKey(Schema.suspend((): Schema.Codec<ChecklistTasksDone, unknown> => ChecklistTasksDone)),
  checklistTasksAdded: Schema.optionalKey(Schema.suspend((): Schema.Codec<ChecklistTasksAdded, unknown> => ChecklistTasksAdded)),
  directMessagePriceChanged: Schema.optionalKey(DirectMessagePriceChanged),
  forumTopicCreated: Schema.optionalKey(ForumTopicCreated),
  forumTopicEdited: Schema.optionalKey(ForumTopicEdited),
  forumTopicClosed: Schema.optionalKey(ForumTopicClosed),
  forumTopicReopened: Schema.optionalKey(ForumTopicReopened),
  generalForumTopicHidden: Schema.optionalKey(GeneralForumTopicHidden),
  generalForumTopicUnhidden: Schema.optionalKey(GeneralForumTopicUnhidden),
  giveawayCreated: Schema.optionalKey(GiveawayCreated),
  giveaway: Schema.optionalKey(Giveaway),
  giveawayWinners: Schema.optionalKey(GiveawayWinners),
  giveawayCompleted: Schema.optionalKey(Schema.suspend((): Schema.Codec<GiveawayCompleted, unknown> => GiveawayCompleted)),
  managedBotCreated: Schema.optionalKey(ManagedBotCreated),
  paidMessagePriceChanged: Schema.optionalKey(PaidMessagePriceChanged),
  pollOptionAdded: Schema.optionalKey(Schema.suspend((): Schema.Codec<PollOptionAdded, unknown> => PollOptionAdded)),
  pollOptionDeleted: Schema.optionalKey(Schema.suspend((): Schema.Codec<PollOptionDeleted, unknown> => PollOptionDeleted)),
  suggestedPostApproved: Schema.optionalKey(Schema.suspend((): Schema.Codec<SuggestedPostApproved, unknown> => SuggestedPostApproved)),
  suggestedPostApprovalFailed: Schema.optionalKey(Schema.suspend((): Schema.Codec<SuggestedPostApprovalFailed, unknown> => SuggestedPostApprovalFailed)),
  suggestedPostDeclined: Schema.optionalKey(Schema.suspend((): Schema.Codec<SuggestedPostDeclined, unknown> => SuggestedPostDeclined)),
  suggestedPostPaid: Schema.optionalKey(Schema.suspend((): Schema.Codec<SuggestedPostPaid, unknown> => SuggestedPostPaid)),
  suggestedPostRefunded: Schema.optionalKey(Schema.suspend((): Schema.Codec<SuggestedPostRefunded, unknown> => SuggestedPostRefunded)),
  videoChatScheduled: Schema.optionalKey(VideoChatScheduled),
  videoChatStarted: Schema.optionalKey(VideoChatStarted),
  videoChatEnded: Schema.optionalKey(VideoChatEnded),
  videoChatParticipantsInvited: Schema.optionalKey(VideoChatParticipantsInvited),
  webAppData: Schema.optionalKey(WebAppData),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup)
}).pipe(
  Schema.encodeKeys({
    messageId: "message_id",
    messageThreadId: "message_thread_id",
    directMessagesTopic: "direct_messages_topic",
    senderChat: "sender_chat",
    senderBoostCount: "sender_boost_count",
    senderBusinessBot: "sender_business_bot",
    senderTag: "sender_tag",
    guestQueryId: "guest_query_id",
    businessConnectionId: "business_connection_id",
    forwardOrigin: "forward_origin",
    isTopicMessage: "is_topic_message",
    isAutomaticForward: "is_automatic_forward",
    replyToMessage: "reply_to_message",
    externalReply: "external_reply",
    replyToStory: "reply_to_story",
    replyToChecklistTaskId: "reply_to_checklist_task_id",
    replyToPollOptionId: "reply_to_poll_option_id",
    viaBot: "via_bot",
    guestBotCallerUser: "guest_bot_caller_user",
    guestBotCallerChat: "guest_bot_caller_chat",
    editDate: "edit_date",
    hasProtectedContent: "has_protected_content",
    isFromOffline: "is_from_offline",
    isPaidPost: "is_paid_post",
    mediaGroupId: "media_group_id",
    authorSignature: "author_signature",
    paidStarCount: "paid_star_count",
    linkPreviewOptions: "link_preview_options",
    suggestedPostInfo: "suggested_post_info",
    effectId: "effect_id",
    richMessage: "rich_message",
    livePhoto: "live_photo",
    paidMedia: "paid_media",
    videoNote: "video_note",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    hasMediaSpoiler: "has_media_spoiler",
    newChatMembers: "new_chat_members",
    leftChatMember: "left_chat_member",
    chatOwnerLeft: "chat_owner_left",
    chatOwnerChanged: "chat_owner_changed",
    newChatTitle: "new_chat_title",
    newChatPhoto: "new_chat_photo",
    deleteChatPhoto: "delete_chat_photo",
    groupChatCreated: "group_chat_created",
    supergroupChatCreated: "supergroup_chat_created",
    channelChatCreated: "channel_chat_created",
    messageAutoDeleteTimerChanged: "message_auto_delete_timer_changed",
    migrateToChatId: "migrate_to_chat_id",
    migrateFromChatId: "migrate_from_chat_id",
    pinnedMessage: "pinned_message",
    successfulPayment: "successful_payment",
    refundedPayment: "refunded_payment",
    usersShared: "users_shared",
    chatShared: "chat_shared",
    uniqueGift: "unique_gift",
    giftUpgradeSent: "gift_upgrade_sent",
    connectedWebsite: "connected_website",
    writeAccessAllowed: "write_access_allowed",
    passportData: "passport_data",
    proximityAlertTriggered: "proximity_alert_triggered",
    boostAdded: "boost_added",
    chatBackgroundSet: "chat_background_set",
    checklistTasksDone: "checklist_tasks_done",
    checklistTasksAdded: "checklist_tasks_added",
    directMessagePriceChanged: "direct_message_price_changed",
    forumTopicCreated: "forum_topic_created",
    forumTopicEdited: "forum_topic_edited",
    forumTopicClosed: "forum_topic_closed",
    forumTopicReopened: "forum_topic_reopened",
    generalForumTopicHidden: "general_forum_topic_hidden",
    generalForumTopicUnhidden: "general_forum_topic_unhidden",
    giveawayCreated: "giveaway_created",
    giveawayWinners: "giveaway_winners",
    giveawayCompleted: "giveaway_completed",
    managedBotCreated: "managed_bot_created",
    paidMessagePriceChanged: "paid_message_price_changed",
    pollOptionAdded: "poll_option_added",
    pollOptionDeleted: "poll_option_deleted",
    suggestedPostApproved: "suggested_post_approved",
    suggestedPostApprovalFailed: "suggested_post_approval_failed",
    suggestedPostDeclined: "suggested_post_declined",
    suggestedPostPaid: "suggested_post_paid",
    suggestedPostRefunded: "suggested_post_refunded",
    videoChatScheduled: "video_chat_scheduled",
    videoChatStarted: "video_chat_started",
    videoChatEnded: "video_chat_ended",
    videoChatParticipantsInvited: "video_chat_participants_invited",
    webAppData: "web_app_data",
    replyMarkup: "reply_markup"
  })
)

/**
 * This object describes a message that was deleted or is otherwise inaccessible to the bot.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InaccessibleMessage = Schema.Struct({
  chat: Chat,
  messageId: Schema.Number,
  date: Schema.Number
}).pipe(
  Schema.encodeKeys({
    messageId: "message_id"
  })
)

/**
 * Decoded `camelCase` InaccessibleMessage.
 *
 * @category models
 * @since 0.1.0
 */
export type InaccessibleMessage = Schema.Schema.Type<typeof InaccessibleMessage>

/**
 * Decoded `camelCase` MaybeInaccessibleMessage (union).
 *
 * @category models
 * @since 0.1.0
 */
export type MaybeInaccessibleMessage = Message | InaccessibleMessage

/**
 * This object describes a message that can be inaccessible to the bot. It can be one of - Message - InaccessibleMessage
 *
 * @category schemas
 * @since 0.1.0
 */
export const MaybeInaccessibleMessage: Schema.Codec<MaybeInaccessibleMessage, unknown> = Schema.Union([Schema.suspend((): Schema.Codec<Message, unknown> => Message), InaccessibleMessage])

/**
 * This object represents an incoming callback query from a callback button in an inline keyboard. If the button that originated the query was attached to a message sent by the bot, the field message will be present. If the button was attached to a message sent via the bot (in inline mode), the field inline_message_id will be present. Exactly one of the fields data or game_short_name will be present.
 *
 * @category schemas
 * @since 0.1.0
 */
export const CallbackQuery = Schema.Struct({
  id: Schema.String,
  from: User,
  message: Schema.optionalKey(Schema.suspend((): Schema.Codec<MaybeInaccessibleMessage, unknown> => MaybeInaccessibleMessage)),
  inlineMessageId: Schema.optionalKey(Schema.String),
  chatInstance: Schema.String,
  data: Schema.optionalKey(Schema.String),
  gameShortName: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    inlineMessageId: "inline_message_id",
    chatInstance: "chat_instance",
    gameShortName: "game_short_name"
  })
)

/**
 * Decoded `camelCase` CallbackQuery.
 *
 * @category models
 * @since 0.1.0
 */
export type CallbackQuery = Schema.Schema.Type<typeof CallbackQuery>

/**
 * Represents the rights of an administrator in a chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatAdministratorRights = Schema.Struct({
  isAnonymous: Schema.Boolean,
  canManageChat: Schema.Boolean,
  canDeleteMessages: Schema.Boolean,
  canManageVideoChats: Schema.Boolean,
  canRestrictMembers: Schema.Boolean,
  canPromoteMembers: Schema.Boolean,
  canChangeInfo: Schema.Boolean,
  canInviteUsers: Schema.Boolean,
  canPostStories: Schema.Boolean,
  canEditStories: Schema.Boolean,
  canDeleteStories: Schema.Boolean,
  canPostMessages: Schema.optionalKey(Schema.Boolean),
  canEditMessages: Schema.optionalKey(Schema.Boolean),
  canPinMessages: Schema.optionalKey(Schema.Boolean),
  canManageTopics: Schema.optionalKey(Schema.Boolean),
  canManageDirectMessages: Schema.optionalKey(Schema.Boolean),
  canManageTags: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
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
 * Decoded `camelCase` ChatAdministratorRights.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatAdministratorRights = Schema.Schema.Type<typeof ChatAdministratorRights>

/**
 * The boost was obtained by subscribing to Telegram Premium or by gifting a Telegram Premium subscription to another user.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatBoostSourcePremium = Schema.Struct({
  source: Schema.Literal("premium"),
  user: User
})

/**
 * Decoded `camelCase` ChatBoostSourcePremium.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatBoostSourcePremium = Schema.Schema.Type<typeof ChatBoostSourcePremium>

/**
 * The boost was obtained by the creation of Telegram Premium gift codes to boost a chat. Each such code boosts the chat 4 times for the duration of the corresponding Telegram Premium subscription.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatBoostSourceGiftCode = Schema.Struct({
  source: Schema.Literal("gift_code"),
  user: User
})

/**
 * Decoded `camelCase` ChatBoostSourceGiftCode.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatBoostSourceGiftCode = Schema.Schema.Type<typeof ChatBoostSourceGiftCode>

/**
 * The boost was obtained by the creation of a Telegram Premium or a Telegram Star giveaway. This boosts the chat 4 times for the duration of the corresponding Telegram Premium subscription for Telegram Premium giveaways and prize_star_count / 500 times for one year for Telegram Star giveaways.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatBoostSourceGiveaway = Schema.Struct({
  source: Schema.Literal("giveaway"),
  giveawayMessageId: Schema.Number,
  user: Schema.optionalKey(User),
  prizeStarCount: Schema.optionalKey(Schema.Number),
  isUnclaimed: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    giveawayMessageId: "giveaway_message_id",
    prizeStarCount: "prize_star_count",
    isUnclaimed: "is_unclaimed"
  })
)

/**
 * Decoded `camelCase` ChatBoostSourceGiveaway.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatBoostSourceGiveaway = Schema.Schema.Type<typeof ChatBoostSourceGiveaway>

/**
 * This object describes the source of a chat boost. It can be one of - ChatBoostSourcePremium - ChatBoostSourceGiftCode - ChatBoostSourceGiveaway
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatBoostSource = Schema.Union([ChatBoostSourcePremium, ChatBoostSourceGiftCode, ChatBoostSourceGiveaway])

/**
 * Decoded `camelCase` ChatBoostSource (union).
 *
 * @category models
 * @since 0.1.0
 */
export type ChatBoostSource = Schema.Schema.Type<typeof ChatBoostSource>

/**
 * This object contains information about a chat boost.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatBoost = Schema.Struct({
  boostId: Schema.String,
  addDate: Schema.Number,
  expirationDate: Schema.Number,
  source: ChatBoostSource
}).pipe(
  Schema.encodeKeys({
    boostId: "boost_id",
    addDate: "add_date",
    expirationDate: "expiration_date"
  })
)

/**
 * Decoded `camelCase` ChatBoost.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatBoost = Schema.Schema.Type<typeof ChatBoost>

/**
 * This object represents a boost removed from a chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatBoostRemoved = Schema.Struct({
  chat: Chat,
  boostId: Schema.String,
  removeDate: Schema.Number,
  source: ChatBoostSource
}).pipe(
  Schema.encodeKeys({
    boostId: "boost_id",
    removeDate: "remove_date"
  })
)

/**
 * Decoded `camelCase` ChatBoostRemoved.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatBoostRemoved = Schema.Schema.Type<typeof ChatBoostRemoved>

/**
 * This object represents a boost added to a chat or changed.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatBoostUpdated = Schema.Struct({
  chat: Chat,
  boost: ChatBoost
})

/**
 * Decoded `camelCase` ChatBoostUpdated.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatBoostUpdated = Schema.Schema.Type<typeof ChatBoostUpdated>

/**
 * This object represents a chat photo.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatPhoto = Schema.Struct({
  smallFileId: Schema.String,
  smallFileUniqueId: Schema.String,
  bigFileId: Schema.String,
  bigFileUniqueId: Schema.String
}).pipe(
  Schema.encodeKeys({
    smallFileId: "small_file_id",
    smallFileUniqueId: "small_file_unique_id",
    bigFileId: "big_file_id",
    bigFileUniqueId: "big_file_unique_id"
  })
)

/**
 * Decoded `camelCase` ChatPhoto.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatPhoto = Schema.Schema.Type<typeof ChatPhoto>

/**
 * The reaction is based on an emoji.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ReactionTypeEmoji = Schema.Struct({
  type: Schema.Literal("emoji"),
  emoji: Schema.String
})

/**
 * Decoded `camelCase` ReactionTypeEmoji.
 *
 * @category models
 * @since 0.1.0
 */
export type ReactionTypeEmoji = Schema.Schema.Type<typeof ReactionTypeEmoji>

/**
 * The reaction is based on a custom emoji.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ReactionTypeCustomEmoji = Schema.Struct({
  type: Schema.Literal("custom_emoji"),
  customEmojiId: Schema.String
}).pipe(
  Schema.encodeKeys({
    customEmojiId: "custom_emoji_id"
  })
)

/**
 * Decoded `camelCase` ReactionTypeCustomEmoji.
 *
 * @category models
 * @since 0.1.0
 */
export type ReactionTypeCustomEmoji = Schema.Schema.Type<typeof ReactionTypeCustomEmoji>

/**
 * The reaction is paid.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ReactionTypePaid = Schema.Struct({
  type: Schema.Literal("paid")
})

/**
 * Decoded `camelCase` ReactionTypePaid.
 *
 * @category models
 * @since 0.1.0
 */
export type ReactionTypePaid = Schema.Schema.Type<typeof ReactionTypePaid>

/**
 * This object describes the type of a reaction. Currently, it can be one of - ReactionTypeEmoji - ReactionTypeCustomEmoji - ReactionTypePaid
 *
 * @category schemas
 * @since 0.1.0
 */
export const ReactionType = Schema.Union([ReactionTypeEmoji, ReactionTypeCustomEmoji, ReactionTypePaid])

/**
 * Decoded `camelCase` ReactionType (union).
 *
 * @category models
 * @since 0.1.0
 */
export type ReactionType = Schema.Schema.Type<typeof ReactionType>

/**
 * Describes actions that a non-administrator user is allowed to take in a chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatPermissions = Schema.Struct({
  canSendMessages: Schema.optionalKey(Schema.Boolean),
  canSendAudios: Schema.optionalKey(Schema.Boolean),
  canSendDocuments: Schema.optionalKey(Schema.Boolean),
  canSendPhotos: Schema.optionalKey(Schema.Boolean),
  canSendVideos: Schema.optionalKey(Schema.Boolean),
  canSendVideoNotes: Schema.optionalKey(Schema.Boolean),
  canSendVoiceNotes: Schema.optionalKey(Schema.Boolean),
  canSendPolls: Schema.optionalKey(Schema.Boolean),
  canSendOtherMessages: Schema.optionalKey(Schema.Boolean),
  canAddWebPagePreviews: Schema.optionalKey(Schema.Boolean),
  canReactToMessages: Schema.optionalKey(Schema.Boolean),
  canEditTag: Schema.optionalKey(Schema.Boolean),
  canChangeInfo: Schema.optionalKey(Schema.Boolean),
  canInviteUsers: Schema.optionalKey(Schema.Boolean),
  canPinMessages: Schema.optionalKey(Schema.Boolean),
  canManageTopics: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    canSendMessages: "can_send_messages",
    canSendAudios: "can_send_audios",
    canSendDocuments: "can_send_documents",
    canSendPhotos: "can_send_photos",
    canSendVideos: "can_send_videos",
    canSendVideoNotes: "can_send_video_notes",
    canSendVoiceNotes: "can_send_voice_notes",
    canSendPolls: "can_send_polls",
    canSendOtherMessages: "can_send_other_messages",
    canAddWebPagePreviews: "can_add_web_page_previews",
    canReactToMessages: "can_react_to_messages",
    canEditTag: "can_edit_tag",
    canChangeInfo: "can_change_info",
    canInviteUsers: "can_invite_users",
    canPinMessages: "can_pin_messages",
    canManageTopics: "can_manage_topics"
  })
)

/**
 * Decoded `camelCase` ChatPermissions.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatPermissions = Schema.Schema.Type<typeof ChatPermissions>

/**
 * Represents a location to which a chat is connected.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatLocation = Schema.Struct({
  location: Location,
  address: Schema.String
})

/**
 * Decoded `camelCase` ChatLocation.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatLocation = Schema.Schema.Type<typeof ChatLocation>

/**
 * This object describes the rating of a user based on their Telegram Star spendings.
 *
 * @category schemas
 * @since 0.1.0
 */
export const UserRating = Schema.Struct({
  level: Schema.Number,
  rating: Schema.Number,
  currentLevelRating: Schema.Number,
  nextLevelRating: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    currentLevelRating: "current_level_rating",
    nextLevelRating: "next_level_rating"
  })
)

/**
 * Decoded `camelCase` UserRating.
 *
 * @category models
 * @since 0.1.0
 */
export type UserRating = Schema.Schema.Type<typeof UserRating>

/**
 * This object contains full information about a chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatFullInfo = Schema.Struct({
  id: Schema.Number,
  type: Schema.String,
  title: Schema.optionalKey(Schema.String),
  username: Schema.optionalKey(Schema.String),
  firstName: Schema.optionalKey(Schema.String),
  lastName: Schema.optionalKey(Schema.String),
  isForum: Schema.optionalKey(Schema.Boolean),
  isDirectMessages: Schema.optionalKey(Schema.Boolean),
  accentColorId: Schema.Number,
  maxReactionCount: Schema.Number,
  photo: Schema.optionalKey(ChatPhoto),
  activeUsernames: Schema.optionalKey(Schema.Array(Schema.String)),
  birthdate: Schema.optionalKey(Birthdate),
  businessIntro: Schema.optionalKey(BusinessIntro),
  businessLocation: Schema.optionalKey(BusinessLocation),
  businessOpeningHours: Schema.optionalKey(BusinessOpeningHours),
  personalChat: Schema.optionalKey(Chat),
  parentChat: Schema.optionalKey(Chat),
  availableReactions: Schema.optionalKey(Schema.Array(ReactionType)),
  backgroundCustomEmojiId: Schema.optionalKey(Schema.String),
  profileAccentColorId: Schema.optionalKey(Schema.Number),
  profileBackgroundCustomEmojiId: Schema.optionalKey(Schema.String),
  emojiStatusCustomEmojiId: Schema.optionalKey(Schema.String),
  emojiStatusExpirationDate: Schema.optionalKey(Schema.Number),
  bio: Schema.optionalKey(Schema.String),
  hasPrivateForwards: Schema.optionalKey(Schema.Boolean),
  hasRestrictedVoiceAndVideoMessages: Schema.optionalKey(Schema.Boolean),
  joinToSendMessages: Schema.optionalKey(Schema.Boolean),
  joinByRequest: Schema.optionalKey(Schema.Boolean),
  description: Schema.optionalKey(Schema.String),
  inviteLink: Schema.optionalKey(Schema.String),
  pinnedMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  permissions: Schema.optionalKey(ChatPermissions),
  acceptedGiftTypes: AcceptedGiftTypes,
  canSendPaidMedia: Schema.optionalKey(Schema.Boolean),
  slowModeDelay: Schema.optionalKey(Schema.Number),
  unrestrictBoostCount: Schema.optionalKey(Schema.Number),
  messageAutoDeleteTime: Schema.optionalKey(Schema.Number),
  hasAggressiveAntiSpamEnabled: Schema.optionalKey(Schema.Boolean),
  hasHiddenMembers: Schema.optionalKey(Schema.Boolean),
  hasProtectedContent: Schema.optionalKey(Schema.Boolean),
  hasVisibleHistory: Schema.optionalKey(Schema.Boolean),
  stickerSetName: Schema.optionalKey(Schema.String),
  canSetStickerSet: Schema.optionalKey(Schema.Boolean),
  customEmojiStickerSetName: Schema.optionalKey(Schema.String),
  linkedChatId: Schema.optionalKey(Schema.Number),
  location: Schema.optionalKey(ChatLocation),
  rating: Schema.optionalKey(UserRating),
  firstProfileAudio: Schema.optionalKey(Audio),
  uniqueGiftColors: Schema.optionalKey(UniqueGiftColors),
  paidMessageStarCount: Schema.optionalKey(Schema.Number),
  guardBot: Schema.optionalKey(User)
}).pipe(
  Schema.encodeKeys({
    firstName: "first_name",
    lastName: "last_name",
    isForum: "is_forum",
    isDirectMessages: "is_direct_messages",
    accentColorId: "accent_color_id",
    maxReactionCount: "max_reaction_count",
    activeUsernames: "active_usernames",
    businessIntro: "business_intro",
    businessLocation: "business_location",
    businessOpeningHours: "business_opening_hours",
    personalChat: "personal_chat",
    parentChat: "parent_chat",
    availableReactions: "available_reactions",
    backgroundCustomEmojiId: "background_custom_emoji_id",
    profileAccentColorId: "profile_accent_color_id",
    profileBackgroundCustomEmojiId: "profile_background_custom_emoji_id",
    emojiStatusCustomEmojiId: "emoji_status_custom_emoji_id",
    emojiStatusExpirationDate: "emoji_status_expiration_date",
    hasPrivateForwards: "has_private_forwards",
    hasRestrictedVoiceAndVideoMessages: "has_restricted_voice_and_video_messages",
    joinToSendMessages: "join_to_send_messages",
    joinByRequest: "join_by_request",
    inviteLink: "invite_link",
    pinnedMessage: "pinned_message",
    acceptedGiftTypes: "accepted_gift_types",
    canSendPaidMedia: "can_send_paid_media",
    slowModeDelay: "slow_mode_delay",
    unrestrictBoostCount: "unrestrict_boost_count",
    messageAutoDeleteTime: "message_auto_delete_time",
    hasAggressiveAntiSpamEnabled: "has_aggressive_anti_spam_enabled",
    hasHiddenMembers: "has_hidden_members",
    hasProtectedContent: "has_protected_content",
    hasVisibleHistory: "has_visible_history",
    stickerSetName: "sticker_set_name",
    canSetStickerSet: "can_set_sticker_set",
    customEmojiStickerSetName: "custom_emoji_sticker_set_name",
    linkedChatId: "linked_chat_id",
    firstProfileAudio: "first_profile_audio",
    uniqueGiftColors: "unique_gift_colors",
    paidMessageStarCount: "paid_message_star_count",
    guardBot: "guard_bot"
  })
)

/**
 * Decoded `camelCase` ChatFullInfo.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatFullInfo = Schema.Schema.Type<typeof ChatFullInfo>

/**
 * Represents an invite link for a chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatInviteLink = Schema.Struct({
  inviteLink: Schema.String,
  creator: User,
  createsJoinRequest: Schema.Boolean,
  isPrimary: Schema.Boolean,
  isRevoked: Schema.Boolean,
  name: Schema.optionalKey(Schema.String),
  expireDate: Schema.optionalKey(Schema.Number),
  memberLimit: Schema.optionalKey(Schema.Number),
  pendingJoinRequestCount: Schema.optionalKey(Schema.Number),
  subscriptionPeriod: Schema.optionalKey(Schema.Number),
  subscriptionPrice: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    inviteLink: "invite_link",
    createsJoinRequest: "creates_join_request",
    isPrimary: "is_primary",
    isRevoked: "is_revoked",
    expireDate: "expire_date",
    memberLimit: "member_limit",
    pendingJoinRequestCount: "pending_join_request_count",
    subscriptionPeriod: "subscription_period",
    subscriptionPrice: "subscription_price"
  })
)

/**
 * Decoded `camelCase` ChatInviteLink.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatInviteLink = Schema.Schema.Type<typeof ChatInviteLink>

/**
 * Represents a join request sent to a chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatJoinRequest = Schema.Struct({
  chat: Chat,
  from: User,
  userChatId: Schema.Number,
  date: Schema.Number,
  bio: Schema.optionalKey(Schema.String),
  inviteLink: Schema.optionalKey(ChatInviteLink),
  queryId: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    userChatId: "user_chat_id",
    inviteLink: "invite_link",
    queryId: "query_id"
  })
)

/**
 * Decoded `camelCase` ChatJoinRequest.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatJoinRequest = Schema.Schema.Type<typeof ChatJoinRequest>

/**
 * Represents a chat member that owns the chat and has all administrator privileges.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatMemberOwner = Schema.Struct({
  status: Schema.Literal("creator"),
  user: User,
  isAnonymous: Schema.Boolean,
  customTitle: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    isAnonymous: "is_anonymous",
    customTitle: "custom_title"
  })
)

/**
 * Decoded `camelCase` ChatMemberOwner.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatMemberOwner = Schema.Schema.Type<typeof ChatMemberOwner>

/**
 * Represents a chat member that has some additional privileges.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatMemberAdministrator = Schema.Struct({
  status: Schema.Literal("administrator"),
  user: User,
  canBeEdited: Schema.Boolean,
  isAnonymous: Schema.Boolean,
  canManageChat: Schema.Boolean,
  canDeleteMessages: Schema.Boolean,
  canManageVideoChats: Schema.Boolean,
  canRestrictMembers: Schema.Boolean,
  canPromoteMembers: Schema.Boolean,
  canChangeInfo: Schema.Boolean,
  canInviteUsers: Schema.Boolean,
  canPostStories: Schema.Boolean,
  canEditStories: Schema.Boolean,
  canDeleteStories: Schema.Boolean,
  canPostMessages: Schema.optionalKey(Schema.Boolean),
  canEditMessages: Schema.optionalKey(Schema.Boolean),
  canPinMessages: Schema.optionalKey(Schema.Boolean),
  canManageTopics: Schema.optionalKey(Schema.Boolean),
  canManageDirectMessages: Schema.optionalKey(Schema.Boolean),
  canManageTags: Schema.optionalKey(Schema.Boolean),
  customTitle: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    canBeEdited: "can_be_edited",
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
    canManageTags: "can_manage_tags",
    customTitle: "custom_title"
  })
)

/**
 * Decoded `camelCase` ChatMemberAdministrator.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatMemberAdministrator = Schema.Schema.Type<typeof ChatMemberAdministrator>

/**
 * Represents a chat member that has no additional privileges or restrictions.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatMemberMember = Schema.Struct({
  status: Schema.Literal("member"),
  tag: Schema.optionalKey(Schema.String),
  user: User,
  untilDate: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    untilDate: "until_date"
  })
)

/**
 * Decoded `camelCase` ChatMemberMember.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatMemberMember = Schema.Schema.Type<typeof ChatMemberMember>

/**
 * Represents a chat member that is under certain restrictions in the chat. Supergroups only.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatMemberRestricted = Schema.Struct({
  status: Schema.Literal("restricted"),
  tag: Schema.optionalKey(Schema.String),
  user: User,
  isMember: Schema.Boolean,
  canSendMessages: Schema.Boolean,
  canSendAudios: Schema.Boolean,
  canSendDocuments: Schema.Boolean,
  canSendPhotos: Schema.Boolean,
  canSendVideos: Schema.Boolean,
  canSendVideoNotes: Schema.Boolean,
  canSendVoiceNotes: Schema.Boolean,
  canSendPolls: Schema.Boolean,
  canSendOtherMessages: Schema.Boolean,
  canAddWebPagePreviews: Schema.Boolean,
  canReactToMessages: Schema.Boolean,
  canEditTag: Schema.Boolean,
  canChangeInfo: Schema.Boolean,
  canInviteUsers: Schema.Boolean,
  canPinMessages: Schema.Boolean,
  canManageTopics: Schema.Boolean,
  untilDate: Schema.Number
}).pipe(
  Schema.encodeKeys({
    isMember: "is_member",
    canSendMessages: "can_send_messages",
    canSendAudios: "can_send_audios",
    canSendDocuments: "can_send_documents",
    canSendPhotos: "can_send_photos",
    canSendVideos: "can_send_videos",
    canSendVideoNotes: "can_send_video_notes",
    canSendVoiceNotes: "can_send_voice_notes",
    canSendPolls: "can_send_polls",
    canSendOtherMessages: "can_send_other_messages",
    canAddWebPagePreviews: "can_add_web_page_previews",
    canReactToMessages: "can_react_to_messages",
    canEditTag: "can_edit_tag",
    canChangeInfo: "can_change_info",
    canInviteUsers: "can_invite_users",
    canPinMessages: "can_pin_messages",
    canManageTopics: "can_manage_topics",
    untilDate: "until_date"
  })
)

/**
 * Decoded `camelCase` ChatMemberRestricted.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatMemberRestricted = Schema.Schema.Type<typeof ChatMemberRestricted>

/**
 * Represents a chat member that isn't currently a member of the chat, but may join it themselves.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatMemberLeft = Schema.Struct({
  status: Schema.Literal("left"),
  user: User
})

/**
 * Decoded `camelCase` ChatMemberLeft.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatMemberLeft = Schema.Schema.Type<typeof ChatMemberLeft>

/**
 * Represents a chat member that was banned in the chat and can't return to the chat or view chat messages.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatMemberBanned = Schema.Struct({
  status: Schema.Literal("kicked"),
  user: User,
  untilDate: Schema.Number
}).pipe(
  Schema.encodeKeys({
    untilDate: "until_date"
  })
)

/**
 * Decoded `camelCase` ChatMemberBanned.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatMemberBanned = Schema.Schema.Type<typeof ChatMemberBanned>

/**
 * This object contains information about one member of a chat. Currently, the following 6 types of chat members are supported: - ChatMemberOwner - ChatMemberAdministrator - ChatMemberMember - ChatMemberRestricted - ChatMemberLeft - ChatMemberBanned
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatMember = Schema.Union([ChatMemberOwner, ChatMemberAdministrator, ChatMemberMember, ChatMemberRestricted, ChatMemberLeft, ChatMemberBanned])

/**
 * Decoded `camelCase` ChatMember (union).
 *
 * @category models
 * @since 0.1.0
 */
export type ChatMember = Schema.Schema.Type<typeof ChatMember>

/**
 * This object represents changes in the status of a chat member.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChatMemberUpdated = Schema.Struct({
  chat: Chat,
  from: User,
  date: Schema.Number,
  oldChatMember: ChatMember,
  newChatMember: ChatMember,
  inviteLink: Schema.optionalKey(ChatInviteLink),
  viaJoinRequest: Schema.optionalKey(Schema.Boolean),
  viaChatFolderInviteLink: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    oldChatMember: "old_chat_member",
    newChatMember: "new_chat_member",
    inviteLink: "invite_link",
    viaJoinRequest: "via_join_request",
    viaChatFolderInviteLink: "via_chat_folder_invite_link"
  })
)

/**
 * Decoded `camelCase` ChatMemberUpdated.
 *
 * @category models
 * @since 0.1.0
 */
export type ChatMemberUpdated = Schema.Schema.Type<typeof ChatMemberUpdated>

/**
 * Represents a result of an inline query that was chosen by the user and sent to their chat partner. Note: It is necessary to enable inline feedback via @BotFather in order to receive these objects in updates.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ChosenInlineResult = Schema.Struct({
  resultId: Schema.String,
  from: User,
  location: Schema.optionalKey(Location),
  inlineMessageId: Schema.optionalKey(Schema.String),
  query: Schema.String
}).pipe(
  Schema.encodeKeys({
    resultId: "result_id",
    inlineMessageId: "inline_message_id"
  })
)

/**
 * Decoded `camelCase` ChosenInlineResult.
 *
 * @category models
 * @since 0.1.0
 */
export type ChosenInlineResult = Schema.Schema.Type<typeof ChosenInlineResult>

/**
 * Upon receiving a message with this object, Telegram clients will display a reply interface to the user (act as if the user has selected the bot's message and tapped 'Reply'). This can be extremely useful if you want to create user-friendly step-by-step interfaces without having to sacrifice privacy mode. Not supported in channels and for messages sent on behalf of a user account.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ForceReply = Schema.Struct({
  forceReply: Schema.Boolean,
  inputFieldPlaceholder: Schema.optionalKey(Schema.String),
  selective: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    forceReply: "force_reply",
    inputFieldPlaceholder: "input_field_placeholder"
  })
)

/**
 * Decoded `camelCase` ForceReply.
 *
 * @category models
 * @since 0.1.0
 */
export type ForceReply = Schema.Schema.Type<typeof ForceReply>

/**
 * This object represents a forum topic.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ForumTopic = Schema.Struct({
  messageThreadId: Schema.Number,
  name: Schema.String,
  iconColor: Schema.Number,
  iconCustomEmojiId: Schema.optionalKey(Schema.String),
  isNameImplicit: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    messageThreadId: "message_thread_id",
    iconColor: "icon_color",
    iconCustomEmojiId: "icon_custom_emoji_id",
    isNameImplicit: "is_name_implicit"
  })
)

/**
 * Decoded `camelCase` ForumTopic.
 *
 * @category models
 * @since 0.1.0
 */
export type ForumTopic = Schema.Schema.Type<typeof ForumTopic>

/**
 * This object represents one row of the high scores table for a game.
 *
 * @category schemas
 * @since 0.1.0
 */
export const GameHighScore = Schema.Struct({
  position: Schema.Number,
  user: User,
  score: Schema.Number
})

/**
 * Decoded `camelCase` GameHighScore.
 *
 * @category models
 * @since 0.1.0
 */
export type GameHighScore = Schema.Schema.Type<typeof GameHighScore>

/**
 * This object represent a list of gifts.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Gifts = Schema.Struct({
  gifts: Schema.Array(Gift)
})

/**
 * Decoded `camelCase` Gifts.
 *
 * @category models
 * @since 0.1.0
 */
export type Gifts = Schema.Schema.Type<typeof Gifts>

/**
 * This object represents an incoming inline query. When the user sends an empty query, your bot could return some default or trending results.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQuery = Schema.Struct({
  id: Schema.String,
  from: User,
  query: Schema.String,
  offset: Schema.String,
  chatType: Schema.optionalKey(Schema.String),
  location: Schema.optionalKey(Location)
}).pipe(
  Schema.encodeKeys({
    chatType: "chat_type"
  })
)

/**
 * Decoded `camelCase` InlineQuery.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQuery = Schema.Schema.Type<typeof InlineQuery>

/**
 * Represents the content of a text message to be sent as the result of an inline query.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputTextMessageContent = Schema.Struct({
  messageText: Schema.String,
  parseMode: Schema.optionalKey(Schema.String),
  entities: Schema.optionalKey(Schema.Array(MessageEntity)),
  linkPreviewOptions: Schema.optionalKey(LinkPreviewOptions)
}).pipe(
  Schema.encodeKeys({
    messageText: "message_text",
    parseMode: "parse_mode",
    linkPreviewOptions: "link_preview_options"
  })
)

/**
 * Decoded `camelCase` InputTextMessageContent.
 *
 * @category models
 * @since 0.1.0
 */
export type InputTextMessageContent = Schema.Schema.Type<typeof InputTextMessageContent>

/**
 * Describes a rich message to be sent. Exactly one of the fields html or markdown must be used.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputRichMessage = Schema.Struct({
  html: Schema.optionalKey(Schema.String),
  markdown: Schema.optionalKey(Schema.String),
  isRtl: Schema.optionalKey(Schema.Boolean),
  skipEntityDetection: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    isRtl: "is_rtl",
    skipEntityDetection: "skip_entity_detection"
  })
)

/**
 * Decoded `camelCase` InputRichMessage.
 *
 * @category models
 * @since 0.1.0
 */
export type InputRichMessage = Schema.Schema.Type<typeof InputRichMessage>

/**
 * Represents the content of a rich message to be sent as the result of an inline query.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputRichMessageContent = Schema.Struct({
  richMessage: InputRichMessage
}).pipe(
  Schema.encodeKeys({
    richMessage: "rich_message"
  })
)

/**
 * Decoded `camelCase` InputRichMessageContent.
 *
 * @category models
 * @since 0.1.0
 */
export type InputRichMessageContent = Schema.Schema.Type<typeof InputRichMessageContent>

/**
 * Represents the content of a location message to be sent as the result of an inline query.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputLocationMessageContent = Schema.Struct({
  latitude: Schema.Number,
  longitude: Schema.Number,
  horizontalAccuracy: Schema.optionalKey(Schema.Number),
  livePeriod: Schema.optionalKey(Schema.Number),
  heading: Schema.optionalKey(Schema.Number),
  proximityAlertRadius: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    horizontalAccuracy: "horizontal_accuracy",
    livePeriod: "live_period",
    proximityAlertRadius: "proximity_alert_radius"
  })
)

/**
 * Decoded `camelCase` InputLocationMessageContent.
 *
 * @category models
 * @since 0.1.0
 */
export type InputLocationMessageContent = Schema.Schema.Type<typeof InputLocationMessageContent>

/**
 * Represents the content of a venue message to be sent as the result of an inline query.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputVenueMessageContent = Schema.Struct({
  latitude: Schema.Number,
  longitude: Schema.Number,
  title: Schema.String,
  address: Schema.String,
  foursquareId: Schema.optionalKey(Schema.String),
  foursquareType: Schema.optionalKey(Schema.String),
  googlePlaceId: Schema.optionalKey(Schema.String),
  googlePlaceType: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    foursquareId: "foursquare_id",
    foursquareType: "foursquare_type",
    googlePlaceId: "google_place_id",
    googlePlaceType: "google_place_type"
  })
)

/**
 * Decoded `camelCase` InputVenueMessageContent.
 *
 * @category models
 * @since 0.1.0
 */
export type InputVenueMessageContent = Schema.Schema.Type<typeof InputVenueMessageContent>

/**
 * Represents the content of a contact message to be sent as the result of an inline query.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputContactMessageContent = Schema.Struct({
  phoneNumber: Schema.String,
  firstName: Schema.String,
  lastName: Schema.optionalKey(Schema.String),
  vcard: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    phoneNumber: "phone_number",
    firstName: "first_name",
    lastName: "last_name"
  })
)

/**
 * Decoded `camelCase` InputContactMessageContent.
 *
 * @category models
 * @since 0.1.0
 */
export type InputContactMessageContent = Schema.Schema.Type<typeof InputContactMessageContent>

/**
 * This object represents a portion of the price for goods or services.
 *
 * @category schemas
 * @since 0.1.0
 */
export const LabeledPrice = Schema.Struct({
  label: Schema.String,
  amount: Schema.Number
})

/**
 * Decoded `camelCase` LabeledPrice.
 *
 * @category models
 * @since 0.1.0
 */
export type LabeledPrice = Schema.Schema.Type<typeof LabeledPrice>

/**
 * Represents the content of an invoice message to be sent as the result of an inline query.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputInvoiceMessageContent = Schema.Struct({
  title: Schema.String,
  description: Schema.String,
  payload: Schema.String,
  providerToken: Schema.optionalKey(Schema.String),
  currency: Schema.String,
  prices: Schema.Array(LabeledPrice),
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
    providerToken: "provider_token",
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
 * Decoded `camelCase` InputInvoiceMessageContent.
 *
 * @category models
 * @since 0.1.0
 */
export type InputInvoiceMessageContent = Schema.Schema.Type<typeof InputInvoiceMessageContent>

/**
 * This object represents the content of a message to be sent as a result of an inline query. Telegram clients currently support the following types: - InputTextMessageContent - InputRichMessageContent - InputLocationMessageContent - InputVenueMessageContent - InputContactMessageContent - InputInvoiceMessageContent
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputMessageContent = Schema.Union([InputTextMessageContent, InputRichMessageContent, InputLocationMessageContent, InputVenueMessageContent, InputContactMessageContent, InputInvoiceMessageContent])

/**
 * Decoded `camelCase` InputMessageContent (union).
 *
 * @category models
 * @since 0.1.0
 */
export type InputMessageContent = Schema.Schema.Type<typeof InputMessageContent>

/**
 * Represents a link to an MP3 audio file stored on the Telegram servers. By default, this audio file will be sent by the user. Alternatively, you can use input_message_content to send a message with the specified content instead of the audio.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultCachedAudio = Schema.Struct({
  type: Schema.Literal("audio"),
  id: Schema.String,
  audioFileId: Schema.String,
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent)
}).pipe(
  Schema.encodeKeys({
    audioFileId: "audio_file_id",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultCachedAudio.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultCachedAudio = Schema.Schema.Type<typeof InlineQueryResultCachedAudio>

/**
 * Represents a link to a file stored on the Telegram servers. By default, this file will be sent by the user with an optional caption. Alternatively, you can use input_message_content to send a message with the specified content instead of the file.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultCachedDocument = Schema.Struct({
  type: Schema.Literal("document"),
  id: Schema.String,
  title: Schema.String,
  documentFileId: Schema.String,
  description: Schema.optionalKey(Schema.String),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent)
}).pipe(
  Schema.encodeKeys({
    documentFileId: "document_file_id",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultCachedDocument.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultCachedDocument = Schema.Schema.Type<typeof InlineQueryResultCachedDocument>

/**
 * Represents a link to an animated GIF file stored on the Telegram servers. By default, this animated GIF file will be sent by the user with an optional caption. Alternatively, you can use input_message_content to send a message with specified content instead of the animation.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultCachedGif = Schema.Struct({
  type: Schema.Literal("gif"),
  id: Schema.String,
  gifFileId: Schema.String,
  title: Schema.optionalKey(Schema.String),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent)
}).pipe(
  Schema.encodeKeys({
    gifFileId: "gif_file_id",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultCachedGif.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultCachedGif = Schema.Schema.Type<typeof InlineQueryResultCachedGif>

/**
 * Represents a link to a video animation (H.264/MPEG-4 AVC video without sound) stored on the Telegram servers. By default, this animated MPEG-4 file will be sent by the user with an optional caption. Alternatively, you can use input_message_content to send a message with the specified content instead of the animation.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultCachedMpeg4Gif = Schema.Struct({
  type: Schema.Literal("mpeg4_gif"),
  id: Schema.String,
  mpeg4FileId: Schema.String,
  title: Schema.optionalKey(Schema.String),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent)
}).pipe(
  Schema.encodeKeys({
    mpeg4FileId: "mpeg4_file_id",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultCachedMpeg4Gif.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultCachedMpeg4Gif = Schema.Schema.Type<typeof InlineQueryResultCachedMpeg4Gif>

/**
 * Represents a link to a photo stored on the Telegram servers. By default, this photo will be sent by the user with an optional caption. Alternatively, you can use input_message_content to send a message with the specified content instead of the photo.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultCachedPhoto = Schema.Struct({
  type: Schema.Literal("photo"),
  id: Schema.String,
  photoFileId: Schema.String,
  title: Schema.optionalKey(Schema.String),
  description: Schema.optionalKey(Schema.String),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent)
}).pipe(
  Schema.encodeKeys({
    photoFileId: "photo_file_id",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultCachedPhoto.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultCachedPhoto = Schema.Schema.Type<typeof InlineQueryResultCachedPhoto>

/**
 * Represents a link to a sticker stored on the Telegram servers. By default, this sticker will be sent by the user. Alternatively, you can use input_message_content to send a message with the specified content instead of the sticker.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultCachedSticker = Schema.Struct({
  type: Schema.Literal("sticker"),
  id: Schema.String,
  stickerFileId: Schema.String,
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent)
}).pipe(
  Schema.encodeKeys({
    stickerFileId: "sticker_file_id",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultCachedSticker.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultCachedSticker = Schema.Schema.Type<typeof InlineQueryResultCachedSticker>

/**
 * Represents a link to a video file stored on the Telegram servers. By default, this video file will be sent by the user with an optional caption. Alternatively, you can use input_message_content to send a message with the specified content instead of the video.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultCachedVideo = Schema.Struct({
  type: Schema.Literal("video"),
  id: Schema.String,
  videoFileId: Schema.String,
  title: Schema.String,
  description: Schema.optionalKey(Schema.String),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent)
}).pipe(
  Schema.encodeKeys({
    videoFileId: "video_file_id",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultCachedVideo.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultCachedVideo = Schema.Schema.Type<typeof InlineQueryResultCachedVideo>

/**
 * Represents a link to a voice message stored on the Telegram servers. By default, this voice message will be sent by the user. Alternatively, you can use input_message_content to send a message with the specified content instead of the voice message.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultCachedVoice = Schema.Struct({
  type: Schema.Literal("voice"),
  id: Schema.String,
  voiceFileId: Schema.String,
  title: Schema.String,
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent)
}).pipe(
  Schema.encodeKeys({
    voiceFileId: "voice_file_id",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultCachedVoice.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultCachedVoice = Schema.Schema.Type<typeof InlineQueryResultCachedVoice>

/**
 * Represents a link to an article or web page.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultArticle = Schema.Struct({
  type: Schema.Literal("article"),
  id: Schema.String,
  title: Schema.String,
  inputMessageContent: InputMessageContent,
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  url: Schema.optionalKey(Schema.String),
  description: Schema.optionalKey(Schema.String),
  thumbnailUrl: Schema.optionalKey(Schema.String),
  thumbnailWidth: Schema.optionalKey(Schema.Number),
  thumbnailHeight: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    inputMessageContent: "input_message_content",
    replyMarkup: "reply_markup",
    thumbnailUrl: "thumbnail_url",
    thumbnailWidth: "thumbnail_width",
    thumbnailHeight: "thumbnail_height"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultArticle.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultArticle = Schema.Schema.Type<typeof InlineQueryResultArticle>

/**
 * Represents a link to an MP3 audio file. By default, this audio file will be sent by the user. Alternatively, you can use input_message_content to send a message with the specified content instead of the audio.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultAudio = Schema.Struct({
  type: Schema.Literal("audio"),
  id: Schema.String,
  audioUrl: Schema.String,
  title: Schema.String,
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  performer: Schema.optionalKey(Schema.String),
  audioDuration: Schema.optionalKey(Schema.Number),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent)
}).pipe(
  Schema.encodeKeys({
    audioUrl: "audio_url",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    audioDuration: "audio_duration",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultAudio.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultAudio = Schema.Schema.Type<typeof InlineQueryResultAudio>

/**
 * Represents a contact with a phone number. By default, this contact will be sent by the user. Alternatively, you can use input_message_content to send a message with the specified content instead of the contact.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultContact = Schema.Struct({
  type: Schema.Literal("contact"),
  id: Schema.String,
  phoneNumber: Schema.String,
  firstName: Schema.String,
  lastName: Schema.optionalKey(Schema.String),
  vcard: Schema.optionalKey(Schema.String),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent),
  thumbnailUrl: Schema.optionalKey(Schema.String),
  thumbnailWidth: Schema.optionalKey(Schema.Number),
  thumbnailHeight: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    phoneNumber: "phone_number",
    firstName: "first_name",
    lastName: "last_name",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content",
    thumbnailUrl: "thumbnail_url",
    thumbnailWidth: "thumbnail_width",
    thumbnailHeight: "thumbnail_height"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultContact.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultContact = Schema.Schema.Type<typeof InlineQueryResultContact>

/**
 * Represents a Game.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultGame = Schema.Struct({
  type: Schema.Literal("game"),
  id: Schema.String,
  gameShortName: Schema.String,
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup)
}).pipe(
  Schema.encodeKeys({
    gameShortName: "game_short_name",
    replyMarkup: "reply_markup"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultGame.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultGame = Schema.Schema.Type<typeof InlineQueryResultGame>

/**
 * Represents a link to a file. By default, this file will be sent by the user with an optional caption. Alternatively, you can use input_message_content to send a message with the specified content instead of the file. Currently, only .PDF and .ZIP files can be sent using this method.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultDocument = Schema.Struct({
  type: Schema.Literal("document"),
  id: Schema.String,
  title: Schema.String,
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  documentUrl: Schema.String,
  mimeType: Schema.String,
  description: Schema.optionalKey(Schema.String),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent),
  thumbnailUrl: Schema.optionalKey(Schema.String),
  thumbnailWidth: Schema.optionalKey(Schema.Number),
  thumbnailHeight: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    documentUrl: "document_url",
    mimeType: "mime_type",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content",
    thumbnailUrl: "thumbnail_url",
    thumbnailWidth: "thumbnail_width",
    thumbnailHeight: "thumbnail_height"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultDocument.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultDocument = Schema.Schema.Type<typeof InlineQueryResultDocument>

/**
 * Represents a link to an animated GIF file. By default, this animated GIF file will be sent by the user with optional caption. Alternatively, you can use input_message_content to send a message with the specified content instead of the animation.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultGif = Schema.Struct({
  type: Schema.Literal("gif"),
  id: Schema.String,
  gifUrl: Schema.String,
  gifWidth: Schema.optionalKey(Schema.Number),
  gifHeight: Schema.optionalKey(Schema.Number),
  gifDuration: Schema.optionalKey(Schema.Number),
  thumbnailUrl: Schema.String,
  thumbnailMimeType: Schema.optionalKey(Schema.String),
  title: Schema.optionalKey(Schema.String),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent)
}).pipe(
  Schema.encodeKeys({
    gifUrl: "gif_url",
    gifWidth: "gif_width",
    gifHeight: "gif_height",
    gifDuration: "gif_duration",
    thumbnailUrl: "thumbnail_url",
    thumbnailMimeType: "thumbnail_mime_type",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultGif.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultGif = Schema.Schema.Type<typeof InlineQueryResultGif>

/**
 * Represents a location on a map. By default, the location will be sent by the user. Alternatively, you can use input_message_content to send a message with the specified content instead of the location.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultLocation = Schema.Struct({
  type: Schema.Literal("location"),
  id: Schema.String,
  latitude: Schema.Number,
  longitude: Schema.Number,
  title: Schema.String,
  horizontalAccuracy: Schema.optionalKey(Schema.Number),
  livePeriod: Schema.optionalKey(Schema.Number),
  heading: Schema.optionalKey(Schema.Number),
  proximityAlertRadius: Schema.optionalKey(Schema.Number),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent),
  thumbnailUrl: Schema.optionalKey(Schema.String),
  thumbnailWidth: Schema.optionalKey(Schema.Number),
  thumbnailHeight: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    horizontalAccuracy: "horizontal_accuracy",
    livePeriod: "live_period",
    proximityAlertRadius: "proximity_alert_radius",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content",
    thumbnailUrl: "thumbnail_url",
    thumbnailWidth: "thumbnail_width",
    thumbnailHeight: "thumbnail_height"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultLocation.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultLocation = Schema.Schema.Type<typeof InlineQueryResultLocation>

/**
 * Represents a link to a video animation (H.264/MPEG-4 AVC video without sound). By default, this animated MPEG-4 file will be sent by the user with optional caption. Alternatively, you can use input_message_content to send a message with the specified content instead of the animation.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultMpeg4Gif = Schema.Struct({
  type: Schema.Literal("mpeg4_gif"),
  id: Schema.String,
  mpeg4Url: Schema.String,
  mpeg4Width: Schema.optionalKey(Schema.Number),
  mpeg4Height: Schema.optionalKey(Schema.Number),
  mpeg4Duration: Schema.optionalKey(Schema.Number),
  thumbnailUrl: Schema.String,
  thumbnailMimeType: Schema.optionalKey(Schema.String),
  title: Schema.optionalKey(Schema.String),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent)
}).pipe(
  Schema.encodeKeys({
    mpeg4Url: "mpeg4_url",
    mpeg4Width: "mpeg4_width",
    mpeg4Height: "mpeg4_height",
    mpeg4Duration: "mpeg4_duration",
    thumbnailUrl: "thumbnail_url",
    thumbnailMimeType: "thumbnail_mime_type",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultMpeg4Gif.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultMpeg4Gif = Schema.Schema.Type<typeof InlineQueryResultMpeg4Gif>

/**
 * Represents a link to a photo. By default, this photo will be sent by the user with optional caption. Alternatively, you can use input_message_content to send a message with the specified content instead of the photo.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultPhoto = Schema.Struct({
  type: Schema.Literal("photo"),
  id: Schema.String,
  photoUrl: Schema.String,
  thumbnailUrl: Schema.String,
  photoWidth: Schema.optionalKey(Schema.Number),
  photoHeight: Schema.optionalKey(Schema.Number),
  title: Schema.optionalKey(Schema.String),
  description: Schema.optionalKey(Schema.String),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent)
}).pipe(
  Schema.encodeKeys({
    photoUrl: "photo_url",
    thumbnailUrl: "thumbnail_url",
    photoWidth: "photo_width",
    photoHeight: "photo_height",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultPhoto.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultPhoto = Schema.Schema.Type<typeof InlineQueryResultPhoto>

/**
 * Represents a venue. By default, the venue will be sent by the user. Alternatively, you can use input_message_content to send a message with the specified content instead of the venue.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultVenue = Schema.Struct({
  type: Schema.Literal("venue"),
  id: Schema.String,
  latitude: Schema.Number,
  longitude: Schema.Number,
  title: Schema.String,
  address: Schema.String,
  foursquareId: Schema.optionalKey(Schema.String),
  foursquareType: Schema.optionalKey(Schema.String),
  googlePlaceId: Schema.optionalKey(Schema.String),
  googlePlaceType: Schema.optionalKey(Schema.String),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent),
  thumbnailUrl: Schema.optionalKey(Schema.String),
  thumbnailWidth: Schema.optionalKey(Schema.Number),
  thumbnailHeight: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    foursquareId: "foursquare_id",
    foursquareType: "foursquare_type",
    googlePlaceId: "google_place_id",
    googlePlaceType: "google_place_type",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content",
    thumbnailUrl: "thumbnail_url",
    thumbnailWidth: "thumbnail_width",
    thumbnailHeight: "thumbnail_height"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultVenue.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultVenue = Schema.Schema.Type<typeof InlineQueryResultVenue>

/**
 * Represents a link to a page containing an embedded video player or a video file. By default, this video file will be sent by the user with an optional caption. Alternatively, you can use input_message_content to send a message with the specified content instead of the video.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultVideo = Schema.Struct({
  type: Schema.Literal("video"),
  id: Schema.String,
  videoUrl: Schema.String,
  mimeType: Schema.String,
  thumbnailUrl: Schema.String,
  title: Schema.String,
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  videoWidth: Schema.optionalKey(Schema.Number),
  videoHeight: Schema.optionalKey(Schema.Number),
  videoDuration: Schema.optionalKey(Schema.Number),
  description: Schema.optionalKey(Schema.String),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent)
}).pipe(
  Schema.encodeKeys({
    videoUrl: "video_url",
    mimeType: "mime_type",
    thumbnailUrl: "thumbnail_url",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    videoWidth: "video_width",
    videoHeight: "video_height",
    videoDuration: "video_duration",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultVideo.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultVideo = Schema.Schema.Type<typeof InlineQueryResultVideo>

/**
 * Represents a link to a voice recording in an .OGG container encoded with OPUS. By default, this voice recording will be sent by the user. Alternatively, you can use input_message_content to send a message with the specified content instead of the the voice message.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultVoice = Schema.Struct({
  type: Schema.Literal("voice"),
  id: Schema.String,
  voiceUrl: Schema.String,
  title: Schema.String,
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  voiceDuration: Schema.optionalKey(Schema.Number),
  replyMarkup: Schema.optionalKey(InlineKeyboardMarkup),
  inputMessageContent: Schema.optionalKey(InputMessageContent)
}).pipe(
  Schema.encodeKeys({
    voiceUrl: "voice_url",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    voiceDuration: "voice_duration",
    replyMarkup: "reply_markup",
    inputMessageContent: "input_message_content"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultVoice.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultVoice = Schema.Schema.Type<typeof InlineQueryResultVoice>

/**
 * This object represents one result of an inline query. Telegram clients currently support results of the following 20 types: - InlineQueryResultCachedAudio - InlineQueryResultCachedDocument - InlineQueryResultCachedGif - InlineQueryResultCachedMpeg4Gif - InlineQueryResultCachedPhoto - InlineQueryResultCachedSticker - InlineQueryResultCachedVideo - InlineQueryResultCachedVoice - InlineQueryResultArticle - InlineQueryResultAudio - InlineQueryResultContact - InlineQueryResultGame - InlineQueryResultDocument - InlineQueryResultGif - InlineQueryResultLocation - InlineQueryResultMpeg4Gif - InlineQueryResultPhoto - InlineQueryResultVenue - InlineQueryResultVideo - InlineQueryResultVoice Note: All URLs passed in inline query results will be available to end users and therefore must be assumed to be public.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResult = Schema.Union([InlineQueryResultCachedAudio, InlineQueryResultCachedDocument, InlineQueryResultCachedGif, InlineQueryResultCachedMpeg4Gif, InlineQueryResultCachedPhoto, InlineQueryResultCachedSticker, InlineQueryResultCachedVideo, InlineQueryResultCachedVoice, InlineQueryResultArticle, InlineQueryResultAudio, InlineQueryResultContact, InlineQueryResultGame, InlineQueryResultDocument, InlineQueryResultGif, InlineQueryResultLocation, InlineQueryResultMpeg4Gif, InlineQueryResultPhoto, InlineQueryResultVenue, InlineQueryResultVideo, InlineQueryResultVoice])

/**
 * Decoded `camelCase` InlineQueryResult (union).
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResult = Schema.Schema.Type<typeof InlineQueryResult>

/**
 * This object represents a button to be shown above inline query results. You must use exactly one of the optional fields.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InlineQueryResultsButton = Schema.Struct({
  text: Schema.String,
  webApp: Schema.optionalKey(WebAppInfo),
  startParameter: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    webApp: "web_app",
    startParameter: "start_parameter"
  })
)

/**
 * Decoded `camelCase` InlineQueryResultsButton.
 *
 * @category models
 * @since 0.1.0
 */
export type InlineQueryResultsButton = Schema.Schema.Type<typeof InlineQueryResultsButton>

/**
 * Describes a task to add to a checklist.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputChecklistTask = Schema.Struct({
  id: Schema.Number,
  text: Schema.String,
  parseMode: Schema.optionalKey(Schema.String),
  textEntities: Schema.optionalKey(Schema.Array(MessageEntity))
}).pipe(
  Schema.encodeKeys({
    parseMode: "parse_mode",
    textEntities: "text_entities"
  })
)

/**
 * Decoded `camelCase` InputChecklistTask.
 *
 * @category models
 * @since 0.1.0
 */
export type InputChecklistTask = Schema.Schema.Type<typeof InputChecklistTask>

/**
 * Describes a checklist to create.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputChecklist = Schema.Struct({
  title: Schema.String,
  parseMode: Schema.optionalKey(Schema.String),
  titleEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  tasks: Schema.Array(InputChecklistTask),
  othersCanAddTasks: Schema.optionalKey(Schema.Boolean),
  othersCanMarkTasksAsDone: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    parseMode: "parse_mode",
    titleEntities: "title_entities",
    othersCanAddTasks: "others_can_add_tasks",
    othersCanMarkTasksAsDone: "others_can_mark_tasks_as_done"
  })
)

/**
 * Decoded `camelCase` InputChecklist.
 *
 * @category models
 * @since 0.1.0
 */
export type InputChecklist = Schema.Schema.Type<typeof InputChecklist>

/**
 * Represents an animation file (GIF or H.264/MPEG-4 AVC video without sound) to be sent.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputMediaAnimation = Schema.Struct({
  type: Schema.Literal("animation"),
  media: Schema.Union([InputFile, Schema.String]),
  thumbnail: Schema.optionalKey(Schema.Union([InputFile, Schema.String])),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  width: Schema.optionalKey(Schema.Number),
  height: Schema.optionalKey(Schema.Number),
  duration: Schema.optionalKey(Schema.Number),
  hasSpoiler: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    hasSpoiler: "has_spoiler"
  })
)

/**
 * Decoded `camelCase` InputMediaAnimation.
 *
 * @category models
 * @since 0.1.0
 */
export type InputMediaAnimation = Schema.Schema.Type<typeof InputMediaAnimation>

/**
 * Represents an audio file to be treated as music to be sent.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputMediaAudio = Schema.Struct({
  type: Schema.Literal("audio"),
  media: Schema.Union([InputFile, Schema.String]),
  thumbnail: Schema.optionalKey(Schema.Union([InputFile, Schema.String])),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  duration: Schema.optionalKey(Schema.Number),
  performer: Schema.optionalKey(Schema.String),
  title: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    parseMode: "parse_mode",
    captionEntities: "caption_entities"
  })
)

/**
 * Decoded `camelCase` InputMediaAudio.
 *
 * @category models
 * @since 0.1.0
 */
export type InputMediaAudio = Schema.Schema.Type<typeof InputMediaAudio>

/**
 * Represents a general file to be sent.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputMediaDocument = Schema.Struct({
  type: Schema.Literal("document"),
  media: Schema.Union([InputFile, Schema.String]),
  thumbnail: Schema.optionalKey(Schema.Union([InputFile, Schema.String])),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  disableContentTypeDetection: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    disableContentTypeDetection: "disable_content_type_detection"
  })
)

/**
 * Decoded `camelCase` InputMediaDocument.
 *
 * @category models
 * @since 0.1.0
 */
export type InputMediaDocument = Schema.Schema.Type<typeof InputMediaDocument>

/**
 * Represents a live photo to be sent.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputMediaLivePhoto = Schema.Struct({
  type: Schema.Literal("live_photo"),
  media: Schema.Union([InputFile, Schema.String]),
  photo: Schema.Union([InputFile, Schema.String]),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  hasSpoiler: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    hasSpoiler: "has_spoiler"
  })
)

/**
 * Decoded `camelCase` InputMediaLivePhoto.
 *
 * @category models
 * @since 0.1.0
 */
export type InputMediaLivePhoto = Schema.Schema.Type<typeof InputMediaLivePhoto>

/**
 * Represents a photo to be sent.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputMediaPhoto = Schema.Struct({
  type: Schema.Literal("photo"),
  media: Schema.Union([InputFile, Schema.String]),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  hasSpoiler: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    hasSpoiler: "has_spoiler"
  })
)

/**
 * Decoded `camelCase` InputMediaPhoto.
 *
 * @category models
 * @since 0.1.0
 */
export type InputMediaPhoto = Schema.Schema.Type<typeof InputMediaPhoto>

/**
 * Represents a video to be sent.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputMediaVideo = Schema.Struct({
  type: Schema.Literal("video"),
  media: Schema.Union([InputFile, Schema.String]),
  thumbnail: Schema.optionalKey(Schema.Union([InputFile, Schema.String])),
  cover: Schema.optionalKey(Schema.Union([InputFile, Schema.String])),
  startTimestamp: Schema.optionalKey(Schema.Number),
  caption: Schema.optionalKey(Schema.String),
  parseMode: Schema.optionalKey(Schema.String),
  captionEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  showCaptionAboveMedia: Schema.optionalKey(Schema.Boolean),
  width: Schema.optionalKey(Schema.Number),
  height: Schema.optionalKey(Schema.Number),
  duration: Schema.optionalKey(Schema.Number),
  supportsStreaming: Schema.optionalKey(Schema.Boolean),
  hasSpoiler: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    startTimestamp: "start_timestamp",
    parseMode: "parse_mode",
    captionEntities: "caption_entities",
    showCaptionAboveMedia: "show_caption_above_media",
    supportsStreaming: "supports_streaming",
    hasSpoiler: "has_spoiler"
  })
)

/**
 * Decoded `camelCase` InputMediaVideo.
 *
 * @category models
 * @since 0.1.0
 */
export type InputMediaVideo = Schema.Schema.Type<typeof InputMediaVideo>

/**
 * This object represents the content of a media message to be sent. It should be one of - InputMediaAnimation - InputMediaAudio - InputMediaDocument - InputMediaLivePhoto - InputMediaPhoto - InputMediaVideo
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputMedia = Schema.Union([InputMediaAnimation, InputMediaAudio, InputMediaDocument, InputMediaLivePhoto, InputMediaPhoto, InputMediaVideo])

/**
 * Decoded `camelCase` InputMedia (union).
 *
 * @category models
 * @since 0.1.0
 */
export type InputMedia = Schema.Schema.Type<typeof InputMedia>

/**
 * Represents an HTTP link to be sent.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputMediaLink = Schema.Struct({
  type: Schema.Literal("link"),
  url: Schema.String
})

/**
 * Decoded `camelCase` InputMediaLink.
 *
 * @category models
 * @since 0.1.0
 */
export type InputMediaLink = Schema.Schema.Type<typeof InputMediaLink>

/**
 * Represents a location to be sent.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputMediaLocation = Schema.Struct({
  type: Schema.Literal("location"),
  latitude: Schema.Number,
  longitude: Schema.Number,
  horizontalAccuracy: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    horizontalAccuracy: "horizontal_accuracy"
  })
)

/**
 * Decoded `camelCase` InputMediaLocation.
 *
 * @category models
 * @since 0.1.0
 */
export type InputMediaLocation = Schema.Schema.Type<typeof InputMediaLocation>

/**
 * Represents a sticker file to be sent.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputMediaSticker = Schema.Struct({
  type: Schema.Literal("sticker"),
  media: Schema.Union([InputFile, Schema.String]),
  emoji: Schema.optionalKey(Schema.String)
})

/**
 * Decoded `camelCase` InputMediaSticker.
 *
 * @category models
 * @since 0.1.0
 */
export type InputMediaSticker = Schema.Schema.Type<typeof InputMediaSticker>

/**
 * Represents a venue to be sent.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputMediaVenue = Schema.Struct({
  type: Schema.Literal("venue"),
  latitude: Schema.Number,
  longitude: Schema.Number,
  title: Schema.String,
  address: Schema.String,
  foursquareId: Schema.optionalKey(Schema.String),
  foursquareType: Schema.optionalKey(Schema.String),
  googlePlaceId: Schema.optionalKey(Schema.String),
  googlePlaceType: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    foursquareId: "foursquare_id",
    foursquareType: "foursquare_type",
    googlePlaceId: "google_place_id",
    googlePlaceType: "google_place_type"
  })
)

/**
 * Decoded `camelCase` InputMediaVenue.
 *
 * @category models
 * @since 0.1.0
 */
export type InputMediaVenue = Schema.Schema.Type<typeof InputMediaVenue>

/**
 * The paid media to send is a live photo.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputPaidMediaLivePhoto = Schema.Struct({
  type: Schema.Literal("live_photo"),
  media: Schema.Union([InputFile, Schema.String]),
  photo: Schema.Union([InputFile, Schema.String])
})

/**
 * Decoded `camelCase` InputPaidMediaLivePhoto.
 *
 * @category models
 * @since 0.1.0
 */
export type InputPaidMediaLivePhoto = Schema.Schema.Type<typeof InputPaidMediaLivePhoto>

/**
 * The paid media to send is a photo.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputPaidMediaPhoto = Schema.Struct({
  type: Schema.Literal("photo"),
  media: Schema.Union([InputFile, Schema.String])
})

/**
 * Decoded `camelCase` InputPaidMediaPhoto.
 *
 * @category models
 * @since 0.1.0
 */
export type InputPaidMediaPhoto = Schema.Schema.Type<typeof InputPaidMediaPhoto>

/**
 * The paid media to send is a video.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputPaidMediaVideo = Schema.Struct({
  type: Schema.Literal("video"),
  media: Schema.Union([InputFile, Schema.String]),
  thumbnail: Schema.optionalKey(Schema.Union([InputFile, Schema.String])),
  cover: Schema.optionalKey(Schema.Union([InputFile, Schema.String])),
  startTimestamp: Schema.optionalKey(Schema.Number),
  width: Schema.optionalKey(Schema.Number),
  height: Schema.optionalKey(Schema.Number),
  duration: Schema.optionalKey(Schema.Number),
  supportsStreaming: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    startTimestamp: "start_timestamp",
    supportsStreaming: "supports_streaming"
  })
)

/**
 * Decoded `camelCase` InputPaidMediaVideo.
 *
 * @category models
 * @since 0.1.0
 */
export type InputPaidMediaVideo = Schema.Schema.Type<typeof InputPaidMediaVideo>

/**
 * This object describes the paid media to be sent. Currently, it can be one of - InputPaidMediaLivePhoto - InputPaidMediaPhoto - InputPaidMediaVideo
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputPaidMedia = Schema.Union([InputPaidMediaLivePhoto, InputPaidMediaPhoto, InputPaidMediaVideo])

/**
 * Decoded `camelCase` InputPaidMedia (union).
 *
 * @category models
 * @since 0.1.0
 */
export type InputPaidMedia = Schema.Schema.Type<typeof InputPaidMedia>

/**
 * This object represents the content of a poll description or a quiz explanation to be sent. It should be one of - InputMediaAnimation - InputMediaAudio - InputMediaDocument - InputMediaLivePhoto - InputMediaLocation - InputMediaPhoto - InputMediaVenue - InputMediaVideo
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputPollMedia = Schema.Union([InputMediaAnimation, InputMediaAudio, InputMediaDocument, InputMediaLivePhoto, InputMediaLocation, InputMediaPhoto, InputMediaVenue, InputMediaVideo])

/**
 * Decoded `camelCase` InputPollMedia (union).
 *
 * @category models
 * @since 0.1.0
 */
export type InputPollMedia = Schema.Schema.Type<typeof InputPollMedia>

/**
 * This object represents the content of a poll option to be sent. It should be one of - InputMediaAnimation - InputMediaLink - InputMediaLivePhoto - InputMediaLocation - InputMediaPhoto - InputMediaSticker - InputMediaVenue - InputMediaVideo
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputPollOptionMedia = Schema.Union([InputMediaAnimation, InputMediaLink, InputMediaLivePhoto, InputMediaLocation, InputMediaPhoto, InputMediaSticker, InputMediaVenue, InputMediaVideo])

/**
 * Decoded `camelCase` InputPollOptionMedia (union).
 *
 * @category models
 * @since 0.1.0
 */
export type InputPollOptionMedia = Schema.Schema.Type<typeof InputPollOptionMedia>

/**
 * This object contains information about one answer option in a poll to be sent.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputPollOption = Schema.Struct({
  text: Schema.String,
  textParseMode: Schema.optionalKey(Schema.String),
  textEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  media: Schema.optionalKey(InputPollOptionMedia)
}).pipe(
  Schema.encodeKeys({
    textParseMode: "text_parse_mode",
    textEntities: "text_entities"
  })
)

/**
 * Decoded `camelCase` InputPollOption.
 *
 * @category models
 * @since 0.1.0
 */
export type InputPollOption = Schema.Schema.Type<typeof InputPollOption>

/**
 * A static profile photo in the .JPG format.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputProfilePhotoStatic = Schema.Struct({
  type: Schema.Literal("static"),
  photo: Schema.Union([InputFile, Schema.String])
})

/**
 * Decoded `camelCase` InputProfilePhotoStatic.
 *
 * @category models
 * @since 0.1.0
 */
export type InputProfilePhotoStatic = Schema.Schema.Type<typeof InputProfilePhotoStatic>

/**
 * An animated profile photo in the MPEG4 format.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputProfilePhotoAnimated = Schema.Struct({
  type: Schema.Literal("animated"),
  animation: Schema.Union([InputFile, Schema.String]),
  mainFrameTimestamp: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    mainFrameTimestamp: "main_frame_timestamp"
  })
)

/**
 * Decoded `camelCase` InputProfilePhotoAnimated.
 *
 * @category models
 * @since 0.1.0
 */
export type InputProfilePhotoAnimated = Schema.Schema.Type<typeof InputProfilePhotoAnimated>

/**
 * This object describes a profile photo to set. Currently, it can be one of - InputProfilePhotoStatic - InputProfilePhotoAnimated
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputProfilePhoto = Schema.Union([InputProfilePhotoStatic, InputProfilePhotoAnimated])

/**
 * Decoded `camelCase` InputProfilePhoto (union).
 *
 * @category models
 * @since 0.1.0
 */
export type InputProfilePhoto = Schema.Schema.Type<typeof InputProfilePhoto>

/**
 * This object describes a sticker to be added to a sticker set.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputSticker = Schema.Struct({
  sticker: Schema.Union([InputFile, Schema.String]),
  format: Schema.String,
  emojiList: Schema.Array(Schema.String),
  maskPosition: Schema.optionalKey(MaskPosition),
  keywords: Schema.optionalKey(Schema.Array(Schema.String))
}).pipe(
  Schema.encodeKeys({
    emojiList: "emoji_list",
    maskPosition: "mask_position"
  })
)

/**
 * Decoded `camelCase` InputSticker.
 *
 * @category models
 * @since 0.1.0
 */
export type InputSticker = Schema.Schema.Type<typeof InputSticker>

/**
 * Describes a photo to post as a story.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputStoryContentPhoto = Schema.Struct({
  type: Schema.Literal("photo"),
  photo: Schema.Union([InputFile, Schema.String])
})

/**
 * Decoded `camelCase` InputStoryContentPhoto.
 *
 * @category models
 * @since 0.1.0
 */
export type InputStoryContentPhoto = Schema.Schema.Type<typeof InputStoryContentPhoto>

/**
 * Describes a video to post as a story.
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputStoryContentVideo = Schema.Struct({
  type: Schema.Literal("video"),
  video: Schema.Union([InputFile, Schema.String]),
  duration: Schema.optionalKey(Schema.Number),
  coverFrameTimestamp: Schema.optionalKey(Schema.Number),
  isAnimation: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    coverFrameTimestamp: "cover_frame_timestamp",
    isAnimation: "is_animation"
  })
)

/**
 * Decoded `camelCase` InputStoryContentVideo.
 *
 * @category models
 * @since 0.1.0
 */
export type InputStoryContentVideo = Schema.Schema.Type<typeof InputStoryContentVideo>

/**
 * This object describes the content of a story to post. Currently, it can be one of - InputStoryContentPhoto - InputStoryContentVideo
 *
 * @category schemas
 * @since 0.1.0
 */
export const InputStoryContent = Schema.Union([InputStoryContentPhoto, InputStoryContentVideo])

/**
 * Decoded `camelCase` InputStoryContent (union).
 *
 * @category models
 * @since 0.1.0
 */
export type InputStoryContent = Schema.Schema.Type<typeof InputStoryContent>

/**
 * This object defines the criteria used to request suitable users. Information about the selected users will be shared with the bot when the corresponding button is pressed. More about requesting users: https://core.telegram.org/bots/features#chat-and-user-selection
 *
 * @category schemas
 * @since 0.1.0
 */
export const KeyboardButtonRequestUsers = Schema.Struct({
  requestId: Schema.Number,
  userIsBot: Schema.optionalKey(Schema.Boolean),
  userIsPremium: Schema.optionalKey(Schema.Boolean),
  maxQuantity: Schema.optionalKey(Schema.Number),
  requestName: Schema.optionalKey(Schema.Boolean),
  requestUsername: Schema.optionalKey(Schema.Boolean),
  requestPhoto: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    requestId: "request_id",
    userIsBot: "user_is_bot",
    userIsPremium: "user_is_premium",
    maxQuantity: "max_quantity",
    requestName: "request_name",
    requestUsername: "request_username",
    requestPhoto: "request_photo"
  })
)

/**
 * Decoded `camelCase` KeyboardButtonRequestUsers.
 *
 * @category models
 * @since 0.1.0
 */
export type KeyboardButtonRequestUsers = Schema.Schema.Type<typeof KeyboardButtonRequestUsers>

/**
 * This object defines the criteria used to request a suitable chat. Information about the selected chat will be shared with the bot when the corresponding button is pressed. The bot will be granted requested rights in the chat if appropriate. More about requesting chats: https://core.telegram.org/bots/features#chat-and-user-selection.
 *
 * @category schemas
 * @since 0.1.0
 */
export const KeyboardButtonRequestChat = Schema.Struct({
  requestId: Schema.Number,
  chatIsChannel: Schema.Boolean,
  chatIsForum: Schema.optionalKey(Schema.Boolean),
  chatHasUsername: Schema.optionalKey(Schema.Boolean),
  chatIsCreated: Schema.optionalKey(Schema.Boolean),
  userAdministratorRights: Schema.optionalKey(ChatAdministratorRights),
  botAdministratorRights: Schema.optionalKey(ChatAdministratorRights),
  botIsMember: Schema.optionalKey(Schema.Boolean),
  requestTitle: Schema.optionalKey(Schema.Boolean),
  requestUsername: Schema.optionalKey(Schema.Boolean),
  requestPhoto: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    requestId: "request_id",
    chatIsChannel: "chat_is_channel",
    chatIsForum: "chat_is_forum",
    chatHasUsername: "chat_has_username",
    chatIsCreated: "chat_is_created",
    userAdministratorRights: "user_administrator_rights",
    botAdministratorRights: "bot_administrator_rights",
    botIsMember: "bot_is_member",
    requestTitle: "request_title",
    requestUsername: "request_username",
    requestPhoto: "request_photo"
  })
)

/**
 * Decoded `camelCase` KeyboardButtonRequestChat.
 *
 * @category models
 * @since 0.1.0
 */
export type KeyboardButtonRequestChat = Schema.Schema.Type<typeof KeyboardButtonRequestChat>

/**
 * This object defines the parameters for the creation of a managed bot. Information about the created bot will be shared with the bot using the update managed_bot and a Message with the field managed_bot_created.
 *
 * @category schemas
 * @since 0.1.0
 */
export const KeyboardButtonRequestManagedBot = Schema.Struct({
  requestId: Schema.Number,
  suggestedName: Schema.optionalKey(Schema.String),
  suggestedUsername: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    requestId: "request_id",
    suggestedName: "suggested_name",
    suggestedUsername: "suggested_username"
  })
)

/**
 * Decoded `camelCase` KeyboardButtonRequestManagedBot.
 *
 * @category models
 * @since 0.1.0
 */
export type KeyboardButtonRequestManagedBot = Schema.Schema.Type<typeof KeyboardButtonRequestManagedBot>

/**
 * This object represents type of a poll, which is allowed to be created and sent when the corresponding button is pressed.
 *
 * @category schemas
 * @since 0.1.0
 */
export const KeyboardButtonPollType = Schema.Struct({
  type: Schema.optionalKey(Schema.String)
})

/**
 * Decoded `camelCase` KeyboardButtonPollType.
 *
 * @category models
 * @since 0.1.0
 */
export type KeyboardButtonPollType = Schema.Schema.Type<typeof KeyboardButtonPollType>

/**
 * This object represents one button of the reply keyboard. At most one of the fields other than text, icon_custom_emoji_id, and style must be used to specify the type of the button. For simple text buttons, String can be used instead of this object to specify the button text.
 *
 * @category schemas
 * @since 0.1.0
 */
export const KeyboardButton = Schema.Struct({
  text: Schema.String,
  iconCustomEmojiId: Schema.optionalKey(Schema.String),
  style: Schema.optionalKey(Schema.String),
  requestUsers: Schema.optionalKey(KeyboardButtonRequestUsers),
  requestChat: Schema.optionalKey(KeyboardButtonRequestChat),
  requestManagedBot: Schema.optionalKey(KeyboardButtonRequestManagedBot),
  requestContact: Schema.optionalKey(Schema.Boolean),
  requestLocation: Schema.optionalKey(Schema.Boolean),
  requestPoll: Schema.optionalKey(KeyboardButtonPollType),
  webApp: Schema.optionalKey(WebAppInfo)
}).pipe(
  Schema.encodeKeys({
    iconCustomEmojiId: "icon_custom_emoji_id",
    requestUsers: "request_users",
    requestChat: "request_chat",
    requestManagedBot: "request_managed_bot",
    requestContact: "request_contact",
    requestLocation: "request_location",
    requestPoll: "request_poll",
    webApp: "web_app"
  })
)

/**
 * Decoded `camelCase` KeyboardButton.
 *
 * @category models
 * @since 0.1.0
 */
export type KeyboardButton = Schema.Schema.Type<typeof KeyboardButton>

/**
 * Describes the physical address of a location.
 *
 * @category schemas
 * @since 0.1.0
 */
export const LocationAddress = Schema.Struct({
  countryCode: Schema.String,
  state: Schema.optionalKey(Schema.String),
  city: Schema.optionalKey(Schema.String),
  street: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    countryCode: "country_code"
  })
)

/**
 * Decoded `camelCase` LocationAddress.
 *
 * @category models
 * @since 0.1.0
 */
export type LocationAddress = Schema.Schema.Type<typeof LocationAddress>

/**
 * This object contains information about the creation, token update, or owner update of a bot that is managed by the current bot.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ManagedBotUpdated = Schema.Struct({
  user: User,
  bot: User
})

/**
 * Decoded `camelCase` ManagedBotUpdated.
 *
 * @category models
 * @since 0.1.0
 */
export type ManagedBotUpdated = Schema.Schema.Type<typeof ManagedBotUpdated>

/**
 * Represents a menu button, which opens the bot's list of commands.
 *
 * @category schemas
 * @since 0.1.0
 */
export const MenuButtonCommands = Schema.Struct({
  type: Schema.Literal("commands")
})

/**
 * Decoded `camelCase` MenuButtonCommands.
 *
 * @category models
 * @since 0.1.0
 */
export type MenuButtonCommands = Schema.Schema.Type<typeof MenuButtonCommands>

/**
 * Represents a menu button, which launches a Web App.
 *
 * @category schemas
 * @since 0.1.0
 */
export const MenuButtonWebApp = Schema.Struct({
  type: Schema.Literal("web_app"),
  text: Schema.String,
  webApp: WebAppInfo
}).pipe(
  Schema.encodeKeys({
    webApp: "web_app"
  })
)

/**
 * Decoded `camelCase` MenuButtonWebApp.
 *
 * @category models
 * @since 0.1.0
 */
export type MenuButtonWebApp = Schema.Schema.Type<typeof MenuButtonWebApp>

/**
 * Describes that no specific value for the menu button was set.
 *
 * @category schemas
 * @since 0.1.0
 */
export const MenuButtonDefault = Schema.Struct({
  type: Schema.Literal("default")
})

/**
 * Decoded `camelCase` MenuButtonDefault.
 *
 * @category models
 * @since 0.1.0
 */
export type MenuButtonDefault = Schema.Schema.Type<typeof MenuButtonDefault>

/**
 * This object describes the bot's menu button in a private chat. It should be one of - MenuButtonCommands - MenuButtonWebApp - MenuButtonDefault If a menu button other than MenuButtonDefault is set for a private chat, then it is applied in the chat. Otherwise the default menu button is applied. By default, the menu button opens the list of bot commands.
 *
 * @category schemas
 * @since 0.1.0
 */
export const MenuButton = Schema.Union([MenuButtonCommands, MenuButtonWebApp, MenuButtonDefault])

/**
 * Decoded `camelCase` MenuButton (union).
 *
 * @category models
 * @since 0.1.0
 */
export type MenuButton = Schema.Schema.Type<typeof MenuButton>

/**
 * This object represents a unique message identifier.
 *
 * @category schemas
 * @since 0.1.0
 */
export const MessageId = Schema.Struct({
  messageId: Schema.Number
}).pipe(
  Schema.encodeKeys({
    messageId: "message_id"
  })
)

/**
 * Decoded `camelCase` MessageId.
 *
 * @category models
 * @since 0.1.0
 */
export type MessageId = Schema.Schema.Type<typeof MessageId>

/**
 * Represents a reaction added to a message along with the number of times it was added.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ReactionCount = Schema.Struct({
  type: ReactionType,
  totalCount: Schema.Number
}).pipe(
  Schema.encodeKeys({
    totalCount: "total_count"
  })
)

/**
 * Decoded `camelCase` ReactionCount.
 *
 * @category models
 * @since 0.1.0
 */
export type ReactionCount = Schema.Schema.Type<typeof ReactionCount>

/**
 * This object represents reaction changes on a message with anonymous reactions.
 *
 * @category schemas
 * @since 0.1.0
 */
export const MessageReactionCountUpdated = Schema.Struct({
  chat: Chat,
  messageId: Schema.Number,
  date: Schema.Number,
  reactions: Schema.Array(ReactionCount)
}).pipe(
  Schema.encodeKeys({
    messageId: "message_id"
  })
)

/**
 * Decoded `camelCase` MessageReactionCountUpdated.
 *
 * @category models
 * @since 0.1.0
 */
export type MessageReactionCountUpdated = Schema.Schema.Type<typeof MessageReactionCountUpdated>

/**
 * This object represents a change of a reaction on a message performed by a user.
 *
 * @category schemas
 * @since 0.1.0
 */
export const MessageReactionUpdated = Schema.Struct({
  chat: Chat,
  messageId: Schema.Number,
  user: Schema.optionalKey(User),
  actorChat: Schema.optionalKey(Chat),
  date: Schema.Number,
  oldReaction: Schema.Array(ReactionType),
  newReaction: Schema.Array(ReactionType)
}).pipe(
  Schema.encodeKeys({
    messageId: "message_id",
    actorChat: "actor_chat",
    oldReaction: "old_reaction",
    newReaction: "new_reaction"
  })
)

/**
 * Decoded `camelCase` MessageReactionUpdated.
 *
 * @category models
 * @since 0.1.0
 */
export type MessageReactionUpdated = Schema.Schema.Type<typeof MessageReactionUpdated>

/**
 * Describes a regular gift owned by a user or a chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const OwnedGiftRegular = Schema.Struct({
  type: Schema.Literal("regular"),
  gift: Gift,
  ownedGiftId: Schema.optionalKey(Schema.String),
  senderUser: Schema.optionalKey(User),
  sendDate: Schema.Number,
  text: Schema.optionalKey(Schema.String),
  entities: Schema.optionalKey(Schema.Array(MessageEntity)),
  isPrivate: Schema.optionalKey(Schema.Boolean),
  isSaved: Schema.optionalKey(Schema.Boolean),
  canBeUpgraded: Schema.optionalKey(Schema.Boolean),
  wasRefunded: Schema.optionalKey(Schema.Boolean),
  convertStarCount: Schema.optionalKey(Schema.Number),
  prepaidUpgradeStarCount: Schema.optionalKey(Schema.Number),
  isUpgradeSeparate: Schema.optionalKey(Schema.Boolean),
  uniqueGiftNumber: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    ownedGiftId: "owned_gift_id",
    senderUser: "sender_user",
    sendDate: "send_date",
    isPrivate: "is_private",
    isSaved: "is_saved",
    canBeUpgraded: "can_be_upgraded",
    wasRefunded: "was_refunded",
    convertStarCount: "convert_star_count",
    prepaidUpgradeStarCount: "prepaid_upgrade_star_count",
    isUpgradeSeparate: "is_upgrade_separate",
    uniqueGiftNumber: "unique_gift_number"
  })
)

/**
 * Decoded `camelCase` OwnedGiftRegular.
 *
 * @category models
 * @since 0.1.0
 */
export type OwnedGiftRegular = Schema.Schema.Type<typeof OwnedGiftRegular>

/**
 * Describes a unique gift received and owned by a user or a chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const OwnedGiftUnique = Schema.Struct({
  type: Schema.Literal("unique"),
  gift: UniqueGift,
  ownedGiftId: Schema.optionalKey(Schema.String),
  senderUser: Schema.optionalKey(User),
  sendDate: Schema.Number,
  isSaved: Schema.optionalKey(Schema.Boolean),
  canBeTransferred: Schema.optionalKey(Schema.Boolean),
  transferStarCount: Schema.optionalKey(Schema.Number),
  nextTransferDate: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    ownedGiftId: "owned_gift_id",
    senderUser: "sender_user",
    sendDate: "send_date",
    isSaved: "is_saved",
    canBeTransferred: "can_be_transferred",
    transferStarCount: "transfer_star_count",
    nextTransferDate: "next_transfer_date"
  })
)

/**
 * Decoded `camelCase` OwnedGiftUnique.
 *
 * @category models
 * @since 0.1.0
 */
export type OwnedGiftUnique = Schema.Schema.Type<typeof OwnedGiftUnique>

/**
 * This object describes a gift received and owned by a user or a chat. Currently, it can be one of - OwnedGiftRegular - OwnedGiftUnique
 *
 * @category schemas
 * @since 0.1.0
 */
export const OwnedGift = Schema.Union([OwnedGiftRegular, OwnedGiftUnique])

/**
 * Decoded `camelCase` OwnedGift (union).
 *
 * @category models
 * @since 0.1.0
 */
export type OwnedGift = Schema.Schema.Type<typeof OwnedGift>

/**
 * Contains the list of gifts received and owned by a user or a chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const OwnedGifts = Schema.Struct({
  totalCount: Schema.Number,
  gifts: Schema.Array(OwnedGift),
  nextOffset: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    totalCount: "total_count",
    nextOffset: "next_offset"
  })
)

/**
 * Decoded `camelCase` OwnedGifts.
 *
 * @category models
 * @since 0.1.0
 */
export type OwnedGifts = Schema.Schema.Type<typeof OwnedGifts>

/**
 * This object contains information about a paid media purchase.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PaidMediaPurchased = Schema.Struct({
  from: User,
  paidMediaPayload: Schema.String
}).pipe(
  Schema.encodeKeys({
    paidMediaPayload: "paid_media_payload"
  })
)

/**
 * Decoded `camelCase` PaidMediaPurchased.
 *
 * @category models
 * @since 0.1.0
 */
export type PaidMediaPurchased = Schema.Schema.Type<typeof PaidMediaPurchased>

/**
 * Represents an issue in one of the data fields that was provided by the user. The error is considered resolved when the field's value changes.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PassportElementErrorDataField = Schema.Struct({
  source: Schema.Literal("data"),
  type: Schema.String,
  fieldName: Schema.String,
  dataHash: Schema.String,
  message: Schema.String
}).pipe(
  Schema.encodeKeys({
    fieldName: "field_name",
    dataHash: "data_hash"
  })
)

/**
 * Decoded `camelCase` PassportElementErrorDataField.
 *
 * @category models
 * @since 0.1.0
 */
export type PassportElementErrorDataField = Schema.Schema.Type<typeof PassportElementErrorDataField>

/**
 * Represents an issue with the front side of a document. The error is considered resolved when the file with the front side of the document changes.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PassportElementErrorFrontSide = Schema.Struct({
  source: Schema.Literal("front_side"),
  type: Schema.String,
  fileHash: Schema.String,
  message: Schema.String
}).pipe(
  Schema.encodeKeys({
    fileHash: "file_hash"
  })
)

/**
 * Decoded `camelCase` PassportElementErrorFrontSide.
 *
 * @category models
 * @since 0.1.0
 */
export type PassportElementErrorFrontSide = Schema.Schema.Type<typeof PassportElementErrorFrontSide>

/**
 * Represents an issue with the reverse side of a document. The error is considered resolved when the file with reverse side of the document changes.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PassportElementErrorReverseSide = Schema.Struct({
  source: Schema.Literal("reverse_side"),
  type: Schema.String,
  fileHash: Schema.String,
  message: Schema.String
}).pipe(
  Schema.encodeKeys({
    fileHash: "file_hash"
  })
)

/**
 * Decoded `camelCase` PassportElementErrorReverseSide.
 *
 * @category models
 * @since 0.1.0
 */
export type PassportElementErrorReverseSide = Schema.Schema.Type<typeof PassportElementErrorReverseSide>

/**
 * Represents an issue with the selfie with a document. The error is considered resolved when the file with the selfie changes.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PassportElementErrorSelfie = Schema.Struct({
  source: Schema.Literal("selfie"),
  type: Schema.String,
  fileHash: Schema.String,
  message: Schema.String
}).pipe(
  Schema.encodeKeys({
    fileHash: "file_hash"
  })
)

/**
 * Decoded `camelCase` PassportElementErrorSelfie.
 *
 * @category models
 * @since 0.1.0
 */
export type PassportElementErrorSelfie = Schema.Schema.Type<typeof PassportElementErrorSelfie>

/**
 * Represents an issue with a document scan. The error is considered resolved when the file with the document scan changes.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PassportElementErrorFile = Schema.Struct({
  source: Schema.Literal("file"),
  type: Schema.String,
  fileHash: Schema.String,
  message: Schema.String
}).pipe(
  Schema.encodeKeys({
    fileHash: "file_hash"
  })
)

/**
 * Decoded `camelCase` PassportElementErrorFile.
 *
 * @category models
 * @since 0.1.0
 */
export type PassportElementErrorFile = Schema.Schema.Type<typeof PassportElementErrorFile>

/**
 * Represents an issue with a list of scans. The error is considered resolved when the list of files containing the scans changes.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PassportElementErrorFiles = Schema.Struct({
  source: Schema.Literal("files"),
  type: Schema.String,
  fileHashes: Schema.Array(Schema.String),
  message: Schema.String
}).pipe(
  Schema.encodeKeys({
    fileHashes: "file_hashes"
  })
)

/**
 * Decoded `camelCase` PassportElementErrorFiles.
 *
 * @category models
 * @since 0.1.0
 */
export type PassportElementErrorFiles = Schema.Schema.Type<typeof PassportElementErrorFiles>

/**
 * Represents an issue with one of the files that constitute the translation of a document. The error is considered resolved when the file changes.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PassportElementErrorTranslationFile = Schema.Struct({
  source: Schema.Literal("translation_file"),
  type: Schema.String,
  fileHash: Schema.String,
  message: Schema.String
}).pipe(
  Schema.encodeKeys({
    fileHash: "file_hash"
  })
)

/**
 * Decoded `camelCase` PassportElementErrorTranslationFile.
 *
 * @category models
 * @since 0.1.0
 */
export type PassportElementErrorTranslationFile = Schema.Schema.Type<typeof PassportElementErrorTranslationFile>

/**
 * Represents an issue with the translated version of a document. The error is considered resolved when a file with the document translation change.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PassportElementErrorTranslationFiles = Schema.Struct({
  source: Schema.Literal("translation_files"),
  type: Schema.String,
  fileHashes: Schema.Array(Schema.String),
  message: Schema.String
}).pipe(
  Schema.encodeKeys({
    fileHashes: "file_hashes"
  })
)

/**
 * Decoded `camelCase` PassportElementErrorTranslationFiles.
 *
 * @category models
 * @since 0.1.0
 */
export type PassportElementErrorTranslationFiles = Schema.Schema.Type<typeof PassportElementErrorTranslationFiles>

/**
 * Represents an issue in an unspecified place. The error is considered resolved when new data is added.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PassportElementErrorUnspecified = Schema.Struct({
  source: Schema.Literal("unspecified"),
  type: Schema.String,
  elementHash: Schema.String,
  message: Schema.String
}).pipe(
  Schema.encodeKeys({
    elementHash: "element_hash"
  })
)

/**
 * Decoded `camelCase` PassportElementErrorUnspecified.
 *
 * @category models
 * @since 0.1.0
 */
export type PassportElementErrorUnspecified = Schema.Schema.Type<typeof PassportElementErrorUnspecified>

/**
 * This object represents an error in the Telegram Passport element which was submitted that should be resolved by the user. It should be one of: - PassportElementErrorDataField - PassportElementErrorFrontSide - PassportElementErrorReverseSide - PassportElementErrorSelfie - PassportElementErrorFile - PassportElementErrorFiles - PassportElementErrorTranslationFile - PassportElementErrorTranslationFiles - PassportElementErrorUnspecified
 *
 * @category schemas
 * @since 0.1.0
 */
export const PassportElementError = Schema.Union([PassportElementErrorDataField, PassportElementErrorFrontSide, PassportElementErrorReverseSide, PassportElementErrorSelfie, PassportElementErrorFile, PassportElementErrorFiles, PassportElementErrorTranslationFile, PassportElementErrorTranslationFiles, PassportElementErrorUnspecified])

/**
 * Decoded `camelCase` PassportElementError (union).
 *
 * @category models
 * @since 0.1.0
 */
export type PassportElementError = Schema.Schema.Type<typeof PassportElementError>

/**
 * This object represents an answer of a user in a non-anonymous poll.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PollAnswer = Schema.Struct({
  pollId: Schema.String,
  voterChat: Schema.optionalKey(Chat),
  user: Schema.optionalKey(User),
  optionIds: Schema.Array(Schema.Number),
  optionPersistentIds: Schema.Array(Schema.String)
}).pipe(
  Schema.encodeKeys({
    pollId: "poll_id",
    voterChat: "voter_chat",
    optionIds: "option_ids",
    optionPersistentIds: "option_persistent_ids"
  })
)

/**
 * Decoded `camelCase` PollAnswer.
 *
 * @category models
 * @since 0.1.0
 */
export type PollAnswer = Schema.Schema.Type<typeof PollAnswer>

/**
 * This object contains information about an incoming pre-checkout query.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PreCheckoutQuery = Schema.Struct({
  id: Schema.String,
  from: User,
  currency: Schema.String,
  totalAmount: Schema.Number,
  invoicePayload: Schema.String,
  shippingOptionId: Schema.optionalKey(Schema.String),
  orderInfo: Schema.optionalKey(OrderInfo)
}).pipe(
  Schema.encodeKeys({
    totalAmount: "total_amount",
    invoicePayload: "invoice_payload",
    shippingOptionId: "shipping_option_id",
    orderInfo: "order_info"
  })
)

/**
 * Decoded `camelCase` PreCheckoutQuery.
 *
 * @category models
 * @since 0.1.0
 */
export type PreCheckoutQuery = Schema.Schema.Type<typeof PreCheckoutQuery>

/**
 * Describes an inline message to be sent by a user of a Mini App.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PreparedInlineMessage = Schema.Struct({
  id: Schema.String,
  expirationDate: Schema.Number
}).pipe(
  Schema.encodeKeys({
    expirationDate: "expiration_date"
  })
)

/**
 * Decoded `camelCase` PreparedInlineMessage.
 *
 * @category models
 * @since 0.1.0
 */
export type PreparedInlineMessage = Schema.Schema.Type<typeof PreparedInlineMessage>

/**
 * Describes a keyboard button to be used by a user of a Mini App.
 *
 * @category schemas
 * @since 0.1.0
 */
export const PreparedKeyboardButton = Schema.Struct({
  id: Schema.String
})

/**
 * Decoded `camelCase` PreparedKeyboardButton.
 *
 * @category models
 * @since 0.1.0
 */
export type PreparedKeyboardButton = Schema.Schema.Type<typeof PreparedKeyboardButton>

/**
 * This object represents a custom keyboard with reply options (see Introduction to bots for details and examples). Not supported in channels and for messages sent on behalf of a business account.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ReplyKeyboardMarkup = Schema.Struct({
  keyboard: Schema.Array(Schema.Array(KeyboardButton)),
  isPersistent: Schema.optionalKey(Schema.Boolean),
  resizeKeyboard: Schema.optionalKey(Schema.Boolean),
  oneTimeKeyboard: Schema.optionalKey(Schema.Boolean),
  inputFieldPlaceholder: Schema.optionalKey(Schema.String),
  selective: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    isPersistent: "is_persistent",
    resizeKeyboard: "resize_keyboard",
    oneTimeKeyboard: "one_time_keyboard",
    inputFieldPlaceholder: "input_field_placeholder"
  })
)

/**
 * Decoded `camelCase` ReplyKeyboardMarkup.
 *
 * @category models
 * @since 0.1.0
 */
export type ReplyKeyboardMarkup = Schema.Schema.Type<typeof ReplyKeyboardMarkup>

/**
 * Upon receiving a message with this object, Telegram clients will remove the current custom keyboard and display the default letter-keyboard. By default, custom keyboards are displayed until a new keyboard is sent by a bot. An exception is made for one-time keyboards that are hidden immediately after the user presses a button (see ReplyKeyboardMarkup). Not supported in channels and for messages sent on behalf of a business account.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ReplyKeyboardRemove = Schema.Struct({
  removeKeyboard: Schema.Boolean,
  selective: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    removeKeyboard: "remove_keyboard"
  })
)

/**
 * Decoded `camelCase` ReplyKeyboardRemove.
 *
 * @category models
 * @since 0.1.0
 */
export type ReplyKeyboardRemove = Schema.Schema.Type<typeof ReplyKeyboardRemove>

/**
 * Describes reply parameters for the message that is being sent.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ReplyParameters = Schema.Struct({
  messageId: Schema.Number,
  chatId: Schema.optionalKey(Schema.Union([Schema.Number, Schema.String])),
  allowSendingWithoutReply: Schema.optionalKey(Schema.Boolean),
  quote: Schema.optionalKey(Schema.String),
  quoteParseMode: Schema.optionalKey(Schema.String),
  quoteEntities: Schema.optionalKey(Schema.Array(MessageEntity)),
  quotePosition: Schema.optionalKey(Schema.Number),
  checklistTaskId: Schema.optionalKey(Schema.Number),
  pollOptionId: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    messageId: "message_id",
    chatId: "chat_id",
    allowSendingWithoutReply: "allow_sending_without_reply",
    quoteParseMode: "quote_parse_mode",
    quoteEntities: "quote_entities",
    quotePosition: "quote_position",
    checklistTaskId: "checklist_task_id",
    pollOptionId: "poll_option_id"
  })
)

/**
 * Decoded `camelCase` ReplyParameters.
 *
 * @category models
 * @since 0.1.0
 */
export type ReplyParameters = Schema.Schema.Type<typeof ReplyParameters>

/**
 * Describes why a request was unsuccessful.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ResponseParameters = Schema.Struct({
  migrateToChatId: Schema.optionalKey(Schema.Number),
  retryAfter: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    migrateToChatId: "migrate_to_chat_id",
    retryAfter: "retry_after"
  })
)

/**
 * Decoded `camelCase` ResponseParameters.
 *
 * @category models
 * @since 0.1.0
 */
export type ResponseParameters = Schema.Schema.Type<typeof ResponseParameters>

/**
 * The withdrawal is in progress.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RevenueWithdrawalStatePending = Schema.Struct({
  type: Schema.Literal("pending")
})

/**
 * Decoded `camelCase` RevenueWithdrawalStatePending.
 *
 * @category models
 * @since 0.1.0
 */
export type RevenueWithdrawalStatePending = Schema.Schema.Type<typeof RevenueWithdrawalStatePending>

/**
 * The withdrawal succeeded.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RevenueWithdrawalStateSucceeded = Schema.Struct({
  type: Schema.Literal("succeeded"),
  date: Schema.Number,
  url: Schema.String
})

/**
 * Decoded `camelCase` RevenueWithdrawalStateSucceeded.
 *
 * @category models
 * @since 0.1.0
 */
export type RevenueWithdrawalStateSucceeded = Schema.Schema.Type<typeof RevenueWithdrawalStateSucceeded>

/**
 * The withdrawal failed and the transaction was refunded.
 *
 * @category schemas
 * @since 0.1.0
 */
export const RevenueWithdrawalStateFailed = Schema.Struct({
  type: Schema.Literal("failed")
})

/**
 * Decoded `camelCase` RevenueWithdrawalStateFailed.
 *
 * @category models
 * @since 0.1.0
 */
export type RevenueWithdrawalStateFailed = Schema.Schema.Type<typeof RevenueWithdrawalStateFailed>

/**
 * This object describes the state of a revenue withdrawal operation. Currently, it can be one of - RevenueWithdrawalStatePending - RevenueWithdrawalStateSucceeded - RevenueWithdrawalStateFailed
 *
 * @category schemas
 * @since 0.1.0
 */
export const RevenueWithdrawalState = Schema.Union([RevenueWithdrawalStatePending, RevenueWithdrawalStateSucceeded, RevenueWithdrawalStateFailed])

/**
 * Decoded `camelCase` RevenueWithdrawalState (union).
 *
 * @category models
 * @since 0.1.0
 */
export type RevenueWithdrawalState = Schema.Schema.Type<typeof RevenueWithdrawalState>

/**
 * Describes an inline message sent by a guest bot.
 *
 * @category schemas
 * @since 0.1.0
 */
export const SentGuestMessage = Schema.Struct({
  inlineMessageId: Schema.String
}).pipe(
  Schema.encodeKeys({
    inlineMessageId: "inline_message_id"
  })
)

/**
 * Decoded `camelCase` SentGuestMessage.
 *
 * @category models
 * @since 0.1.0
 */
export type SentGuestMessage = Schema.Schema.Type<typeof SentGuestMessage>

/**
 * Describes an inline message sent by a Web App on behalf of a user.
 *
 * @category schemas
 * @since 0.1.0
 */
export const SentWebAppMessage = Schema.Struct({
  inlineMessageId: Schema.optionalKey(Schema.String)
}).pipe(
  Schema.encodeKeys({
    inlineMessageId: "inline_message_id"
  })
)

/**
 * Decoded `camelCase` SentWebAppMessage.
 *
 * @category models
 * @since 0.1.0
 */
export type SentWebAppMessage = Schema.Schema.Type<typeof SentWebAppMessage>

/**
 * This object represents one shipping option.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ShippingOption = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  prices: Schema.Array(LabeledPrice)
})

/**
 * Decoded `camelCase` ShippingOption.
 *
 * @category models
 * @since 0.1.0
 */
export type ShippingOption = Schema.Schema.Type<typeof ShippingOption>

/**
 * This object contains information about an incoming shipping query.
 *
 * @category schemas
 * @since 0.1.0
 */
export const ShippingQuery = Schema.Struct({
  id: Schema.String,
  from: User,
  invoicePayload: Schema.String,
  shippingAddress: ShippingAddress
}).pipe(
  Schema.encodeKeys({
    invoicePayload: "invoice_payload",
    shippingAddress: "shipping_address"
  })
)

/**
 * Decoded `camelCase` ShippingQuery.
 *
 * @category models
 * @since 0.1.0
 */
export type ShippingQuery = Schema.Schema.Type<typeof ShippingQuery>

/**
 * Describes a transaction with a user.
 *
 * @category schemas
 * @since 0.1.0
 */
export const TransactionPartnerUser = Schema.Struct({
  type: Schema.Literal("user"),
  transactionType: Schema.String,
  user: User,
  affiliate: Schema.optionalKey(AffiliateInfo),
  invoicePayload: Schema.optionalKey(Schema.String),
  subscriptionPeriod: Schema.optionalKey(Schema.Number),
  paidMedia: Schema.optionalKey(Schema.Array(PaidMedia)),
  paidMediaPayload: Schema.optionalKey(Schema.String),
  gift: Schema.optionalKey(Gift),
  premiumSubscriptionDuration: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    transactionType: "transaction_type",
    invoicePayload: "invoice_payload",
    subscriptionPeriod: "subscription_period",
    paidMedia: "paid_media",
    paidMediaPayload: "paid_media_payload",
    premiumSubscriptionDuration: "premium_subscription_duration"
  })
)

/**
 * Decoded `camelCase` TransactionPartnerUser.
 *
 * @category models
 * @since 0.1.0
 */
export type TransactionPartnerUser = Schema.Schema.Type<typeof TransactionPartnerUser>

/**
 * Describes a transaction with a chat.
 *
 * @category schemas
 * @since 0.1.0
 */
export const TransactionPartnerChat = Schema.Struct({
  type: Schema.Literal("chat"),
  chat: Chat,
  gift: Schema.optionalKey(Gift)
})

/**
 * Decoded `camelCase` TransactionPartnerChat.
 *
 * @category models
 * @since 0.1.0
 */
export type TransactionPartnerChat = Schema.Schema.Type<typeof TransactionPartnerChat>

/**
 * Describes the affiliate program that issued the affiliate commission received via this transaction.
 *
 * @category schemas
 * @since 0.1.0
 */
export const TransactionPartnerAffiliateProgram = Schema.Struct({
  type: Schema.Literal("affiliate_program"),
  sponsorUser: Schema.optionalKey(User),
  commissionPerMille: Schema.Number
}).pipe(
  Schema.encodeKeys({
    sponsorUser: "sponsor_user",
    commissionPerMille: "commission_per_mille"
  })
)

/**
 * Decoded `camelCase` TransactionPartnerAffiliateProgram.
 *
 * @category models
 * @since 0.1.0
 */
export type TransactionPartnerAffiliateProgram = Schema.Schema.Type<typeof TransactionPartnerAffiliateProgram>

/**
 * Describes a withdrawal transaction with Fragment.
 *
 * @category schemas
 * @since 0.1.0
 */
export const TransactionPartnerFragment = Schema.Struct({
  type: Schema.Literal("fragment"),
  withdrawalState: Schema.optionalKey(RevenueWithdrawalState)
}).pipe(
  Schema.encodeKeys({
    withdrawalState: "withdrawal_state"
  })
)

/**
 * Decoded `camelCase` TransactionPartnerFragment.
 *
 * @category models
 * @since 0.1.0
 */
export type TransactionPartnerFragment = Schema.Schema.Type<typeof TransactionPartnerFragment>

/**
 * Describes a withdrawal transaction to the Telegram Ads platform.
 *
 * @category schemas
 * @since 0.1.0
 */
export const TransactionPartnerTelegramAds = Schema.Struct({
  type: Schema.Literal("telegram_ads")
})

/**
 * Decoded `camelCase` TransactionPartnerTelegramAds.
 *
 * @category models
 * @since 0.1.0
 */
export type TransactionPartnerTelegramAds = Schema.Schema.Type<typeof TransactionPartnerTelegramAds>

/**
 * Describes a transaction with payment for paid broadcasting.
 *
 * @category schemas
 * @since 0.1.0
 */
export const TransactionPartnerTelegramApi = Schema.Struct({
  type: Schema.Literal("telegram_api"),
  requestCount: Schema.Number
}).pipe(
  Schema.encodeKeys({
    requestCount: "request_count"
  })
)

/**
 * Decoded `camelCase` TransactionPartnerTelegramApi.
 *
 * @category models
 * @since 0.1.0
 */
export type TransactionPartnerTelegramApi = Schema.Schema.Type<typeof TransactionPartnerTelegramApi>

/**
 * Describes a transaction with an unknown source or recipient.
 *
 * @category schemas
 * @since 0.1.0
 */
export const TransactionPartnerOther = Schema.Struct({
  type: Schema.Literal("other")
})

/**
 * Decoded `camelCase` TransactionPartnerOther.
 *
 * @category models
 * @since 0.1.0
 */
export type TransactionPartnerOther = Schema.Schema.Type<typeof TransactionPartnerOther>

/**
 * This object describes the source of a transaction, or its recipient for outgoing transactions. Currently, it can be one of - TransactionPartnerUser - TransactionPartnerChat - TransactionPartnerAffiliateProgram - TransactionPartnerFragment - TransactionPartnerTelegramAds - TransactionPartnerTelegramApi - TransactionPartnerOther
 *
 * @category schemas
 * @since 0.1.0
 */
export const TransactionPartner = Schema.Union([TransactionPartnerUser, TransactionPartnerChat, TransactionPartnerAffiliateProgram, TransactionPartnerFragment, TransactionPartnerTelegramAds, TransactionPartnerTelegramApi, TransactionPartnerOther])

/**
 * Decoded `camelCase` TransactionPartner (union).
 *
 * @category models
 * @since 0.1.0
 */
export type TransactionPartner = Schema.Schema.Type<typeof TransactionPartner>

/**
 * Describes a Telegram Star transaction. Note that if the buyer initiates a chargeback with the payment provider from whom they acquired Stars (e.g., Apple, Google) following this transaction, the refunded Stars will be deducted from the bot's balance. This is outside of Telegram's control.
 *
 * @category schemas
 * @since 0.1.0
 */
export const StarTransaction = Schema.Struct({
  id: Schema.String,
  amount: Schema.Number,
  nanostarAmount: Schema.optionalKey(Schema.Number),
  date: Schema.Number,
  source: Schema.optionalKey(TransactionPartner),
  receiver: Schema.optionalKey(TransactionPartner)
}).pipe(
  Schema.encodeKeys({
    nanostarAmount: "nanostar_amount"
  })
)

/**
 * Decoded `camelCase` StarTransaction.
 *
 * @category models
 * @since 0.1.0
 */
export type StarTransaction = Schema.Schema.Type<typeof StarTransaction>

/**
 * Contains a list of Telegram Star transactions.
 *
 * @category schemas
 * @since 0.1.0
 */
export const StarTransactions = Schema.Struct({
  transactions: Schema.Array(StarTransaction)
})

/**
 * Decoded `camelCase` StarTransactions.
 *
 * @category models
 * @since 0.1.0
 */
export type StarTransactions = Schema.Schema.Type<typeof StarTransactions>

/**
 * This object represents a sticker set.
 *
 * @category schemas
 * @since 0.1.0
 */
export const StickerSet = Schema.Struct({
  name: Schema.String,
  title: Schema.String,
  stickerType: Schema.String,
  stickers: Schema.Array(Sticker),
  thumbnail: Schema.optionalKey(PhotoSize)
}).pipe(
  Schema.encodeKeys({
    stickerType: "sticker_type"
  })
)

/**
 * Decoded `camelCase` StickerSet.
 *
 * @category models
 * @since 0.1.0
 */
export type StickerSet = Schema.Schema.Type<typeof StickerSet>

/**
 * Describes the position of a clickable area within a story.
 *
 * @category schemas
 * @since 0.1.0
 */
export const StoryAreaPosition = Schema.Struct({
  xPercentage: Schema.Number,
  yPercentage: Schema.Number,
  widthPercentage: Schema.Number,
  heightPercentage: Schema.Number,
  rotationAngle: Schema.Number,
  cornerRadiusPercentage: Schema.Number
}).pipe(
  Schema.encodeKeys({
    xPercentage: "x_percentage",
    yPercentage: "y_percentage",
    widthPercentage: "width_percentage",
    heightPercentage: "height_percentage",
    rotationAngle: "rotation_angle",
    cornerRadiusPercentage: "corner_radius_percentage"
  })
)

/**
 * Decoded `camelCase` StoryAreaPosition.
 *
 * @category models
 * @since 0.1.0
 */
export type StoryAreaPosition = Schema.Schema.Type<typeof StoryAreaPosition>

/**
 * Describes a story area pointing to a location. Currently, a story can have up to 10 location areas.
 *
 * @category schemas
 * @since 0.1.0
 */
export const StoryAreaTypeLocation = Schema.Struct({
  type: Schema.Literal("location"),
  latitude: Schema.Number,
  longitude: Schema.Number,
  address: Schema.optionalKey(LocationAddress)
})

/**
 * Decoded `camelCase` StoryAreaTypeLocation.
 *
 * @category models
 * @since 0.1.0
 */
export type StoryAreaTypeLocation = Schema.Schema.Type<typeof StoryAreaTypeLocation>

/**
 * Describes a story area pointing to a suggested reaction. Currently, a story can have up to 5 suggested reaction areas.
 *
 * @category schemas
 * @since 0.1.0
 */
export const StoryAreaTypeSuggestedReaction = Schema.Struct({
  type: Schema.Literal("suggested_reaction"),
  reactionType: ReactionType,
  isDark: Schema.optionalKey(Schema.Boolean),
  isFlipped: Schema.optionalKey(Schema.Boolean)
}).pipe(
  Schema.encodeKeys({
    reactionType: "reaction_type",
    isDark: "is_dark",
    isFlipped: "is_flipped"
  })
)

/**
 * Decoded `camelCase` StoryAreaTypeSuggestedReaction.
 *
 * @category models
 * @since 0.1.0
 */
export type StoryAreaTypeSuggestedReaction = Schema.Schema.Type<typeof StoryAreaTypeSuggestedReaction>

/**
 * Describes a story area pointing to an HTTP or tg:// link. Currently, a story can have up to 3 link areas.
 *
 * @category schemas
 * @since 0.1.0
 */
export const StoryAreaTypeLink = Schema.Struct({
  type: Schema.Literal("link"),
  url: Schema.String
})

/**
 * Decoded `camelCase` StoryAreaTypeLink.
 *
 * @category models
 * @since 0.1.0
 */
export type StoryAreaTypeLink = Schema.Schema.Type<typeof StoryAreaTypeLink>

/**
 * Describes a story area containing weather information. Currently, a story can have up to 3 weather areas.
 *
 * @category schemas
 * @since 0.1.0
 */
export const StoryAreaTypeWeather = Schema.Struct({
  type: Schema.Literal("weather"),
  temperature: Schema.Number,
  emoji: Schema.String,
  backgroundColor: Schema.Number
}).pipe(
  Schema.encodeKeys({
    backgroundColor: "background_color"
  })
)

/**
 * Decoded `camelCase` StoryAreaTypeWeather.
 *
 * @category models
 * @since 0.1.0
 */
export type StoryAreaTypeWeather = Schema.Schema.Type<typeof StoryAreaTypeWeather>

/**
 * Describes a story area pointing to a unique gift. Currently, a story can have at most 1 unique gift area.
 *
 * @category schemas
 * @since 0.1.0
 */
export const StoryAreaTypeUniqueGift = Schema.Struct({
  type: Schema.Literal("unique_gift"),
  name: Schema.String
})

/**
 * Decoded `camelCase` StoryAreaTypeUniqueGift.
 *
 * @category models
 * @since 0.1.0
 */
export type StoryAreaTypeUniqueGift = Schema.Schema.Type<typeof StoryAreaTypeUniqueGift>

/**
 * Describes the type of a clickable area on a story. Currently, it can be one of - StoryAreaTypeLocation - StoryAreaTypeSuggestedReaction - StoryAreaTypeLink - StoryAreaTypeWeather - StoryAreaTypeUniqueGift
 *
 * @category schemas
 * @since 0.1.0
 */
export const StoryAreaType = Schema.Union([StoryAreaTypeLocation, StoryAreaTypeSuggestedReaction, StoryAreaTypeLink, StoryAreaTypeWeather, StoryAreaTypeUniqueGift])

/**
 * Decoded `camelCase` StoryAreaType (union).
 *
 * @category models
 * @since 0.1.0
 */
export type StoryAreaType = Schema.Schema.Type<typeof StoryAreaType>

/**
 * Describes a clickable area on a story media.
 *
 * @category schemas
 * @since 0.1.0
 */
export const StoryArea = Schema.Struct({
  position: StoryAreaPosition,
  type: StoryAreaType
})

/**
 * Decoded `camelCase` StoryArea.
 *
 * @category models
 * @since 0.1.0
 */
export type StoryArea = Schema.Schema.Type<typeof StoryArea>

/**
 * Contains parameters of a post that is being suggested by the bot.
 *
 * @category schemas
 * @since 0.1.0
 */
export const SuggestedPostParameters = Schema.Struct({
  price: Schema.optionalKey(SuggestedPostPrice),
  sendDate: Schema.optionalKey(Schema.Number)
}).pipe(
  Schema.encodeKeys({
    sendDate: "send_date"
  })
)

/**
 * Decoded `camelCase` SuggestedPostParameters.
 *
 * @category models
 * @since 0.1.0
 */
export type SuggestedPostParameters = Schema.Schema.Type<typeof SuggestedPostParameters>

/**
 * This object represents an incoming update. At most one of the optional fields can be present in any given update.
 *
 * @category schemas
 * @since 0.1.0
 */
export const Update = Schema.Struct({
  updateId: Schema.Number,
  message: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  editedMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  channelPost: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  editedChannelPost: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  businessConnection: Schema.optionalKey(BusinessConnection),
  businessMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  editedBusinessMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  deletedBusinessMessages: Schema.optionalKey(BusinessMessagesDeleted),
  guestMessage: Schema.optionalKey(Schema.suspend((): Schema.Codec<Message, unknown> => Message)),
  messageReaction: Schema.optionalKey(MessageReactionUpdated),
  messageReactionCount: Schema.optionalKey(MessageReactionCountUpdated),
  inlineQuery: Schema.optionalKey(InlineQuery),
  chosenInlineResult: Schema.optionalKey(ChosenInlineResult),
  callbackQuery: Schema.optionalKey(CallbackQuery),
  shippingQuery: Schema.optionalKey(ShippingQuery),
  preCheckoutQuery: Schema.optionalKey(PreCheckoutQuery),
  purchasedPaidMedia: Schema.optionalKey(PaidMediaPurchased),
  poll: Schema.optionalKey(Poll),
  pollAnswer: Schema.optionalKey(PollAnswer),
  myChatMember: Schema.optionalKey(ChatMemberUpdated),
  chatMember: Schema.optionalKey(ChatMemberUpdated),
  chatJoinRequest: Schema.optionalKey(ChatJoinRequest),
  chatBoost: Schema.optionalKey(ChatBoostUpdated),
  removedChatBoost: Schema.optionalKey(ChatBoostRemoved),
  managedBot: Schema.optionalKey(ManagedBotUpdated)
}).pipe(
  Schema.encodeKeys({
    updateId: "update_id",
    editedMessage: "edited_message",
    channelPost: "channel_post",
    editedChannelPost: "edited_channel_post",
    businessConnection: "business_connection",
    businessMessage: "business_message",
    editedBusinessMessage: "edited_business_message",
    deletedBusinessMessages: "deleted_business_messages",
    guestMessage: "guest_message",
    messageReaction: "message_reaction",
    messageReactionCount: "message_reaction_count",
    inlineQuery: "inline_query",
    chosenInlineResult: "chosen_inline_result",
    callbackQuery: "callback_query",
    shippingQuery: "shipping_query",
    preCheckoutQuery: "pre_checkout_query",
    purchasedPaidMedia: "purchased_paid_media",
    pollAnswer: "poll_answer",
    myChatMember: "my_chat_member",
    chatMember: "chat_member",
    chatJoinRequest: "chat_join_request",
    chatBoost: "chat_boost",
    removedChatBoost: "removed_chat_boost",
    managedBot: "managed_bot"
  })
)

/**
 * Decoded `camelCase` Update.
 *
 * @category models
 * @since 0.1.0
 */
export type Update = Schema.Schema.Type<typeof Update>

/**
 * This object represents a list of boosts added to a chat by a user.
 *
 * @category schemas
 * @since 0.1.0
 */
export const UserChatBoosts = Schema.Struct({
  boosts: Schema.Array(ChatBoost)
})

/**
 * Decoded `camelCase` UserChatBoosts.
 *
 * @category models
 * @since 0.1.0
 */
export type UserChatBoosts = Schema.Schema.Type<typeof UserChatBoosts>

/**
 * This object represents the audios displayed on a user's profile.
 *
 * @category schemas
 * @since 0.1.0
 */
export const UserProfileAudios = Schema.Struct({
  totalCount: Schema.Number,
  audios: Schema.Array(Audio)
}).pipe(
  Schema.encodeKeys({
    totalCount: "total_count"
  })
)

/**
 * Decoded `camelCase` UserProfileAudios.
 *
 * @category models
 * @since 0.1.0
 */
export type UserProfileAudios = Schema.Schema.Type<typeof UserProfileAudios>

/**
 * This object represent a user's profile pictures.
 *
 * @category schemas
 * @since 0.1.0
 */
export const UserProfilePhotos = Schema.Struct({
  totalCount: Schema.Number,
  photos: Schema.Array(Schema.Array(PhotoSize))
}).pipe(
  Schema.encodeKeys({
    totalCount: "total_count"
  })
)

/**
 * Decoded `camelCase` UserProfilePhotos.
 *
 * @category models
 * @since 0.1.0
 */
export type UserProfilePhotos = Schema.Schema.Type<typeof UserProfilePhotos>

/**
 * Describes the current status of a webhook.
 *
 * @category schemas
 * @since 0.1.0
 */
export const WebhookInfo = Schema.Struct({
  url: Schema.String,
  hasCustomCertificate: Schema.Boolean,
  pendingUpdateCount: Schema.Number,
  ipAddress: Schema.optionalKey(Schema.String),
  lastErrorDate: Schema.optionalKey(Schema.Number),
  lastErrorMessage: Schema.optionalKey(Schema.String),
  lastSynchronizationErrorDate: Schema.optionalKey(Schema.Number),
  maxConnections: Schema.optionalKey(Schema.Number),
  allowedUpdates: Schema.optionalKey(Schema.Array(Schema.String))
}).pipe(
  Schema.encodeKeys({
    hasCustomCertificate: "has_custom_certificate",
    pendingUpdateCount: "pending_update_count",
    ipAddress: "ip_address",
    lastErrorDate: "last_error_date",
    lastErrorMessage: "last_error_message",
    lastSynchronizationErrorDate: "last_synchronization_error_date",
    maxConnections: "max_connections",
    allowedUpdates: "allowed_updates"
  })
)

/**
 * Decoded `camelCase` WebhookInfo.
 *
 * @category models
 * @since 0.1.0
 */
export type WebhookInfo = Schema.Schema.Type<typeof WebhookInfo>

// === MANUAL — not regenerated below (codegen) ===
//
// (The `InputFile` schema is emitted above the marker, bound to `../InputFile.js`.)
