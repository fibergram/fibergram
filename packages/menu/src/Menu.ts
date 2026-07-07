/**
 * `Menu` - stateful inline menus with submenu / back / pagination navigation
 * (the analogue of grammY's `@grammyjs/menu`).
 *
 * A menu is an immutable builder describing a tree of **panes** (the root menu
 * and its submenus), each rendered as an inline keyboard. Callback payloads
 * carry only the **intent** ("go to pane X", "page 3 of section Y"); the
 * **truth** - the navigation stack, the current pane, and the page index of
 * every paginated section - lives in the `DialogStore`, keyed per menu
 * *message*. That is what makes `back` reliable and lets an out-of-date message
 * (a tap arriving from a keyboard that is no longer the current pane) be
 * detected and re-rendered instead of guessed at.
 *
 * Labels may be `Effect`s, so a button can read a `Session` (or any service)
 * and re-render with a fresh label after its handler runs - toggle buttons work
 * out of the box. A re-render that changes nothing is fine: the resulting
 * `MessageNotModified` is swallowed.
 *
 * Payloads ride the 64-byte `callback_data` budget as compact JSON tuples under
 * the menu's `CallbackData` prefix - keep pane / button / item ids short
 * (≤ ~10 chars). Oversized payloads spill to a `CallbackStore` when one is
 * provided, exactly like any other `CallbackData` codec.
 *
 * @since 0.1.0
 */
import { Effect, Option, Schema } from "effect"

import { CallbackData, Chat, DialogAddress, DialogStore, UpdateContext } from "@fibergram/core"
import { TelegramClient } from "@fibergram/core/client"

import type { Router, SentMessage } from "@fibergram/core"
import type { BotApi, TelegramError } from "@fibergram/core/client"

/**
 * A button label: a plain string or an `Effect` producing one, evaluated on
 * every render - the hook for labels that reflect state (`"Notifications: ON"`).
 *
 * @category models
 * @since 0.1.0
 */
export type Label<E = never, R = never> = string | Effect.Effect<string, E, R>

/**
 * One entry of a paginated section's page.
 *
 * @category models
 * @since 0.1.0
 */
export interface PageItem {
  /** Stable id carried in the button's callback payload - keep it short. */
  readonly id: string
  readonly label: string
}

/**
 * One page of a paginated section, as produced by its `source`.
 *
 * @category models
 * @since 0.1.0
 */
export interface Page {
  readonly items: ReadonlyArray<PageItem>
  /** Whether a next page exists (renders the "next" arrow). */
  readonly hasNext: boolean
}

/**
 * Options for {@link Menu.paginated}: where the items come from and what a tap
 * on one does.
 *
 * @category models
 * @since 0.1.0
 */
export interface PaginatedOptions<E = never, R = never> {
  /** The page contents - an `Effect`, so a DB-backed list works directly. */
  readonly source: (page: number) => Effect.Effect<Page, E, R>
  /** Runs when an item button is tapped, with the item's id. */
  readonly onSelect: (itemId: string) => Effect.Effect<void, E, R>
  /** Item buttons per keyboard row. Default `1`. */
  readonly columns?: number
  /** Label of the previous-page arrow. Default `"‹"`. */
  readonly prevLabel?: string
  /** Label of the next-page arrow. Default `"›"`. */
  readonly nextLabel?: string
}

/**
 * Pages a static array: `pageSize` items per page (default `8`).
 *
 * @example
 * import { Menu } from "@fibergram/menu"
 * import { Effect } from "effect"
 *
 * const source = Menu.pages([
 *   { id: "a", label: "Apples" },
 *   { id: "b", label: "Bananas" }
 * ], 1)
 *
 * const program = Effect.map(source(0), (page) => page.hasNext) // true
 *
 * @category constructors
 * @since 0.1.0
 */
export const pages = (
  items: ReadonlyArray<PageItem>,
  pageSize = 8
): ((page: number) => Effect.Effect<Page>) =>
(page) =>
  Effect.succeed({
    items: items.slice(page * pageSize, (page + 1) * pageSize),
    hasNext: (page + 1) * pageSize < items.length
  })

/**
 * Whose navigation state a menu message tracks: `"chat"` (default - everyone
 * tapping the message shares one stack) or `"user"` (each tapper navigates
 * independently on the same message).
 *
 * @category models
 * @since 0.1.0
 */
export type Scope = "chat" | "user"

/**
 * Options for {@link make}.
 *
 * @category models
 * @since 0.1.0
 */
export interface MakeOptions {
  /**
   * The pane's message text. Navigating to a pane that has one edits the whole
   * message (`editMessageText`); a textless pane edits only the keyboard.
   */
  readonly text?: string
  /**
   * `CallbackData` prefix for the whole tree (root menu only). Default
   * `menu-<id>`. Must not contain `":"` or `"#"`.
   */
  readonly prefix?: string
  /** See {@link Scope}. Default `"chat"` (root menu only). */
  readonly scope?: Scope
}

/**
 * An immutable menu pane under construction. Every method returns a new menu;
 * handler and label `E`/`R` accumulate into the menu's type, exactly like
 * routes in a `Router` - one edge `Layer` satisfies the finished bot.
 *
 * @category models
 * @since 0.1.0
 */
export interface Menu<out E, out R> {
  /** The pane id - the root's doubles as the tree id. Keep it short. */
  readonly id: string
  /** An action button: taps run `handler`, then the keyboard re-renders. */
  readonly text: <E1 = never, R1 = never, E2 = never, R2 = never>(
    id: string,
    label: Label<E1, R1>,
    handler: Effect.Effect<void, E2, R2>
  ) => Menu<E | E1 | E2, R | R1 | R2>
  /** A button navigating into `target` (pushed onto the back stack). */
  readonly submenu: <E1 = never, R1 = never, E2 = never, R2 = never>(
    label: Label<E1, R1>,
    target: Menu<E2, R2>
  ) => Menu<E | E1 | E2, R | R1 | R2>
  /** A button popping the back stack (no-op on the root pane). */
  readonly back: <E1 = never, R1 = never>(label: Label<E1, R1>) => Menu<E | E1, R | R1>
  /** A plain URL button (no callback). */
  readonly url: <E1 = never, R1 = never>(label: Label<E1, R1>, url: string) => Menu<E | E1, R | R1>
  /** A paged button section - occupies its own keyboard rows. */
  readonly paginated: <E2 = never, R2 = never>(
    id: string,
    options: PaginatedOptions<E2, R2>
  ) => Menu<E | E2, R | R2>
  /** Starts a new keyboard row. */
  readonly row: () => Menu<E, R>
}

/**
 * The navigation state persisted per menu message: the pane ids beneath the
 * current one, the pane being displayed, and the page index of each paginated
 * section (keyed `"<paneId>/<sectionId>"`).
 *
 * @category models
 * @since 0.1.0
 */
export interface NavState {
  readonly stack: ReadonlyArray<string>
  readonly current: string
  readonly pages: Readonly<Record<string, number>>
}

// ---------------------------------------------------------------------------
// Internal representation
// ---------------------------------------------------------------------------

type AnyLabel = Effect.Effect<string, any, any>

type Item =
  | { readonly _tag: "action"; readonly id: string; readonly label: AnyLabel; readonly handler: Effect.Effect<void, any, any> }
  | { readonly _tag: "submenu"; readonly label: AnyLabel; readonly target: Source }
  | { readonly _tag: "back"; readonly label: AnyLabel }
  | { readonly _tag: "url"; readonly label: AnyLabel; readonly url: string }
  | { readonly _tag: "paginated"; readonly id: string; readonly options: PaginatedOptions<any, any> }

interface Source {
  readonly id: string
  readonly paneText: string | undefined
  readonly prefix: string | undefined
  readonly scope: Scope
  readonly rows: ReadonlyArray<ReadonlyArray<Item>>
}

const sourceOf = (menu: Menu<any, any>): Source => (menu as unknown as { readonly source: Source }).source

const toLabel = (label: Label<any, any>): AnyLabel =>
  typeof label === "string" ? Effect.succeed(label) : label

const appendItem = (source: Source, item: Item): Source => {
  const rows = source.rows.length === 0 ? [[]] as ReadonlyArray<ReadonlyArray<Item>> : source.rows
  const head = rows.slice(0, -1)
  const last = rows[rows.length - 1] ?? []
  return { ...source, rows: [...head, [...last, item]] }
}

const build = (source: Source): Menu<any, any> => {
  const menu = {
    id: source.id,
    source,
    text: (id: string, label: Label<any, any>, handler: Effect.Effect<void, any, any>) =>
      build(appendItem(source, { _tag: "action", id, label: toLabel(label), handler })),
    submenu: (label: Label<any, any>, target: Menu<any, any>) =>
      build(appendItem(source, { _tag: "submenu", label: toLabel(label), target: sourceOf(target) })),
    back: (label: Label<any, any>) => build(appendItem(source, { _tag: "back", label: toLabel(label) })),
    url: (label: Label<any, any>, url: string) =>
      build(appendItem(source, { _tag: "url", label: toLabel(label), url })),
    paginated: (id: string, options: PaginatedOptions<any, any>) =>
      build(appendItem(source, { _tag: "paginated", id, options })),
    row: () => build({ ...source, rows: [...source.rows, []] })
  }
  return menu as Menu<any, any>
}

/**
 * Creates an empty menu pane. The root pane's `id` names the whole tree (and
 * its default `CallbackData` prefix, `menu-<id>`); submenu panes are attached
 * with {@link Menu.submenu} and only need ids unique within the tree.
 *
 * @example
 * import { Menu } from "@fibergram/menu"
 * import { Effect } from "effect"
 *
 * const settings = Menu.make("settings", { text: "Settings" })
 *   .text("notif", "Notifications", Effect.log("toggled"))
 *   .row()
 *   .back("‹ Back")
 *
 * const main = Menu.make("main", { text: "Main menu" })
 *   .submenu("Settings", settings)
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = (id: string, options?: MakeOptions): Menu<never, never> =>
  build({
    id,
    paneText: options?.text,
    prefix: options?.prefix,
    scope: options?.scope ?? "chat",
    rows: []
  }) as Menu<never, never>

// ---------------------------------------------------------------------------
// Callback payload
// ---------------------------------------------------------------------------

// Compact tuple payloads: `menu-settings:["b","main","notif"]` ≈ 30 bytes.
const Payload = Schema.Union([
  /** action:    ["b", paneId, buttonId] */
  Schema.Tuple([Schema.Literal("b"), Schema.String, Schema.String]),
  /** submenu:   ["n", targetPaneId] */
  Schema.Tuple([Schema.Literal("n"), Schema.String]),
  /** back:      ["k"] */
  Schema.Tuple([Schema.Literal("k")]),
  /** page turn: ["p", paneId, sectionId, page] */
  Schema.Tuple([Schema.Literal("p"), Schema.String, Schema.String, Schema.Number]),
  /** item pick: ["i", paneId, sectionId, itemId] */
  Schema.Tuple([Schema.Literal("i"), Schema.String, Schema.String, Schema.String]),
  /** noop:      ["x"] (the page indicator) */
  Schema.Tuple([Schema.Literal("x")])
])
type Payload = Schema.Schema.Type<typeof Payload>

const codecOf = (source: Source): CallbackData.Codec<Payload> =>
  CallbackData.make(source.prefix ?? `menu-${source.id}`, Payload)

// ---------------------------------------------------------------------------
// Pane index & state
// ---------------------------------------------------------------------------

const indexPanes = (root: Source): ReadonlyMap<string, Source> => {
  const panes = new Map<string, Source>()
  const walk = (source: Source): void => {
    const existing = panes.get(source.id)
    if (existing === source) return
    if (existing !== undefined) {
      throw new Error(`Menu "${root.id}": duplicate pane id "${source.id}"`)
    }
    panes.set(source.id, source)
    for (const row of source.rows) {
      for (const item of row) {
        if (item._tag === "submenu") walk(item.target)
      }
    }
  }
  walk(root)
  return panes
}

const initialState = (source: Source): NavState => ({
  stack: [],
  current: source.id,
  pages: {}
})

const isNavState = (value: unknown): value is NavState =>
  typeof value === "object" &&
  value !== null &&
  Array.isArray((value as { stack?: unknown }).stack) &&
  typeof (value as { current?: unknown }).current === "string" &&
  typeof (value as { pages?: unknown }).pages === "object" &&
  (value as { pages?: unknown }).pages !== null

/**
 * Identifiers of the message (and, for `scope: "user"`, the tapper) whose
 * navigation state to address.
 *
 * @category models
 * @since 0.1.0
 */
export interface StateKeyOptions {
  readonly chatId: number
  readonly messageId: number
  readonly threadId?: number
  readonly fromId?: number
}

/**
 * The `DialogStore` key a menu message's {@link NavState} is stored under. The
 * message id rides inside the address `kind` (`menu:<rootId>:<messageId>`), so
 * two live menu messages in one chat never share a stack.
 *
 * @example
 * import { Menu } from "@fibergram/menu"
 *
 * const main = Menu.make("main", { text: "Main" })
 * Menu.stateKey(main, { chatId: 100, messageId: 7 })
 * // "menu:main:7:100::"
 *
 * @category combinators
 * @since 0.1.0
 */
export const stateKey = <E, R>(menu: Menu<E, R>, options: StateKeyOptions): string => {
  const source = sourceOf(menu)
  return DialogAddress.toKey({
    chatId: options.chatId,
    ...(options.threadId !== undefined ? { threadId: options.threadId } : {}),
    ...(source.scope === "user" && options.fromId !== undefined ? { fromId: options.fromId } : {}),
    kind: `menu:${source.id}:${options.messageId}`
  })
}

const keyOf = (source: Source, options: StateKeyOptions): string =>
  DialogAddress.toKey({
    chatId: options.chatId,
    ...(options.threadId !== undefined ? { threadId: options.threadId } : {}),
    ...(source.scope === "user" && options.fromId !== undefined ? { fromId: options.fromId } : {}),
    kind: `menu:${source.id}:${options.messageId}`
  })

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

type Button = BotApi.InlineKeyboardButton
type Rendered =
  | { readonly _tag: "button"; readonly button: Button }
  | { readonly _tag: "rows"; readonly rows: ReadonlyArray<ReadonlyArray<Button>> }

const chunk = <A>(items: ReadonlyArray<A>, size: number): ReadonlyArray<ReadonlyArray<A>> =>
  items.length === 0
    ? []
    : Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
      items.slice(i * size, (i + 1) * size))

const renderItem = (
  codec: CallbackData.Codec<Payload>,
  paneId: string,
  state: NavState,
  item: Item
): Effect.Effect<Rendered, any, any> => {
  switch (item._tag) {
    case "action":
      return Effect.flatMap(item.label, (label) =>
        Effect.map(codec.button(label, ["b", paneId, item.id]), (button) => ({ _tag: "button" as const, button })))
    case "submenu":
      return Effect.flatMap(item.label, (label) =>
        Effect.map(codec.button(label, ["n", item.target.id]), (button) => ({ _tag: "button" as const, button })))
    case "back":
      return Effect.flatMap(item.label, (label) =>
        Effect.map(codec.button(label, ["k"]), (button) => ({ _tag: "button" as const, button })))
    case "url":
      return Effect.map(item.label, (label) => ({
        _tag: "button" as const,
        button: { text: label, url: item.url }
      }))
    case "paginated":
      return Effect.gen(function* () {
        const page = state.pages[`${paneId}/${item.id}`] ?? 0
        const current = yield* item.options.source(page)
        const itemButtons = yield* Effect.forEach(current.items, (entry) =>
          codec.button(entry.label, ["i", paneId, item.id, entry.id]))
        const rows = chunk(itemButtons, item.options.columns ?? 1)
        if (page === 0 && !current.hasNext) return { _tag: "rows" as const, rows }
        const nav: Array<Button> = []
        if (page > 0) {
          nav.push(yield* codec.button(item.options.prevLabel ?? "‹", ["p", paneId, item.id, page - 1]))
        }
        nav.push(yield* codec.button(`· ${page + 1} ·`, ["x"]))
        if (current.hasNext) {
          nav.push(yield* codec.button(item.options.nextLabel ?? "›", ["p", paneId, item.id, page + 1]))
        }
        return { _tag: "rows" as const, rows: [...rows, nav] }
      })
  }
}

const assembleRow = (parts: ReadonlyArray<Rendered>): ReadonlyArray<ReadonlyArray<Button>> => {
  const rows: Array<ReadonlyArray<Button>> = []
  let current: Array<Button> = []
  for (const part of parts) {
    if (part._tag === "button") current.push(part.button)
    else {
      if (current.length > 0) {
        rows.push(current)
        current = []
      }
      rows.push(...part.rows)
    }
  }
  if (current.length > 0) rows.push(current)
  return rows
}

const renderMarkup = (
  codec: CallbackData.Codec<Payload>,
  pane: Source,
  state: NavState
): Effect.Effect<BotApi.InlineKeyboardMarkup, any, any> =>
  Effect.map(
    Effect.forEach(pane.rows, (row) =>
      Effect.forEach(row, (item) => renderItem(codec, pane.id, state, item))),
    (rendered) => ({ inlineKeyboard: rendered.flatMap(assembleRow) })
  )

/**
 * Renders the keyboard a menu shows in `state` (default: the initial state -
 * root pane, first pages). Label effects and paginated `source`s run here, so
 * their `E`/`R` surface in the result.
 *
 * @example
 * import { Menu } from "@fibergram/menu"
 * import { Effect } from "effect"
 *
 * const main = Menu.make("main", { text: "Main" })
 *   .text("hi", "Say hi", Effect.log("hi"))
 *
 * const markup = Menu.render(main)
 *
 * @category combinators
 * @since 0.1.0
 */
export const render = <E, R>(
  menu: Menu<E, R>,
  state?: NavState
): Effect.Effect<BotApi.InlineKeyboardMarkup, E | CallbackData.CallbackDataTooLong, R> => {
  const source = sourceOf(menu)
  return Effect.suspend(() => {
    const panes = indexPanes(source)
    const resolved = state ?? initialState(source)
    const pane = panes.get(resolved.current) ?? source
    return renderMarkup(codecOf(source), pane, resolved)
  })
}

// ---------------------------------------------------------------------------
// Sending
// ---------------------------------------------------------------------------

/**
 * Sends the menu into the current chat (root pane, initial state) and stores
 * that state under the sent message's key. `text` overrides the root pane's
 * `MakeOptions.text`; omitting both is a defect.
 *
 * @example
 * import { Menu } from "@fibergram/menu"
 * import { Effect } from "effect"
 *
 * const main = Menu.make("main", { text: "Main menu" })
 *   .text("hi", "Say hi", Effect.log("hi"))
 *
 * const handler = Effect.asVoid(Menu.reply(main))
 *
 * @category combinators
 * @since 0.1.0
 */
export const reply = <E, R>(
  menu: Menu<E, R>,
  text?: Chat.Text
): Effect.Effect<
  SentMessage.SentMessage,
  E | TelegramError.TelegramError | CallbackData.CallbackDataTooLong,
  R | TelegramClient.TelegramClient | DialogStore.DialogStore
> => {
  const source = sourceOf(menu)
  return Effect.gen(function* () {
    yield* Effect.sync(() => indexPanes(source))
    const state = initialState(source)
    const markup = yield* renderMarkup(codecOf(source), source, state)
    const paneText = text ?? source.paneText
    if (paneText === undefined) {
      return yield* Effect.die(
        new Error(`Menu "${source.id}" has no text - pass one to Menu.reply or set MakeOptions.text`)
      )
    }
    const sent = yield* Chat.reply(paneText, { replyMarkup: markup })
    const env = yield* UpdateContext.env
    const store = yield* DialogStore.DialogStore
    yield* store.save(
      keyOf(source, {
        chatId: sent.chat.id,
        messageId: sent.messageId,
        ...(sent.messageThreadId !== undefined ? { threadId: sent.messageThreadId } : {}),
        ...(Option.isSome(env.fromId) ? { fromId: env.fromId.value } : {})
      }),
      state
    )
    return sent
  })
}

// ---------------------------------------------------------------------------
// The route
// ---------------------------------------------------------------------------

const answer = (query: BotApi.CallbackQuery): Effect.Effect<void, never, TelegramClient.TelegramClient> =>
  Effect.flatMap(TelegramClient.TelegramClient, (tg) =>
    Effect.ignore(tg.answerCallbackQuery({ callbackQueryId: query.id })))

const rerender = (
  codec: CallbackData.Codec<Payload>,
  panes: ReadonlyMap<string, Source>,
  root: Source,
  state: NavState,
  chatId: number,
  messageId: number
): Effect.Effect<void, any, any> =>
  Effect.gen(function* () {
    const pane = panes.get(state.current) ?? root
    const replyMarkup = yield* renderMarkup(codec, pane, state)
    const tg = yield* TelegramClient.TelegramClient
    const edit = pane.paneText !== undefined
      ? tg.editMessageText({ chatId, messageId, text: pane.paneText, replyMarkup })
      : tg.editMessageReplyMarkup({ chatId, messageId, replyMarkup })
    // Re-rendering an unchanged keyboard is normal (a handler that changed no
    // label): Telegram answers "message is not modified" - not an error here.
    yield* edit.pipe(Effect.catchTag("MessageNotModified", () => Effect.void), Effect.asVoid)
  })

const handle = (
  source: Source,
  codec: CallbackData.Codec<Payload>,
  panes: ReadonlyMap<string, Source>,
  query: BotApi.CallbackQuery,
  payload: Payload
): Effect.Effect<void, any, any> =>
  Effect.gen(function* () {
    const message = query.message
    if (message === undefined) return yield* answer(query)

    // `message` may be inaccessible (too old): it still carries chat + id, but
    // no thread info.
    const threadId = "messageThreadId" in message ? message.messageThreadId : undefined
    const key = keyOf(source, {
      chatId: message.chat.id,
      messageId: message.messageId,
      ...(threadId !== undefined ? { threadId } : {}),
      fromId: query.from.id
    })
    const store = yield* DialogStore.DialogStore
    const loaded = yield* store.load(key)
    const restored = Option.isSome(loaded) && isNavState(loaded.value) ? loaded.value : initialState(source)
    // A pane that no longer exists (menu changed across a redeploy) resets to root.
    const state = panes.has(restored.current) ? restored : initialState(source)

    const redraw = (next: NavState): Effect.Effect<void, any, any> =>
      Effect.flatMap(
        store.save(key, next),
        () => rerender(codec, panes, source, next, message.chat.id, message.messageId)
      )

    switch (payload[0]) {
      case "b": {
        // A tap from a keyboard that is not the current pane is a stale view:
        // skip the handler, just bring the message back in sync.
        if (payload[1] !== state.current) {
          yield* redraw(state)
          break
        }
        const pane = panes.get(state.current) ?? source
        const item = pane.rows.flat().find((i) => i._tag === "action" && i.id === payload[2])
        if (item?._tag === "action") {
          yield* item.handler
          yield* redraw(state)
        }
        break
      }
      case "n": {
        if (panes.has(payload[1])) {
          yield* redraw({ ...state, stack: [...state.stack, state.current], current: payload[1] })
        }
        break
      }
      case "k": {
        if (state.stack.length > 0) {
          yield* redraw({
            ...state,
            stack: state.stack.slice(0, -1),
            current: state.stack[state.stack.length - 1] ?? source.id
          })
        }
        break
      }
      case "p": {
        if (payload[1] !== state.current) {
          yield* redraw(state)
          break
        }
        yield* redraw({
          ...state,
          pages: { ...state.pages, [`${payload[1]}/${payload[2]}`]: payload[3] }
        })
        break
      }
      case "i": {
        if (payload[1] !== state.current) {
          yield* redraw(state)
          break
        }
        const pane = panes.get(state.current) ?? source
        const item = pane.rows.flat().find((i) => i._tag === "paginated" && i.id === payload[2])
        if (item?._tag === "paginated") {
          yield* item.options.onSelect(payload[3])
          yield* redraw(state)
        }
        break
      }
      case "x":
        break
    }
    yield* answer(query)
  })

/**
 * The `Router` route that drives a menu tree: it matches taps on this menu's
 * buttons (by `CallbackData` prefix), runs the tapped handler, updates the
 * stored {@link NavState}, re-renders the message, and acknowledges the
 * callback query. Mount it next to your other routes; carrying
 * `kinds: ["callbackQuery"]`, it feeds `Router.allowedUpdates` automatically.
 *
 * @example
 * import { Menu } from "@fibergram/menu"
 * import { Router } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const main = Menu.make("main", { text: "Main menu" })
 *   .text("hi", "Say hi", Effect.log("hi"))
 *
 * const router = Router.make(Menu.route(main))
 * // Router.allowedUpdates(router) -> ["callback_query"]
 *
 * @category constructors
 * @since 0.1.0
 */
export const route = <E, R>(
  menu: Menu<E, R>
): Router.Route<
  E | CallbackData.CallbackDataMalformed | CallbackData.CallbackDataTooLong | TelegramError.TelegramError,
  R | TelegramClient.TelegramClient | DialogStore.DialogStore
> => {
  const source = sourceOf(menu)
  const codec = codecOf(source)
  return {
    kinds: ["callbackQuery"],
    match: (update) => {
      const query = update.callbackQuery
      const data = query?.data
      if (query === undefined || data === undefined) return Option.none()
      return Option.map(codec.parse(data), (decode) =>
        Effect.flatMap(decode, (payload) =>
          Effect.flatMap(
            Effect.sync(() => indexPanes(source)),
            (panes) => handle(source, codec, panes, query, payload)
          )))
    }
  }
}
