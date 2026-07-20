/**
 * `I18n` - Fluent-based localization for fibergram bots (the analogue of
 * grammY's `@grammyjs/i18n` and aiogram's `I18n` middleware).
 *
 * Translations are [Fluent](https://projectfluent.org) resources (`.ftl`
 * sources handed to {@link make} as strings), formatted through
 * `@fluent/bundle` - plurals, selectors and message attributes work out of the
 * box. {@link I18nService.t} resolves the message in the **current locale**,
 * falling back to the default locale for keys a translation does not cover yet.
 *
 * The current locale is ambient, like {@link module:UpdateContext}: no `ctx`
 * object is threaded through handlers. It resolves through a chain, first hit
 * wins:
 *
 * 1. an explicit override scoped with {@link withLocale} (the
 *    {@link currentLocale} `Context.Reference`),
 * 2. the preference persisted through the `DialogStore` port by
 *    {@link I18nService.setLocale} (read opportunistically - when no store is
 *    in context, the step is skipped),
 * 3. the sender's `languageCode` from the update being handled,
 * 4. the configured default locale.
 *
 * Steps 2-3 read the ambient update via `UpdateContext`, so inside a handler
 * `t` needs nothing in `R`; outside a handler it simply answers in the default
 * locale (or the {@link withLocale} override). Resolved tags are negotiated
 * against the loaded locales (exact match, then case-insensitive, then primary
 * subtag - `"pt-BR"` finds a `"pt"` bundle), unknown tags fall back to the
 * default.
 *
 * @since 0.1.0
 */
import { FluentBundle, FluentResource } from "@fluent/bundle"
import { Context, Effect, Layer, Option, Schema } from "effect"

import { Chat, DialogAddress, DialogStore, Message, UpdateContext } from "@fibergram/core"

import type { Coroutine, Router, SentMessage } from "@fibergram/core"
import type { BotApi, TelegramClient, TelegramError } from "@fibergram/core/client"
import type { FluentVariable } from "@fluent/bundle"

/**
 * Variables interpolated into a Fluent pattern: `{ $name }` placeables and
 * selector arguments. Fluent accepts strings, numbers and dates.
 *
 * @category models
 * @since 0.1.0
 */
export type Vars = Record<string, FluentVariable>

/**
 * How the persisted locale preference is keyed: `"user"` (the default) stores
 * one preference per sender in a chat, `"chat"` shares one per chat (plus
 * Forum Topic thread) - the same scopes as {@link module:Session}.
 *
 * @category models
 * @since 0.1.0
 */
export type Scope = "chat" | "user"

/**
 * A translator bound to one resolved locale: the negotiated `locale` tag and a
 * **pure** `t` lookup against it (falling back to the default locale, then the
 * key). This is what {@link I18nService.capture} returns inside a coroutine -
 * once the locale is captured by a durable step, every subsequent translation is
 * a deterministic function of persisted state, so replays render identically.
 *
 * @category models
 * @since 0.1.0
 */
export interface Translator {
  readonly locale: string
  readonly t: (key: string, vars?: Vars) => string
}

/**
 * Options for {@link make}: the `.ftl` sources per locale tag (one string or
 * several, added in order), the default locale (must be one of the loaded
 * tags), the {@link Scope} of the persisted preference, and whether Fluent
 * wraps placeables in Unicode isolation marks (`useIsolating`, off by default
 * so formatted text round-trips through Telegram and {@link I18nService.hears}
 * exact-matches).
 *
 * @category models
 * @since 0.1.0
 */
export interface Options {
  readonly locales: Readonly<Record<string, string | ReadonlyArray<string>>>
  readonly defaultLocale: string
  readonly scope?: Scope
  readonly useIsolating?: boolean
}

/**
 * The translator surface built by {@link make}. `locale`/`t` are ambient - they
 * resolve the locale chain themselves and add nothing to `R`; `setLocale`
 * persists a preference through the `DialogStore` port; `translate` is the
 * pure lookup underneath; `hears` builds a `Router` route matching a message's
 * translation in any loaded locale.
 *
 * @category models
 * @since 0.1.0
 */
export interface I18nService {
  /** The loaded locale tags, in the order they were given to {@link make}. */
  readonly locales: ReadonlyArray<string>
  /** The locale used when nothing else resolves. */
  readonly defaultLocale: string
  /** The negotiated current locale - always one of {@link locales}. */
  readonly locale: Effect.Effect<string>
  /**
   * Persists the sender's (or chat's, per {@link Scope}) locale preference.
   * Dies on a locale that is not loaded, or outside an update handler.
   */
  readonly setLocale: (target: string) => Effect.Effect<void, never, DialogStore.DialogStore>
  /**
   * Formats the message at `key` (`"message-id"` or `"message-id.attribute"`)
   * in the current locale, falling back to the default locale. A key missing
   * from both is a programming error and dies.
   */
  readonly t: (key: string, vars?: Vars) => Effect.Effect<string>
  /** Pure lookup: the formatted message in exactly `locale`, if it defines `key`. */
  readonly translate: (locale: string, key: string, vars?: Vars) => Option.Option<string>
  /**
   * Formats `key` in the current locale and sends it to the current chat -
   * `Chat.reply(yield* t(key))` in one call. Cuts the
   * `Effect.flatMap(t(key), Chat.reply)` boilerplate a localized bot repeats for
   * every reply.
   */
  readonly reply: (
    key: string,
    vars?: Vars
  ) => Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient>
  /**
   * Captures the current locale through a **durable** coroutine step and returns
   * a {@link Translator} bound to it. Use it once at the top of a wizard -
   * `const t = yield* i18n.capture(d)` - so the locale is fixed in the coroutine's
   * persisted state and every later `t(...)` is a pure, replay-stable lookup
   * (the ambient locale could otherwise change mid-conversation and diverge a
   * replay).
   */
  readonly capture: <E, R>(d: Coroutine.Dsl<E, R>) => Generator<any, Translator, any>
  /**
   * A route matching a text/caption equal to `key`'s translation in **any**
   * loaded locale - for reply-keyboard buttons, whose presses come back as
   * plain localized text. The handler receives the locale that matched.
   */
  readonly hears: <E, R>(
    key: string,
    handler: (locale: string) => Effect.Effect<void, E, R>
  ) => Router.Route<E, R>
}

/**
 * The ambient locale override, `None` unless scoped with {@link withLocale}.
 * Reading it adds nothing to `R` - the same mechanism as
 * `UpdateContext.current`.
 *
 * @category references
 * @since 0.1.0
 */
export const currentLocale: Context.Reference<Option.Option<string>> = Context.Reference<
  Option.Option<string>
>("@fibergram/i18n/CurrentLocale", {
  defaultValue: (): Option.Option<string> => Option.none()
})

/**
 * Scopes `locale` as the ambient {@link currentLocale} for the duration of
 * `effect`, overriding persisted/`languageCode` resolution - for broadcasts,
 * tests, or answering in a fixed language.
 *
 * @example
 * import { I18n } from "@fibergram/i18n"
 *
 * const inRussian = I18n.t("hello").pipe(I18n.withLocale("ru"))
 *
 * @category combinators
 * @since 0.1.0
 */
export const withLocale = (locale: string) =>
<A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  Effect.provideService(effect, currentLocale, Option.some(locale))

/**
 * The `I18n` service tag, for handlers that reach the translator through `R`
 * (the free {@link t}/{@link locale}/{@link setLocale} accessors) instead of
 * closing over the {@link make} value.
 *
 * @example
 * import { I18n } from "@fibergram/i18n"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const i18n = yield* I18n.I18n
 *   return i18n.defaultLocale
 * })
 *
 * @category services
 * @since 0.1.0
 */
export class I18n extends Context.Service<I18n, I18nService>()("@fibergram/i18n/I18n") {}

const storageKind = "i18n:locale"

const senderOf = (update: BotApi.Update): Option.Option<BotApi.User> =>
  Option.fromNullishOr(
    update.message?.from ??
      update.editedMessage?.from ??
      update.channelPost?.from ??
      update.editedChannelPost?.from ??
      update.businessMessage?.from ??
      update.editedBusinessMessage?.from ??
      update.guestMessage?.from ??
      update.callbackQuery?.from ??
      update.inlineQuery?.from ??
      update.chosenInlineResult?.from ??
      update.shippingQuery?.from ??
      update.preCheckoutQuery?.from ??
      update.purchasedPaidMedia?.from ??
      update.messageReaction?.user ??
      update.myChatMember?.from ??
      update.chatMember?.from ??
      update.chatJoinRequest?.from ??
      update.businessConnection?.user ??
      update.pollAnswer?.user
  )

/**
 * Builds an {@link I18nService} from `.ftl` sources. Construction is eager and
 * synchronous (Fluent parsing is pure), so the value can build routes
 * ({@link I18nService.hears}) before any Layer exists; wire it into `R` with
 * {@link layer}. Throws on construction-time configuration errors: a
 * `defaultLocale` that is not among `locales`, or conflicting message ids
 * within one locale's resources.
 *
 * @example
 * import { I18n } from "@fibergram/i18n"
 *
 * const i18n = I18n.make({
 *   defaultLocale: "en",
 *   locales: {
 *     en: "hello = Hello, { $name }!",
 *     ru: "hello = Привет, { $name }!"
 *   }
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = (options: Options): I18nService => {
  const scope = options.scope ?? "user"
  const useIsolating = options.useIsolating ?? false

  const bundles = new Map<string, FluentBundle>()
  for (const [tag, sources] of Object.entries(options.locales)) {
    const bundle = new FluentBundle(tag, { useIsolating })
    const list = typeof sources === "string" ? [sources] : sources
    for (const source of list) {
      const errors = bundle.addResource(new FluentResource(source))
      if (errors.length > 0) {
        throw new Error(
          `fibergram: i18n resources for locale "${tag}" conflict: ${
            errors.map((error) => error.message).join("; ")
          }`
        )
      }
    }
    bundles.set(tag, bundle)
  }

  const tags = [...bundles.keys()]
  const defaultLocale = options.defaultLocale
  if (!bundles.has(defaultLocale)) {
    throw new Error(
      `fibergram: i18n defaultLocale "${defaultLocale}" is not among the loaded locales (${
        tags.join(", ")
      })`
    )
  }

  const negotiate = (tag: string): string => {
    if (bundles.has(tag)) return tag
    const lower = tag.toLowerCase()
    const exact = tags.find((candidate) => candidate.toLowerCase() === lower)
    if (exact !== undefined) return exact
    const primary = lower.split("-")[0] ?? lower
    const base = tags.find((candidate) => candidate.toLowerCase() === primary)
    return base ?? defaultLocale
  }

  const storageKeyOf = (env: UpdateContext.UpdateEnv): Option.Option<string> => {
    if (scope === "user" && Option.isNone(env.fromId)) return Option.none()
    return Option.some(
      DialogAddress.toKey({
        chatId: env.chatId,
        ...(Option.isSome(env.threadId) ? { threadId: env.threadId.value } : {}),
        ...(scope === "user" && Option.isSome(env.fromId) ? { fromId: env.fromId.value } : {}),
        kind: storageKind
      })
    )
  }

  const translate = (locale: string, key: string, vars?: Vars): Option.Option<string> => {
    const bundle = bundles.get(locale)
    if (bundle === undefined) return Option.none()
    const dot = key.indexOf(".")
    const id = dot === -1 ? key : key.slice(0, dot)
    const attribute = dot === -1 ? undefined : key.slice(dot + 1)
    const message = bundle.getMessage(id)
    if (message === undefined) return Option.none()
    const pattern = attribute === undefined ? message.value : message.attributes[attribute]
    if (pattern === null || pattern === undefined) return Option.none()
    // A collector array keeps formatPattern from throwing; a missing variable
    // renders as its `{$name}` placeholder instead.
    return Option.some(bundle.formatPattern(pattern, vars ?? null, []))
  }

  const locale: Effect.Effect<string> = Effect.gen(function* () {
    const ambient = yield* Effect.service(currentLocale)
    if (Option.isSome(ambient)) return negotiate(ambient.value)
    const maybeEnv = yield* Effect.service(UpdateContext.current)
    if (Option.isNone(maybeEnv)) return defaultLocale
    const env = maybeEnv.value
    const store = yield* Effect.serviceOption(DialogStore.DialogStore)
    if (Option.isSome(store)) {
      const key = storageKeyOf(env)
      if (Option.isSome(key)) {
        const saved = yield* store.value.load(key.value)
        if (Option.isSome(saved) && typeof saved.value === "string") {
          return negotiate(saved.value)
        }
      }
    }
    const sender = senderOf(env.update)
    const code = Option.isSome(sender) ? sender.value.languageCode : undefined
    return code === undefined ? defaultLocale : negotiate(code)
  })

  const setLocale = (target: string): Effect.Effect<void, never, DialogStore.DialogStore> =>
    Effect.gen(function* () {
      if (!bundles.has(target)) {
        return yield* Effect.die(
          new Error(
            `fibergram: i18n locale "${target}" is not among the loaded locales (${
              tags.join(", ")
            })`
          )
        )
      }
      const env = yield* UpdateContext.env
      const key = storageKeyOf(env)
      if (Option.isNone(key)) {
        return yield* Effect.die(
          new Error(
            "fibergram: the i18n locale preference is scoped per-user, but the update carries no sender (fromId)"
          )
        )
      }
      const store = yield* DialogStore.DialogStore
      yield* store.save(key.value, target)
    })

  const t = (key: string, vars?: Vars): Effect.Effect<string> =>
    Effect.flatMap(locale, (current) =>
      translate(current, key, vars).pipe(
        Option.orElse(() => translate(defaultLocale, key, vars)),
        Option.match({
          onNone: () =>
            Effect.die(
              new Error(
                `fibergram: i18n message "${key}" is missing from locale "${current}" and the default locale "${defaultLocale}"`
              )
            ),
          onSome: Effect.succeed
        })
      ))

  const reply = (
    key: string,
    vars?: Vars
  ): Effect.Effect<SentMessage.SentMessage, TelegramError.TelegramError, TelegramClient.TelegramClient> =>
    Effect.flatMap(t(key, vars), (text) => Chat.reply(text))

  const boundTranslate = (loc: string) => (key: string, vars?: Vars): string =>
    Option.getOrElse(
      Option.orElse(translate(loc, key, vars), () => translate(defaultLocale, key, vars)),
      () => key
    )

  function* capture<E, R>(d: Coroutine.Dsl<E, R>): Generator<any, Translator, any> {
    const loc = yield* d.run(locale, Schema.String)
    return { locale: loc, t: boundTranslate(loc) }
  }

  const hears = <E, R>(
    key: string,
    handler: (locale: string) => Effect.Effect<void, E, R>
  ): Router.Route<E, R> => {
    // Built in reverse so that on a translation shared by several locales the
    // *earlier* locale wins (Map keeps the last write).
    const table = new Map(
      tags
        .flatMap((tag) =>
          Option.match(translate(tag, key), {
            onNone: () => [],
            onSome: (text) => [[text, tag] as const]
          })
        )
        .reverse()
    )
    return {
      match: (update) =>
        Option.flatMap(Message.text(update), (text) => {
          const matched = table.get(text)
          return matched === undefined ? Option.none() : Option.some(handler(matched))
        }),
      kinds: ["message"]
    }
  }

  return { locales: tags, defaultLocale, locale, setLocale, t, translate, reply, capture, hears }
}

/**
 * Wires an {@link I18nService} built by {@link make} into the environment under
 * the {@link I18n} tag, so handlers can use the free {@link t}/{@link locale}/
 * {@link setLocale} accessors.
 *
 * @example
 * import { I18n } from "@fibergram/i18n"
 * import { Layer } from "effect"
 *
 * const i18n = I18n.make({ defaultLocale: "en", locales: { en: "hi = Hi!" } })
 * const live: Layer.Layer<I18n.I18n> = I18n.layer(i18n)
 *
 * @category layers
 * @since 0.1.0
 */
export const layer = (service: I18nService): Layer.Layer<I18n> => Layer.succeed(I18n, service)

/**
 * {@link I18nService.t} through the {@link I18n} tag: formats `key` in the
 * ambient current locale, falling back to the default locale.
 *
 * @example
 * import { I18n } from "@fibergram/i18n"
 * import { Effect } from "effect"
 *
 * const greet = Effect.gen(function* () {
 *   const text = yield* I18n.t("hello", { name: "Ada" })
 *   return text
 * })
 *
 * @category accessors
 * @since 0.1.0
 */
export const t = (key: string, vars?: Vars): Effect.Effect<string, never, I18n> =>
  Effect.flatMap(I18n, (i18n) => i18n.t(key, vars))

/**
 * {@link I18nService.locale} through the {@link I18n} tag: the negotiated
 * current locale.
 *
 * @example
 * import { I18n } from "@fibergram/i18n"
 * import { Effect } from "effect"
 *
 * const which = Effect.flatMap(I18n.locale, (locale) => Effect.log(locale))
 *
 * @category accessors
 * @since 0.1.0
 */
export const locale: Effect.Effect<string, never, I18n> = Effect.flatMap(
  I18n,
  (i18n) => i18n.locale
)

/**
 * {@link I18nService.setLocale} through the {@link I18n} tag: persists the
 * locale preference for the current update's sender (or chat, per
 * {@link Scope}).
 *
 * @example
 * import { I18n } from "@fibergram/i18n"
 *
 * const toRussian = I18n.setLocale("ru")
 *
 * @category accessors
 * @since 0.1.0
 */
export const setLocale = (
  target: string
): Effect.Effect<void, never, I18n | DialogStore.DialogStore> =>
  Effect.flatMap(I18n, (i18n) => i18n.setLocale(target))

/**
 * {@link I18nService.reply} through the {@link I18n} tag: formats `key` in the
 * current locale and sends it to the current chat.
 *
 * @example
 * import { I18n } from "@fibergram/i18n"
 *
 * const greet = I18n.reply("hello", { name: "Ada" })
 *
 * @category accessors
 * @since 0.1.0
 */
export const reply = (
  key: string,
  vars?: Vars
): Effect.Effect<
  SentMessage.SentMessage,
  TelegramError.TelegramError,
  I18n | TelegramClient.TelegramClient
> => Effect.flatMap(I18n, (i18n) => i18n.reply(key, vars))
