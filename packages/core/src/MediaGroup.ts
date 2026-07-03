/**
 * `MediaGroup` - an immutable builder for an album (`sendMediaGroup`): chain
 * `.photo` / `.video` / `.document` / `.audio`, each accepting an uploaded
 * {@link module:InputFile.InputFile} or a `file_id`/URL string, and the `attach://`
 * wiring is handled by the transport seam.
 *
 * Every method returns a new `MediaGroup`, so a group is a plain value with no
 * hidden mutation. Feed it to {@link module:Chat.replyMediaGroup} or read `.items`
 * to pass to the client directly.
 *
 * @since 0.1.0
 */
import type { BotApi, InputFile } from "./client/index.js"

/**
 * One album item: a photo, video, audio, or document input-media object.
 *
 * @category models
 * @since 0.1.0
 */
export type Item =
  | BotApi.InputMediaPhoto
  | BotApi.InputMediaVideo
  | BotApi.InputMediaAudio
  | BotApi.InputMediaDocument

/**
 * Caption attributes shared by every album item.
 *
 * @category models
 * @since 0.1.0
 */
export interface CaptionOptions {
  /** Caption text (shown under the item; on the first item it captions the album). */
  readonly caption?: string
  /** Parse mode for the caption (`"MarkdownV2"`, `"HTML"`, ...). */
  readonly parseMode?: string
  /** Pre-parsed caption entities (mutually exclusive with `parseMode`). */
  readonly captionEntities?: ReadonlyArray<BotApi.MessageEntity>
}

/**
 * Options for a photo / video item.
 *
 * @category models
 * @since 0.1.0
 */
export interface VisualOptions extends CaptionOptions {
  /** Cover the media with a spoiler animation. */
  readonly hasSpoiler?: boolean
  /** Show the caption above the media instead of below. */
  readonly showCaptionAboveMedia?: boolean
}

/**
 * A file to place in an album: an uploaded {@link module:InputFile.InputFile} or a
 * `file_id`/URL string.
 *
 * @category models
 * @since 0.1.0
 */
export type Media = InputFile.InputFile | string

/**
 * An immutable album under construction. Chain the `add*` methods; read `items`
 * for the built array.
 *
 * @category models
 * @since 0.1.0
 */
export interface MediaGroup {
  /** The items accumulated so far, ready for `sendMediaGroup`. */
  readonly items: ReadonlyArray<Item>
  /** Append a photo. */
  readonly photo: (media: Media, options?: VisualOptions) => MediaGroup
  /** Append a video. */
  readonly video: (media: Media, options?: VisualOptions) => MediaGroup
  /** Append a document. */
  readonly document: (media: Media, options?: CaptionOptions) => MediaGroup
  /** Append an audio track. */
  readonly audio: (media: Media, options?: CaptionOptions) => MediaGroup
}

const caption = (options?: CaptionOptions): Record<string, unknown> => ({
  ...(options?.caption !== undefined ? { caption: options.caption } : {}),
  ...(options?.parseMode !== undefined ? { parseMode: options.parseMode } : {}),
  ...(options?.captionEntities !== undefined ? { captionEntities: options.captionEntities } : {})
})

const visual = (options?: VisualOptions): Record<string, unknown> => ({
  ...caption(options),
  ...(options?.hasSpoiler !== undefined ? { hasSpoiler: options.hasSpoiler } : {}),
  ...(options?.showCaptionAboveMedia !== undefined ? { showCaptionAboveMedia: options.showCaptionAboveMedia } : {})
})

const build = (items: ReadonlyArray<Item>): MediaGroup => ({
  items,
  photo: (media, options) => build([...items, { type: "photo", media, ...visual(options) }]),
  video: (media, options) => build([...items, { type: "video", media, ...visual(options) }]),
  document: (media, options) => build([...items, { type: "document", media, ...caption(options) }]),
  audio: (media, options) => build([...items, { type: "audio", media, ...caption(options) }])
})

/**
 * An empty {@link MediaGroup} to start building from.
 *
 * @example
 * import { MediaGroup } from "@fibergram/core"
 * import { InputFile } from "@fibergram/core/client"
 *
 * const album = MediaGroup.empty
 *   .photo(InputFile.fromPath("./1.png"), { caption: "First" })
 *   .photo(InputFile.fromPath("./2.png"))
 *
 * const items = album.items
 *
 * @category constructors
 * @since 0.1.0
 */
export const empty: MediaGroup = build([])
