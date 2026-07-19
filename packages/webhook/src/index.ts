/**
 * `@fibergram/webhook` - webhook ingestion as a second producer into the shared
 * `Queue<Update>`. A framework-agnostic `handle(Request) => Promise<Response>`
 * with secret-token validation and fast-ack.
 *
 * @since 0.1.0
 */

/**
 * The `Webhook` transport: `Webhook.make`, the `Webhook` handle/stream pair and
 * its options.
 *
 * @since 0.1.0
 */
export * as Webhook from "./Webhook.js"

/**
 * Multi-bot webhook fan-out (`Multibot.make`/`Multibot.fromMap`): one HTTP
 * endpoint routing to many per-bot `Webhook`s by a token in the request path -
 * the analog of grammY's `TokenBasedRequestHandler`.
 *
 * @since 0.1.0
 */
export * as Multibot from "./Multibot.js"

/**
 * Express adapter (`@fibergram/webhook/express`): `Express.middleware` bridging an
 * express `RequestHandler` to `Webhook.handle`.
 *
 * @since 0.1.0
 */
export * as Express from "./Express.js"

/**
 * Fastify adapter (`@fibergram/webhook/fastify`): `Fastify.handler` bridging a
 * fastify route handler to `Webhook.handle`.
 *
 * @since 0.1.0
 */
export * as Fastify from "./Fastify.js"
