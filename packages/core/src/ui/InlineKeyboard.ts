/**
 * `InlineKeyboard` - an immutable builder for an `inline_keyboard` markup. Chain
 * `.text` / `.url` / `.webApp` / … to append buttons to the current row, `.row()`
 * to start a new one, and `.adjust(...sizes)` to reflow every button into columns
 * (aiogram's column layout). Every method returns a new `InlineKeyboard`, so a
 * keyboard is a plain value with no hidden mutation.
 *
 * The differentiator is `.data`: it takes a typed {@link module:CallbackData.Codec}
 * and a value, so a button carries a schema-encoded payload instead of a
 * hand-built `callback_data` string. Because encoding can overflow 64 bytes,
 * turning the keyboard into its markup is the effectful {@link build} step.
 *
 * @since 0.1.0
 */
import { Effect } from "effect"

import type { BotApi } from "../client/index.js"
import type { CallbackData } from "../index.js"

// One accumulated button: either a fully-built button, or a pending typed encode
// (from `.data`) resolved by `build`.
type Spec =
  | { readonly kind: "static"; readonly button: BotApi.InlineKeyboardButton }
  | {
    readonly kind: "encoded"
    readonly effect: Effect.Effect<BotApi.InlineKeyboardButton, CallbackData.CallbackDataTooLong>
  }

/**
 * An inline keyboard under construction. Chain the button methods; feed it to
 * {@link build} to turn it into an `InlineKeyboardMarkup`.
 *
 * @category models
 * @since 0.1.0
 */
export interface InlineKeyboard {
  /** The accumulated rows of button specs (internal representation). */
  readonly rows: ReadonlyArray<ReadonlyArray<Spec>>
  /** Append a button carrying a raw `callback_data` string. */
  readonly text: (label: string, callbackData: string) => InlineKeyboard
  /** Append a button whose payload is `value` encoded by a typed {@link module:CallbackData.Codec}. */
  readonly data: <A>(label: string, codec: CallbackData.Codec<A>, value: A) => InlineKeyboard
  /** Append a URL button. */
  readonly url: (label: string, url: string) => InlineKeyboard
  /** Append a Web App button. */
  readonly webApp: (label: string, url: string) => InlineKeyboard
  /** Append a Telegram Login button (a URL, or full `LoginUrl` parameters). */
  readonly login: (label: string, url: string | BotApi.LoginUrl) => InlineKeyboard
  /** Append a button that switches to inline mode in another chat, with an optional query. */
  readonly switchInline: (label: string, query?: string) => InlineKeyboard
  /** Append a button that switches to inline mode in the current chat, with an optional query. */
  readonly switchInlineCurrent: (label: string, query?: string) => InlineKeyboard
  /** Append a button that copies `text` to the clipboard when tapped. */
  readonly copyText: (label: string, text: string) => InlineKeyboard
  /** Append a Pay button (must be the first button of the first row). */
  readonly pay: (label: string) => InlineKeyboard
  /** Start a new row; subsequent buttons append to it. */
  readonly row: () => InlineKeyboard
  /** Reflow every accumulated button into rows of the given column sizes (last size repeats). */
  readonly adjust: (...sizes: ReadonlyArray<number>) => InlineKeyboard
}

const staticButton = (button: BotApi.InlineKeyboardButton): Spec => ({ kind: "static", button })

const appendToLast = (rows: ReadonlyArray<ReadonlyArray<Spec>>, spec: Spec): ReadonlyArray<ReadonlyArray<Spec>> => {
  const last = rows.at(-1)
  return last === undefined
    ? [[spec]]
    : [...rows.slice(0, -1), [...last, spec]]
}

const reflow = (
  buttons: ReadonlyArray<Spec>,
  sizes: ReadonlyArray<number>
): ReadonlyArray<ReadonlyArray<Spec>> => {
  const rows: Array<ReadonlyArray<Spec>> = []
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

const make = (rows: ReadonlyArray<ReadonlyArray<Spec>>): InlineKeyboard => ({
  rows,
  text: (label, callbackData) => make(appendToLast(rows, staticButton({ text: label, callbackData }))),
  data: (label, codec, value) =>
    make(appendToLast(rows, { kind: "encoded", effect: codec.button(label, value) })),
  url: (label, url) => make(appendToLast(rows, staticButton({ text: label, url }))),
  webApp: (label, url) => make(appendToLast(rows, staticButton({ text: label, webApp: { url } }))),
  login: (label, url) =>
    make(appendToLast(rows, staticButton({ text: label, loginUrl: typeof url === "string" ? { url } : url }))),
  switchInline: (label, query) =>
    make(appendToLast(rows, staticButton({ text: label, switchInlineQuery: query ?? "" }))),
  switchInlineCurrent: (label, query) =>
    make(appendToLast(rows, staticButton({ text: label, switchInlineQueryCurrentChat: query ?? "" }))),
  copyText: (label, text) => make(appendToLast(rows, staticButton({ text: label, copyText: { text } }))),
  pay: (label) => make(appendToLast(rows, staticButton({ text: label, pay: true }))),
  row: () => make([...rows, []]),
  adjust: (...sizes) => make(reflow(rows.flat(), sizes))
})

/**
 * An empty {@link InlineKeyboard} to start building from.
 *
 * @example
 * import { InlineKeyboard } from "@fibergram/core/ui"
 *
 * const keyboard = InlineKeyboard.empty
 *   .url("Docs", "https://effect.website")
 *   .row()
 *   .text("Ping", "ping")
 *
 * @category constructors
 * @since 0.1.0
 */
export const empty: InlineKeyboard = make([])

/**
 * Build an {@link InlineKeyboard} from an existing matrix of buttons.
 *
 * @example
 * import { InlineKeyboard } from "@fibergram/core/ui"
 *
 * const keyboard = InlineKeyboard.from([
 *   [{ text: "A", callbackData: "a" }, { text: "B", callbackData: "b" }]
 * ])
 *
 * @category constructors
 * @since 0.1.0
 */
export const from = (rows: ReadonlyArray<ReadonlyArray<BotApi.InlineKeyboardButton>>): InlineKeyboard =>
  make(rows.map((row) => row.map(staticButton)))

/**
 * Resolve a keyboard into an `InlineKeyboardMarkup`, encoding every typed
 * {@link module:CallbackData.Codec} button. Empty rows are dropped. Fails with
 * {@link module:CallbackData.CallbackDataTooLong} if a payload overflows 64 bytes
 * and no {@link module:CallbackData.CallbackStore} is available to spill it.
 *
 * @example
 * import { InlineKeyboard } from "@fibergram/core/ui"
 * import { Chat } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const handler = Effect.gen(function* () {
 *   const keyboard = InlineKeyboard.empty.text("Yes", "yes").text("No", "no")
 *   yield* Chat.reply("Confirm?", { replyMarkup: yield* InlineKeyboard.build(keyboard) })
 * })
 *
 * @category combinators
 * @since 0.1.0
 */
export const build = (
  keyboard: InlineKeyboard
): Effect.Effect<BotApi.InlineKeyboardMarkup, CallbackData.CallbackDataTooLong> =>
  Effect.map(
    Effect.all(
      keyboard.rows
        .filter((row) => row.length > 0)
        .map((row) => Effect.all(row.map((spec) => (spec.kind === "static" ? Effect.succeed(spec.button) : spec.effect))))
    ),
    (inlineKeyboard) => ({ inlineKeyboard })
  )
