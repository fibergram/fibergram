/**
 * The stateless commands and the language switcher — everything that answers in
 * a single turn and therefore lives on the {@link Router}, not in a wizard.
 *
 * `/language` shows an inline keyboard of `lang:<locale>` buttons; the callback
 * persists the choice through `@fibergram/i18n` (backed by the shared
 * `DialogStore`) and confirms in the newly-selected language.
 */
import { Effect, Option, Schema } from "effect"

import { Chat, CallbackData, Command } from "@fibergram/core"
import { Fmt, InlineKeyboard } from "@fibergram/core/ui"

import { BookingRepo, UserRepo  } from "./domain.js"
import { i18n, localeName, supportedLocales, translate  } from "./i18n.js"

import type {Booking} from "./domain.js";
import type {Locale} from "./i18n.js";
import type { DialogStore, SentMessage } from "@fibergram/core"
import type { TelegramClient, TelegramError } from "@fibergram/core/client"

// --- Commands ---------------------------------------------------------------

export const helpCommand = Command.make("/help", { description: "Show available commands" })
export const myBookingsCommand = Command.make("/my_bookings", { description: "View your reservations" })
export const languageCommand = Command.make("/language", { description: "Change language" })

/** Typed callback data for a language button: `lang:{"locale":"ru"}`. */
export const LanguageChoice = CallbackData.make("lang", Schema.Struct({ locale: Schema.String }))

// --- /help ------------------------------------------------------------------

export const help: Effect.Effect<void, TelegramError.TelegramError, TelegramClient.TelegramClient> =
  Effect.asVoid(Effect.flatMap(i18n.t("help-text"), (text) => Chat.reply(text)))

// --- /my_bookings -----------------------------------------------------------

const statusEmoji: Record<Booking["status"], string> = {
  confirmed: "✅",
  pending: "⏳",
  cancelled: "❌"
}

const formatBookings = (
  bookings: ReadonlyArray<Booking>,
  locale: string
): Fmt.FmtString => {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars)
  const lines = bookings.map((b) =>
    [
      `${statusEmoji[b.status]} ${t(`status-${b.status}`)}`,
      `📅 ${b.date} ${t("bookings-at")} ${b.time}`,
      `👥 ${b.guests} ${t("bookings-guests")}`,
      `🪑 ${t("bookings-table")} ${b.tableNumber} (${t("bookings-capacity")}: ${b.capacity}) · ${b.location}`,
      `🎫 ${t("bookings-confirmation")}: ${b.confirmationCode}`
    ].join("\n")
  )
  return Fmt.concat(
    Fmt.bold(`📋 ${t("bookings-header")}`),
    "\n\n",
    Fmt.join(lines, "\n━━━━━━━━━━━━━━━\n")
  )
}

export const myBookings: Effect.Effect<
  SentMessage.SentMessage,
  TelegramError.TelegramError,
  TelegramClient.TelegramClient | UserRepo | BookingRepo
> = Chat.withTyping(
  Effect.gen(function* () {
    const { chatId, userId } = yield* Chat.identity

    const userRepo = yield* UserRepo
    const user = yield* userRepo.find(chatId, userId)
    if (Option.isNone(user)) {
      return yield* Effect.flatMap(i18n.t("registration-required"), (text) => Chat.reply(text))
    }

    const bookingRepo = yield* BookingRepo
    const bookings = yield* bookingRepo.listForUser(userId)
    if (bookings.length === 0) {
      return yield* Effect.flatMap(i18n.t("bookings-none"), (text) => Chat.reply(text))
    }

    const locale = yield* i18n.locale
    return yield* Chat.reply(formatBookings(bookings, locale))
  })
)

// --- /language --------------------------------------------------------------

export const language: Effect.Effect<
  void,
  TelegramError.TelegramError | CallbackData.CallbackDataTooLong,
  TelegramClient.TelegramClient
> = Effect.gen(function* () {
  const keyboard = supportedLocales.reduce(
    (kb, locale) => kb.data(localeName(locale), LanguageChoice, { locale }).row(),
    InlineKeyboard.empty
  )
  const text = yield* i18n.t("settings-choose-language")
  yield* Chat.reply(text, { replyMarkup: yield* InlineKeyboard.build(keyboard) })
})

const isLocale = (value: string): value is Locale => supportedLocales.includes(value)

/** Persist the chosen language and confirm in that language. */
export const setLanguage = ({ locale }: { readonly locale: string }): Effect.Effect<
  void,
  TelegramError.TelegramError,
  TelegramClient.TelegramClient | DialogStore.DialogStore
> =>
  Effect.gen(function* () {
    if (!isLocale(locale)) return
    yield* i18n.setLocale(locale)
    yield* Chat.reply(translate(locale, "settings-language-set"))
  })
