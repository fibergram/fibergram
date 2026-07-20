import { it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { KeyValueStore } from "effect/unstable/persistence"
import { describe, expect } from "vitest"

import { Dedup, Dispatcher } from "@fibergram/core"
import { TestTelegram, Updates } from "@fibergram/core/testing"
import { PersistedDialogStore } from "@fibergram/durable"

import { rootDialog } from "../src/app.js"
import { AppConfig } from "../src/config.js"
import * as Domain from "../src/domain.js"

// The whole bot on an in-memory KeyValueStore — the same graph as `main.ts`,
// with `Storage.layer` swapped for `KeyValueStore.layerMemory`. Nothing else
// changes: that swap is the point.
const layersFor = (tg: TestTelegram.TestTelegram) =>
  Layer.mergeAll(
    Layer.mergeAll(PersistedDialogStore.layer, Domain.layer).pipe(
      Layer.provide(KeyValueStore.layerMemory)
    ),
    Layer.succeed(AppConfig, { restaurantName: "Test Bistro", dataDir: ".data" }),
    Dedup.layerMemory,
    tg.layer
  )

const run = (tg: TestTelegram.TestTelegram, updates: ReadonlyArray<Parameters<typeof Updates.stream>[0][number]>) =>
  Dispatcher.run({ updates: Updates.stream(updates), dialog: rootDialog }).pipe(
    Effect.scoped,
    Effect.provide(layersFor(tg))
  )

const CHAT = 100
const USER = 100

describe("restaurant booking bot", () => {
  it.effect("registers a profile and unlocks the rest", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      yield* run(tg, [
        Updates.command({ updateId: 1, chatId: CHAT, fromId: USER, command: "/start" }),
        Updates.text({ updateId: 2, chatId: CHAT, fromId: USER, text: "Alice Walker" }),
        Updates.text({ updateId: 3, chatId: CHAT, fromId: USER, text: "+1 555 123 4567" }),
        Updates.text({ updateId: 4, chatId: CHAT, fromId: USER, text: "skip" }),
        Updates.command({ updateId: 5, chatId: CHAT, fromId: USER, command: "/my_bookings" })
      ])

      const texts = (yield* tg.sent).map((m) => m.text ?? "")
      const all = texts.join("\n")

      expect(texts[0]).toContain("Welcome to Test Bistro")
      expect(all).toContain("full name")
      expect(all).toContain("phone number")
      expect(all).toContain("Email")
      expect(all).toContain("all set at Test Bistro")
      // Registered: /my_bookings reports an empty list, not "register first".
      expect(all).toContain("no bookings")
      expect(all).not.toContain("register first")
    }))

  it.effect("walks the booking wizard to a confirmed reservation", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      yield* run(tg, [
        // Register first.
        Updates.command({ updateId: 1, chatId: CHAT, fromId: USER, command: "/start" }),
        Updates.text({ updateId: 2, chatId: CHAT, fromId: USER, text: "Alice Walker" }),
        Updates.text({ updateId: 3, chatId: CHAT, fromId: USER, text: "+1 555 123 4567" }),
        Updates.text({ updateId: 4, chatId: CHAT, fromId: USER, text: "skip" }),
        // Book — reply-keyboard taps arrive as their label text.
        Updates.command({ updateId: 5, chatId: CHAT, fromId: USER, command: "/book" }),
        Updates.text({ updateId: 6, chatId: CHAT, fromId: USER, text: "2026-08-15" }),
        Updates.text({ updateId: 7, chatId: CHAT, fromId: USER, text: "17:00" }),
        Updates.text({ updateId: 8, chatId: CHAT, fromId: USER, text: "3" }),
        Updates.text({ updateId: 9, chatId: CHAT, fromId: USER, text: "🏠 Main hall" }),
        Updates.text({ updateId: 10, chatId: CHAT, fromId: USER, text: "— No extras" }),
        Updates.text({ updateId: 11, chatId: CHAT, fromId: USER, text: "Skip" }),
        Updates.text({ updateId: 12, chatId: CHAT, fromId: USER, text: "✅ Yes" }),
        Updates.command({ updateId: 13, chatId: CHAT, fromId: USER, command: "/my_bookings" })
      ])

      const texts = (yield* tg.sent).map((m) => m.text ?? "")
      const all = texts.join("\n")

      expect(all).toContain("Let's book your table at Test Bistro")
      expect(all).toContain("2026-08-15") // echoed in the confirmation summary
      expect(all).toContain("Booking confirmed")
      expect(all).toMatch(/BK\d{4}/) // the generated confirmation code
      // The booking is persisted and shows up under /my_bookings.
      const codeMatch = /BK\d{7}/.exec(all)
      expect(codeMatch).not.toBeNull()
      expect(all).toContain("Your bookings")
      expect(all).toContain("Table 3")
    }))

  it.effect("switches language and localizes the menu", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      yield* run(tg, [
        Updates.command({ updateId: 1, chatId: CHAT, fromId: USER, command: "/language" }),
        Updates.callback({ updateId: 2, chatId: CHAT, fromId: USER, data: 'lang:{"locale":"ru"}' }),
        Updates.command({ updateId: 3, chatId: CHAT, fromId: USER, command: "/help" }),
        Updates.command({ updateId: 4, chatId: CHAT, fromId: USER, command: "/menu" })
      ])

      const texts = (yield* tg.sent).map((m) => m.text ?? "")
      const all = texts.join("\n")

      expect(all).toContain("Choose your language") // shown before the switch
      expect(all).toContain("Язык обновлён") // confirmation in the new locale
      expect(all).toContain("Бот бронирования") // /help now in Russian
      expect(all).toContain("Меню Test Bistro") // /menu title in Russian
    }))

  it.effect("resumes a half-finished wizard after a restart", () =>
    Effect.gen(function* () {
      // One shared store, reused across two independent dispatcher runs — the
      // second run stands in for a process restart.
      const store = new Map<string, string>()
      const kv = Layer.succeed(
        KeyValueStore.KeyValueStore,
        KeyValueStore.makeStringOnly({
          get: (key) => Effect.succeed(store.get(key)),
          set: (key, value) => Effect.sync(() => void store.set(key, value)),
          remove: (key) => Effect.sync(() => void store.delete(key)),
          clear: Effect.sync(() => store.clear()),
          size: Effect.sync(() => store.size)
        })
      )

      const tg = yield* TestTelegram.make
      const layers = Layer.mergeAll(
        Layer.mergeAll(PersistedDialogStore.layer, Domain.layer).pipe(Layer.provide(kv)),
        Layer.succeed(AppConfig, { restaurantName: "Test Bistro", dataDir: ".data" }),
        Dedup.layerMemory,
        tg.layer
      )
      const dispatch = (updates: ReadonlyArray<Parameters<typeof Updates.stream>[0][number]>) =>
        Dispatcher.run({ updates: Updates.stream(updates), dialog: rootDialog }).pipe(
          Effect.scoped,
          Effect.provide(layers)
        )

      // Run 1: start and answer the name, then "crash".
      yield* dispatch([
        Updates.command({ updateId: 1, chatId: CHAT, fromId: USER, command: "/start" }),
        Updates.text({ updateId: 2, chatId: CHAT, fromId: USER, text: "Alice Walker" })
      ])
      // Run 2: a fresh dispatcher over the same store resumes at the phone step.
      yield* dispatch([
        Updates.text({ updateId: 3, chatId: CHAT, fromId: USER, text: "+1 555 123 4567" }),
        Updates.text({ updateId: 4, chatId: CHAT, fromId: USER, text: "skip" })
      ])

      const all = (yield* tg.sent).map((m) => m.text ?? "").join("\n")
      expect(all).toContain("phone number") // asked in run 1
      expect(all).toContain("all set at Test Bistro") // completed in run 2
    }))
})
