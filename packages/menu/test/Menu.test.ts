import { it } from "@effect/vitest"
import { Context, Effect, Exit, Layer, Option, Ref } from "effect"
import { describe, expect } from "vitest"

import { CallbackData, DialogStore, Router, UpdateContext } from "@fibergram/core"
import { TelegramClient, TelegramError } from "@fibergram/core/client"
import { TestTelegram, Updates } from "@fibergram/core/testing"
import { Menu } from "@fibergram/menu"

import type { BotApi } from "@fibergram/core/client"

const dataOf = (markup: BotApi.InlineKeyboardMarkup, label: string): string => {
  const button = markup.inlineKeyboard.flat().find((b) => b.text === label)
  if (button?.callbackData === undefined) throw new Error(`no callback button "${label}"`)
  return button.callbackData
}

const labelsOf = (markup: BotApi.InlineKeyboardMarkup): ReadonlyArray<ReadonlyArray<string>> =>
  markup.inlineKeyboard.map((row) => row.map((b) => b.text))

const tap = <E, R>(
  route: Router.Route<E, R>,
  data: string,
  options?: { readonly updateId?: number; readonly fromId?: number; readonly messageId?: number }
): Effect.Effect<void, E, R> =>
  Option.getOrThrowWith(
    route.match(Updates.callback({
      updateId: options?.updateId ?? 1,
      chatId: 100,
      fromId: options?.fromId ?? 42,
      data,
      messageId: options?.messageId ?? 7
    })),
    () => new Error("route did not match")
  )

const loadState = (menu: Menu.Menu<any, any>, options: Menu.StateKeyOptions) =>
  Effect.flatMap(DialogStore.DialogStore, (store) => store.load(Menu.stateKey(menu, options)))

const settingsMenu = () =>
  Menu.make("settings", { text: "Settings" })
    .text("notif", "Notifications", Effect.void)
    .row()
    .back("‹ Back")

describe("Menu", () => {
  it.effect("renders the declared rows with compact payloads", () =>
    Effect.gen(function* () {
      const main = Menu.make("main", { text: "Main" })
        .text("a", "Alpha", Effect.void)
        .text("b", "Beta", Effect.void)
        .row()
        .url("Docs", "https://effect.website")
      const markup = yield* Menu.render(main)

      expect(labelsOf(markup)).toEqual([["Alpha", "Beta"], ["Docs"]])
      const payload = dataOf(markup, "Alpha")
      expect(payload.startsWith("menu-main:")).toBe(true)
      expect(payload.length).toBeLessThanOrEqual(64)
      const docs = markup.inlineKeyboard.flat().find((b) => b.text === "Docs")
      expect(docs?.url).toBe("https://effect.website")
      expect(docs?.callbackData).toBeUndefined()
    }))

  it.effect("reply sends the keyboard and stores the initial state", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const main = Menu.make("main", { text: "Main menu" }).text("a", "Alpha", Effect.void)
      const env = yield* UpdateContext.fromAddress(
        { chatId: 100, fromId: 42, kind: "router" },
        { updateId: 1 }
      )
      const sent = yield* Menu.reply(main).pipe(UpdateContext.provide(env), Effect.provide(tg.layer))

      const sends = yield* tg.sent
      expect(sends).toHaveLength(1)
      expect(sends[0]?.text).toBe("Main menu")
      expect(sends[0]?.replyMarkup).toBeDefined()

      const stored = yield* loadState(main, { chatId: 100, messageId: sent.messageId })
      expect(stored).toEqual(Option.some({ stack: [], current: "main", pages: {} }))
    }).pipe(Effect.provide(DialogStore.layerMemory)))

  it.effect("submenu tap edits the message, pushes the stack, answers the query", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const main = Menu.make("main", { text: "Main" }).submenu("Settings", settingsMenu())
      const route = Menu.route(main)
      const markup = yield* Menu.render(main)

      yield* tap(route, dataOf(markup, "Settings")).pipe(Effect.provide(tg.layer))

      const edits = yield* tg.edited
      expect(edits).toHaveLength(1)
      expect(edits[0]?.text).toBe("Settings")
      expect(edits[0]?.messageId).toBe(7)
      const answered = yield* tg.answered
      expect(answered).toHaveLength(1)

      const stored = yield* loadState(main, { chatId: 100, messageId: 7 })
      expect(stored).toEqual(Option.some({ stack: ["main"], current: "settings", pages: {} }))
    }).pipe(Effect.provide(DialogStore.layerMemory)))

  it.effect("back pops the stack; back on an empty stack edits nothing", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const settings = settingsMenu()
      const main = Menu.make("main", { text: "Main" }).submenu("Settings", settings)
      const route = Menu.route(main)
      const mainMarkup = yield* Menu.render(main)
      const subMarkup = yield* Menu.render(main, { stack: ["main"], current: "settings", pages: {} })

      yield* Effect.provide(
        Effect.gen(function* () {
          yield* tap(route, dataOf(mainMarkup, "Settings"), { updateId: 1 })
          yield* tap(route, dataOf(subMarkup, "‹ Back"), { updateId: 2 })
        }),
        tg.layer
      )
      const afterRoundTrip = yield* loadState(main, { chatId: 100, messageId: 7 })
      expect(afterRoundTrip).toEqual(Option.some({ stack: [], current: "main", pages: {} }))

      yield* tg.clear
      // A back tap while already at the root: no edit, still answered.
      yield* tap(route, dataOf(subMarkup, "‹ Back"), { updateId: 3 }).pipe(Effect.provide(tg.layer))
      const edits = yield* tg.edited
      expect(edits).toHaveLength(0)
      const answered = yield* tg.answered
      expect(answered).toHaveLength(1)
    }).pipe(Effect.provide(DialogStore.layerMemory)))

  it.effect("a textless pane edits only the reply markup", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const bare = Menu.make("bare").text("a", "Alpha", Effect.void).back("‹ Back")
      const main = Menu.make("main", { text: "Main" }).submenu("Bare", bare)
      const route = Menu.route(main)
      const markup = yield* Menu.render(main)

      yield* tap(route, dataOf(markup, "Bare")).pipe(Effect.provide(tg.layer))

      expect(yield* tg.edited).toHaveLength(0)
      const markupEdits = yield* tg.callsTo("editMessageReplyMarkup")
      expect(markupEdits).toHaveLength(1)
    }).pipe(Effect.provide(DialogStore.layerMemory)))

  it.effect("an action tap runs the handler and re-renders with fresh labels", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const on = yield* Ref.make(false)
      const label = Effect.map(Ref.get(on), (v) => (v ? "Notifications: ON" : "Notifications: OFF"))
      const main = Menu.make("main", { text: "Main" }).text("n", label, Ref.set(on, true))
      const route = Menu.route(main)
      const markup = yield* Menu.render(main)
      expect(labelsOf(markup)).toEqual([["Notifications: OFF"]])

      yield* tap(route, dataOf(markup, "Notifications: OFF")).pipe(Effect.provide(tg.layer))

      const edits = yield* tg.edited
      expect(edits).toHaveLength(1)
      const rerendered = edits[0]?.replyMarkup as BotApi.InlineKeyboardMarkup
      expect(labelsOf(rerendered)).toEqual([["Notifications: ON"]])
    }).pipe(Effect.provide(DialogStore.layerMemory)))

  it.effect("a re-render that changes nothing swallows MessageNotModified", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const base = yield* Effect.provide(TelegramClient.TelegramClient, tg.layer)
      const failing = Layer.succeed(TelegramClient.TelegramClient, {
        ...base,
        editMessageText: () =>
          Effect.fail(new TelegramError.MessageNotModified({ method: "editMessageText" }))
      })
      const main = Menu.make("main", { text: "Main" }).text("a", "Alpha", Effect.void)
      const route = Menu.route(main)
      const markup = yield* Menu.render(main)

      const exit = yield* tap(route, dataOf(markup, "Alpha")).pipe(
        Effect.provide(failing),
        Effect.exit
      )
      expect(Exit.isSuccess(exit)).toBe(true)
    }).pipe(Effect.provide(DialogStore.layerMemory)))

  it.effect("pagination renders arrows, turns pages, and selects items", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const picked: Array<string> = []
      const items = Array.from({ length: 9 }, (_, i) => ({ id: `i${i}`, label: `Item ${i}` }))
      const main = Menu.make("main", { text: "Main" }).paginated("goods", {
        source: Menu.pages(items, 4),
        onSelect: (id) => Effect.sync(() => void picked.push(id))
      })
      const route = Menu.route(main)

      const first = yield* Menu.render(main)
      const firstLabels = labelsOf(first)
      expect(firstLabels.slice(0, 4)).toEqual([["Item 0"], ["Item 1"], ["Item 2"], ["Item 3"]])
      expect(firstLabels[4]).toEqual(["· 1 ·", "›"]) // no prev on page 0

      yield* tap(route, dataOf(first, "›"), { updateId: 1 }).pipe(Effect.provide(tg.layer))
      const stored = yield* loadState(main, { chatId: 100, messageId: 7 })
      expect(stored).toEqual(
        Option.some({ stack: [], current: "main", pages: { "main/goods": 1 } })
      )

      const second = yield* Menu.render(main, { stack: [], current: "main", pages: { "main/goods": 1 } })
      expect(labelsOf(second)[4]).toEqual(["‹", "· 2 ·", "›"])
      const last = yield* Menu.render(main, { stack: [], current: "main", pages: { "main/goods": 2 } })
      expect(labelsOf(last)[1]).toEqual(["‹", "· 3 ·"]) // 9 items / 4 per page -> 1 item + nav

      yield* tap(route, dataOf(second, "Item 5"), { updateId: 2 }).pipe(Effect.provide(tg.layer))
      expect(picked).toEqual(["i5"])

      yield* tg.clear
      yield* tap(route, dataOf(second, "· 2 ·"), { updateId: 3 }).pipe(Effect.provide(tg.layer))
      // The page indicator is a noop: answered, nothing edited, nothing selected.
      expect(yield* tg.edited).toHaveLength(0)
      expect(yield* tg.callsTo("editMessageReplyMarkup")).toHaveLength(0)
      expect(yield* tg.answered).toHaveLength(1)
      expect(picked).toEqual(["i5"])
    }).pipe(Effect.provide(DialogStore.layerMemory)))

  it.effect("a tap from a stale pane skips the handler and resyncs the message", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const ran: Array<string> = []
      const settings = Menu.make("settings", { text: "Settings" }).back("‹ Back")
      const main = Menu.make("main", { text: "Main" })
        .text("a", "Alpha", Effect.sync(() => void ran.push("alpha")))
        .submenu("Settings", settings)
      const route = Menu.route(main)
      const mainMarkup = yield* Menu.render(main)

      yield* Effect.provide(
        Effect.gen(function* () {
          // Navigate to settings, then feed a tap from the old "main" keyboard.
          yield* tap(route, dataOf(mainMarkup, "Settings"), { updateId: 1 })
          yield* tg.clear
          yield* tap(route, dataOf(mainMarkup, "Alpha"), { updateId: 2 })
        }),
        tg.layer
      )

      expect(ran).toEqual([])
      const edits = yield* tg.edited
      expect(edits).toHaveLength(1)
      expect(edits[0]?.text).toBe("Settings") // re-rendered to the *current* pane
      const stored = yield* loadState(main, { chatId: 100, messageId: 7 })
      expect(stored).toEqual(Option.some({ stack: ["main"], current: "settings", pages: {} }))
    }).pipe(Effect.provide(DialogStore.layerMemory)))

  it.effect("a tap with no stored state is treated as a fresh root", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const ran: Array<string> = []
      const main = Menu.make("main", { text: "Main" })
        .text("a", "Alpha", Effect.sync(() => void ran.push("alpha")))
      const route = Menu.route(main)
      const markup = yield* Menu.render(main)

      yield* tap(route, dataOf(markup, "Alpha")).pipe(Effect.provide(tg.layer))
      expect(ran).toEqual(["alpha"])
    }).pipe(Effect.provide(DialogStore.layerMemory)))

  it.effect("scope \"user\" keeps an independent stack per tapper", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const ran: Array<number> = []
      const settings = Menu.make("settings", { text: "Settings" }).back("‹ Back")
      const main = Menu.make("main", { text: "Main", scope: "user" })
        .text("a", "Alpha", Effect.sync(() => void ran.push(1)))
        .submenu("Settings", settings)
      const route = Menu.route(main)
      const markup = yield* Menu.render(main)

      yield* Effect.provide(
        Effect.gen(function* () {
          // User 42 navigates into settings; user 43 still sees a fresh root,
          // so the same "main" action tap runs for 43 but is stale for 42.
          yield* tap(route, dataOf(markup, "Settings"), { updateId: 1, fromId: 42 })
          yield* tap(route, dataOf(markup, "Alpha"), { updateId: 2, fromId: 43 })
          yield* tap(route, dataOf(markup, "Alpha"), { updateId: 3, fromId: 42 })
        }),
        tg.layer
      )

      expect(ran).toEqual([1]) // only user 43's tap ran the handler
      const user42 = yield* loadState(main, { chatId: 100, messageId: 7, fromId: 42 })
      expect(Option.map(user42, (s) => (s as Menu.NavState).current)).toEqual(Option.some("settings"))
      const user43 = yield* loadState(main, { chatId: 100, messageId: 7, fromId: 43 })
      expect(Option.map(user43, (s) => (s as Menu.NavState).current)).toEqual(Option.some("main"))
    }).pipe(Effect.provide(DialogStore.layerMemory)))

  it("derives allowed_updates and ignores foreign updates", () => {
    const main = Menu.make("main", { text: "Main" }).text("a", "Alpha", Effect.void)
    const route = Menu.route(main)
    expect(Router.allowedUpdates(Router.make(route))).toEqual(["callback_query"])

    expect(Option.isNone(route.match({ updateId: 1 }))).toBe(true)
    expect(
      Option.isNone(
        route.match(Updates.callback({ updateId: 1, chatId: 100, fromId: 42, data: "other:1" }))
      )
    ).toBe(true)
  })

  it.effect("oversized ids fail without a CallbackStore and spill with one", () =>
    Effect.gen(function* () {
      const longId = "a-very-long-button-identifier-that-cannot-possibly-fit-the-budget"
      const main = Menu.make("main", { text: "Main" }).text(longId, "Long", Effect.void)

      const bare = yield* Effect.exit(Menu.render(main))
      expect(Exit.isFailure(bare)).toBe(true)

      const markup = yield* Menu.render(main).pipe(Effect.provide(CallbackData.layerMemory))
      expect(dataOf(markup, "Long").startsWith("menu-main#")).toBe(true)
    }))

  it("accumulates handler requirements in the route type", () => {
    class Svc extends Context.Service<Svc, { readonly x: number }>()("test/Svc") {}
    const main = Menu.make("main", { text: "Main" })
      .text("a", "Alpha", Effect.asVoid(Effect.map(Svc, (s) => s.x)))
    const route = Menu.route(main)
    type RouteR<T> = T extends Router.Route<infer _E, infer R> ? R : never
    type HasSvc = [Svc] extends [Extract<RouteR<typeof route>, Svc>] ? true : false
    const ok: HasSvc = true
    expect(ok).toBe(true)
    expect(route.kinds).toEqual(["callbackQuery"])
  })
})
