/**
 * `@fibergram/core/client` - `TelegramClient` (Tag + Layer over `HttpClient`) plus
 * the Bot API edge schemas. This package owns the `snake_case <-> camelCase`
 * boundary and the typed Telegram error union; everything
 * else in fibergram builds on top of it.
 *
 * @since 0.1.0
 */

/**
 * Bot API edge schemas (`Update`, `Message`, `Chat`, `User`, request/response
 * shapes).
 *
 * @since 0.1.0
 */
export * as BotApi from "./BotApi.js"

/**
 * The typed Telegram error union and its response mapper.
 *
 * @since 0.1.0
 */
export * as TelegramError from "./TelegramError.js"

/**
 * The `TelegramClient` service, its layers and constructors.
 *
 * @since 0.1.0
 */
export * as TelegramClient from "./TelegramClient.js"

/**
 * `InputFile` - files to upload (path / bytes / stream / URL).
 *
 * @since 0.1.0
 */
export * as InputFile from "./InputFile.js"

/**
 * The JSON-vs-multipart body decision for the transport seam.
 *
 * @since 0.1.0
 */
export * as Multipart from "./Multipart.js"

/**
 * Mini App `initData` HMAC validation and the typed `WebAppInitData`.
 *
 * @since 0.1.0
 */
export * as WebApp from "./WebApp.js"
