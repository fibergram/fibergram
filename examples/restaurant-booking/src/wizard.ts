/**
 * The one helper the registration and booking wizards share: capturing the
 * per-conversation context once, durably.
 *
 * A wizard's replay must reproduce every rendered string identically, so the
 * things that could otherwise drift between updates - the active locale, the
 * restaurant name, the sender's identity - are captured at the top through
 * durable steps: {@link I18n.capture} (a locale-bound, pure translator) plus two
 * `d.run` activities. After that, all copy is a pure {@link WizardContext.t}
 * lookup and every id is fixed in the coroutine's persisted state.
 *
 * Keyboard choice steps and identity resolution used to live here as hand-rolled
 * helpers (`choose`, `readIdentity`); they are now framework primitives -
 * `d.choose` and `Chat.identity` - so this module is just the context capture.
 */
import { Schema } from "effect"

import { Chat } from "@fibergram/core"

import { restaurantName } from "./config.js"
import { i18n } from "./i18n.js"

import type { AppConfig } from "./config.js"
import type { Coroutine } from "@fibergram/core"
import type { TelegramError } from "@fibergram/core/client"

/** The requirements every wizard step shares (beyond `TelegramClient`). */
export type WizardR = AppConfig

/** The per-conversation context captured once at the top of a wizard. */
export interface WizardContext {
  readonly locale: string
  readonly restaurant: string
  readonly chatId: number
  readonly userId: number
  /** A pure translator bound to the captured {@link locale}. */
  readonly t: (key: string, vars?: Record<string, string | number>) => string
}

const Identity = Schema.Struct({ chatId: Schema.Number, userId: Schema.Number })

/**
 * Resolve the ambient locale, restaurant name and sender identity once and
 * record them durably, so every replay of the wizard renders identical copy and
 * writes for the same user. Compose with `const ctx = yield* openContext(d)`.
 */
export function* openContext(d: Coroutine.Dsl<TelegramError.TelegramError, WizardR>) {
  const tr = yield* i18n.capture(d)
  const restaurant = yield* d.run(restaurantName, Schema.String)
  const { chatId, userId } = yield* d.run(Chat.identity, Identity)
  const ctx: WizardContext = { locale: tr.locale, restaurant, chatId, userId, t: tr.t }
  return ctx
}
