/**
 * `/start` registration as a fibergram {@link Coroutine} — the wizard reads
 * top-to-bottom, one `prompt` per step, and the replay driver persists progress
 * after every answer. A half-finished registration survives a restart and
 * resumes at the next prompt.
 *
 * Validation lives in the prompt schemas: a bad answer re-asks with a localized
 * message (`onInvalid`) instead of advancing. The persistence write is a durable
 * `d.run` activity, so it runs exactly once even across replays.
 */
import { Effect, Schema } from "effect"

import { Coroutine } from "@fibergram/core"


import { UserRepo } from "./domain.js"
import { openContext } from "./wizard.js"

import type { AppConfig } from "./config.js"
import type { Dialog } from "@fibergram/core";
import type { TelegramClient, TelegramError } from "@fibergram/core/client"

/** What the wizard returns once the profile is saved. */
export interface Registered {
  readonly userId: number
  readonly name: string
}

const cleanPhone = (raw: string) => raw.replaceAll(/[\s\-()+]/g, "")

const phoneOk = (raw: string): boolean => {
  const digits = cleanPhone(raw)
  return /^\d+$/.test(digits) && digits.length >= 10 && digits.length <= 15
}

const emailOk = (raw: string): boolean => {
  const value = raw.trim()
  return value.includes("@") && value.includes(".")
}

const Name = Schema.Trim.check(Schema.isMinLength(2), Schema.isMaxLength(100))
const Phone = Schema.String.pipe(Schema.refine((s): s is string => phoneOk(s)))
const EmailOrSkip = Schema.String.pipe(
  Schema.refine((s): s is string => s.trim().toLowerCase() === "skip" || emailOk(s))
)

/**
 * The registration wizard. Requires the client (to send), {@link AppConfig} (the
 * restaurant name) and {@link UserRepo} (to persist).
 */
export const registration: Dialog.Dialog<
  Coroutine.State<Registered>,
  Coroutine.State<Registered>,
  TelegramError.TelegramError,
  TelegramClient.TelegramClient | AppConfig | UserRepo
> = Coroutine.make<
  Registered,
  TelegramError.TelegramError,
  TelegramClient.TelegramClient | AppConfig | UserRepo
>("registration", function* (d) {
  const ctx = yield* openContext(d)

  yield* d.reply(ctx.t("reg-welcome", { restaurant: ctx.restaurant }))

  const name = (yield* d.prompt(ctx.t("reg-ask-name"), Name, {
    onInvalid: (input) =>
      ctx.t((input ?? "").trim().length < 2 ? "error-name-short" : "error-name-long")
  })).trim()

  const phoneRaw = yield* d.prompt(ctx.t("reg-ask-phone"), Phone, {
    onInvalid: () => ctx.t("error-invalid-phone")
  })
  const phone = cleanPhone(phoneRaw)

  const emailRaw = yield* d.prompt(ctx.t("reg-ask-email"), EmailOrSkip, {
    onInvalid: () => ctx.t("error-invalid-email")
  })
  const email = emailRaw.trim().toLowerCase() === "skip" ? "" : emailRaw.trim()

  yield* d.run(
    Effect.gen(function* () {
      const repo = yield* UserRepo
      yield* repo.upsert({ userId: ctx.userId, chatId: ctx.chatId, name, phone, email })
      return ctx.userId
    }),
    Schema.Number
  )

  yield* d.reply(ctx.t("reg-success", { restaurant: ctx.restaurant }))

  return { userId: ctx.userId, name }
})
