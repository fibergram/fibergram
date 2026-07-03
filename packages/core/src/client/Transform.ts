/**
 * `Transform` - a first-class value that intercepts every outgoing Bot API call
 * on the single {@link module:generated/client.Call} seam every method flows
 * through. It is fibergram's answer to grammY's *API transformer functions* and
 * aiogram's *session middleware*, but without a parallel middleware universe: a
 * `Transform` is an ordinary `(next) => next'` function over the transport, so
 * `defaults`, throttling, auto-retry, logging and metrics are just values you
 * `compose`.
 *
 * Because they sit on the same `call` seam the recording double
 * ({@link module:TestTelegram}) sits on, any transform stack keeps working under
 * test - the throttle sleeps on a virtual `TestClock`, the injected `parseMode`
 * default shows up in the recorded params.
 *
 * @since 0.1.0
 */
import { Clock, Duration, Effect, Exit, Metric, Ref } from "effect"

import type * as GeneratedClient from "./generated/client.js"
import type * as T from "./generated/types.js"

/**
 * A transform of the transport {@link module:generated/client.Call}: given the
 * `next` call in the stack, it returns a new call that may modify the outgoing
 * `method`/`params`, wrap the effect (retry, throttle, span) or short-circuit.
 * Compose several with {@link compose}; install them with
 * `TelegramClient.transformed(...)` or `TelegramClient.make({ transforms })`.
 *
 * @example
 * import { Transform } from "@fibergram/core/client"
 *
 * const passthrough: Transform.Transform = (next) => next
 *
 * @category models
 * @since 0.1.0
 */
export type Transform = (next: GeneratedClient.Call) => GeneratedClient.Call

/**
 * Builds a {@link Transform} from a function over the transport call. The
 * identity function of the module (`make((next) => next)`); reach for it to write
 * a bespoke interceptor the built-in combinators do not cover. The `method` and
 * `params` types come straight from the generated schemas.
 *
 * @example
 * import { Transform } from "@fibergram/core/client"
 * import { Effect } from "effect"
 *
 * const trace = Transform.make((next) => (method, paramsSchema, resultSchema, params) =>
 *   Effect.tap(next(method, paramsSchema, resultSchema, params), () => Effect.log(`called ${method}`))
 * )
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = (transform: Transform): Transform => transform

/**
 * The transform that changes nothing - the identity for {@link compose}.
 *
 * @example
 * import { Transform } from "@fibergram/core/client"
 *
 * const noop = Transform.identity
 *
 * @category constructors
 * @since 0.1.0
 */
export const identity: Transform = (next) => next

/**
 * Composes transforms into one, left-to-right: the first argument is the
 * **outermost** wrapper (it sees a call before the others and its result last),
 * mirroring the order plugins install in grammY. `compose()` is {@link identity}.
 *
 * @example
 * import { Transform } from "@fibergram/core/client"
 *
 * const stack = Transform.compose(
 *   Transform.defaults({ parseMode: "HTML" }),
 *   Transform.autoRetry()
 * )
 *
 * @category combinators
 * @since 0.1.0
 */
export const compose = (...transforms: ReadonlyArray<Transform>): Transform =>
  (next) => transforms.reduceRight((acc, transform) => transform(acc), next)

/**
 * Applies a stack of transforms over a base transport call. Used internally by
 * `TelegramClient.make`/`transformed` and by `TestTelegram`; exposed so a custom
 * client can install the same stack.
 *
 * @example
 * import { Transform } from "@fibergram/core/client"
 *
 * const install = (base: Parameters<Transform.Transform>[0]) =>
 *   Transform.applyAll([Transform.autoRetry(), Transform.throttle()], base)
 *
 * @category combinators
 * @since 0.1.0
 */
export const applyAll = (
  transforms: ReadonlyArray<Transform>,
  base: GeneratedClient.Call
): GeneratedClient.Call => compose(...transforms)(base)

// --- defaults ---------------------------------------------------------------

/**
 * Bot-wide default params (the analogue of aiogram's `DefaultBotProperties`).
 * Each field is applied only to methods whose `*Params` schema actually declares
 * it, and only when the caller did not pass it - explicit params always win.
 *
 * @example
 * import { Transform } from "@fibergram/core/client"
 *
 * const defaults: Transform.Defaults = { parseMode: "HTML", linkPreviewOptions: { isDisabled: true } }
 *
 * @category models
 * @since 0.1.0
 */
export interface Defaults {
  /** Default `parse_mode` for text/caption-bearing methods. */
  readonly parseMode?: "HTML" | "MarkdownV2" | "Markdown"
  /** Default link-preview options. */
  readonly linkPreviewOptions?: T.LinkPreviewOptions
  /** Send silently by default. */
  readonly disableNotification?: boolean
  /** Protect sent content from forwarding/saving by default. */
  readonly protectContent?: boolean
  /** Allow paid broadcast by default. */
  readonly allowPaidBroadcast?: boolean
  /** Default message effect id. */
  readonly messageEffectId?: string
}

const fieldsCache = new WeakMap<object, ReadonlySet<string>>()

const fieldNamesOf = (schema: object): ReadonlySet<string> => {
  const cached = fieldsCache.get(schema)
  if (cached !== undefined) return cached
  // The camelCase type side of a `Struct(...).pipe(encodeKeys(...))` codec keeps
  // its property names on `ast.propertySignatures` - that is the exact set of
  // keys a default may be injected into.
  const ast = (schema as { readonly ast?: { readonly propertySignatures?: ReadonlyArray<{ readonly name: PropertyKey }> } }).ast
  const names = new Set((ast?.propertySignatures ?? []).map((p) => String(p.name)))
  fieldsCache.set(schema, names)
  return names
}

/**
 * A transform that injects bot-wide {@link Defaults} into every call. A field is
 * merged only when the method's params schema declares it and the caller omitted
 * it - so `parseMode` reaches `sendMessage` but is silently skipped for `getMe`,
 * and an explicit `parseMode` is never overridden. Set it once instead of on
 * every send.
 *
 * @example
 * import { Transform, TelegramClient } from "@fibergram/core/client"
 *
 * const layer = TelegramClient.transformed(Transform.defaults({ parseMode: "HTML" }))
 *
 * @category combinators
 * @since 0.1.0
 */
export const defaults = (values: Defaults): Transform =>
  (next) => (method, paramsSchema, resultSchema, params) => {
    if (paramsSchema === null || typeof params !== "object" || params === null) {
      return next(method, paramsSchema, resultSchema, params)
    }
    const allowed = fieldNamesOf(paramsSchema)
    const present = params as Record<string, unknown>
    const applicable: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined && allowed.has(key) && present[key] === undefined) {
        applicable[key] = value
      }
    }
    const merged = Object.keys(applicable).length === 0 ? params : { ...applicable, ...present }
    return next(method, paramsSchema, resultSchema, merged)
  }

// --- throttle ---------------------------------------------------------------

/**
 * A single rate ceiling: at most `limit` calls per `window`.
 *
 * @example
 * import { Transform } from "@fibergram/core/client"
 * import { Duration } from "effect"
 *
 * const perSecond: Transform.Rate = { limit: 30, window: Duration.seconds(1) }
 *
 * @category models
 * @since 0.1.0
 */
export interface Rate {
  readonly limit: number
  readonly window: Duration.Duration
}

/**
 * Ceilings for {@link throttle}. Omitted fields fall back to Telegram's published
 * limits: 30 messages/second globally, 1 message/second per chat, 20
 * messages/minute per group (negative `chat_id`).
 *
 * @example
 * import { Transform } from "@fibergram/core/client"
 * import { Duration } from "effect"
 *
 * const opts: Transform.ThrottleOptions = { perChat: { limit: 1, window: Duration.seconds(1) } }
 *
 * @category models
 * @since 0.1.0
 */
export interface ThrottleOptions {
  readonly global?: Rate
  readonly perChat?: Rate
  readonly group?: Rate
}

const TELEGRAM_GLOBAL: Rate = { limit: 30, window: Duration.seconds(1) }
const TELEGRAM_PER_CHAT: Rate = { limit: 1, window: Duration.seconds(1) }
const TELEGRAM_GROUP: Rate = { limit: 20, window: Duration.minutes(1) }

const gapMillis = (rate: Rate): number => Duration.toMillis(rate.window) / Math.max(1, rate.limit)

const chatIdOf = (params: unknown): number | string | undefined => {
  if (typeof params !== "object" || params === null) return undefined
  const chatId = (params as { readonly chatId?: number | string }).chatId
  return typeof chatId === "number" || typeof chatId === "string" ? chatId : undefined
}

/**
 * A transform that paces outgoing calls under Telegram's flood limits, so a
 * "noisy" broadcast never trips a 429 in the first place (the analogue of
 * grammY's transformer-throttler). It reserves a dispatch slot per scope
 * (global, per-chat, and per-group for negative `chat_id`s) and sleeps until the
 * latest one; because the wait goes through `Effect.sleep`, a `TestClock` drives
 * it virtually. Calls without a `chat_id` pass through untouched.
 *
 * @example
 * import { Transform, TelegramClient } from "@fibergram/core/client"
 *
 * const layer = TelegramClient.transformed(Transform.throttle())
 *
 * @category combinators
 * @since 0.1.0
 */
export const throttle = (options?: ThrottleOptions): Transform => {
  const global = options?.global ?? TELEGRAM_GLOBAL
  const perChat = options?.perChat ?? TELEGRAM_PER_CHAT
  const group = options?.group ?? TELEGRAM_GROUP
  // Per-key "next free slot" (epoch millis), advanced atomically on reservation.
  const slots = Ref.makeUnsafe(new Map<string, number>())

  const reserve = (key: string, gap: number, now: number): Effect.Effect<number> =>
    Ref.modify(slots, (map) => {
      const slot = Math.max(now, map.get(key) ?? 0)
      const nextMap = new Map(map)
      nextMap.set(key, slot + gap)
      return [slot, nextMap]
    })

  return (next) => (method, paramsSchema, resultSchema, params) => {
    const chatId = chatIdOf(params)
    if (chatId === undefined) return next(method, paramsSchema, resultSchema, params)
    return Clock.currentTimeMillis.pipe(
      Effect.flatMap((now) => {
        const isGroup = typeof chatId === "number" && chatId < 0
        const reservations = [
          reserve("global", gapMillis(global), now),
          reserve(`chat:${chatId}`, gapMillis(perChat), now),
          ...(isGroup ? [reserve(`group:${chatId}`, gapMillis(group), now)] : [])
        ]
        return Effect.forEach(reservations, (r) => r).pipe(
          Effect.flatMap((dispatchAt) => {
            const wait = Math.max(0, Math.max(...dispatchAt) - now)
            const run = next(method, paramsSchema, resultSchema, params)
            return wait === 0 ? run : Effect.andThen(Effect.sleep(Duration.millis(wait)), run)
          })
        )
      })
    )
  }
}

// --- autoRetry --------------------------------------------------------------

/**
 * Options for {@link autoRetry}.
 *
 * @example
 * import { Transform } from "@fibergram/core/client"
 * import { Duration } from "effect"
 *
 * const opts: Transform.AutoRetryOptions = { maxAttempts: 5, maxDelay: Duration.seconds(30) }
 *
 * @category models
 * @since 0.1.0
 */
export interface AutoRetryOptions {
  /** Total attempts before surfacing the last `RateLimited` (default 3). */
  readonly maxAttempts?: number
  /** If Telegram asks to wait longer than this, give up instead of sleeping. */
  readonly maxDelay?: Duration.Duration
}

/**
 * A transform that transparently retries `429`s on the client seam, honouring
 * Telegram's `retry_after` (the analogue of `@grammyjs/auto-retry`). Instead of
 * wrapping every effect with {@link module:Retry.retryRateLimited} by hand,
 * install this once. A `retry_after` beyond `maxDelay` is surfaced rather than
 * slept through. The wait goes through `Effect.sleep`, so `TestClock` drives it.
 *
 * @example
 * import { Transform, TelegramClient } from "@fibergram/core/client"
 *
 * const layer = TelegramClient.transformed(Transform.autoRetry({ maxAttempts: 5 }))
 *
 * @category combinators
 * @since 0.1.0
 */
export const autoRetry = (options?: AutoRetryOptions): Transform => {
  const maxAttempts = options?.maxAttempts ?? 3
  const maxDelay = options?.maxDelay
  return (next) => (method, paramsSchema, resultSchema, params) => {
    const run = next(method, paramsSchema, resultSchema, params)
    const attempt = (n: number): typeof run =>
      Effect.catchTag(run, "RateLimited", (error) => {
        const tooLong = maxDelay !== undefined &&
          Duration.toMillis(error.retryAfter) > Duration.toMillis(maxDelay)
        return n >= maxAttempts || tooLong
          ? Effect.fail(error)
          : Effect.andThen(Effect.sleep(error.retryAfter), attempt(n + 1))
      })
    return attempt(1)
  }
}

// --- logging & metrics ------------------------------------------------------

/**
 * A transform that opens a span per outgoing method (`telegram.<method>`) and
 * logs each call and failure, wiring outbound traffic into the ambient `Tracer`
 * and `Logger`. No-op observability by default (no Tracer/Logger set), like the
 * rest of {@link module:Telemetry}.
 *
 * @example
 * import { Transform, TelegramClient } from "@fibergram/core/client"
 *
 * const layer = TelegramClient.transformed(Transform.logging)
 *
 * @category combinators
 * @since 0.1.0
 */
export const logging: Transform = (next) => (method, paramsSchema, resultSchema, params) =>
  next(method, paramsSchema, resultSchema, params).pipe(
    Effect.tapError((error) => Effect.annotateLogs(Effect.logWarning(`telegram ${method} failed`), { error: error._tag })),
    Effect.withSpan(`telegram.${method}`, { attributes: { "telegram.method": method } })
  )

/**
 * Counter of outgoing Bot API calls made through the seam - bumped by
 * {@link metrics}. Read a live value with `Metric.value(Transform.callsTotal)`.
 *
 * @example
 * import { Transform } from "@fibergram/core/client"
 * import { Effect, Metric } from "effect"
 *
 * const total = Effect.map(Metric.value(Transform.callsTotal), (state) => state.count)
 *
 * @category metrics
 * @since 0.1.0
 */
export const callsTotal: Metric.Counter<number> = Metric.counter("fibergram_api_calls_total", {
  description: "Outgoing Bot API calls made through the client seam",
  incremental: true
})

/**
 * Counter of outgoing calls that failed with a Telegram error - bumped by
 * {@link metrics}.
 *
 * @example
 * import { Transform } from "@fibergram/core/client"
 * import { Effect, Metric } from "effect"
 *
 * const errors = Effect.map(Metric.value(Transform.errorsTotal), (state) => state.count)
 *
 * @category metrics
 * @since 0.1.0
 */
export const errorsTotal: Metric.Counter<number> = Metric.counter("fibergram_api_errors_total", {
  description: "Outgoing Bot API calls that failed with a Telegram error",
  incremental: true
})

/**
 * Histogram (timer) of per-call latency for outgoing Bot API calls - sampled by
 * {@link metrics}.
 *
 * @example
 * import { Transform } from "@fibergram/core/client"
 * import { Effect, Metric } from "effect"
 *
 * const samples = Effect.map(Metric.value(Transform.callDuration), (state) => state.count)
 *
 * @category metrics
 * @since 0.1.0
 */
export const callDuration: Metric.Histogram<Duration.Duration> = Metric.timer(
  "fibergram_api_call_duration",
  { description: "Latency of a single outgoing Bot API call" }
)

/**
 * A transform that records outbound metrics: a call counter
 * (`fibergram_api_calls_total`), an error counter (`fibergram_api_errors_total`)
 * and a latency histogram (`fibergram_api_call_duration`). Read them with
 * `Metric.value` against the same names. Pairs with {@link logging} for
 * span-level tracing.
 *
 * @example
 * import { Transform, TelegramClient } from "@fibergram/core/client"
 *
 * const layer = TelegramClient.transformed(Transform.metrics)
 *
 * @category combinators
 * @since 0.1.0
 */
export const metrics: Transform = (next) => (method, paramsSchema, resultSchema, params) =>
  Clock.currentTimeMillis.pipe(
    Effect.flatMap((start) =>
      next(method, paramsSchema, resultSchema, params).pipe(
        Effect.onExit((exit) =>
          Clock.currentTimeMillis.pipe(
            Effect.flatMap((end) =>
              Metric.update(callDuration, Duration.millis(end - start)).pipe(
                Effect.andThen(Metric.update(callsTotal, 1)),
                Effect.andThen(Exit.isFailure(exit) ? Metric.update(errorsTotal, 1) : Effect.void)
              ))))
      ))
  )
