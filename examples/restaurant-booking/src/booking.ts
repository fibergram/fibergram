/**
 * `/book` table booking as a fibergram {@link Coroutine}.
 *
 * The reference (telega-gleam) models this as a declarative *dialog* of
 * inline-keyboard windows with managed widgets and a sub-dialog. fibergram has
 * no widget engine — its higher-level primitive is the coroutine — so the same
 * journey is re-expressed idiomatically: reply-keyboard choice steps
 * ({@link choose}) for time / party size / seating / extras / confirm, plain
 * text prompts for the date and the optional delivery address (the reference's
 * sub-dialog collapses to two ordinary prompts), and a durable `d.run` for the
 * reservation itself. State persists after every step, so a half-finished
 * booking survives a restart; `/cancel` (handled by the root dialog) aborts it.
 */
import { Effect, Schema } from "effect"

import { Coroutine } from "@fibergram/core"


import { BookingRepo } from "./domain.js"
import { openContext } from "./wizard.js"

import type { AppConfig } from "./config.js"
import type { Dialog } from "@fibergram/core";
import type { TelegramClient, TelegramError } from "@fibergram/core/client"

/** Evening service, every half hour — the slots offered by the time step. */
const timeSlots = [
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"
] as const

const zones = ["hall", "terrace", "window"] as const
const extrasOptions = ["none", "kids-chair", "cake", "flowers"] as const

const dateOk = (raw: string): boolean => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim())
  if (match === null) return false
  const month = Number(match[2])
  const day = Number(match[3])
  return month >= 1 && month <= 12 && day >= 1 && day <= 31
}

const BookingDate = Schema.String.pipe(Schema.refine((s): s is string => dateOk(s)))
const NonEmpty = Schema.Trim.check(Schema.isMinLength(1))

/** What the wizard returns: whether a table was reserved, and the code if so. */
export interface Booked {
  readonly booked: boolean
  readonly code: string
}

/**
 * The booking wizard. Requires the client, {@link AppConfig} and
 * {@link BookingRepo}.
 */
export const booking: Dialog.Dialog<
  Coroutine.State<Booked>,
  Coroutine.State<Booked>,
  TelegramError.TelegramError,
  TelegramClient.TelegramClient | AppConfig | BookingRepo
> = Coroutine.make<
  Booked,
  TelegramError.TelegramError,
  TelegramClient.TelegramClient | AppConfig | BookingRepo
>("booking", function* (d) {
  const ctx = yield* openContext(d)

  yield* d.reply(ctx.t("book-welcome", { restaurant: ctx.restaurant }))

  const date = (yield* d.prompt(ctx.t("book-ask-date"), BookingDate, {
    onInvalid: () => ctx.t("error-invalid-date")
  })).trim()

  const time = yield* d.choose(
    ctx.t("book-ask-time"),
    timeSlots.map((slot) => ({ id: slot, label: slot })),
    { columns: 3, onInvalid: () => ctx.t("error-invalid-time") }
  )

  const guestsPick = yield* d.choose(
    ctx.t("book-ask-guests"),
    [1, 2, 3, 4, 5, 6].map((n) => ({ id: String(n), label: String(n) })),
    { columns: 3, onInvalid: () => ctx.t("error-invalid-guests") }
  )
  const guests = Number(guestsPick)

  const zone = yield* d.choose(
    ctx.t("book-ask-zone"),
    zones.map((z) => ({ id: z, label: ctx.t(`zone-${z}`) })),
    { columns: 1 }
  )

  const extra = yield* d.choose(
    ctx.t("book-ask-extras"),
    extrasOptions.map((e) => ({ id: e, label: ctx.t(`extra-${e}`) })),
    { columns: 1 }
  )

  // Optional delivery address — the reference's sub-dialog, as two prompts.
  const wantsAddress = yield* d.choose(
    ctx.t("book-ask-address"),
    [
      { id: "add", label: ctx.t("book-address-add") },
      { id: "skip", label: ctx.t("book-address-skip") }
    ],
    { columns: 2 }
  )
  let address = ""
  if (wantsAddress === "add") {
    const city = (yield* d.prompt(ctx.t("book-ask-city"), NonEmpty)).trim()
    const street = (yield* d.prompt(ctx.t("book-ask-street", { city }), NonEmpty)).trim()
    address = `${city}, ${street}`
  }

  const extrasSummary = ctx.t(`extra-${extra}`)
  const confirm = yield* d.choose(
    ctx.t("book-confirm-prompt", {
      date,
      time,
      guests,
      zone: ctx.t(`zone-${zone}`),
      extras: extrasSummary,
      address: address === "" ? ctx.t("book-address-none") : address
    }),
    [
      { id: "yes", label: ctx.t("yes") },
      { id: "no", label: ctx.t("no") }
    ],
    { columns: 2 }
  )

  if (confirm === "no") {
    yield* d.reply(ctx.t("cancelled"))
    return { booked: false, code: "" }
  }

  // Locale-independent note for the kitchen — raw ids, not localized labels.
  const specialRequests = [
    `zone: ${zone}`,
    extra === "none" ? undefined : `extras: ${extra}`,
    address === "" ? undefined : `address: ${address}`
  ]
    .filter((part): part is string => part !== undefined)
    .join("; ")

  // The reservation is a durable activity: it runs once, and a "no tables"
  // outcome is folded to an empty code so it never escapes as a failure.
  const code = yield* d.run(
    Effect.gen(function* () {
      const repo = yield* BookingRepo
      return yield* repo.create({ userId: ctx.userId, date, time, guests, specialRequests }).pipe(
        Effect.map((b) => b.confirmationCode),
        Effect.catchTag("NoTablesAvailable", () => Effect.succeed(""))
      )
    }),
    Schema.String
  )

  if (code === "") {
    yield* d.reply(ctx.t("book-no-tables"))
    return { booked: false, code: "" }
  }

  yield* d.reply(ctx.t("book-success", { code, date, time, guests, restaurant: ctx.restaurant }))
  return { booked: true, code }
})
