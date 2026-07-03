/**
 * `@fibergram/core/ui` - message-construction UI outside the core (design §2):
 * inline and reply keyboard builders, an entity-tree formatter (no `parse_mode`,
 * nothing to escape), a compiler-checked emoji tagged template, and the closed
 * set of reaction emoji. Depends on `client`/`core`; the core never depends on it.
 *
 * @since 0.1.0
 */

/**
 * The immutable `inline_keyboard` builder (typed `CallbackData` buttons via `.data`).
 *
 * @since 0.1.0
 */
export * as InlineKeyboard from "./InlineKeyboard.js"

/**
 * The immutable reply-keyboard builder (`.text`/`.request*`/`.webApp` + flags).
 *
 * @since 0.1.0
 */
export * as Keyboard from "./Keyboard.js"

/**
 * The entity-tree formatter (`fmt` tagged template + `bold`/`link`/… nodes).
 *
 * @since 0.1.0
 */
export * as Fmt from "./Fmt.js"

/**
 * The compiler-checked emoji tagged template.
 *
 * @since 0.1.0
 */
export * as Emoji from "./Emoji.js"

/**
 * The closed set of reaction emoji and the `ReactionTypeEmoji` constructor.
 *
 * @since 0.1.0
 */
export * as Reaction from "./Reaction.js"
