/**
 * Webhook ingestion. Like polling, the webhook transport is
 * **just a producer into a shared `Queue<Update>`** - the dispatcher drains
 * `Stream.fromQueue` and never learns which transport delivered an update. The
 * decoupling point is `Queue.offer`: everything before it (secret-token check,
 * body decode) is transport concern; everything after it is handler concern.
 *
 * Two entrypoints share one transport-neutral core:
 * - {@link Webhook.handle} - **framework-agnostic**, takes a web-standard
 *   `Request` and returns a `Promise<Response>`. Serves serverless (Workers,
 *   Vercel, Lambda), Bun, workerd and any framework that speaks web `Request`
 *   directly; express/fastify need a ~20-line body/headers adapter.
 *   Nothing from Effect leaks across that boundary.
 * - {@link Webhook.httpApp} - **Effect-native**, an `Effect<HttpServerResponse,
 *   never, HttpServerRequest>` mounted on the `@effect/platform` HTTP server via
 *   `HttpRouter.add("POST", "/webhook", webhook.httpApp)`; tracing spans and `R`
 *   flow through untouched.
 *
 * **Ack policy**. Telegram retries a webhook it does not 2xx within
 * the timeout, so the handler never does heavy work inline:
 * - **fast-ack** (default): `offer` to the in-memory queue, return 200. A crash
 *   between the 200 and processing loses that update.
 * - **durable-ack** ({@link MakeOptions.persist}): persist the update, *then*
 *   offer, *then* 200; a failed persist answers 500 so Telegram re-delivers
 *   (at-least-once). Dedup by `updateId` removes the duplicates.
 *
 * @since 0.1.0
 */
import { Effect, Option, Queue, Redacted, Schema, Stream as StreamNs } from "effect"
import {
  Headers,
  HttpServerRequest,
  HttpServerResponse
} from "effect/unstable/http"

import { BotApi } from "@fibergram/core/client"

import type { Scope, Stream } from "effect"
import type {
  HttpClientResponse} from "effect/unstable/http";

/**
 * The header Telegram echoes back for every webhook call, carrying the secret
 * token configured via `setWebhook`. Constant across the Bot API.
 *
 * @category constants
 * @since 0.1.0
 */
export const secretTokenHeader = "x-telegram-bot-api-secret-token"

// Web-standard Request/Response types, derived from the Effect http helpers so
// we neither pull in the DOM lib (tsconfig is `lib: ["ES2022"]`) nor hand-roll
// them. Under no-DOM these resolve loosely, which is exactly what an
// edge-portable handler wants.
type WebRequest = Parameters<typeof HttpServerRequest.fromWeb>[0]
type WebResponse = Parameters<typeof HttpClientResponse.fromWeb>[1]

const ResponseCtor = (
  globalThis as typeof globalThis & {
    Response: new (
      body?: string | null,
      init?: { status?: number }
    ) => WebResponse
  }
).Response

const webResponse = (status: number): WebResponse => new ResponseCtor(null, { status })

/**
 * Length-independent string comparison: folds the length delta and every char
 * XOR into a single accumulator so the running time does not reveal *where* two
 * tokens first differ. Out-of-range `charCodeAt` yields `NaN`, which `^` coerces
 * to `0`; the seeded length delta already forces a mismatch on unequal lengths.
 */
const constantTimeEqual = (a: string, b: string): boolean => {
  const length = Math.max(a.length, b.length)
  let diff = a.length ^ b.length
  for (let index = 0; index < length; index++) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index)
  }
  return diff === 0
}

/**
 * Options for {@link make}.
 *
 * @category models
 * @since 0.1.0
 */
export interface MakeOptions {
  /**
   * Secret token configured with `setWebhook`. When set, both entrypoints reject
   * any request whose `X-Telegram-Bot-Api-Secret-Token` header does not match
   * (constant-time) with `401`. Omit only if the endpoint is otherwise
   * unguessable - the token is the sole thing separating Telegram from spoofed
   * traffic.
   */
  readonly secretToken?: string | Redacted.Redacted<string>
  /** Bounded queue capacity; a full queue makes the entrypoint block before its
   * 200, which is the intended signal to Telegram to retry later (default 1024). */
  readonly capacity?: number
  /**
   * Durable-ack hook. When provided, a validated update is handed
   * to `persist` *before* it is enqueued and before `200` is returned; if
   * `persist` fails the entrypoint answers `500`, so Telegram re-delivers and
   * nothing is lost (at-least-once). Omit for fast-ack. Must be `R = never` -
   * close over your store instance (the `@fibergram/durable` backend supplies a
   * ready-made persist effect). Handler code is identical either way.
   */
  readonly persist?: (update: BotApi.Update) => Effect.Effect<void, unknown>
}

/**
 * A built webhook: the ingestion stream for the dispatcher plus the two HTTP
 * entrypoints (framework-agnostic and Effect-native).
 *
 * @category models
 * @since 0.1.0
 */
export interface Webhook {
  /** The `Stream<Update>` the dispatcher consumes - the same shape polling
   * returns, so a bot can switch transports without touching handler code. */
  readonly updates: Stream.Stream<BotApi.Update>
  /**
   * Validate, decode and enqueue one incoming webhook request, resolving to the
   * web-standard `Response` to send back:
   * - bad/absent secret token -> `401` (do not answer `200`, or a spoofer stays
   *   silent);
   * - authenticated-but-malformed body -> log + `200` (drop; a non-2xx would
   *   trigger a Telegram retry storm);
   * - failed durable persist -> `500` (Telegram re-delivers);
   * - valid update -> `offer` to the queue + `200`.
   */
  readonly handle: (request: WebRequest) => Promise<WebResponse>
  /**
   * The Effect-native form of {@link handle}: read the active
   * `HttpServerRequest`, run the same validate/decode/ack path, and produce an
   * `HttpServerResponse`. Mount it on `@effect/platform`:
   * `HttpRouter.add("POST", "/webhook", webhook.httpApp)`.
   */
  readonly httpApp: Effect.Effect<
    HttpServerResponse.HttpServerResponse,
    never,
    HttpServerRequest.HttpServerRequest
  >
}

/**
 * Builds a {@link Webhook} owning an in-memory `Queue<Update>` in the ambient
 * `Scope`. `handle` closes over that queue and runs on the default runtime, so
 * it needs no services and returns a plain `Promise<Response>`; `httpApp` is the
 * same logic as an `Effect` for the platform HTTP server.
 *
 * @example
 * import { Webhook } from "@fibergram/webhook"
 * import { Dispatcher, Dialog, DialogStore, Dedup } from "@fibergram/core"
 * import { TelegramClient } from "@fibergram/core/client"
 * import { Effect, Layer } from "effect"
 * import { FetchHttpClient } from "effect/unstable/http"
 *
 * const echo = Dialog.stateless({ onUpdate: () => Effect.void })
 *
 * const program = Effect.gen(function* () {
 *   const webhook = yield* Webhook.make({ secretToken: "s3cret" })
 *   yield* Effect.forkScoped(
 *     Dispatcher.run({ updates: webhook.updates, dialog: echo })
 *   )
 *   // Serverless / Bun / workerd / Hono speak web `Request` already:
 *   //   export default { fetch: (request) => webhook.handle(request) }
 *   // express/fastify: adapt req -> Request, Response -> res (~20 lines):
 *   //   app.post("/webhook", (req, res) =>
 *   //     webhook.handle(toRequest(req)).then((r) => send(res, r)))
 * }).pipe(
 *   Effect.scoped,
 *   Effect.provide([
 *     DialogStore.layerMemory,
 *     Dedup.layerMemory,
 *     TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
 *   ])
 * )
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = (
  options?: MakeOptions
): Effect.Effect<Webhook, never, Scope.Scope> =>
  Effect.gen(function* () {
    const capacity = options?.capacity ?? 1024
    const persist = options?.persist
    const secretToken =
      options?.secretToken === undefined
        ? undefined
        : (Redacted.isRedacted(options.secretToken)
          ? Redacted.value(options.secretToken)
          : options.secretToken)

    const queue = yield* Queue.bounded<BotApi.Update>(capacity)
    // `fromJsonString` folds `JSON.parse` and schema decode into one Effect whose
    // only failure channel is `SchemaError` - swallowed to `None` below.
    const decodeUpdate = Schema.decodeUnknownEffect(Schema.fromJsonString(BotApi.Update))

    // Transport-neutral core, shared by both entrypoints. `readBody` lets each
    // transport supply the body its own way (a rejected Promise for the web path,
    // an `HttpServerError` for the platform path); every failure - I/O, JSON or
    // schema - collapses to `None`, so a malformed-but-authenticated body is
    // dropped, not retried. Returns the HTTP status to answer with.
    const decide = <E>(
      providedToken: string | null,
      readBody: Effect.Effect<string, E>
    ): Effect.Effect<number> =>
      Effect.gen(function* () {
        if (secretToken !== undefined && (providedToken === null || !constantTimeEqual(providedToken, secretToken))) {
            return 401
          }

        const update = yield* readBody.pipe(Effect.flatMap(decodeUpdate), Effect.option)
        if (Option.isNone(update)) {
          yield* Effect.logWarning("fibergram: webhook received a malformed update")
          return 200
        }

        // Durable-ack: persist before enqueue/ack; a failed persist -> 500 so
        // Telegram re-delivers. Fast-ack skips straight to the offer.
        if (persist !== undefined) {
          const persisted = yield* persist(update.value).pipe(Effect.option)
          if (Option.isNone(persisted)) {
            yield* Effect.logWarning("fibergram: webhook durable persist failed; answering 500")
            return 500
          }
        }

        yield* Queue.offer(queue, update.value)
        return 200
      }).pipe(
        // Trace the ingestion leg. The dispatcher opens its own
        // `fibergram.update` span once the update is dequeued; this one covers the
        // synchronous validate/decode/enqueue before the 200. Spans flow to
        // whatever Tracer is provided (a no-op when none is).
        Effect.tap((status) => Effect.annotateCurrentSpan("http.status", status)),
        Effect.withSpan("fibergram.webhook")
      )

    const httpApp = Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const providedToken = Option.getOrNull(Headers.get(secretTokenHeader)(request.headers))
      const status = yield* decide(providedToken, request.text)
      return HttpServerResponse.empty({ status })
    })

    const handle = (request: WebRequest): Promise<WebResponse> =>
      Effect.runPromise(
        decide(
          request.headers.get(secretTokenHeader),
          Effect.tryPromise(() => request.text())
        ).pipe(Effect.map(webResponse))
      )

    return {
      updates: StreamNs.fromQueue(queue),
      handle,
      httpApp
    }
  })
