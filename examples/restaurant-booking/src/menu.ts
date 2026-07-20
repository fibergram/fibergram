/**
 * The browsable food menu (`/menu`) built with `@fibergram/menu`: a root pane of
 * categories, each opening a paginated submenu of dishes, plus a reservations
 * shortcut row. Navigation state lives in the shared `DialogStore`; the whole
 * tree is driven by one {@link Menu.route}.
 *
 * Button labels are **dynamic** — each is an `Effect<string>` resolved through
 * the ambient i18n locale on every render, so the menu re-localizes the instant
 * a user switches language. Category panes carry no text of their own, so
 * opening one only swaps the keyboard and keeps the title message intact.
 */
import { Effect } from "effect"

import { Chat } from "@fibergram/core"
import { Menu } from "@fibergram/menu"

import { restaurantName } from "./config.js"
import { i18n } from "./i18n.js"

import type { AppConfig} from "./config.js";
import type { CallbackData, DialogStore } from "@fibergram/core"
import type { TelegramClient, TelegramError } from "@fibergram/core/client"

/** Error and requirement of a plain `Chat.reply`, shared by every menu handler. */
type ReplyE = TelegramError.TelegramError
type ReplyR = TelegramClient.TelegramClient

interface Dish {
  readonly id: number
  readonly name: string
  readonly price: string
}

interface Category {
  readonly key: string
  readonly emoji: string
  readonly name: string
  readonly dishes: ReadonlyArray<Dish>
}

const catalog: ReadonlyArray<Category> = [
  {
    key: "appetizers",
    emoji: "🥗",
    name: "Appetizers",
    dishes: [
      { id: 1, name: "Caesar Salad", price: "$12.99" },
      { id: 2, name: "Bruschetta", price: "$8.99" },
      { id: 3, name: "Calamari", price: "$14.99" },
      { id: 4, name: "Mozzarella Sticks", price: "$9.99" },
      { id: 5, name: "Buffalo Wings", price: "$11.99" },
      { id: 6, name: "Loaded Nachos", price: "$10.99" },
      { id: 7, name: "Shrimp Cocktail", price: "$16.99" },
      { id: 8, name: "Spinach Dip", price: "$9.99" }
    ]
  },
  {
    key: "mains",
    emoji: "🍖",
    name: "Main Courses",
    dishes: [
      { id: 9, name: "Grilled Salmon", price: "$24.99" },
      { id: 10, name: "Ribeye Steak", price: "$32.99" },
      { id: 11, name: "Chicken Parmesan", price: "$19.99" },
      { id: 12, name: "Fish & Chips", price: "$17.99" },
      { id: 13, name: "BBQ Ribs", price: "$26.99" },
      { id: 14, name: "Lamb Chops", price: "$29.99" }
    ]
  },
  {
    key: "pizza",
    emoji: "🍕",
    name: "Pizza",
    dishes: [
      { id: 15, name: "Margherita", price: "$16.99" },
      { id: 16, name: "Pepperoni", price: "$18.99" },
      { id: 17, name: "Quattro Stagioni", price: "$21.99" },
      { id: 18, name: "Hawaiian", price: "$19.99" },
      { id: 19, name: "Meat Lovers", price: "$23.99" },
      { id: 20, name: "Veggie Supreme", price: "$20.99" }
    ]
  },
  {
    key: "desserts",
    emoji: "🍰",
    name: "Desserts",
    dishes: [
      { id: 21, name: "Tiramisu", price: "$8.99" },
      { id: 22, name: "Cheesecake", price: "$7.99" },
      { id: 23, name: "Gelato", price: "$5.99" },
      { id: 24, name: "Panna Cotta", price: "$6.99" }
    ]
  }
]

const dishById = new Map(catalog.flatMap((c) => c.dishes.map((d) => [d.id, d] as const)))

/** Reply with a dish's localized info card when it is tapped. */
const showDish = (itemId: string): Effect.Effect<void, ReplyE, ReplyR> => {
  const dish = dishById.get(Number(itemId))
  if (dish === undefined) return Effect.void
  return Effect.flatMap(
    i18n.t("menu-item-info", { name: dish.name, price: dish.price }),
    (text) => Effect.asVoid(Chat.reply(text))
  )
}

const categoryMenu = (category: Category): Menu.Menu<ReplyE, ReplyR> =>
  Menu.make(`cat-${category.key}`)
    .paginated("dishes", {
      source: Menu.pages(
        category.dishes.map((d) => ({ id: String(d.id), label: `${d.name} — ${d.price}` })),
        5
      ),
      onSelect: showDish
    })
    .row()
    .back(i18n.t("menu-back"))

/** The full menu tree, ready to `Menu.reply` and register with `Menu.route`. */
export const restaurantMenu: Menu.Menu<ReplyE, ReplyR> = catalog
  .reduce<Menu.Menu<ReplyE, ReplyR>>(
    (menu, category) =>
      menu.submenu(
        Effect.map(
          i18n.t("menu-items", { count: category.dishes.length }),
          (count) => `${category.emoji} ${category.name} (${count})`
        ),
        categoryMenu(category)
      ),
    Menu.make("menu")
  )
  .row()
  .text("reserve", i18n.t("menu-make-reservation"), Effect.flatMap(i18n.t("menu-use-book"), (t) => Effect.asVoid(Chat.reply(t))))
  .text("bookings", i18n.t("menu-my-bookings"), Effect.flatMap(i18n.t("menu-use-my-bookings"), (t) => Effect.asVoid(Chat.reply(t))))

/** Open the menu in the current chat with a localized title. */
export const openMenu: Effect.Effect<
  void,
  ReplyE | CallbackData.CallbackDataTooLong,
  ReplyR | DialogStore.DialogStore | AppConfig
> = Effect.gen(function* () {
  const restaurant = yield* restaurantName
  const title = yield* i18n.t("menu-title", { restaurant })
  yield* Menu.reply(restaurantMenu, title)
})
