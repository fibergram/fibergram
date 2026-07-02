import { TestTelegram } from '../../src'
import { Chat } from "@fibergram/core"
import { UpdateContext } from "@fibergram/core"
import { Effect, Option, Ref } from "effect"

const program = Effect.gen(function* () {
  const tg = yield* TestTelegram.make
  const lastSent = yield* Ref.make(Option.none<number>())
  const env = {
    chatId: 1,
    threadId: Option.none(),
    fromId: Option.none(),
    update: { updateId: 1 },
    lastSent
  }
  yield* Chat.reply("hello").pipe(UpdateContext.provide(env), Effect.provide(tg.layer))
  return yield* tg.sent
})
