/**
 * `@fibergram/example-restaurant-booking` — a full fibergram bot: coroutine
 * wizards (`/start`, `/book`), an inline menu with pagination (`/menu`), Fluent
 * i18n (`/language`), and durable filesystem persistence.
 *
 * This barrel re-exports the composable pieces (the root dialog, the layers, the
 * domain repositories) for embedding and testing. The runnable entry point is
 * `./main.ts` — it is intentionally *not* re-exported here, so importing this
 * module never starts a bot.
 */
export * as App from "./app.js"
export * as Booking from "./booking.js"
export * as Commands from "./commands.js"
export * as Config from "./config.js"
export * as Domain from "./domain.js"
export * as I18n from "./i18n.js"
export * as MenuFeature from "./menu.js"
export * as Registration from "./registration.js"
export * as Wizard from "./wizard.js"
