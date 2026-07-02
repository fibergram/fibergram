/**
 * Express adapter for {@link module:Webhook.Webhook} (design section 7.1). A thin
 * bridge - it only rebuilds a web-standard `Request` from the express `req` and
 * writes the returned `Response`'s status back onto `res`; all validation and
 * decoding stay in `Webhook.handle`. `express` is an optional peer dependency and
 * is imported for types only, so this module adds nothing to your runtime unless
 * you already use express.
 *
 * @since 0.1.0
 */
import type { Webhook } from "./Webhook.js"
import type { RequestHandler } from "express"

// express hands the body in whatever shape its parser produced: an object
// (`express.json()`), a Buffer (`express.raw()`), a string, or nothing. `handle`
// re-parses via `Schema.fromJsonString`, so normalise everything back to a raw
// JSON string here.
const bodyToString = (body: unknown): string =>
  typeof body === "string"
    ? body
    : body instanceof Uint8Array
      ? new TextDecoder().decode(body)
      : body == null
        ? ""
        : JSON.stringify(body)

const toWebRequest = (
  url: string,
  nodeHeaders: Record<string, string | ReadonlyArray<string> | undefined>,
  body: unknown
): Request => {
  const headers = new Headers()
  for (const [key, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const one of value) headers.append(key, one)
    } else if (value != null) {
      headers.set(key, value as string)
    }
  }
  return new Request(`http://localhost${url}`, {
    method: "POST",
    headers,
    body: bodyToString(body)
  })
}

/**
 * Builds an express `RequestHandler` that feeds each incoming webhook into
 * `webhook.handle` and answers with the status it returns (200 accepted, 401
 * spoofed token, 500 durable-persist failure). Mount it on a POST route; any
 * body parser works (`express.json()` and `express.raw()` are both handled).
 *
 * @example
 * import { Express, Webhook } from "@fibergram/webhook"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const webhook = yield* Webhook.make({ secretToken: "s3cret" })
 *   const handler = Express.middleware(webhook)
 *   // With express:
 *   //   app.post("/webhook", express.json(), handler)
 *   return handler
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const middleware = (webhook: Webhook): RequestHandler => (req, res, next) => {
  const request = toWebRequest(req.originalUrl ?? req.url ?? "/", req.headers, req.body)
  webhook
    .handle(request)
    .then((response) => {
      res.status(response.status).end()
    })
    .catch(next)
}
