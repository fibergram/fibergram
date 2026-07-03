/**
 * `Reaction` - the closed set of emoji Telegram allows as message reactions, as a
 * typed union, plus a constructor for the `ReactionTypeEmoji` object. Use the
 * literals with {@link module:Chat.react} / {@link module:Router.reaction} to catch
 * a wrong emoji at compile time instead of a runtime Bot API error.
 *
 * @since 0.1.0
 */
import type { BotApi } from "../client/index.js"

/**
 * The closed list of emoji accepted as reactions (Bot API `ReactionTypeEmoji`).
 *
 * @category models
 * @since 0.1.0
 */
export const emojis = [
  "👍", "👎", "❤", "🔥", "🥰", "👏", "😁", "🤔", "🤯", "😱", "🤬", "😢", "🎉", "🤩",
  "🤮", "💩", "🙏", "👌", "🕊", "🤡", "🥱", "🥴", "😍", "🐳", "❤‍🔥", "🌚", "🌭", "💯",
  "🤣", "⚡", "🍌", "🏆", "💔", "🤨", "😐", "🍓", "🍾", "💋", "🖕", "😈", "😴", "😭",
  "🤓", "👻", "👨‍💻", "👀", "🎃", "🙈", "😇", "😨", "🤝", "✍", "🤗", "🫡", "🎅", "🎄",
  "☃", "💅", "🤪", "🗿", "🆒", "💘", "🙉", "🦄", "😘", "💊", "🙊", "😎", "👾", "🤷‍♂",
  "🤷", "🤷‍♀", "😡"
] as const

/**
 * An emoji that Telegram accepts as a reaction - one of {@link emojis}.
 *
 * @category models
 * @since 0.1.0
 */
export type ReactionEmoji = typeof emojis[number]

const allowed: ReadonlySet<string> = new Set(emojis)

/**
 * Whether `emoji` is a valid reaction emoji (a runtime refinement over the closed
 * {@link emojis} list).
 *
 * @example
 * import { Reaction } from "@fibergram/core/ui"
 *
 * Reaction.isReactionEmoji("🔥") // true
 * Reaction.isReactionEmoji("🥑") // false
 *
 * @category refinements
 * @since 0.1.0
 */
export const isReactionEmoji = (emoji: string): emoji is ReactionEmoji => allowed.has(emoji)

/**
 * Build a `ReactionTypeEmoji` object from a reaction emoji (for `setMessageReaction`).
 *
 * @example
 * import { Reaction } from "@fibergram/core/ui"
 *
 * const reaction = Reaction.of("🔥") // { type: "emoji", emoji: "🔥" }
 *
 * @category constructors
 * @since 0.1.0
 */
export const of = (emoji: ReactionEmoji): BotApi.ReactionTypeEmoji => ({ type: "emoji", emoji })

/**
 * The 👍 reaction.
 *
 * @example
 * import { Reaction } from "@fibergram/core/ui"
 * import { Chat } from "@fibergram/core"
 *
 * const react = Chat.react(Reaction.thumbsUp)
 *
 * @category constructors
 * @since 0.1.0
 */
export const thumbsUp: ReactionEmoji = "👍"

/**
 * The 👎 reaction.
 *
 * @example
 * import { Reaction } from "@fibergram/core/ui"
 *
 * const emoji = Reaction.thumbsDown
 *
 * @category constructors
 * @since 0.1.0
 */
export const thumbsDown: ReactionEmoji = "👎"

/**
 * The ❤ reaction.
 *
 * @example
 * import { Reaction } from "@fibergram/core/ui"
 *
 * const emoji = Reaction.heart
 *
 * @category constructors
 * @since 0.1.0
 */
export const heart: ReactionEmoji = "❤"

/**
 * The 🔥 reaction.
 *
 * @example
 * import { Reaction } from "@fibergram/core/ui"
 *
 * const emoji = Reaction.fire
 *
 * @category constructors
 * @since 0.1.0
 */
export const fire: ReactionEmoji = "🔥"

/**
 * The 👏 reaction.
 *
 * @example
 * import { Reaction } from "@fibergram/core/ui"
 *
 * const emoji = Reaction.clap
 *
 * @category constructors
 * @since 0.1.0
 */
export const clap: ReactionEmoji = "👏"
