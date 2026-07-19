/**
 * Multi-bot webhook fan-out. One HTTP endpoint serving many bots, each behind
 * its own {@link module:Webhook.Webhook} (its own `Queue<Update>` + dispatcher),
 * disambiguated by a routing key carried **in the request path** - the analog of
 * grammY's `TokenBasedRequestHandler`.
 *
 * The idiom mirrors the Bot API's own multi-bot deployment: give each bot a
 * distinct webhook URL (`setWebhook` with `https://host/webhook/<token>`), then
 * route by the last path segment. The token in the path is secret, so it doubles
 * as coarse auth; the per-bot `secretToken` header stays the real guard.
 *
 * `Multibot` is **transport-neutral in the same way `Webhook` is** - it exposes the
 * same two entrypoints ({@link Multibot.handle} framework-agnostic,
 * {@link Multibot.httpApp} Effect-native) and delegates to the resolved bot's
 * matching entrypoint. It owns no queue and no scope of its own; the per-bot
 * `Webhook`s are built (and their dispatchers forked) in the caller's `Scope`.
 *
 * @since 0.1.0
 */
import { Effect, Option } from "effect"
import { HttpServerRequest, HttpServerResponse } from "effect/unstable/http"

import type { Webhook } from "./Webhook.js"

// Reuse Webhook's DOM-free web Request/Response types instead of re-deriving them,
// so the two entrypoints stay in lockstep with the single-bot transport.
type WebRequest = Parameters<Webhook["handle"]>[0]
type WebResponse = Awaited<ReturnType<Webhook["handle"]>>

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
 * Default routing-key extractor: the last non-empty path segment of the request
 * URL. Handles both the absolute URL a web `Request` carries
 * (`https://host/webhook/<token>`) and the bare path the platform
 * `HttpServerRequest` carries (`/webhook/<token>`); query and hash are ignored.
 * Returns `None` for a path with no segments (`/`), which routes to `404`.
 */
const lastPathSegment = (url: string): Option.Option<string> => {
  // Strip scheme + authority when the URL is absolute; the platform request's
  // `url` is already a bare path, so leave it untouched.
  let rest = url
  const schemeEnd = url.indexOf("://")
  if (schemeEnd !== -1) {
    const slash = url.indexOf("/", schemeEnd + 3)
    rest = slash === -1 ? "" : url.slice(slash)
  }
  const queryOrHash = rest.search(/[?#]/)
  const path = queryOrHash === -1 ? rest : rest.slice(0, queryOrHash)
  const segments = path.split("/").filter((segment) => segment.length > 0)
  const last = segments.at(-1)
  return last === undefined ? Option.none() : Option.some(last)
}

/**
 * Options for {@link make}.
 *
 * @category models
 * @since 0.1.0
 */
export interface MakeOptions {
  /**
   * Resolve a routing key (by default the last path segment) to the `Webhook`
   * that should handle the request. Return `None` for an unknown key, which is
   * answered `404` without touching any bot's queue. Called on **every** request,
   * so memoise inside if resolution is expensive (a DB lookup, lazy bot
   * creation). Must be `R = never` and total (`E = never`) - close over your
   * registry - so it runs on the default runtime from the framework-agnostic
   * {@link Multibot.handle}.
   */
  readonly resolve: (key: string) => Effect.Effect<Option.Option<Webhook>>
  /**
   * Override how the routing key is pulled from the request URL. Defaults to the
   * last non-empty path segment. Return `None` to answer `404` (no routable key).
   */
  readonly extractKey?: (url: string) => Option.Option<string>
}

/**
 * A built multi-bot endpoint: the same handle/httpApp pair as a single
 * {@link module:Webhook.Webhook}, dispatching each request to the resolved bot.
 *
 * @category models
 * @since 0.1.0
 */
export interface Multibot {
  /**
   * Extract the routing key, resolve the owning `Webhook`, and delegate to its
   * {@link module:Webhook.Webhook.handle}. Unknown key (or no key in the path) ->
   * `404`; otherwise the resolved bot's own status (200 / 401 / 500) flows
   * straight through.
   */
  readonly handle: (request: WebRequest) => Promise<WebResponse>
  /**
   * The Effect-native form of {@link Multibot.handle}: read the active
   * `HttpServerRequest`, resolve the owning `Webhook`, and run its
   * {@link module:Webhook.Webhook.httpApp}. Mount it once for all bots:
   * `HttpRouter.add("POST", "/webhook/:token", multibot.httpApp)`.
   */
  readonly httpApp: Effect.Effect<
    HttpServerResponse.HttpServerResponse,
    never,
    HttpServerRequest.HttpServerRequest
  >
}

/**
 * Builds a {@link Multibot} that routes each incoming request to a per-bot
 * `Webhook` chosen by a routing key in the path. It owns nothing itself - build
 * each `Webhook` (and fork its dispatcher) in your scope, then hand a `resolve`
 * that maps the key to one. For a fixed set of bots see {@link fromMap}.
 *
 * @example
 * import { Multibot, Webhook } from "@fibergram/webhook"
 * import { Dispatcher, Dialog } from "@fibergram/core"
 * import { Effect, Option } from "effect"
 *
 * const echo = Dialog.stateless({ onUpdate: () => Effect.void })
 *
 * const program = Effect.gen(function* () {
 *   // One Webhook + dispatcher per bot, each with its own secret token.
 *   const alice = yield* Webhook.make({ secretToken: "alice-secret" })
 *   yield* Effect.forkScoped(Dispatcher.run({ updates: alice.updates, dialog: echo }))
 *
 *   const bots = new Map([["alice-token", alice]])
 *   const multibot = Multibot.make({
 *     resolve: (key) => Effect.succeed(Option.fromNullishOr(bots.get(key)))
 *   })
 *   // Point each bot's setWebhook at https://host/webhook/<its-token>:
 *   //   export default { fetch: (request) => multibot.handle(request) }
 *   return multibot
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = (options: MakeOptions): Multibot => {
  const extractKey = options.extractKey ?? lastPathSegment
  const { resolve } = options

  const dispatch = <A, R>(
    url: string,
    onFound: (webhook: Webhook) => Effect.Effect<A, never, R>,
    notFound: A
  ): Effect.Effect<A, never, R> =>
    Effect.gen(function* () {
      const key = extractKey(url)
      if (Option.isNone(key)) return notFound
      const webhook = yield* resolve(key.value)
      return Option.isNone(webhook) ? notFound : yield* onFound(webhook.value)
    })

  const handle = (request: WebRequest): Promise<WebResponse> =>
    Effect.runPromise(
      dispatch(
        request.url,
        (webhook) => Effect.promise(() => webhook.handle(request)),
        webResponse(404)
      )
    )

  const httpApp = Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest
    return yield* dispatch(
      request.url,
      (webhook) => webhook.httpApp,
      HttpServerResponse.empty({ status: 404 })
    )
  })

  return { handle, httpApp }
}

/**
 * {@link make} over a fixed registry: a `ReadonlyMap` from routing key to
 * `Webhook`. Lookup is a synchronous, total map read - a missing key is `404`.
 * Use this when the set of bots is known at startup; reach for {@link make} when
 * bots come and go at runtime.
 *
 * @example
 * import { Multibot, Webhook } from "@fibergram/webhook"
 * import { Dispatcher, Dialog } from "@fibergram/core"
 * import { Effect } from "effect"
 *
 * const echo = Dialog.stateless({ onUpdate: () => Effect.void })
 *
 * const program = Effect.gen(function* () {
 *   const alice = yield* Webhook.make({ secretToken: "alice-secret" })
 *   const bob = yield* Webhook.make({ secretToken: "bob-secret" })
 *   yield* Effect.forkScoped(Dispatcher.run({ updates: alice.updates, dialog: echo }))
 *   yield* Effect.forkScoped(Dispatcher.run({ updates: bob.updates, dialog: echo }))
 *
 *   return Multibot.fromMap(
 *     new Map([
 *       ["alice-token", alice],
 *       ["bob-token", bob]
 *     ])
 *   )
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const fromMap = (
  bots: ReadonlyMap<string, Webhook>,
  options?: {
    readonly extractKey?: (url: string) => Option.Option<string>
  }
): Multibot =>
  make({
    resolve: (key) => Effect.succeed(Option.fromNullishOr(bots.get(key))),
    ...(options?.extractKey === undefined ? {} : { extractKey: options.extractKey })
  })
