import { it } from "@effect/vitest"
import { Effect, Exit, Stream } from "effect"
import { describe, expect } from "vitest"

import * as TestTelegram from "./TestTelegram.js"
import { Dedup, Dialog, DialogStore, Dispatcher, Session } from "../src/index.js"

import type { BotApi } from "../src/client/index.js"

const textFrom = (
  updateId: number,
  chatId: number,
  fromId: number,
  text: string
): BotApi.Update => ({
  updateId,
  message: {
    messageId: updateId,
    date: 0,
    chat: { id: chatId, type: "private" },
    from: { id: fromId, isBot: false, firstName: "Tester" },
    text
  }
})

const dispatch = <S, Ev, E, R>(
  dialog: Dialog.Dialog<S, Ev, E, R>,
  updates: ReadonlyArray<BotApi.Update>
) =>
  Dispatcher.run({ updates: Stream.fromIterable(updates), dialog }).pipe(Effect.scoped)

describe("Session", () => {
  it.effect("get returns initial when nothing is stored", () =>
    Effect.gen(function* () {
      const counter = Session.make("counter", { initial: 0 })
      const seen: Array<number> = []
      const dialog = Dialog.stateless({
        onUpdate: () =>
          Effect.map(counter.get, (n) => {
            seen.push(n)
          })
      })
      yield* dispatch(dialog, [TestTelegram.textUpdate(1, 555, "hi")])

      expect(seen).toEqual([0])
    }).pipe(Effect.provide([DialogStore.layerMemory, Dedup.layerMemory])))

  it.effect("update persists across updates in the same chat", () =>
    Effect.gen(function* () {
      const counter = Session.make("counter", { initial: 0 })
      const seen: Array<number> = []
      const dialog = Dialog.stateless({
        onUpdate: () =>
          Effect.map(counter.update((n) => n + 1), (n) => {
            seen.push(n)
          })
      })
      yield* dispatch(dialog, [
        TestTelegram.textUpdate(1, 555, "one"),
        TestTelegram.textUpdate(2, 555, "two")
      ])

      expect(seen).toEqual([1, 2])
    }).pipe(Effect.provide([DialogStore.layerMemory, Dedup.layerMemory])))

  it.effect("chat scope isolates chats from each other", () =>
    Effect.gen(function* () {
      const counter = Session.make("counter", { initial: 0 })
      const dialog = Dialog.stateless({
        onUpdate: () => Effect.asVoid(counter.update((n) => n + 1))
      })
      yield* dispatch(dialog, [
        TestTelegram.textUpdate(1, 100, "a"),
        TestTelegram.textUpdate(2, 200, "b"),
        TestTelegram.textUpdate(3, 100, "c")
      ])

      expect(yield* counter.getAt({ chatId: 100 })).toBe(2)
      expect(yield* counter.getAt({ chatId: 200 })).toBe(1)
    }).pipe(Effect.provide([DialogStore.layerMemory, Dedup.layerMemory])))

  it.effect("chat scope shares one slot between senders in the same chat", () =>
    Effect.gen(function* () {
      const counter = Session.make("counter", { initial: 0 })
      const dialog = Dialog.stateless({
        onUpdate: () => Effect.asVoid(counter.update((n) => n + 1))
      })
      yield* dispatch(dialog, [
        textFrom(1, 100, 7, "a"),
        textFrom(2, 100, 8, "b")
      ])

      expect(yield* counter.getAt({ chatId: 100 })).toBe(2)
    }).pipe(Effect.provide([DialogStore.layerMemory, Dedup.layerMemory])))

  it.effect("user scope gives each sender in a chat an independent slot", () =>
    Effect.gen(function* () {
      const counter = Session.make("counter", { initial: 0, scope: "user" })
      const dialog = Dialog.stateless({
        onUpdate: () => Effect.asVoid(counter.update((n) => n + 1))
      })
      yield* dispatch(dialog, [
        textFrom(1, 100, 7, "a"),
        textFrom(2, 100, 8, "b"),
        textFrom(3, 100, 7, "c")
      ])

      expect(yield* counter.getAt({ chatId: 100, fromId: 7 })).toBe(2)
      expect(yield* counter.getAt({ chatId: 100, fromId: 8 })).toBe(1)
    }).pipe(Effect.provide([DialogStore.layerMemory, Dedup.layerMemory])))

  it.effect("set overwrites the stored value", () =>
    Effect.gen(function* () {
      const greeting = Session.make("greeting", { initial: "hello" })
      const dialog = Dialog.stateless({
        onUpdate: (u) =>
          u.message?.text !== undefined ? greeting.set(u.message.text) : Effect.void
      })
      yield* dispatch(dialog, [TestTelegram.textUpdate(1, 555, "privet")])

      expect(yield* greeting.getAt({ chatId: 555 })).toBe("privet")
    }).pipe(Effect.provide([DialogStore.layerMemory, Dedup.layerMemory])))

  it.effect("At variants address the same slot as the ambient accessors", () =>
    Effect.gen(function* () {
      const counter = Session.make("counter", { initial: 0 })
      yield* counter.setAt({ chatId: 555 }, 41)
      const seen: Array<number> = []
      const dialog = Dialog.stateless({
        onUpdate: () =>
          Effect.map(counter.update((n) => n + 1), (n) => {
            seen.push(n)
          })
      })
      yield* dispatch(dialog, [TestTelegram.textUpdate(1, 555, "hi")])

      expect(seen).toEqual([42])
      expect(yield* counter.updateAt({ chatId: 555 }, (n) => n + 8)).toBe(50)
    }).pipe(Effect.provide([DialogStore.layerMemory, Dedup.layerMemory])))

  it.effect("sessions with different names never see each other's state", () =>
    Effect.gen(function* () {
      const a = Session.make("a", { initial: 0 })
      const b = Session.make("b", { initial: 100 })
      yield* a.setAt({ chatId: 1 }, 5)

      expect(yield* b.getAt({ chatId: 1 })).toBe(100)
    }).pipe(Effect.provide([DialogStore.layerMemory, Dedup.layerMemory])))

  it.effect("session state does not collide with dialog state at the same address", () =>
    Effect.gen(function* () {
      const store = yield* DialogStore.DialogStore
      // A dialog folded at the default address of chat 555.
      yield* store.save("default:555::", { step: "asking" })
      const counter = Session.make("default", { initial: 0 })

      expect(yield* counter.getAt({ chatId: 555 })).toBe(0)
    }).pipe(Effect.provide([DialogStore.layerMemory, Dedup.layerMemory])))

  it.effect("user scope dies when the update carries no sender", () =>
    Effect.gen(function* () {
      const counter = Session.make("counter", { initial: 0, scope: "user" })
      const exit = yield* Effect.exit(counter.getAt({ chatId: 555 }))

      expect(Exit.isFailure(exit)).toBe(true)
    }).pipe(Effect.provide([DialogStore.layerMemory, Dedup.layerMemory])))
})
