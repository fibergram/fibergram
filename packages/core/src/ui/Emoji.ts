/**
 * `Emoji` - a typed emoji tagged template (grammY's `@grammyjs/emoji`). Write
 * `emoji\`party ${"tada"}!\`` and the compiler checks every name against a curated
 * table, so a typo is a type error, not a literal `":tada:"` shipped to users.
 *
 * The table is curated (a common subset), not exhaustive; the point is the
 * compiler-checked mechanism. For animated custom emoji in formatted text, see
 * {@link module:Fmt.customEmoji}.
 *
 * @since 0.1.0
 */

/**
 * The curated emoji table: name → unicode. The keys are the valid
 * {@link EmojiName} values.
 *
 * @category models
 * @since 0.1.0
 */
export const emojis = {
  "grinning": "😀",
  "smile": "😄",
  "laughing": "😆",
  "sweat_smile": "😅",
  "rofl": "🤣",
  "joy": "😂",
  "slightly_smiling_face": "🙂",
  "wink": "😉",
  "blush": "😊",
  "innocent": "😇",
  "heart_eyes": "😍",
  "kissing_heart": "😘",
  "yum": "😋",
  "sunglasses": "😎",
  "nerd_face": "🤓",
  "thinking": "🤔",
  "shushing_face": "🤫",
  "neutral_face": "😐",
  "expressionless": "😑",
  "rolling_eyes": "🙄",
  "smirk": "😏",
  "unamused": "😒",
  "relieved": "😌",
  "pensive": "😔",
  "sleepy": "😪",
  "sleeping": "😴",
  "mask": "😷",
  "dizzy_face": "😵",
  "exploding_head": "🤯",
  "cowboy": "🤠",
  "partying_face": "🥳",
  "sunglasses_cool": "😎",
  "worried": "😟",
  "frowning": "😦",
  "anguished": "😧",
  "open_mouth": "😮",
  "astonished": "😲",
  "flushed": "😳",
  "pleading_face": "🥺",
  "cry": "😢",
  "sob": "😭",
  "scream": "😱",
  "confounded": "😖",
  "persevere": "😣",
  "disappointed": "😞",
  "sweat": "😓",
  "weary": "😩",
  "tired_face": "😫",
  "yawning_face": "🥱",
  "triumph": "😤",
  "rage": "😡",
  "angry": "😠",
  "cursing_face": "🤬",
  "smiling_imp": "😈",
  "imp": "👿",
  "skull": "💀",
  "poop": "💩",
  "clown_face": "🤡",
  "ghost": "👻",
  "alien": "👽",
  "robot": "🤖",
  "wave": "👋",
  "raised_hand": "✋",
  "ok_hand": "👌",
  "pinching_hand": "🤏",
  "point_up": "☝️",
  "point_down": "👇",
  "point_left": "👈",
  "point_right": "👉",
  "thumbsup": "👍",
  "thumbsdown": "👎",
  "fist": "✊",
  "punch": "👊",
  "clap": "👏",
  "raised_hands": "🙌",
  "open_hands": "👐",
  "pray": "🙏",
  "handshake": "🤝",
  "writing_hand": "✍️",
  "nail_care": "💅",
  "muscle": "💪",
  "eyes": "👀",
  "brain": "🧠",
  "heart": "❤️",
  "orange_heart": "🧡",
  "yellow_heart": "💛",
  "green_heart": "💚",
  "blue_heart": "💙",
  "purple_heart": "💜",
  "black_heart": "🖤",
  "white_heart": "🤍",
  "broken_heart": "💔",
  "heart_on_fire": "❤️‍🔥",
  "sparkling_heart": "💖",
  "two_hearts": "💕",
  "revolving_hearts": "💞",
  "cupid": "💘",
  "gift_heart": "💝",
  "fire": "🔥",
  "star": "⭐",
  "star2": "🌟",
  "sparkles": "✨",
  "zap": "⚡",
  "boom": "💥",
  "dizzy": "💫",
  "sweat_drops": "💦",
  "droplet": "💧",
  "snowflake": "❄️",
  "sunny": "☀️",
  "cloud": "☁️",
  "rainbow": "🌈",
  "tada": "🎉",
  "confetti_ball": "🎊",
  "balloon": "🎈",
  "gift": "🎁",
  "trophy": "🏆",
  "medal": "🏅",
  "first_place": "🥇",
  "crown": "👑",
  "gem": "💎",
  "moneybag": "💰",
  "dollar": "💵",
  "credit_card": "💳",
  "rocket": "🚀",
  "airplane": "✈️",
  "car": "🚗",
  "checkered_flag": "🏁",
  "bulb": "💡",
  "flashlight": "🔦",
  "lock": "🔒",
  "unlock": "🔓",
  "key": "🔑",
  "hammer": "🔨",
  "wrench": "🔧",
  "gear": "⚙️",
  "package": "📦",
  "email": "📧",
  "phone": "📱",
  "computer": "💻",
  "keyboard": "⌨️",
  "battery": "🔋",
  "magnifying_glass": "🔍",
  "bell": "🔔",
  "mute": "🔕",
  "loudspeaker": "📢",
  "megaphone": "📣",
  "calendar": "📅",
  "pushpin": "📌",
  "paperclip": "📎",
  "pencil": "✏️",
  "memo": "📝",
  "book": "📖",
  "books": "📚",
  "clipboard": "📋",
  "chart_up": "📈",
  "chart_down": "📉",
  "bar_chart": "📊",
  "check_mark": "✅",
  "cross_mark": "❌",
  "warning": "⚠️",
  "no_entry": "⛔",
  "question": "❓",
  "exclamation": "❗",
  "hundred": "💯",
  "recycle": "♻️",
  "heavy_check_mark": "✔️",
  "arrow_right": "➡️",
  "arrow_left": "⬅️",
  "arrow_up": "⬆️",
  "arrow_down": "⬇️",
  "back": "🔙",
  "soon": "🔜",
  "hourglass": "⏳",
  "watch": "⌚",
  "alarm_clock": "⏰",
  "coffee": "☕",
  "beer": "🍺",
  "pizza": "🍕",
  "hamburger": "🍔",
  "cake": "🎂",
  "apple": "🍎",
  "banana": "🍌",
  "strawberry": "🍓",
  "dog": "🐶",
  "cat": "🐱",
  "unicorn": "🦄",
  "whale": "🐳",
  "penguin": "🐧",
  "bug": "🐛",
  "seedling": "🌱",
  "four_leaf_clover": "🍀",
  "rose": "🌹",
  "sun_with_face": "🌞",
  "moon": "🌚",
  "earth": "🌍"
} as const

/**
 * A valid emoji name - one of the keys of {@link emojis}.
 *
 * @category models
 * @since 0.1.0
 */
export type EmojiName = keyof typeof emojis

/**
 * Look up a single emoji by name (compiler-checked).
 *
 * @example
 * import { Emoji } from "@fibergram/core/ui"
 *
 * Emoji.get("tada") // "🎉"
 *
 * @category combinators
 * @since 0.1.0
 */
export const get = (name: EmojiName): string => emojis[name]

/**
 * A tagged template that substitutes emoji names for their unicode. Every
 * interpolated name is checked against {@link emojis} at compile time.
 *
 * @example
 * import { Emoji } from "@fibergram/core/ui"
 *
 * const message = Emoji.emoji`Congrats ${"tada"}${"tada"} you did it ${"fire"}`
 * // "Congrats 🎉🎉 you did it 🔥"
 *
 * @category combinators
 * @since 0.1.0
 */
export const emoji = (strings: TemplateStringsArray, ...names: ReadonlyArray<EmojiName>): string => {
  let out = ""
  for (const [index, chunk] of strings.entries()) {
    out += chunk
    const name = names[index]
    if (name !== undefined) out += emojis[name]
  }
  return out
}
