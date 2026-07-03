/**
 * `Keyboard` - an immutable builder for a custom reply keyboard
 * (`ReplyKeyboardMarkup`). Chain `.text` / `.requestContact` / `.webApp` / … to
 * append buttons, `.row()` to start a new row, `.adjust(...sizes)` to reflow into
 * columns, and the flag methods (`.resized()`, `.oneTime()`, `.persistent()`,
 * `.placeholder()`, `.selective()`) to set markup options. Every method returns a
 * new `Keyboard`, so it is a plain value with no hidden mutation.
 *
 * Reply-keyboard buttons carry no `callback_data`, so turning a keyboard into its
 * markup is the pure {@link build} - no `Effect` needed (unlike
 * {@link module:InlineKeyboard.build}).
 *
 * @since 0.1.0
 */
import type { BotApi } from "../client/index.js"

interface Options {
  readonly isPersistent?: boolean
  readonly resizeKeyboard?: boolean
  readonly oneTimeKeyboard?: boolean
  readonly inputFieldPlaceholder?: string
  readonly selective?: boolean
}

/**
 * A reply keyboard under construction. Chain the button and flag methods; feed it
 * to {@link build} to turn it into a `ReplyKeyboardMarkup`.
 *
 * @category models
 * @since 0.1.0
 */
export interface Keyboard {
  /** The accumulated rows of buttons (internal representation). */
  readonly rows: ReadonlyArray<ReadonlyArray<BotApi.KeyboardButton>>
  /** The markup options set by the flag methods (internal representation). */
  readonly options: Options
  /** Append a plain text button. */
  readonly text: (label: string) => Keyboard
  /** Append a button that requests the user's phone contact. */
  readonly requestContact: (label: string) => Keyboard
  /** Append a button that requests the user's location. */
  readonly requestLocation: (label: string) => Keyboard
  /** Append a button that opens a poll composer (`"regular"`, `"quiz"`, or any). */
  readonly requestPoll: (label: string, type?: string) => Keyboard
  /** Append a button that requests users matching `request` (needs a `requestId`). */
  readonly requestUsers: (label: string, request: BotApi.KeyboardButtonRequestUsers) => Keyboard
  /** Append a button that requests a chat matching `request` (needs a `requestId`). */
  readonly requestChat: (label: string, request: BotApi.KeyboardButtonRequestChat) => Keyboard
  /** Append a Web App button. */
  readonly webApp: (label: string, url: string) => Keyboard
  /** Start a new row; subsequent buttons append to it. */
  readonly row: () => Keyboard
  /** Reflow every accumulated button into rows of the given column sizes (last size repeats). */
  readonly adjust: (...sizes: ReadonlyArray<number>) => Keyboard
  /** Request clients to resize the keyboard to fit its buttons. */
  readonly resized: () => Keyboard
  /** Hide the keyboard after one use. */
  readonly oneTime: () => Keyboard
  /** Keep the keyboard visible while the regular keyboard is closed. */
  readonly persistent: () => Keyboard
  /** Set the input field placeholder shown while the keyboard is active. */
  readonly placeholder: (text: string) => Keyboard
  /** Show the keyboard only to specific users (see the Bot API `selective` rules). */
  readonly selective: () => Keyboard
}

const appendToLast = (
  rows: ReadonlyArray<ReadonlyArray<BotApi.KeyboardButton>>,
  button: BotApi.KeyboardButton
): ReadonlyArray<ReadonlyArray<BotApi.KeyboardButton>> => {
  const last = rows.at(-1)
  return last === undefined
    ? [[button]]
    : [...rows.slice(0, -1), [...last, button]]
}

const reflow = (
  buttons: ReadonlyArray<BotApi.KeyboardButton>,
  sizes: ReadonlyArray<number>
): ReadonlyArray<ReadonlyArray<BotApi.KeyboardButton>> => {
  const rows: Array<ReadonlyArray<BotApi.KeyboardButton>> = []
  let index = 0
  let step = 0
  while (index < buttons.length) {
    const raw = sizes[Math.min(step, sizes.length - 1)] ?? buttons.length
    const size = Math.max(1, raw)
    rows.push(buttons.slice(index, index + size))
    index += size
    step++
  }
  return rows
}

const make = (
  rows: ReadonlyArray<ReadonlyArray<BotApi.KeyboardButton>>,
  options: Options
): Keyboard => ({
  rows,
  options,
  text: (label) => make(appendToLast(rows, { text: label }), options),
  requestContact: (label) => make(appendToLast(rows, { text: label, requestContact: true }), options),
  requestLocation: (label) => make(appendToLast(rows, { text: label, requestLocation: true }), options),
  requestPoll: (label, type) =>
    make(appendToLast(rows, { text: label, requestPoll: type !== undefined ? { type } : {} }), options),
  requestUsers: (label, request) => make(appendToLast(rows, { text: label, requestUsers: request }), options),
  requestChat: (label, request) => make(appendToLast(rows, { text: label, requestChat: request }), options),
  webApp: (label, url) => make(appendToLast(rows, { text: label, webApp: { url } }), options),
  row: () => make([...rows, []], options),
  adjust: (...sizes) => make(reflow(rows.flat(), sizes), options),
  resized: () => make(rows, { ...options, resizeKeyboard: true }),
  oneTime: () => make(rows, { ...options, oneTimeKeyboard: true }),
  persistent: () => make(rows, { ...options, isPersistent: true }),
  placeholder: (text) => make(rows, { ...options, inputFieldPlaceholder: text }),
  selective: () => make(rows, { ...options, selective: true })
})

/**
 * An empty {@link Keyboard} to start building from.
 *
 * @example
 * import { Keyboard } from "@fibergram/core/ui"
 *
 * const keyboard = Keyboard.empty
 *   .text("Yes").text("No")
 *   .row()
 *   .requestContact("Share my number")
 *   .resized()
 *   .oneTime()
 *
 * @category constructors
 * @since 0.1.0
 */
export const empty: Keyboard = make([], {})

/**
 * Resolve a keyboard into a `ReplyKeyboardMarkup`. Empty rows are dropped.
 *
 * @example
 * import { Keyboard } from "@fibergram/core/ui"
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   const keyboard = Keyboard.empty.text("A").text("B").resized()
 *   yield* Chat.reply("Pick one", { replyMarkup: Keyboard.build(keyboard) })
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const build = (keyboard: Keyboard): BotApi.ReplyKeyboardMarkup => ({
  keyboard: keyboard.rows.filter((row) => row.length > 0),
  ...(keyboard.options.isPersistent !== undefined ? { isPersistent: keyboard.options.isPersistent } : {}),
  ...(keyboard.options.resizeKeyboard !== undefined ? { resizeKeyboard: keyboard.options.resizeKeyboard } : {}),
  ...(keyboard.options.oneTimeKeyboard !== undefined ? { oneTimeKeyboard: keyboard.options.oneTimeKeyboard } : {}),
  ...(keyboard.options.inputFieldPlaceholder !== undefined
    ? { inputFieldPlaceholder: keyboard.options.inputFieldPlaceholder }
    : {}),
  ...(keyboard.options.selective !== undefined ? { selective: keyboard.options.selective } : {})
})

/**
 * A `ReplyKeyboardRemove` that hides the current custom keyboard, restoring the
 * default letter keyboard.
 *
 * @example
 * import { Keyboard } from "@fibergram/core/ui"
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   yield* Chat.reply("Done", { replyMarkup: Keyboard.remove() })
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const remove = (options?: { readonly selective?: boolean }): BotApi.ReplyKeyboardRemove => ({
  removeKeyboard: true,
  ...(options?.selective !== undefined ? { selective: options.selective } : {})
})
