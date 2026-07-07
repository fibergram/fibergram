/**
 * `File` - a hydrated file value. The Bot API describes a downloadable file as a
 * plain {@link module:BotApi.File}; this module wraps it in a value that carries
 * the same data **plus** `Effect` accessors to act on it (`url`, `download`),
 * delegating to {@link module:TelegramClient.TelegramClientService.getFileUrl} and
 * {@link module:TelegramClient.TelegramClientService.downloadFile}.
 *
 * It is an ordinary value whose accessors close over the raw file, never a
 * mutated prototype. The accessors require `TelegramClient` only when run, so
 * hydration itself is pure and adds nothing to a handler's `R`.
 *
 * @since 0.1.0
 */
import { Effect, Option, Stream } from "effect"

import { TelegramClient } from "./client/index.js"

import type { BotApi, TelegramError } from "./client/index.js"

/**
 * A Telegram file hydrated with `Effect` accessors that act on it.
 *
 * @category models
 * @since 0.1.0
 */
export interface File extends BotApi.File {
  /** Resolve the full download URL (calls `getFile` when `filePath` is unknown). */
  readonly url: Effect.Effect<string, TelegramError.TelegramError, TelegramClient.TelegramClient>
  /** Stream the file's bytes. */
  readonly download: () => Stream.Stream<
    Uint8Array,
    TelegramError.TelegramError,
    TelegramClient.TelegramClient
  >
}

/**
 * Wraps a raw {@link module:BotApi.File} into a {@link File}, attaching the
 * `Effect` accessors that act on it. Pure - the accessors pull `TelegramClient`
 * only when run.
 *
 * @example
 * import { File } from "@fibergram/core"
 * import { Effect, Stream } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const file = File.make({ fileId: "abc", fileUniqueId: "u1" })
 *   const url = yield* file.url
 *   const bytes = yield* Stream.runCollect(file.download())
 *   return [url, bytes] as const
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = (raw: BotApi.File): File => ({
  ...raw,
  url: Effect.flatMap(TelegramClient.TelegramClient, (tg) => tg.getFileUrl(raw)),
  download: () =>
    Stream.unwrap(Effect.map(TelegramClient.TelegramClient, (tg) => tg.downloadFile(raw)))
})

/**
 * The file a message carries, if any. Checks, in order: `photo` (the last -
 * largest - size), `document`, `video`, `audio`, `voice`, `animation`,
 * `videoNote`, `sticker`.
 *
 * @example
 * import { File } from "@fibergram/core"
 * import { Effect, Option } from "effect"
 * import type { BotApi } from "@fibergram/core/client"
 *
 * const download = (message: BotApi.Message) =>
 *   Option.match(File.fromMessage(message), {
 *     onNone: () => Effect.void,
 *     onSome: (file) => Effect.asVoid(file.url)
 *   })
 *
 * @category constructors
 * @since 0.1.0
 */
export const fromMessage = (message: BotApi.Message): Option.Option<File> => {
  const raw = message.photo?.at(-1) ??
    message.document ??
    message.video ??
    message.audio ??
    message.voice ??
    message.animation ??
    message.videoNote ??
    message.sticker
  return raw === undefined ? Option.none() : Option.some(make(raw))
}
