import { TestTelegram } from '../../src'
import { TelegramClient } from "@fibergram/client"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const tg = yield* TestTelegram.makeWith({
    respond: (method) =>
      method === "getMe"
        ? { id: 42, isBot: true, firstName: "TestBot" }
        : undefined
  })
  yield* Effect.gen(function* () {
    const client = yield* TelegramClient.TelegramClient
    yield* client.sendMessage({ chatId: 1, text: "hi" })
  }).pipe(Effect.provide(tg.layer))
  return yield* tg.sent
})
