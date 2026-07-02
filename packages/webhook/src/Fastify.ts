/**
 * Fastify adapter for {@link module:Webhook.Webhook} (design section 7.1). A thin
 * bridge - it rebuilds a web-standard `Request` from the fastify request and
 * replies with the status `Webhook.handle` returns; all validation and decoding
 * stay in the core. `fastify` is an optional peer dependency imported for types
 * only, so this module adds nothing to your runtime unless you already use it.
 *
 * @since 0.1.0
 */
import type { Webhook } from "./Webhook.js"
import type { RouteHandlerMethod } from "fastify"

// fastify's default JSON parser hands `body` as an object; `handle` re-parses via
// `Schema.fromJsonString`, so normalise back to a raw JSON string.
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
 * Builds a fastify route handler that feeds each incoming webhook into
 * `webhook.handle` and replies with the status it returns (200 accepted, 401
 * spoofed token, 500 durable-persist failure). Register it on a POST route.
 *
 * @example
 * import { Fastify, Webhook } from "@fibergram/webhook"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const webhook = yield* Webhook.make({ secretToken: "s3cret" })
 *   const handler = Fastify.handler(webhook)
 *   // With fastify:
 *   //   app.post("/webhook", handler)
 *   return handler
 * })
 *
 * @category constructors
 * @since 0.1.0
 */
export const handler = (webhook: Webhook): RouteHandlerMethod => async (req, reply) => {
  const request = toWebRequest(req.url, req.headers, req.body)
  const response = await webhook.handle(request)
  await reply.code(response.status).send()
}
