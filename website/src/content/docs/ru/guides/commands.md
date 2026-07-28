---
title: Команды
description: Объявление команд с типизированными аргументами, синхронизация меню Telegram и обработка опечаток.
sidebar:
  order: 1
---

## Объявить команду

```ts
import { Command } from "@fibergram/core"
import { Schema } from "effect"

const help = Command.make("/help", { description: "Показать список команд" })

const setAge = Command.make("/setage", Schema.Struct({ age: Schema.NumberFromString }), {
  description: "Указать возраст"
})
```

Ведущий слеш необязателен. Токены аргументов раскладываются на поля схемы
**позиционно**, а `/setage@yourbot 30` в группах работает без дополнительной
обработки.

Монтируем:

```ts
import { Chat, Router } from "@fibergram/core"

const router = Router.make(
  Router.command(help, () => Chat.reply("…")),
  Router.command(setAge, ({ age }) => Chat.reply(`Вам ${age}`))
)
```

Внутри хендлера `age` — это `number`. `/setage банан` до него не доходит: роут
просто не совпадает, поэтому ошибка декода не утекает в `E`.

## Синхронизировать меню Telegram

Описания, которые вы уже написали, и есть меню:

```ts
yield * Router.setMyCommands(router)
```

Вызовите однократно при старте. Второго списка вести не нужно, а команда без
`description` намеренно не попадает в меню — так админские команды остаются вне
публичного списка.

`Router.commands` и `Router.commandGroups` отдают те же метаданные, если `/help`
вы хотите рисовать сами, а не зашивать текст.

## Обработать неизвестную команду

```ts
const known = Router.make(
  Router.command(help, () => Chat.reply("…")),
  Router.command(setAge, ({ age }) => Chat.reply(`Вам ${age}`))
)

const router = known.pipe(
  Router.add(
    Router.commandNotFound(known, ({ command, suggestions }) =>
      Chat.reply(
        suggestions.length > 0
          ? `Неизвестная команда /${command}. Может быть, /${suggestions[0]}?`
          : `Неизвестная команда /${command}.`
      )
    )
  )
)
```

`commandNotFound` принимает роутер (или явный список имён), который считается
«известным», и вычисляет по нему нечёткие подсказки. Ставьте его **последним** —
роуты перебираются по порядку. *Известная* команда с плохими аргументами сюда не
попадает: её обрабатывает собственный роут `command`.

## Ограничить доступ к команде

Фильтры композируются перед хендлером, поэтому авторизация — не middleware:

```ts
import { Filter, Router } from "@fibergram/core"

const adminOnly = Router.when(Filter.fromUsers([1, 2, 3]), () => Chat.reply("админ"))
```

Либо проверяйте внутри хендлера, где отказ типизирован:

```ts
Router.command(ban, ({ userId }) =>
  Effect.gen(function* () {
    const admins = yield* AdminList
    const from = yield* Chat.from
    if (!admins.has(from?.id)) return yield* Chat.reply("Недостаточно прав")
    yield* doBan(userId)
  })
)
```

## Войти в визард из команды

Команды, запускающие многошаговый поток, — это правила входа, а не хендлеры:

```ts
const manager = Conversations.make({
  router,
  scenes: { registration },
  enter: [Conversations.on(start, "registration")],
  cancel: Conversations.cancel(Command.make("/cancel", { description: "Прервать" }))
})
```

Команды входа и отмены возвращаются в `manager.router`, поэтому `setMyCommands` и
`allowedUpdates` их видят. См. [Разговоры](/ru/guides/conversations/).

## Диплинки

`/start` с payload — отдельная история: реферальные коды, приглашения, «открой
этот элемент». См. [Диплинки](/ru/guides/deep-linking/).
