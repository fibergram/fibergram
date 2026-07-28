---
title: Первый бот
description: От эхо-бота до роутинга и визарда за четыре шага.
sidebar:
  order: 3
---

Пойдём по нарастающей: эхо → команды → кнопки → визард. Каждый шаг — законченная
работающая программа.

## 1. Эхо

```ts
import { Chat, Dedup, Dialog, DialogStore, Dispatcher } from "@fibergram/core"
import { TelegramClient } from "@fibergram/core/client"
import { Polling } from "@fibergram/core/polling"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

const echo = Dialog.stateless({
  onUpdate: (update) =>
    Effect.gen(function* () {
      const text = update.message?.text
      if (text !== undefined) yield* Chat.reply(text)
    })
})

const program = Effect.gen(function* () {
  const updates = yield* Polling.make()
  yield* Dispatcher.run({ updates, dialog: echo })
}).pipe(
  Effect.scoped,
  Effect.provide([
    DialogStore.layerMemory,
    Dedup.layerMemory,
    TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
  ])
)

Effect.runFork(program)
```

Здесь происходит четыре вещи:

- **`Polling.make()`** форкает фоновый поллер в амбиентный `Scope` и возвращает
  `Stream<Update>`. Цикл никогда не умирает: `retry_after` соблюдается, остальные
  сбои логируются и ретраятся.
- **`Dialog.stateless`** — сахар для «у диалога нет состояния»; полноценный decider
  под ним разбирается в [Диалогах](/ru/concepts/dialogs/).
- **`Chat.reply`** знает, в какой чат отвечать, потому что диспетчер выставил
  амбиентный контекст апдейта перед запуском хендлера. Никакого `ctx` внутрь не
  передавали.
- **`Effect.provide([...])`** — единственная точка проводки. `DialogStore.layerMemory`
  и `Dedup.layerMemory` выбирают режим персистентности «в памяти»; замена их на
  [`@fibergram/durable`](/ru/guides/durable/) — единственное, что нужно, чтобы
  пережить рестарт.

`Effect.scoped` здесь важен: fiber поллинга принадлежит этому скоупу, поэтому
остановка программы останавливает и поллер.

## 2. Команды с типизированными аргументами

Команда — это `Schema` над своими аргументами; разбор и валидация происходят до
запуска хендлера:

```ts
import { Chat, Command, Router } from "@fibergram/core"
import { Schema } from "effect"

const start = Command.make("/start", { description: "Поздороваться" })

const setAge = Command.make("/setage", Schema.Struct({ age: Schema.NumberFromString }), {
  description: "Указать возраст"
})

const router = Router.make(
  Router.command(start, () => Chat.reply("Привет!")),
  Router.command(setAge, ({ age }) => Chat.reply(`Вам ${age}`))
)
```

Внутри хендлера `age` — это `number`. Пользователь, отправивший `/setage банан`,
до него не доберётся.

Роутер превращается в диалог, как и всё остальное:

```ts
import { Dispatcher, Router } from "@fibergram/core"

const program = Effect.gen(function* () {
  const updates = yield* Polling.make()
  yield* Dispatcher.run({ updates, dialog: Router.toDialog(router) })
})
```

Два приятных следствия достаются бесплатно:

```ts
Router.allowedUpdates(router) // набор `allowed_updates`, вытекающий из ваших роутов
Router.setMyCommands(router) // синхронизация меню команд по описаниям
```

Ни один из этих списков не поддерживается вручную — оба вычисляются из реально
смонтированных роутов. См. [Команды](/ru/guides/commands/).

## 3. Кнопки с типизированным payload

Telegram даёт 64 байта `callback_data`. `CallbackData.make` превращает эти байты
в типизированный кодек:

```ts
import { CallbackData, Chat, Router } from "@fibergram/core"
import { InlineKeyboard } from "@fibergram/core/ui"
import { Effect, Schema } from "effect"

const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number }))

const ask = Effect.gen(function* () {
  const keyboard = InlineKeyboard.empty.data("👍", Vote, { id: 1 }).data("👎", Vote, { id: 2 })

  yield* Chat.reply("Голосуем:", { replyMarkup: yield* InlineKeyboard.build(keyboard) })
})

const router = Router.make(
  Router.callback(Vote, ({ id }) => Chat.answerCallback({ text: `Голос за ${id}` }))
)
```

Бюджет в 64 байта проверяется по-настоящему: `encode` падает с
`CallbackDataTooLong`, а не молча обрезает данные. См.
[Callback data](/ru/guides/callback-data/).

## 4. Многошаговый визард

Задать три вопроса подряд обычно значит написать конечный автомат руками.
`Coroutine` выводит автомат из генератора:

```ts
import { Coroutine } from "@fibergram/core"
import { Schema } from "effect"

const Age = Schema.NumberFromString.check(Schema.isBetween({ minimum: 0, maximum: 150 }))

const registration = Coroutine.make("registration", function* (d) {
  const name = yield* d.prompt("Как вас зовут?", Schema.NonEmptyString)
  const age = yield* d.prompt("Сколько вам лет?", Age, {
    onInvalid: () => "Столько не бывает. Сколько вам лет?"
  })
  yield* d.reply(`Приятно познакомиться, ${name} (${age}).`)
  return { name, age }
})
```

Каждый `d.prompt` — точка приостановки: корутина спрашивает, останавливается и
возобновляется на следующем апдейте уже с декодированным ответом. Скармливается
диспетчеру как любой другой диалог:

```ts
Dispatcher.run({ updates, dialog: registration })
```

Переживёт ли недозаполненная регистрация деплой, решает слой `DialogStore`, а не
что-либо в коде выше. Это центральная идея, и она разобрана в
[Диалогах](/ru/concepts/dialogs/) и
[Режимах персистентности](/ru/concepts/persistence/).

## Собираем вместе

Настоящие боты сочетают `Router` с визардами. Поскольку `Coroutine` работает
только с текстом, а fibergram запускает **один диалог на чат**, композиция явная:
небольшой корневой диалог держит состояние «какой разговор активен» и делегирует.
[Пример restaurant-booking](https://github.com/fibergram/fibergram/tree/main/examples/restaurant-booking) —
законченный бот ровно такой конструкции: визарды, инлайн-меню с пагинацией, две
локали и файловое durable-хранилище.

## Что дальше

- [Структура проекта](/ru/getting-started/project-structure/) — как разложить бота,
  переросшего один файл.
- [Роутинг](/ru/concepts/routing/) — все конструкторы роутов и как по ним
  накапливаются `E` и `R`.
- [Тестирование](/ru/guides/testing/) — проверять, что бот отправил, без сети.
