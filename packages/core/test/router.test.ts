import { TelegramClient, TelegramError } from "@fibergram/client"
import {
  CallbackData,
  Chat,
  Command,
  Dedup,
  DialogStore,
  Dispatcher,
  Router
} from "@fibergram/core"
import { it } from "@effect/vitest"
import { Context, Effect, Layer, Option, Ref, Schema, Stream } from "effect"
import { describe, expect } from "vitest"
import * as TestTelegram from "./TestTelegram.js"

// --- A second, non-Telegram requirement, to prove heterogeneous R accumulates.
class UserRepo extends Context.Service<UserRepo, {
  readonly nameOf: (id: number) => Effect.Effect<string>
}>()("test/UserRepo") {}

const userRepoLayer = Layer.succeed(UserRepo, {
  nameOf: (id) => Effect.succeed(`user-${id}`)
})

// --- Declarative Schema declarations (the "HttpApi-style" sugar inputs). -----
const greet = Command.make("/greet")
const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number }))

// --- One bot from N routes with *different* R (design §11.3). ----------------
//  - command route requires UserRepo + TelegramClient
//  - callback route requires TelegramClient
//  - fallback route requires TelegramClient
const router = Router.make(
  Router.command(greet, () =>
    Effect.gen(function* () {
      const repo = yield* UserRepo
      const from = yield* Chat.from
      const id = Option.match(from, { onNone: () => 0, onSome: (u) => u.id })
      yield* Chat.reply(`hi ${yield* repo.nameOf(id)}`)
    })),
  Router.callback(Vote, ({ id }) => Effect.asVoid(Chat.answerCallback({ text: `voted ${id}` }))),
  Router.when(
    (u) => u.message?.text !== undefined,
    () => Effect.asVoid(Chat.reply("?"))
  )
)

// --- §11.3 proof, at the type level: R/E accumulate *exactly*, no `any`. -----
type CtxOf<T> = T extends Router.Router<infer _E, infer R> ? R : never
type ErrOf<T> = T extends Router.Router<infer E, infer _R> ? E : never

// `any` swallows both directions of assignability; this catches it explicitly.
type IsAny<T> = 0 extends 1 & T ? true : false
type Assert<T extends true> = T
// Mutual assignability == exact type equality.
type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

type ExpectedCtx = TelegramClient.TelegramClient | UserRepo
type ExpectedErr =
  | Command.CommandArgsError
  | CallbackData.CallbackDataMalformed
  | TelegramError.TelegramError

// These fail to compile if R/E are wider, narrower, or `any`.
type _ctxNotAny = Assert<IsAny<CtxOf<typeof router>> extends false ? true : false>
type _ctxExact = Assert<Equals<CtxOf<typeof router>, ExpectedCtx>>
type _errNotAny = Assert<IsAny<ErrOf<typeof router>> extends false ? true : false>
type _errExact = Assert<Equals<ErrOf<typeof router>, ExpectedErr>>

// Silence "unused type" without weakening the assertions.
export type _Proof = [_ctxNotAny, _ctxExact, _errNotAny, _errExact]

describe("Router (§11.1 handler-style + declarative sugar, §11.3 R accumulation)", () => {
  it.effect("routes command, callback and fallback from one router, one Layer at the edge", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make

      // The whole bot's R = TelegramClient | UserRepo, satisfied by ONE provide.
      yield* Dispatcher.run({
        updates: Stream.fromIterable([
          TestTelegram.textUpdate(1, 100, "/greet"),
          TestTelegram.callbackUpdate(2, 100, 7, "vote:{\"id\":42}"),
          TestTelegram.textUpdate(3, 100, "chatter")
        ]),
        dialog: Router.toDialog(router)
      }).pipe(
        Effect.scoped,
        Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer, userRepoLayer])
      )

      const sent = yield* Ref.get(tg.sent)
      const answered = yield* Ref.get(tg.answered)
      // command → greeting; fallback → "?"
      expect(sent.map((s) => s.text)).toEqual(["hi user-0", "?"])
      // callback → answered toast
      expect(answered.map((a) => a.text)).toEqual(["voted 42"])
    }))

  it.effect("first matching route wins; unmatched updates are ignored without a fallback", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const onlyGreet = Router.make(
        Router.command(greet, () => Effect.asVoid(Chat.reply("hi")))
      )

      yield* Dispatcher.run({
        updates: Stream.fromIterable([
          TestTelegram.textUpdate(1, 100, "/greet"),
          // no route matches this; nothing is sent, nothing crashes
          TestTelegram.textUpdate(2, 100, "unmatched")
        ]),
        dialog: Router.toDialog(onlyGreet)
      }).pipe(
        Effect.scoped,
        Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer])
      )

      expect((yield* Ref.get(tg.sent)).map((s) => s.text)).toEqual(["hi"])
    }))

  it.effect("concat unions two sub-routers' routes and requirements", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const help = Router.make(
        Router.when((u) => u.message?.text === "/help", () => Effect.asVoid(Chat.reply("help")))
      )
      const admin = Router.make(
        Router.when((u) => u.message?.text === "/ban", () => Effect.asVoid(Chat.reply("banned")))
      )
      const combined = help.pipe(Router.concat(admin))

      yield* Dispatcher.run({
        updates: Stream.fromIterable([
          TestTelegram.textUpdate(1, 100, "/help"),
          TestTelegram.textUpdate(2, 100, "/ban")
        ]),
        dialog: Router.toDialog(combined)
      }).pipe(
        Effect.scoped,
        Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer])
      )

      expect((yield* Ref.get(tg.sent)).map((s) => s.text)).toEqual(["help", "banned"])
    }))
})
