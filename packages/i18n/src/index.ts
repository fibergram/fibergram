/**
 * `@fibergram/i18n` - Fluent (`.ftl`) localization for fibergram bots:
 * {@link module:I18n.I18nService.t} through an ambient locale resolved as
 * override → persisted preference (`DialogStore`) → sender `languageCode` →
 * default, plus a localized `hears` route for reply-keyboard text.
 *
 * @since 0.1.0
 */

/**
 * The translator: `make` over `.ftl` sources, the ambient `currentLocale`
 * reference, `t`/`locale`/`setLocale` accessors, and the localized `hears`.
 *
 * @since 0.1.0
 */
export * as I18n from "./I18n.js"
