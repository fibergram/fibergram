/**
 * `Telemetry` - observability defaults for the dispatch boundary.
 * Every update the dispatcher processes is, out of the box:
 *
 * - **annotated** - `chatId`/`updateId` are attached with `Effect.annotateLogs`,
 *   so any `Effect.log` a handler emits is already tagged with the update it ran for;
 * - **traced** - the whole load -> decide -> effects -> save step runs inside a
 *   `fibergram.update` span (`Effect.withSpan`), carrying the chat, update and
 *   dialog kind as attributes. Because both polling and webhook feed the same
 *   dispatcher, the span covers either transport with no extra wiring;
 * - **measured** - three {@link https://effect.website Metric}s update themselves:
 *   how many updates were handled ({@link updatesTotal}), how long each took
 *   ({@link dialogDuration}) and how often Telegram rate-limited us
 *   ({@link rateLimitHits}, incremented from {@link module:Retry}).
 *
 * All three mechanisms are ambient in Effect - they add **nothing** to a handler's
 * `R`. There is nothing to turn on: a bot built with {@link module:Dispatcher}
 * is instrumented by default.
 *
 * **Extension points.** The metrics are plain `Metric` values, so a user reads a
 * live snapshot with `Metric.value(Telemetry.updatesTotal)` or exports the whole
 * registry with `Metric.snapshot`. Spans flow to whatever `Tracer` layer is
 * provided at the edge (e.g. an OpenTelemetry layer); with none, they are no-ops.
 * Log annotations reach whatever `Logger` is installed. Users layer their own
 * spans/metrics on top freely - these are defaults, not a ceiling.
 *
 * @since 0.1.0
 */
import { Clock, Duration, Effect, Metric } from "effect"

import type * as DialogAddress from "./DialogAddress.js"
import type { BotApi } from "@fibergram/client"

/**
 * The name of the span opened per update by {@link instrument}. Exposed so users
 * can match on it in span processors / exporters.
 *
 * @category constants
 * @since 0.1.0
 */
export const updateSpanName = "fibergram.update"

/**
 * Counter of updates accepted and handed to a dialog (post-dedup). Increment-only;
 * read a live value with `Metric.value(Telemetry.updatesTotal)`.
 *
 * @example
 * import { Telemetry } from "@fibergram/core"
 * import { Effect, Metric } from "effect"
 *
 * const handled = Effect.map(Metric.value(Telemetry.updatesTotal), (state) => state.count)
 *
 * @category metrics
 * @since 0.1.0
 */
export const updatesTotal: Metric.Counter<number> = Metric.counter("fibergram_updates_total", {
  description: "Updates accepted by the dispatcher and handed to a dialog",
  incremental: true
})

/**
 * Histogram (timer) of per-update handling latency: the wall-clock of one
 * load -> decide -> run effects -> save step, whether it succeeds or fails.
 *
 * @example
 * import { Telemetry } from "@fibergram/core"
 * import { Effect, Metric } from "effect"
 *
 * const samples = Effect.map(Metric.value(Telemetry.dialogDuration), (state) => state.count)
 *
 * @category metrics
 * @since 0.1.0
 */
export const dialogDuration: Metric.Histogram<Duration.Duration> = Metric.timer(
  "fibergram_dialog_duration",
  { description: "Latency of handling a single update in a dialog" }
)

/**
 * Counter of Telegram rate-limit responses (`429`) observed while retrying an
 * outgoing call. Incremented by {@link module:Retry.retryRateLimited} once per
 * `RateLimited` it catches, so it counts hits, not just failures.
 *
 * @example
 * import { Telemetry } from "@fibergram/core"
 * import { Effect, Metric } from "effect"
 *
 * const hits = Effect.map(Metric.value(Telemetry.rateLimitHits), (state) => state.count)
 *
 * @category metrics
 * @since 0.1.0
 */
export const rateLimitHits: Metric.Counter<number> = Metric.counter("fibergram_rate_limit_hits_total", {
  description: "Telegram 429 rate-limit responses observed while retrying",
  incremental: true
})

/**
 * Wraps one update's handling with the default observability: log annotations,
 * a `fibergram.update` span, an {@link updatesTotal} bump and a
 * {@link dialogDuration} sample. Preserves `A`, `E` and `R` untouched (the span
 * only discharges an ambient `ParentSpan`), so the dispatcher applies it around
 * the decider step without changing any types.
 *
 * The duration is recorded from `Clock`, so it is virtual under `TestClock`.
 *
 * @example
 * import { Telemetry } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const address = { chatId: 100, kind: "echo" }
 * const update = { updateId: 7 }
 * const handled = Telemetry.instrument(address, update)(Effect.void)
 *
 * @category combinators
 * @since 0.1.0
 */
export const instrument = (
  address: DialogAddress.DialogAddress,
  update: BotApi.Update
) =>
<A, E, R>(self: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> => {
  const measured = Effect.gen(function* () {
    yield* Metric.update(updatesTotal, 1)
    const start = yield* Clock.currentTimeMillis
    return yield* self.pipe(
      Effect.onExit(() =>
        Clock.currentTimeMillis.pipe(
          Effect.flatMap((end) => Metric.update(dialogDuration, Duration.millis(end - start)))
        ))
    )
  })
  return measured.pipe(
    Effect.withSpan(updateSpanName, {
      attributes: {
        "telegram.chatId": address.chatId,
        "telegram.updateId": update.updateId,
        "fibergram.dialog.kind": address.kind
      }
    }),
    Effect.annotateLogs({ chatId: address.chatId, updateId: update.updateId })
  )
}
