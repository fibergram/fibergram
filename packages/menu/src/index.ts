/**
 * `@fibergram/menu` - stateful inline menus for fibergram bots: submenu / back /
 * pagination navigation declared as an immutable builder, rendered as an inline
 * keyboard, with the navigation state (stack, current pane, page indices) kept in
 * the `DialogStore` rather than guessed from the message (grammY's "outdated
 * menu" heuristics).
 *
 * @since 0.1.0
 */

/**
 * The menu builder, renderer, and the `Router` route that drives navigation.
 *
 * @since 0.1.0
 */
export * as Menu from "./Menu.js"
