import { it } from "@effect/vitest"
import { Duration, Effect } from "effect"
import { TestClock } from "effect/testing"
import { describe, expect } from "vitest"

import { WebApp } from "../src/client/index.js"

const TOKEN = "123456:TEST-token"

// Build a signed `initData` string exactly the way Telegram's client does, so
// `WebApp.validate` has a genuine HMAC to check (no mocking of the crypto seam).
const sign = async (fields: Record<string, string>, token: string): Promise<string> => {
  const encoder = new TextEncoder()
  const hmac = async (key: Uint8Array, message: Uint8Array): Promise<Uint8Array> => {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key as unknown as ArrayBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, message))
  }
  const dataCheckString = Object.keys(fields)
    .sort()
    .map((key) => `${key}=${fields[key]}`)
    .join("\n")
  const secretKey = await hmac(encoder.encode("WebAppData"), encoder.encode(token))
  const mac = await hmac(secretKey, encoder.encode(dataCheckString))
  const hash = [...mac].map((b) => b.toString(16).padStart(2, "0")).join("")
  return new URLSearchParams({ ...fields, hash }).toString()
}

const user = JSON.stringify({ id: 42, first_name: "Alice", is_bot: false, language_code: "en" })

describe("WebApp.validate", () => {
  it.effect("accepts and decodes a genuinely-signed initData", () =>
    Effect.gen(function* () {
      const initData = yield* Effect.promise(() =>
        sign({ auth_date: "1700000000", query_id: "AAABBB", user }, TOKEN))

      const data = yield* WebApp.validate(initData, TOKEN)
      expect(data.user?.id).toBe(42)
      expect(data.user?.firstName).toBe("Alice")
      expect(data.queryId).toBe("AAABBB")
      expect(data.authDate).toBe(1_700_000_000)
    }))

  it.effect("rejects a tampered hash", () =>
    Effect.gen(function* () {
      const initData = yield* Effect.promise(() => sign({ auth_date: "1700000000", user }, TOKEN))
      const tampered = initData.replace(/hash=[0-9a-f]+/, "hash=deadbeef")

      const error = yield* Effect.flip(WebApp.validate(tampered, TOKEN))
      expect(error.reason).toBe("hash mismatch")
    }))

  it.effect("rejects data signed with a different token", () =>
    Effect.gen(function* () {
      const initData = yield* Effect.promise(() => sign({ auth_date: "1700000000", user }, "other:token"))

      const error = yield* Effect.flip(WebApp.validate(initData, TOKEN))
      expect(error.reason).toBe("hash mismatch")
    }))

  it.effect("rejects data older than maxAge (against the ambient clock)", () =>
    Effect.gen(function* () {
      const initData = yield* Effect.promise(() => sign({ auth_date: "1", user }, TOKEN))
      // TestClock starts at epoch 0; move to 10s so the auth_date (1s) is 9s stale.
      yield* TestClock.adjust("10 seconds")

      const error = yield* Effect.flip(
        WebApp.validate(initData, TOKEN, { maxAge: Duration.seconds(5) })
      )
      expect(error.reason).toBe("expired")
    }))
})
