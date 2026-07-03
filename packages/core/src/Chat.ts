/**
 * `Chat` - the ctx-less ergonomics layer. Free
 * accessor functions that read the ambient {@link module:UpdateContext} the
 * dispatcher stamped for the current update, so a handler writes `Chat.reply("hi")`
 * instead of digging `chatId` out of a context object.
 *
 * These are deliberately thin: they only add `TelegramClient` to a handler's `R`
 * (never an ambient "chat" tag), and they never grow into a god-object - each
 * function does exactly one Bot API call against the current chat. Send helpers
 * return a hydrated {@link module:SentMessage.SentMessage} so the handler can act on
 * what it just sent.
 *
 * @since 0.1.0
 */
import { Duration, Effect, Fiber, Option, Ref } from "effect"

import { TelegramClient } from "./client/index.js"
import * as SentMessage from "./SentMessage.js"
import * as UpdateContext from "./UpdateContext.js"

import type { BotApi, InputFile, TelegramError } from "./client/index.js"
import type * as MediaGroup from "./MediaGroup.js"

/**
 * Any of the four reply-markup kinds a message can carry: an inline keyboard, a
 * custom reply keyboard, a keyboard-removal, or a force-reply.
 *
 * @category models
 * @since 0.1.0
 */
export type ReplyMarkup =
  | BotApi.InlineKeyboardMarkup
  | BotApi.ReplyKeyboardMarkup
  | BotApi.ReplyKeyboardRemove
  | BotApi.ForceReply

/**
 * A file to send: an uploaded {@link module:InputFile.InputFile} or a `file_id`/URL
 * string.
 *
 * @category models
 * @since 0.1.0
 */
export type Media = InputFile.InputFile | string

/**
 * Pre-formatted text: the rendered string and its `entities`, with no
 * `parse_mode`. This is structurally the output of an entity-tree formatter (e.g.
 * `@fibergram/core/ui`'s `Fmt`), so a formatter result feeds {@link reply} /
 * {@link editLast} / a media caption directly - no import of the UI package and
 * nothing to escape.
 *
 * @category models
 * @since 0.1.0
 */
export interface FormattedText {
  /** The rendered text. */
  readonly text: string
  /** The entities marking spans of {@link text} (mutually exclusive with a parse mode). */
  readonly entities?: ReadonlyArray<BotApi.MessageEntity>
}

/**
 * Text to send: a plain `string` (optionally with a parse mode via options) or
 * pre-formatted {@link FormattedText} carrying its own entities.
 *
 * @category models
 * @since 0.1.0
 */
export type Text = string | FormattedText

const asFormatted = (text: Text): FormattedText => (typeof text === "string" ? { text } : text)

// --- ambient accessors -------------------------------------------------------

/**
 * The chat id of the update being handled.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const id = yield* Chat.chatId
 *   return id
 * })
 *
 * @category accessors
 * @since 0.1.0
 */
export const chatId: Effect.Effect<number> = Effect.map(UpdateContext.env, (env) => env.chatId)

/**
 * The Forum Topic thread of the current update, if any.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect, Option } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const thread = yield* Chat.thread
 *   return Option.getOrElse(thread, () => 0)
 * })
 *
 * @category accessors
 * @since 0.1.0
 */
export const thread: Effect.Effect<Option.Option<number>> = Effect.map(
  UpdateContext.env,
  (env) => env.threadId
)

/**
 * The sender of the current update (from a message, edited message or callback
 * query), if any.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect, Option } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const from = yield* Chat.from
 *   return Option.map(from, (user) => user.firstName)
 * })
 *
 * @category accessors
 * @since 0.1.0
 */
export const from: Effect.Effect<Option.Option<BotApi.User>> = Effect.map(
  UpdateContext.env,
  (env) => {
    const update = env.update
    const user = update.message?.from ??
      update.editedMessage?.from ??
      update.callbackQuery?.from
    return Option.fromNullishOr(user)
  }
)

// --- shared field builders ---------------------------------------------------

type Env = UpdateContext.UpdateEnv

const threadField = (env: Env): { messageThreadId?: number } =>
  Option.isSome(env.threadId) ? { messageThreadId: env.threadId.value } : {}

const markupField = (options?: { readonly replyMarkup?: ReplyMarkup }): { replyMarkup?: ReplyMarkup } =>
  options?.replyMarkup !== undefined ? { replyMarkup: options.replyMarkup } : {}

const replyToField = (
  options?: { readonly replyToMessageId?: number; readonly replyParameters?: BotApi.ReplyParameters }
): { replyParameters?: BotApi.ReplyParameters } => {
  if (options?.replyParameters !== undefined) return { replyParameters: options.replyParameters }
  if (options?.replyToMessageId !== undefined) return { replyParameters: { messageId: options.replyToMessageId } }
  return {}
}

const captionFields = (
  options?: MediaOptions
): { caption?: string; parseMode?: string; captionEntities?: ReadonlyArray<BotApi.MessageEntity> } => {
  if (options?.caption === undefined) return {}
  const body = asFormatted(options.caption)
  const entities = body.entities ?? options.captionEntities
  return {
    caption: body.text,
    ...(entities !== undefined ? { captionEntities: entities } : {}),
    // A parse mode only applies to a plain caption with no explicit entities.
    ...(entities === undefined && options.parseMode !== undefined ? { parseMode: options.parseMode } : {})
  }
}

/** Record the sent message id (so `editLast` can target it) and hydrate it. */
const remember = (env: Env, message: BotApi.Message): Effect.Effect<SentMessage.SentMessage> =>
  Effect.as(Ref.set(env.lastSent, Option.some(message.messageId)), SentMessage.make(message))

const currentMessageId = (update: BotApi.Update): number | undefined =>
  update.message?.messageId ??
  update.editedMessage?.messageId ??
  update.channelPost?.messageId ??
  update.editedChannelPost?.messageId

// --- options -----------------------------------------------------------------

/**
 * Options common to every send helper.
 *
 * @category models
 * @since 0.1.0
 */
export interface SendOptions {
  /** Attach any of the four reply-markup kinds. */
  readonly replyMarkup?: ReplyMarkup
  /** Reply to a specific message id (shorthand for `replyParameters.messageId`). */
  readonly replyToMessageId?: number
  /** Full reply parameters (quote, cross-chat reply, ...); overrides `replyToMessageId`. */
  readonly replyParameters?: BotApi.ReplyParameters
}

/**
 * Options for the caption-bearing media helpers.
 *
 * @category models
 * @since 0.1.0
 */
export interface MediaOptions extends SendOptions {
  /** Caption shown with the media: plain text, or pre-formatted {@link FormattedText}. */
  readonly caption?: Text
  /** Parse mode for a plain-text caption (`"MarkdownV2"`, `"HTML"`, ...). */
  readonly parseMode?: string
  /** Pre-parsed caption entities (mutually exclusive with `parseMode`). */
  readonly captionEntities?: ReadonlyArray<BotApi.MessageEntity>
}

/**
 * Options for {@link reply}.
 *
 * @category models
 * @since 0.1.0
 */
export interface ReplyOptions extends SendOptions {
  /** Parse mode for the text (`"MarkdownV2"`, `"HTML"`, ...). */
  readonly parseMode?: string
  /** Pre-parsed text entities (mutually exclusive with `parseMode`). */
  readonly entities?: ReadonlyArray<BotApi.MessageEntity>
  /** Link-preview behaviour for the message. */
  readonly linkPreviewOptions?: BotApi.LinkPreviewOptions
}

// --- text --------------------------------------------------------------------

/**
 * Sends a message to the current chat (threaded when the update is threaded), and
 * remembers its id so a later {@link editLast} can target it. Returns a hydrated
 * {@link module:SentMessage.SentMessage}.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   const sent = yield* Chat.reply("Hello!")
 *   yield* sent.react("👍")
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const reply = (
  text: Text,
  options?: ReplyOptions
): Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const tg = yield* TelegramClient.TelegramClient
    const body = asFormatted(text)
    const entities = body.entities ?? options?.entities
    const message = yield* tg.sendMessage({
      chatId: env.chatId,
      text: body.text,
      ...threadField(env),
      ...markupField(options),
      ...replyToField(options),
      ...(entities !== undefined ? { entities } : {}),
      // A parse mode only applies to plain text with no explicit entities.
      ...(entities === undefined && options?.parseMode !== undefined ? { parseMode: options.parseMode } : {}),
      ...(options?.linkPreviewOptions !== undefined ? { linkPreviewOptions: options.linkPreviewOptions } : {})
    })
    return yield* remember(env, message)
  })

/**
 * Options for {@link editLast}.
 *
 * @category models
 * @since 0.1.0
 */
export interface EditOptions {
  /** Replace the inline keyboard. */
  readonly replyMarkup?: BotApi.InlineKeyboardMarkup
  /** Parse mode for the new text. */
  readonly parseMode?: string
}

/**
 * Edits the last message this handler sent in the current turn, instead of
 * spamming a new one. Falls back to a fresh {@link reply}
 * when nothing has been sent yet.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.reply("Loading...")
 *   yield* Chat.editLast("Done")
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const editLast = (
  text: Text,
  options?: EditOptions
): Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const last = yield* Ref.get(env.lastSent)
    if (Option.isNone(last)) {
      return yield* reply(text, options)
    }
    const tg = yield* TelegramClient.TelegramClient
    const body = asFormatted(text)
    // `editMessageText` returns `Message | true` per the Bot API - `true` only for
    // inline messages. `editLast` always targets a chat message (chatId + messageId),
    // so the result is always the edited `Message`.
    const edited = yield* tg.editMessageText({
      chatId: env.chatId,
      messageId: last.value,
      text: body.text,
      ...(options?.replyMarkup !== undefined ? { replyMarkup: options.replyMarkup } : {}),
      ...(body.entities !== undefined ? { entities: body.entities } : {}),
      ...(body.entities === undefined && options?.parseMode !== undefined ? { parseMode: options.parseMode } : {})
    })
    return SentMessage.make(edited as BotApi.Message)
  })

// --- media -------------------------------------------------------------------

const sendFile = (
  key: string,
  method: (params: never) => Effect.Effect<BotApi.Message, TelegramError.TelegramError>,
  file: Media,
  options?: MediaOptions
): Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const message = yield* method({
      chatId: env.chatId,
      [key]: file,
      ...threadField(env),
      ...markupField(options),
      ...replyToField(options),
      ...captionFields(options)
    } as never)
    return yield* remember(env, message)
  })

/**
 * Sends a photo to the current chat (from disk, bytes, stream, URL, or `file_id`).
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { InputFile } from "@fibergram/core/client"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.replyPhoto(InputFile.fromPath("./cat.png"), { caption: "meow" })
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const replyPhoto = (
  photo: Media,
  options?: MediaOptions
): Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.flatMap(TelegramClient.TelegramClient, (tg) => sendFile("photo", tg.sendPhoto, photo, options))

/**
 * Sends a general file (document) to the current chat.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { InputFile } from "@fibergram/core/client"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.replyDocument(InputFile.fromPath("./report.pdf"))
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const replyDocument = (
  document: Media,
  options?: MediaOptions
): Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.flatMap(TelegramClient.TelegramClient, (tg) => sendFile("document", tg.sendDocument, document, options))

/**
 * Sends a video to the current chat.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { InputFile } from "@fibergram/core/client"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.replyVideo(InputFile.fromUrl("https://example.com/clip.mp4"))
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const replyVideo = (
  video: Media,
  options?: MediaOptions
): Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.flatMap(TelegramClient.TelegramClient, (tg) => sendFile("video", tg.sendVideo, video, options))

/**
 * Sends an audio track to the current chat.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { InputFile } from "@fibergram/core/client"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.replyAudio(InputFile.fromPath("./song.mp3"))
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const replyAudio = (
  audio: Media,
  options?: MediaOptions
): Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.flatMap(TelegramClient.TelegramClient, (tg) => sendFile("audio", tg.sendAudio, audio, options))

/**
 * Sends a voice message to the current chat.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { InputFile } from "@fibergram/core/client"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.replyVoice(InputFile.fromPath("./note.ogg"))
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const replyVoice = (
  voice: Media,
  options?: MediaOptions
): Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.flatMap(TelegramClient.TelegramClient, (tg) => sendFile("voice", tg.sendVoice, voice, options))

/**
 * Sends an animation (GIF or soundless H.264) to the current chat.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { InputFile } from "@fibergram/core/client"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.replyAnimation(InputFile.fromPath("./loop.gif"))
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const replyAnimation = (
  animation: Media,
  options?: MediaOptions
): Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.flatMap(TelegramClient.TelegramClient, (tg) => sendFile("animation", tg.sendAnimation, animation, options))

/**
 * Sends a sticker to the current chat (stickers carry no caption).
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.replySticker("CAACAgIAAxk...")
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const replySticker = (
  sticker: Media,
  options?: SendOptions
): Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const tg = yield* TelegramClient.TelegramClient
    const message = yield* tg.sendSticker({
      chatId: env.chatId,
      sticker,
      ...threadField(env),
      ...markupField(options),
      ...replyToField(options)
    })
    return yield* remember(env, message)
  })

/**
 * Sends an album (media group) to the current chat. Accepts a
 * {@link module:MediaGroup.MediaGroup} builder or a raw array of items. Returns one
 * hydrated {@link module:SentMessage.SentMessage} per item.
 *
 * @example
 * import { Chat, MediaGroup } from "@fibergram/core"
 * import { InputFile } from "@fibergram/core/client"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.replyMediaGroup(
 *     MediaGroup.empty
 *       .photo(InputFile.fromPath("./1.png"), { caption: "Album" })
 *       .photo(InputFile.fromPath("./2.png"))
 *   )
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const replyMediaGroup = (
  group: MediaGroup.MediaGroup | ReadonlyArray<MediaGroup.Item>
): Effect.Effect<
  ReadonlyArray<SentMessage.SentMessage>,
  TelegramError.TelegramError,
  TelegramClient.TelegramClient
> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const tg = yield* TelegramClient.TelegramClient
    const media = Array.isArray(group) ? group : (group as MediaGroup.MediaGroup).items
    const messages = yield* tg.sendMediaGroup({
      chatId: env.chatId,
      media,
      ...threadField(env)
    })
    const last = messages.at(-1)
    if (last !== undefined) yield* Ref.set(env.lastSent, Option.some(last.messageId))
    return messages.map(SentMessage.make)
  })

/**
 * Sends a location to the current chat.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.replyLocation(51.5, -0.12)
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const replyLocation = (
  latitude: number,
  longitude: number,
  options?: SendOptions
): Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const tg = yield* TelegramClient.TelegramClient
    const message = yield* tg.sendLocation({
      chatId: env.chatId,
      latitude,
      longitude,
      ...threadField(env),
      ...markupField(options),
      ...replyToField(options)
    })
    return yield* remember(env, message)
  })

/**
 * Sends a phone contact to the current chat.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.replyContact("+15551234567", "Ada")
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const replyContact = (
  phoneNumber: string,
  firstName: string,
  options?: SendOptions & { readonly lastName?: string }
): Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const tg = yield* TelegramClient.TelegramClient
    const message = yield* tg.sendContact({
      chatId: env.chatId,
      phoneNumber,
      firstName,
      ...(options?.lastName !== undefined ? { lastName: options.lastName } : {}),
      ...threadField(env),
      ...markupField(options),
      ...replyToField(options)
    })
    return yield* remember(env, message)
  })

/**
 * Options for {@link replyPoll}.
 *
 * @category models
 * @since 0.1.0
 */
export interface PollOptions extends SendOptions {
  /** Whether the poll is anonymous (default `true`). */
  readonly isAnonymous?: boolean
  /** `"regular"` (default) or `"quiz"`. */
  readonly type?: string
  /** Allow multiple answers (regular polls only). */
  readonly allowsMultipleAnswers?: boolean
  /** 0-based id of the correct answer (quiz polls). */
  readonly correctOptionId?: number
}

/**
 * Sends a poll to the current chat.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.replyPoll("Pick one", ["A", "B", "C"])
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const replyPoll = (
  question: string,
  choices: ReadonlyArray<string>,
  options?: PollOptions
): Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const tg = yield* TelegramClient.TelegramClient
    const message = yield* tg.sendPoll({
      chatId: env.chatId,
      question,
      options: choices.map((text) => ({ text })),
      ...(options?.isAnonymous !== undefined ? { isAnonymous: options.isAnonymous } : {}),
      ...(options?.type !== undefined ? { type: options.type } : {}),
      ...(options?.allowsMultipleAnswers !== undefined
        ? { allowsMultipleAnswers: options.allowsMultipleAnswers }
        : {}),
      ...(options?.correctOptionId !== undefined ? { correctOptionId: options.correctOptionId } : {}),
      ...threadField(env),
      ...markupField(options),
      ...replyToField(options)
    })
    return yield* remember(env, message)
  })

/**
 * Sends an animated dice (or other emoji) that shows a random value.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.replyDice({ emoji: "🎲" })
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const replyDice = (
  options?: SendOptions & { readonly emoji?: string }
): Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const tg = yield* TelegramClient.TelegramClient
    const message = yield* tg.sendDice({
      chatId: env.chatId,
      ...(options?.emoji !== undefined ? { emoji: options.emoji } : {}),
      ...threadField(env),
      ...markupField(options),
      ...replyToField(options)
    })
    return yield* remember(env, message)
  })

// --- acting on the incoming message ------------------------------------------

/**
 * Deletes the message that produced the current update. Fails as a defect when the
 * update carries no deletable message.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.deleteMessage
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const deleteMessage: Effect.Effect<
  boolean,
  TelegramError.TelegramError,
  TelegramClient.TelegramClient
> = Effect.gen(function* () {
  const env = yield* UpdateContext.env
  const messageId = currentMessageId(env.update)
  if (messageId === undefined) {
    return yield* Effect.die(new Error("fibergram: Chat.deleteMessage used on an update with no message"))
  }
  const tg = yield* TelegramClient.TelegramClient
  return yield* tg.deleteMessage({ chatId: env.chatId, messageId })
})

/**
 * Reacts to the incoming message with a single emoji.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.react("🔥")
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const react = (
  emoji: string,
  options?: { readonly isBig?: boolean }
): Effect.Effect<boolean, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const messageId = currentMessageId(env.update)
    if (messageId === undefined) {
      return yield* Effect.die(new Error("fibergram: Chat.react used on an update with no message"))
    }
    const tg = yield* TelegramClient.TelegramClient
    return yield* tg.setMessageReaction({
      chatId: env.chatId,
      messageId,
      reaction: [{ type: "emoji", emoji }],
      ...(options?.isBig !== undefined ? { isBig: options.isBig } : {})
    })
  })

/**
 * Forwards the incoming message to another chat.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.forwardTo(123456)
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const forwardTo = (
  toChatId: number | string
): Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const messageId = currentMessageId(env.update)
    if (messageId === undefined) {
      return yield* Effect.die(new Error("fibergram: Chat.forwardTo used on an update with no message"))
    }
    const tg = yield* TelegramClient.TelegramClient
    const message = yield* tg.forwardMessage({ chatId: toChatId, fromChatId: env.chatId, messageId })
    return SentMessage.make(message)
  })

/**
 * Copies the incoming message to another chat (no link back), returning the new
 * message id.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.copyTo(123456)
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const copyTo = (
  toChatId: number | string
): Effect.Effect<BotApi.MessageId, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const messageId = currentMessageId(env.update)
    if (messageId === undefined) {
      return yield* Effect.die(new Error("fibergram: Chat.copyTo used on an update with no message"))
    }
    const tg = yield* TelegramClient.TelegramClient
    return yield* tg.copyMessage({ chatId: toChatId, fromChatId: env.chatId, messageId })
  })

// --- callback & inline queries -----------------------------------------------

/**
 * Options for {@link answerCallback}.
 *
 * @category models
 * @since 0.1.0
 */
export interface AnswerOptions {
  /** Toast text shown to the user. */
  readonly text?: string
  /** Show it as a modal alert rather than a toast. */
  readonly showAlert?: boolean
}

/**
 * Acknowledges the inline-button tap that produced the current update (stops the
 * client's spinner). Fails as a defect if the current update is not a callback
 * query.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.answerCallback({ text: "Saved" })
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const answerCallback = (
  options?: AnswerOptions
): Effect.Effect<boolean, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const query = env.update.callbackQuery
    if (query === undefined) {
      return yield* Effect.die(
        new Error("fibergram: Chat.answerCallback used on a non-callback update")
      )
    }
    const tg = yield* TelegramClient.TelegramClient
    return yield* tg.answerCallbackQuery({
      callbackQueryId: query.id,
      ...(options?.text !== undefined ? { text: options.text } : {}),
      ...(options?.showAlert !== undefined ? { showAlert: options.showAlert } : {})
    })
  })

/**
 * Answers the inline query that produced the current update. Fails as a defect if
 * the current update is not an inline query.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.answerInline([
 *     { type: "article", id: "1", title: "Hi", inputMessageContent: { messageText: "Hi" } }
 *   ])
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const answerInline = (
  results: ReadonlyArray<BotApi.InlineQueryResult>,
  options?: { readonly cacheTime?: number; readonly isPersonal?: boolean }
): Effect.Effect<boolean, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
  Effect.gen(function* () {
    const env = yield* UpdateContext.env
    const query = env.update.inlineQuery
    if (query === undefined) {
      return yield* Effect.die(new Error("fibergram: Chat.answerInline used on a non-inline-query update"))
    }
    const tg = yield* TelegramClient.TelegramClient
    return yield* tg.answerInlineQuery({
      inlineQueryId: query.id,
      results,
      ...(options?.cacheTime !== undefined ? { cacheTime: options.cacheTime } : {}),
      ...(options?.isPersonal !== undefined ? { isPersonal: options.isPersonal } : {})
    })
  })

// --- chat actions ------------------------------------------------------------

/**
 * A chat action indicator (`"typing"`, `"upload_photo"`, `"record_voice"`, ...).
 *
 * @category models
 * @since 0.1.0
 */
export type ChatAction =
  | "typing"
  | "upload_photo"
  | "record_video"
  | "upload_video"
  | "record_voice"
  | "upload_voice"
  | "upload_document"
  | "choose_sticker"
  | "find_location"
  | "record_video_note"
  | "upload_video_note"

/**
 * Runs `effect` while `action` shows in the current chat, cleared automatically
 * when it finishes - a textbook `Scope`/`acquireRelease`. Telegram expires the
 * indicator after ~5s, so it is refreshed every 4s; errors from the refresh are
 * ignored so they never fail the wrapped work. {@link withTyping} is
 * `withAction("typing")`.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const slow = Chat.withAction("upload_photo")(
 *   Effect.gen(function* () {
 *     yield* Effect.sleep("2 seconds")
 *     yield* Chat.replyPhoto("file_id")
 *   })
 * )
 *
 * @category combinators
 * @since 0.1.0
 */
export const withAction = (action: ChatAction) =>
<A, E, R>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R | TelegramClient.TelegramClient> =>
  Effect.scoped(
    Effect.gen(function* () {
      const env = yield* UpdateContext.env
      const tg = yield* TelegramClient.TelegramClient
      // Errors from the indicator must never fail the wrapped work.
      const tick = Effect.ignore(
        tg.sendChatAction({
          chatId: env.chatId,
          action,
          ...threadField(env)
        })
      )
      // Show it immediately, then refresh before Telegram's ~5s expiry.
      yield* tick
      const refresh = Effect.forever(Effect.andThen(Effect.sleep(Duration.seconds(4)), tick))
      yield* Effect.acquireRelease(Effect.forkChild(refresh), (fiber) => Fiber.interrupt(fiber))
      return yield* effect
    })
  )

/**
 * Runs `effect` while a `"typing…"` indicator shows in the current chat. A
 * shorthand for `Chat.withAction("typing")`.
 *
 * @example
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const slow = Chat.withTyping(
 *   Effect.gen(function* () {
 *     yield* Effect.sleep("2 seconds")
 *     yield* Chat.reply("Done")
 *   })
 * )
 *
 * @category combinators
 * @since 0.1.0
 */
export const withTyping = <A, E, R>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R | TelegramClient.TelegramClient> => withAction("typing")(effect)
