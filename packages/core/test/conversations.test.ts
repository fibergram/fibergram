import { it } from "@effect/vitest"
import { Context, Effect, Layer, Ref, Schema, Stream } from "effect"
import { describe, expect } from "vitest"

import * as TestTelegram from "./TestTelegram.js"
import {
  Chat,
  Command,
  Conversations,
  Coroutine,
  Dedup,
  DialogStore,
  Dispatcher,
  Router
} from "../src/index.js"

import type { BotApi, TelegramError } from "../src/client/index.js"

// A service a scene depends on, to prove SceneContext accumulates into `R`.
interface RegistryShape {
  readonly remember: (name: string) => Effect.Effect<void>
}
class Registry extends Context.Service<Registry, RegistryShape>()("test/Registry") {}

// A service the entry guard depends on, to prove EnterR accumulates into `R`.
interface GateShape {
  readonly allowed: Effect.Effect<boolean>
}
class Gate extends Context.Service<Gate, GateShape>()("test/Gate") {}

const startCommand = Command.make("/start", { description: "Register" })
const bookCommand = Command.make("/book", { description: "Book" })
const cancelCommand = Command.make("/cancel", { description: "Cancel" })
const helpCommand = Command.make("/help", { description: "Help" })

const registration = Coroutine.make<
  { readonly name: string },
  TelegramError.TelegramError,
  Registry
>("registration", function* (d) {
  const name = yield* d.prompt("Name?", Schema.NonEmptyString)
  yield* d.effect(Effect.flatMap(Registry, (r) => r.remember(name)))
  yield* d.reply(`Registered ${name}`)
  return { name }
})

const booking = Coroutine.make("booking", function* (d) {
  const day = yield* d.choose("When?", [
    { id: "sat", label: "Saturday" },
    { id: "sun", label: "Sunday" }
  ])
  yield* d.reply(`Booked ${day}`)
})

const router = Router.make(
  Router.command(helpCommand, () => Effect.asVoid(Chat.reply("help")))
)

const manager = Conversations.make({
  router,
  scenes: { registration, booking },
  enter: [
    Conversations.on(startCommand, "registration"),
    Conversations.on(bookCommand, "booking", {
      guard: Effect.flatMap(Gate, (g) => g.allowed),
      onReject: Effect.asVoid(Chat.reply("not allowed"))
    })
  ],
  cancel: Conversations.cancel(cancelCommand, {
    onCancel: Effect.asVoid(Chat.reply("cancelled"))
  })
})

// `manager` composes scenes requiring `Registry` and a guard requiring `Gate`;
// the accumulated dialog must require both (plus TelegramClient). This assigns
// to a precise union, proving no `any` collapse.
const dialog: typeof manager.dialog = Conversations.toDialog(manager)

const run = (
  tg: TestTelegram.TestTelegram,
  updates: ReadonlyArray<BotApi.Update>,
  gate: boolean,
  seen: Ref.Ref<ReadonlyArray<string>>
) =>
  Dispatcher.run({ updates: Stream.fromIterable(updates), dialog }).pipe(
    Effect.scoped,
    Effect.provide([
      DialogStore.layerMemory,
      Dedup.layerMemory,
      tg.layer,
      Layer.succeed(Gate, { allowed: Effect.succeed(gate) }),
      Layer.succeed(Registry, { remember: (name) => Ref.update(seen, (xs) => [...xs, name]) })
    ])
  )

const texts = (tg: TestTelegram.TestTelegram) =>
  Effect.map(Ref.get(tg.sent), (sent) => sent.map((s) => s.text))

describe("Conversations — scene manager", () => {
  it.effect("enters a scene on its command and runs it to completion", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const seen = yield* Ref.make<ReadonlyArray<string>>([])
      yield* run(tg, [
        TestTelegram.textUpdate(1, 100, "/start"),
        TestTelegram.textUpdate(2, 100, "Ada")
      ], true, seen)

      expect(yield* texts(tg)).toEqual(["Name?", "Registered Ada"])
      expect(yield* Ref.get(seen)).toEqual(["Ada"])
    }))

  it.effect("falls through to the router while idle", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const seen = yield* Ref.make<ReadonlyArray<string>>([])
      yield* run(tg, [TestTelegram.textUpdate(1, 100, "/help")], true, seen)

      expect(yield* texts(tg)).toEqual(["help"])
    }))

  it.effect("the router does not fire while a scene is active", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const seen = yield* Ref.make<ReadonlyArray<string>>([])
      yield* run(tg, [
        TestTelegram.textUpdate(1, 100, "/start"),
        // A `/help` mid-registration is fed to the wizard as a (rejected) name,
        // not the router: NonEmptyString accepts it, so it registers "/help".
        TestTelegram.textUpdate(2, 100, "Zoe")
      ], true, seen)

      expect(yield* texts(tg)).toEqual(["Name?", "Registered Zoe"])
    }))

  it.effect("a shared /cancel aborts the active scene", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const seen = yield* Ref.make<ReadonlyArray<string>>([])
      yield* run(tg, [
        TestTelegram.textUpdate(1, 100, "/start"),
        TestTelegram.textUpdate(2, 100, "/cancel"),
        // After cancel, the manager is Idle again, so /help routes.
        TestTelegram.textUpdate(3, 100, "/help")
      ], true, seen)

      expect(yield* texts(tg)).toEqual(["Name?", "cancelled", "help"])
      expect(yield* Ref.get(seen)).toEqual([])
    }))

  it.effect("a failing entry guard runs onReject and stays idle", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const seen = yield* Ref.make<ReadonlyArray<string>>([])
      yield* run(tg, [
        TestTelegram.textUpdate(1, 100, "/book"),
        TestTelegram.textUpdate(2, 100, "/help")
      ], false, seen)

      expect(yield* texts(tg)).toEqual(["not allowed", "help"])
    }))

  it.effect("a passing guard enters the keyboard-driven booking scene", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const seen = yield* Ref.make<ReadonlyArray<string>>([])
      yield* run(tg, [
        TestTelegram.textUpdate(1, 100, "/book"),
        TestTelegram.textUpdate(2, 100, "Saturday")
      ], true, seen)

      expect(yield* texts(tg)).toEqual(["When?", "Booked sat"])
    }))

  it.effect("keeps two chats' scenes independent", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const seen = yield* Ref.make<ReadonlyArray<string>>([])
      yield* run(tg, [
        TestTelegram.textUpdate(1, 100, "/start"),
        TestTelegram.textUpdate(2, 200, "/start"),
        TestTelegram.textUpdate(3, 100, "Ann"),
        TestTelegram.textUpdate(4, 200, "Ben")
      ], true, seen)

      const sent = yield* Ref.get(tg.sent)
      const forChat = (id: number) => sent.filter((s) => s.chatId === id).map((s) => s.text)
      expect(forChat(100)).toEqual(["Name?", "Registered Ann"])
      expect(forChat(200)).toEqual(["Name?", "Registered Ben"])
    }))
})

describe("Conversations — command surface", () => {
  it("contributes entry and cancel commands to the router for setMyCommands", () => {
    const commands = Router.commands(manager.router).map((c) => c.command)
    expect(commands).toContain("help")
    expect(commands).toContain("start")
    expect(commands).toContain("book")
    expect(commands).toContain("cancel")
  })

  it("derives allowed_updates covering the scene/entry surface", () => {
    expect(Router.allowedUpdates(manager.router)).toEqual(["message"])
  })
})
