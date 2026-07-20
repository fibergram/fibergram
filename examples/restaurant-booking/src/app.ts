/**
 * The application root: one {@link Conversations} manager composing the stateless
 * {@link Router} (commands, menu, language callback) with the two stateful
 * {@link Coroutine} wizards (registration, booking).
 *
 * fibergram runs exactly one dialog per chat, so "which conversation is active"
 * is state that would otherwise be a hand-written tag union with delegation,
 * entry guards and a shared `/cancel`. {@link Conversations.make} owns all of it:
 * name the scenes, declare which command enters each (behind a `guard`), give it
 * the router for everything else, and it returns the single {@link rootDialog}.
 *
 * `E`/`R` accumulate from the router, both scenes and the guards, so the whole
 * bot is still provided by one `Layer` at the edge - and the entry/cancel
 * commands ride into {@link conversations}'s router, so `main.ts` syncs the
 * command menu from it with no hand-written list.
 */
import { Effect, Option } from "effect"

import { Chat, Command, Conversations, Router } from "@fibergram/core"
import { Menu } from "@fibergram/menu"

import { booking } from "./booking.js"
import {
  help,
  language,
  languageCommand,
  LanguageChoice,
  myBookings,
  myBookingsCommand,
  setLanguage,
  helpCommand
} from "./commands.js"
import { UserRepo } from "./domain.js"
import { i18n } from "./i18n.js"
import { openMenu, restaurantMenu } from "./menu.js"
import { registration } from "./registration.js"

// Imported for type-portability: the manager's inferred `E`/`R` reference these
// modules, so `conversations`/`rootDialog` can be named in the emitted types.
import type { AppConfig } from "./config.js"
import type { BookingRepo } from "./domain.js"
import type { CallbackData, Conversations as ConversationsType, Dialog, DialogStore } from "@fibergram/core"
import type { TelegramClient, TelegramError } from "@fibergram/core/client"

// --- Commands that enter a wizard or are shared by the manager --------------

export const startCommand = Command.make("/start", { description: "Register or update your profile" })
export const bookCommand = Command.make("/book", { description: "Make a table reservation" })
export const cancelCommand = Command.make("/cancel", { description: "Abort the current conversation" })
export const menuCommand = Command.make("/menu", { description: "Browse the menu" })

// --- The stateless part -----------------------------------------------------

const router = Router.make(
  Router.command(helpCommand, () => help),
  Router.command(menuCommand, () => openMenu),
  Router.command(myBookingsCommand, () => myBookings),
  Router.command(languageCommand, () => language),
  Router.callback(LanguageChoice, setLanguage, { autoAnswer: true }),
  Menu.route(restaurantMenu)
)

// --- Entry guard ------------------------------------------------------------

/** Is the current sender already registered? */
const isRegistered = Effect.gen(function* () {
  const { chatId, userId } = yield* Chat.identity
  const repo = yield* UserRepo
  return Option.isSome(yield* repo.find(chatId, userId))
})

// --- The whole multi-scenario bot, as one manager ---------------------------

/** Everything the bot can fail with, accumulated across router, scenes and guards. */
type AppE =
  | TelegramError.TelegramError
  | Command.CommandArgsError
  | CallbackData.CallbackDataMalformed
  | CallbackData.CallbackDataTooLong

/** Everything the bot needs, provided by one `Layer` at the edge. */
type AppR =
  | TelegramClient.TelegramClient
  | DialogStore.DialogStore
  | AppConfig
  | UserRepo
  | BookingRepo

/**
 * The scene manager: `/start` enters registration (only when not already
 * registered), `/book` enters booking (only when registered), `/cancel` aborts
 * either, and everything else falls through to the router.
 */
export const conversations: ConversationsType.Conversations<AppE, AppR> = Conversations.make({
  kind: "restaurant",
  router,
  scenes: { registration, booking },
  enter: [
    Conversations.on(startCommand, "registration", {
      guard: Effect.map(isRegistered, (registered) => !registered),
      onReject: Effect.asVoid(i18n.reply("already-registered"))
    }),
    Conversations.on(bookCommand, "booking", {
      guard: isRegistered,
      onReject: Effect.asVoid(i18n.reply("registration-required"))
    })
  ],
  cancel: Conversations.cancel(cancelCommand, {
    onCancel: Effect.asVoid(i18n.reply("cancelled"))
  })
})

/** The one dialog the dispatcher runs. */
export const rootDialog: Dialog.Dialog<
  ConversationsType.State,
  ConversationsType.State,
  AppE,
  AppR
> = Conversations.toDialog(conversations)
