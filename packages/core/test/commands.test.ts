import { it } from "@effect/vitest"
import { Effect, Ref, Schema, Stream } from "effect"
import { describe, expect } from "vitest"

import * as TestTelegram from "./TestTelegram.js"
import { Chat, Command, Dedup, DialogStore, Dispatcher, Router } from "../src/index.js"

import type { BotApi } from "../src/client/index.js"

const help = Command.make("/help", { description: "Show help" })
const start = Command.make("/start", { description: "Start the bot" })
const secret = Command.make("/secret") // no description -> opted out of the menu
const ban = Command.make("/ban", Schema.Struct({ user: Schema.String }), { description: "Ban a user" })

const adminScope: BotApi.BotCommandScope = { type: "all_chat_administrators" }

describe("Router command sync", () => {
  it("collects default-scope commands, skipping ones without a description", () => {
    const router = Router.make(
      Router.command(help, () => Chat.reply("help")),
      Router.command(secret, () => Chat.reply("secret")),
      Router.command(ban, ({ user }) => Chat.reply(`banned ${user}`))
    )
    expect(Router.commands(router)).toEqual([
      { command: "help", description: "Show help" },
      { command: "ban", description: "Ban a user" }
    ])
  })

  it("groups commands by scope and language", () => {
    const router = Router.make(
      Router.command(help, () => Chat.reply("help")),
      Router.command(ban, () => Chat.reply("ban"), { scope: adminScope }),
      Router.command(start, () => Chat.reply("start"), { languageCode: "ru", description: "Начать" })
    )
    const groups = Router.commandGroups(router)
    expect(groups.length).toBe(3)
    // default scope carries only /help
    expect(groups.find((g) => g.scope === undefined && g.languageCode === undefined)?.commands)
      .toEqual([{ command: "help", description: "Show help" }])
    // admin scope carries /ban
    expect(groups.find((g) => g.scope?.type === "all_chat_administrators")?.commands)
      .toEqual([{ command: "ban", description: "Ban a user" }])
    // ru language carries the localized /start
    expect(groups.find((g) => g.languageCode === "ru")?.commands)
      .toEqual([{ command: "start", description: "Начать" }])
  })

  it.effect("setMyCommands issues one call per scope/language group", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      const router = Router.make(
        Router.command(help, () => Chat.reply("help")),
        Router.command(ban, () => Chat.reply("ban"), { scope: adminScope })
      )

      yield* Router.setMyCommands(router).pipe(Effect.provide(tg.layer))

      const calls = yield* Ref.get(tg.myCommands)
      expect(calls.length).toBe(2)
      const defaultCall = calls.find((c) => c.scope === undefined)
      const adminCall = calls.find((c) => c.scope?.type === "all_chat_administrators")
      expect(defaultCall?.commands).toEqual([{ command: "help", description: "Show help" }])
      expect(adminCall?.commands).toEqual([{ command: "ban", description: "Ban a user" }])
    }))
})

describe("Router.commandNotFound", () => {
  const known = Router.make(
    Router.command(help, () => Effect.asVoid(Chat.reply("help"))),
    Router.command(start, () => Effect.asVoid(Chat.reply("start")))
  )

  const router = known.pipe(
    Router.add(Router.commandNotFound(known, ({ command, suggestions }) =>
      Effect.asVoid(
        Chat.reply(
          suggestions.length > 0
            ? `unknown /${command}, did you mean /${suggestions[0]}?`
            : `unknown /${command}`
        )
      )))
  )

  it.effect("suggests the closest known command for an unknown one", () =>
    Effect.gen(function* () {
      const tg = yield* TestTelegram.make
      yield* Dispatcher.run({
        updates: Stream.fromIterable([
          TestTelegram.textUpdate(1, 100, "/halp"),
          TestTelegram.textUpdate(2, 100, "/help")
        ]),
        dialog: Router.toDialog(router)
      }).pipe(
        Effect.scoped,
        Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer])
      )

      // /halp -> fuzzy suggestion; /help -> its own route, not the fallback
      expect((yield* Ref.get(tg.sent)).map((s) => s.text))
        .toEqual(["unknown /halp, did you mean /help?", "help"])
    }))
})
