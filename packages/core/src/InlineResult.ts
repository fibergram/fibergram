/**
 * `InlineResult` - constructors over the generated `InlineQueryResult*` schemas,
 * so answering an inline query reads as data instead of hand-built objects with
 * literal `type` tags. Each returns a {@link module:BotApi.InlineQueryResult} ready
 * for `Hydrated.InlineQuery.answer` / `Chat.answerInline`.
 *
 * @since 0.1.0
 */
import type { BotApi } from "./client/index.js"

const textContent = (message: string): BotApi.InputTextMessageContent => ({ messageText: message })

/**
 * Options for {@link article}.
 *
 * @category models
 * @since 0.1.0
 */
export interface ArticleOptions {
  /** Unique id of this result (≤ 64 bytes). */
  readonly id: string
  /** Result title shown in the list. */
  readonly title: string
  /** The message sent when the result is chosen: text, or full input content. */
  readonly message: string | BotApi.InputMessageContent
  /** Short description under the title. */
  readonly description?: string
  /** URL of the result. */
  readonly url?: string
  /** Thumbnail URL. */
  readonly thumbnailUrl?: string
  /** Inline keyboard attached to the message. */
  readonly replyMarkup?: BotApi.InlineKeyboardMarkup
}

/**
 * An `article` inline result - a titled item that sends `message` when chosen.
 *
 * @example
 * import { InlineResult } from "@fibergram/core"
 *
 * const result = InlineResult.article({ id: "1", title: "Greeting", message: "Hello!" })
 *
 * @category constructors
 * @since 0.1.0
 */
export const article = (options: ArticleOptions): BotApi.InlineQueryResult => ({
  type: "article",
  id: options.id,
  title: options.title,
  inputMessageContent: typeof options.message === "string"
    ? textContent(options.message)
    : options.message,
  ...(options.description !== undefined ? { description: options.description } : {}),
  ...(options.url !== undefined ? { url: options.url } : {}),
  ...(options.thumbnailUrl !== undefined ? { thumbnailUrl: options.thumbnailUrl } : {}),
  ...(options.replyMarkup !== undefined ? { replyMarkup: options.replyMarkup } : {})
})

/**
 * Options for {@link photo}.
 *
 * @category models
 * @since 0.1.0
 */
export interface PhotoOptions {
  /** Unique id of this result (≤ 64 bytes). */
  readonly id: string
  /** URL of the full photo (JPEG, ≤ 5MB). */
  readonly photoUrl: string
  /** URL of the thumbnail. */
  readonly thumbnailUrl: string
  /** Title of the result. */
  readonly title?: string
  /** Caption of the photo. */
  readonly caption?: string
  /** Inline keyboard attached to the message. */
  readonly replyMarkup?: BotApi.InlineKeyboardMarkup
}

/**
 * A `photo` inline result - shows a photo by URL, sent when chosen.
 *
 * @example
 * import { InlineResult } from "@fibergram/core"
 *
 * const result = InlineResult.photo({
 *   id: "1",
 *   photoUrl: "https://example.com/cat.jpg",
 *   thumbnailUrl: "https://example.com/cat_thumb.jpg",
 *   caption: "meow"
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const photo = (options: PhotoOptions): BotApi.InlineQueryResult => ({
  type: "photo",
  id: options.id,
  photoUrl: options.photoUrl,
  thumbnailUrl: options.thumbnailUrl,
  ...(options.title !== undefined ? { title: options.title } : {}),
  ...(options.caption !== undefined ? { caption: options.caption } : {}),
  ...(options.replyMarkup !== undefined ? { replyMarkup: options.replyMarkup } : {})
})

/**
 * Options for {@link gif}.
 *
 * @category models
 * @since 0.1.0
 */
export interface GifOptions {
  /** Unique id of this result (≤ 64 bytes). */
  readonly id: string
  /** URL of the GIF file. */
  readonly gifUrl: string
  /** URL of the static thumbnail. */
  readonly thumbnailUrl: string
  /** Title of the result. */
  readonly title?: string
  /** Caption of the GIF. */
  readonly caption?: string
  /** Inline keyboard attached to the message. */
  readonly replyMarkup?: BotApi.InlineKeyboardMarkup
}

/**
 * A `gif` inline result - an animated GIF by URL.
 *
 * @example
 * import { InlineResult } from "@fibergram/core"
 *
 * const result = InlineResult.gif({
 *   id: "1",
 *   gifUrl: "https://example.com/loop.gif",
 *   thumbnailUrl: "https://example.com/loop_thumb.jpg"
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const gif = (options: GifOptions): BotApi.InlineQueryResult => ({
  type: "gif",
  id: options.id,
  gifUrl: options.gifUrl,
  thumbnailUrl: options.thumbnailUrl,
  ...(options.title !== undefined ? { title: options.title } : {}),
  ...(options.caption !== undefined ? { caption: options.caption } : {}),
  ...(options.replyMarkup !== undefined ? { replyMarkup: options.replyMarkup } : {})
})

/**
 * Options for {@link video}.
 *
 * @category models
 * @since 0.1.0
 */
export interface VideoOptions {
  /** Unique id of this result (≤ 64 bytes). */
  readonly id: string
  /** URL of the embedded video player or video file. */
  readonly videoUrl: string
  /** MIME type of the content (`"text/html"` or `"video/mp4"`). */
  readonly mimeType: string
  /** URL of the thumbnail (JPEG). */
  readonly thumbnailUrl: string
  /** Title of the result. */
  readonly title: string
  /** Caption of the video. */
  readonly caption?: string
  /** Inline keyboard attached to the message. */
  readonly replyMarkup?: BotApi.InlineKeyboardMarkup
}

/**
 * A `video` inline result - a video by URL (or an embedded player).
 *
 * @example
 * import { InlineResult } from "@fibergram/core"
 *
 * const result = InlineResult.video({
 *   id: "1",
 *   videoUrl: "https://example.com/clip.mp4",
 *   mimeType: "video/mp4",
 *   thumbnailUrl: "https://example.com/clip_thumb.jpg",
 *   title: "Clip"
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const video = (options: VideoOptions): BotApi.InlineQueryResult => ({
  type: "video",
  id: options.id,
  videoUrl: options.videoUrl,
  mimeType: options.mimeType,
  thumbnailUrl: options.thumbnailUrl,
  title: options.title,
  ...(options.caption !== undefined ? { caption: options.caption } : {}),
  ...(options.replyMarkup !== undefined ? { replyMarkup: options.replyMarkup } : {})
})

/**
 * Options for {@link document}.
 *
 * @category models
 * @since 0.1.0
 */
export interface DocumentOptions {
  /** Unique id of this result (≤ 64 bytes). */
  readonly id: string
  /** Title of the result. */
  readonly title: string
  /** URL of the file. */
  readonly documentUrl: string
  /** MIME type (`"application/pdf"` or `"application/zip"`). */
  readonly mimeType: string
  /** Caption of the document. */
  readonly caption?: string
  /** Short description under the title. */
  readonly description?: string
  /** Inline keyboard attached to the message. */
  readonly replyMarkup?: BotApi.InlineKeyboardMarkup
}

/**
 * A `document` inline result - a file (PDF or ZIP) by URL.
 *
 * @example
 * import { InlineResult } from "@fibergram/core"
 *
 * const result = InlineResult.document({
 *   id: "1",
 *   title: "Report",
 *   documentUrl: "https://example.com/report.pdf",
 *   mimeType: "application/pdf"
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const document = (options: DocumentOptions): BotApi.InlineQueryResult => ({
  type: "document",
  id: options.id,
  title: options.title,
  documentUrl: options.documentUrl,
  mimeType: options.mimeType,
  ...(options.caption !== undefined ? { caption: options.caption } : {}),
  ...(options.description !== undefined ? { description: options.description } : {}),
  ...(options.replyMarkup !== undefined ? { replyMarkup: options.replyMarkup } : {})
})
