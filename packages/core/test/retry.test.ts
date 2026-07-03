import { it } from "@effect/vitest"
import { Duration, Effect, Fiber, Ref } from "effect"
import { TestClock } from "effect/testing"
import { describe, expect } from "vitest"

import { TelegramError } from "../src/client/index.js"
import { Retry } from "../src/index.js"

describe("retryRateLimited (honour retry_after)", () => {
  it.effect("waits exactly retry_after, retries, then succeeds", () =>
    Effect.gen(function* () {
      const attempts = yield* Ref.make(0)
      const flaky = Ref.updateAndGet(attempts, (n) => n + 1).pipe(
        Effect.flatMap((n) =>
          n <= 2
            ? Effect.fail(
              new TelegramError.RateLimited({
                method: "sendMessage",
                retryAfter: Duration.seconds(2)
              })
            )
            : Effect.succeed("ok" as const))
      )

      const fiber = yield* Effect.forkChild(Retry.retryRateLimited(flaky, { maxAttempts: 5 }))
      // Two rate limits -> two 2s virtual sleeps to step through.
      yield* TestClock.adjust(Duration.seconds(2))
      yield* TestClock.adjust(Duration.seconds(2))

      const result = yield* Fiber.join(fiber)
      expect(result).toBe("ok")
      expect(yield* Ref.get(attempts)).toBe(3)
    }))

  it.effect("gives up after maxAttempts, surfacing the last RateLimited", () =>
    Effect.gen(function* () {
      const attempts = yield* Ref.make(0)
      const alwaysLimited = Ref.update(attempts, (n) => n + 1).pipe(
        Effect.andThen(
          Effect.fail(
            new TelegramError.RateLimited({
              method: "sendMessage",
              retryAfter: Duration.seconds(1)
            })
          )
        )
      )

      const fiber = yield* Effect.forkChild(
        Effect.exit(Retry.retryRateLimited(alwaysLimited, { maxAttempts: 3 }))
      )
      yield* TestClock.adjust(Duration.seconds(1))
      yield* TestClock.adjust(Duration.seconds(1))

      const exit = yield* Fiber.join(fiber)
      expect(exit._tag).toBe("Failure")
      expect(yield* Ref.get(attempts)).toBe(3)
    }))

  it.effect("does not retry a non-rate-limit error", () =>
    Effect.gen(function* () {
      const attempts = yield* Ref.make(0)
      const badRequest = Ref.update(attempts, (n) => n + 1).pipe(
        Effect.andThen(
          Effect.fail(
            new TelegramError.BadRequest({
              method: "sendMessage",
              description: "chat not found",
              errorCode: 400
            })
          )
        )
      )

      const exit = yield* Effect.exit(Retry.retryRateLimited(badRequest))
      expect(exit._tag).toBe("Failure")
      expect(yield* Ref.get(attempts)).toBe(1)
    }))
})
