import { it } from "@effect/vitest"
import { Cause, Effect, Exit, Layer, Option, Ref, Stream } from "effect"
import { describe, expect } from "vitest"

import { Coroutine, Dedup, DialogStore, Dispatcher, Router, UpdateContext } from "@fibergram/core"
import { TelegramClient } from "@fibergram/core/client"
import { I18n } from "@fibergram/i18n"

import type { BotApi } from "@fibergram/core/client"

const en = `
hello = Hello, { $name }!
apples = { $count ->
    [one] { $count } apple
   *[other] { $count } apples
}
menu-button = Menu
english-only = Only in English
welcome = Welcome
    .title = The title
`

const ru = `
hello = Привет, { $name }!
menu-button = Меню
`

const pt = `
hello = Olá, { $name }!
`

const i18n = I18n.make({
  defaultLocale: "en",
  locales: { en, ru, pt }
})

const messageUpdate = (text: string, languageCode?: string): BotApi.Update => ({
  updateId: 1,
  message: {
    messageId: 1,
    date: 0,
    chat: { id: 10, type: "private" },
    from: {
      id: 42,
      isBot: false,
      firstName: "Ada",
      ...(languageCode === undefined ? {} : { languageCode })
    },
    text
  }
})

const inUpdate = (update: BotApi.Update) =>
<A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  Effect.flatMap(
    UpdateContext.fromAddress({ chatId: 10, fromId: 42, kind: "test" }, update),
    (env) => effect.pipe(UpdateContext.provide(env))
  )

describe("I18n", () => {
  it.effect("t formats variables and plural selectors in the default locale", () =>
    Effect.gen(function* () {
      expect(yield* i18n.t("hello", { name: "Ada" })).toBe("Hello, Ada!")
      expect(yield* i18n.t("apples", { count: 1 })).toBe("1 apple")
      expect(yield* i18n.t("apples", { count: 5 })).toBe("5 apples")
      expect(yield* i18n.t("welcome.title")).toBe("The title")
    }))

  it.effect("withLocale overrides every other source of locale", () =>
    Effect.gen(function* () {
      const text = yield* i18n.t("hello", { name: "Ada" }).pipe(I18n.withLocale("ru"))
      expect(text).toBe("Привет, Ada!")
      expect(yield* i18n.locale.pipe(I18n.withLocale("ru"))).toBe("ru")
    }).pipe(inUpdate(messageUpdate("hi", "pt"))))

  it.effect("the sender's languageCode picks the locale inside a handler", () =>
    Effect.gen(function* () {
      expect(yield* i18n.locale).toBe("ru")
      expect(yield* i18n.t("hello", { name: "Ada" })).toBe("Привет, Ada!")
    }).pipe(inUpdate(messageUpdate("hi", "ru"))))

  it.effect("languageCode negotiation falls back to the primary subtag, then default", () =>
    Effect.gen(function* () {
      expect(yield* i18n.locale.pipe(inUpdate(messageUpdate("hi", "pt-BR")))).toBe("pt")
      expect(yield* i18n.locale.pipe(inUpdate(messageUpdate("hi", "de")))).toBe("en")
      expect(yield* i18n.locale.pipe(inUpdate(messageUpdate("hi")))).toBe("en")
    }))

  it.effect("setLocale persists a preference that beats languageCode", () =>
    Effect.gen(function* () {
      yield* i18n.setLocale("ru").pipe(inUpdate(messageUpdate("hi", "pt")))
      expect(yield* i18n.locale.pipe(inUpdate(messageUpdate("hi", "pt")))).toBe("ru")
      // A different sender in the same chat keeps their own preference.
      const other: BotApi.Update = {
        updateId: 2,
        message: {
          messageId: 2,
          date: 0,
          chat: { id: 10, type: "private" },
          from: { id: 43, isBot: false, firstName: "Eve", languageCode: "pt" },
          text: "hi"
        }
      }
      const otherLocale = yield* Effect.flatMap(
        UpdateContext.fromAddress({ chatId: 10, fromId: 43, kind: "test" }, other),
        (env) => i18n.locale.pipe(UpdateContext.provide(env))
      )
      expect(otherLocale).toBe("pt")
    }).pipe(Effect.provide(DialogStore.layerMemory)))

  it.effect("setLocale dies on a locale that is not loaded", () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(
        i18n.setLocale("xx").pipe(inUpdate(messageUpdate("hi")))
      )
      expect(Exit.isFailure(exit) && Cause.hasDies(exit.cause)).toBe(true)
    }).pipe(Effect.provide(DialogStore.layerMemory)))

  it.effect("a key missing from the user's locale falls back to the default bundle", () =>
    Effect.gen(function* () {
      const text = yield* i18n.t("english-only").pipe(I18n.withLocale("ru"))
      expect(text).toBe("Only in English")
    }))

  it.effect("a key missing everywhere dies", () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(i18n.t("nope"))
      expect(Exit.isFailure(exit) && Cause.hasDies(exit.cause)).toBe(true)
    }))

  it("translate is the pure per-locale lookup", () => {
    expect(i18n.translate("ru", "hello", { name: "Ada" })).toEqual(
      Option.some("Привет, Ada!")
    )
    expect(Option.isNone(i18n.translate("ru", "english-only"))).toBe(true)
    expect(Option.isNone(i18n.translate("xx", "hello"))).toBe(true)
  })

  it.effect("hears matches a translation in any locale and reports which", () =>
    Effect.gen(function* () {
      const seen: Array<string> = []
      const route = i18n.hears("menu-button", (locale) =>
        Effect.sync(() => {
          seen.push(locale)
        }))

      expect(route.kinds).toEqual(["message"])
      expect(Router.allowedUpdates(Router.make(route))).toEqual(["message"])

      const ruMatch = route.match(messageUpdate("Меню"))
      expect(Option.isSome(ruMatch)).toBe(true)
      yield* Option.getOrThrow(ruMatch)

      const enMatch = route.match(messageUpdate("Menu"))
      expect(Option.isSome(enMatch)).toBe(true)
      yield* Option.getOrThrow(enMatch)

      expect(Option.isNone(route.match(messageUpdate("nope")))).toBe(true)
      expect(seen).toEqual(["ru", "en"])
    }))

  it.effect("the free accessors reach the service through the I18n tag", () =>
    Effect.gen(function* () {
      const text = yield* I18n.t("hello", { name: "Ada" })
      expect(text).toBe("Hello, Ada!")
      expect(yield* I18n.locale).toBe("en")
    }).pipe(Effect.provide(I18n.layer(i18n))))

  it("make validates its configuration eagerly", () => {
    expect(() => I18n.make({ defaultLocale: "de", locales: { en } })).toThrow(
      /defaultLocale "de"/
    )
  })
})

// A TelegramClient that records only the text of each sendMessage.
const recordingClient = (sent: Ref.Ref<ReadonlyArray<string>>) =>
  Layer.succeed(
    TelegramClient.TelegramClient,
    {
      sendMessage: (params: BotApi.SendMessageParams) =>
        Effect.as(Ref.update(sent, (all) => [...all, params.text]), {
          messageId: 1,
          date: 0,
          chat: { id: Number(params.chatId), type: "private" },
          text: params.text
        })
    } as unknown as TelegramClient.TelegramClientService
  )

describe("I18n — reply", () => {
  it.effect("formats a key in the current locale and sends it", () =>
    Effect.gen(function* () {
      const sent = yield* Ref.make<ReadonlyArray<string>>([])
      yield* i18n.reply("hello", { name: "Ada" }).pipe(
        inUpdate(messageUpdate("hi", "ru")),
        Effect.provide(recordingClient(sent))
      )
      expect(yield* Ref.get(sent)).toEqual(["Привет, Ada!"])
    }))
})

describe("I18n — capture", () => {
  it.effect("captures the locale durably and translates purely thereafter", () =>
    Effect.gen(function* () {
      const sent = yield* Ref.make<ReadonlyArray<string>>([])
      const wizard = Coroutine.make("cap", function* (d) {
        const t = yield* i18n.capture(d)
        yield* d.reply(t.t("hello", { name: t.locale === "ru" ? "Аня" : "Ann" }))
      })

      // The update's sender speaks ru, so the captured translator renders ru.
      const update: BotApi.Update = messageUpdate("/go", "ru")
      yield* Dispatcher.run({ updates: Stream.fromIterable([update]), dialog: wizard }).pipe(
        Effect.scoped,
        Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, recordingClient(sent)])
      )

      expect(yield* Ref.get(sent)).toEqual(["Привет, Аня!"])
    }))
})
