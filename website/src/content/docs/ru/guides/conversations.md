---
title: Разговоры
description: Многошаговые визарды как генераторы, replay-модель, делающая их durable, и композиция с роутером.
sidebar:
  order: 5
---

Задать три вопроса подряд обычно значит написать конечный автомат: enum состояний,
switch по нему, переход на каждую ветку и баг при первой же фотографии там, где
ждали число.

`Coroutine` выводит этот автомат из кода, который вы написали бы, будь
приостановка бесплатной:

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

Запускается как любой диалог:

```ts
Dispatcher.run({ updates, dialog: registration })
```

## DSL

| Операция | Что делает |
|---|---|
| `d.prompt(question, schema, options?)` | Спросить, **приостановиться**, возобновиться с декодированным текстом следующего апдейта. `onInvalid` задаёт сообщение при переспросе; без него повторяется сам вопрос. |
| `d.choose(question, choices, options?)` | Одноразовая reply-клавиатура из подписей; возобновляется со стабильным `id` выбранного варианта. Схлопывает связку «отправить клавиатуру → prompt → сопоставить подпись» в один вызов. |
| `d.reply(text, options?)` | Отправить сообщение записываемым шагом — исполняется один раз, не на реплее. |
| `d.effect(effect)` | Произвольный эффект записываемым шагом. |
| `d.run(effect, schema)` | Durable-**активность**: исполнить один раз, записать результат и на реплее вернуть записанное, не запуская заново. |

За `d.choose` стоит тянуться всякий раз, когда у шага фиксированный набор ответов:
хендлер ветвится по `"window"`, а не по тому, как подпись кнопки выглядит на языке
пользователя.

## Replay-модель

Это то, что стоит понять до написания длинного визарда.

На каждом апдейте генератор **перезапускается с нуля**. Уже отвеченные `prompt` и
уже записанные активности подаются из персистентного лога; реально исполняется
только фронтир-операция. Это модель Temporal / Effect Workflow, и именно она
делает визард возобновляемым между рестартами без единого перехода, написанного
руками.

Отсюда правило: **код между шагами должен быть детерминирован**.

```ts
// ✗ разъедется на реплее — Date.now() каждый раз другой
const bad = Coroutine.make("bad", function* (d) {
  if (Date.now() % 2 === 0) yield* d.reply("чётное")
  else yield* d.reply("нечётное")
})

// ✓ значение записывается на первом прогоне и реплеится дальше
const good = Coroutine.make("good", function* (d) {
  const now = yield* d.run(Clock.currentTimeMillis, Schema.Number)
  if (now % 2 === 0) yield* d.reply("чётное")
  else yield* d.reply("нечётное")
})
```

Ветвление на незаписанном недетерминизме ловится как **defect**
`NonDeterminismError` — намеренно громко, потому что альтернатива это молча
испорченное состояние, которое проявится через несколько дней.

Две оговорки, идущие с моделью:

- **`d.run` — at-least-once.** Падение после исполнения, но до сохранения
  состояния приведёт к повторному запуску при восстановлении. Держите
  идемпотентным.
- **Схема должна круглиться без потерь.** На реплее возвращается
  `decode(encode(a))`, поэтому `Date`, кодирующийся в строку, вернётся строкой,
  если схема не говорит иного.

## Композиция

Корутины композируются делегированием генераторов: шаги ребёнка вклеиваются в
единый лог родителя, и родитель возобновляется с возвращённым значением ребёнка:

```ts
function* askAddress(d) {
  const city = yield* d.prompt("Город?", Schema.NonEmptyString)
  const street = yield* d.prompt("Улица?", Schema.NonEmptyString)
  return { city, street }
}

const booking = Coroutine.make("booking", function* (d) {
  const when = yield* d.prompt("Когда?", Schema.NonEmptyString)
  const address = yield* askAddress(d) // ← вклеивается сюда
  yield* d.reply(`Забронировано на ${when}: ${address.street}, ${address.city}`)
})
```

Отдельного понятия «поддиалог» учить не нужно: это вызов функции.

## Композиция с роутером

fibergram запускает **один диалог на чат**, поэтому боту с командами без состояния
и визардами нужен явный ответ на вопрос «какой разговор активен». `Conversations`
владеет этим автоматом — аналог `Stage` в grammY и `Scenes` в aiogram:

```ts
import { Chat, Command, Conversations, Router } from "@fibergram/core"

const help = Command.make("/help", { description: "Помощь" })
const start = Command.make("/start", { description: "Регистрация" })
const stop = Command.make("/cancel", { description: "Прервать" })

const manager = Conversations.make({
  router: Router.make(Router.command(help, () => Chat.reply("помощь"))),
  scenes: { registration, booking },
  enter: [Conversations.on(start, "registration")],
  cancel: Conversations.cancel(stop, { onCancel: Chat.reply("Отменено") })
})

Dispatcher.run({ updates, dialog: Conversations.toDialog(manager) })
```

На каждом апдейте менеджер:

1. прерывает активную сцену при совпадении `cancel`,
2. делегирует активной сцене — её `decide` выполняет отправки и возвращает
   следующий снапшот; снапшот `done` возвращает менеджер в `Idle`,
3. из `Idle` перебирает правила `enter` по порядку (опциональный `guard` правила
   может отказать, выполнив `onReject` и оставив `Idle`),
4. иначе отдаёт апдейт роутеру.

Имена сцен ограничены в `make` ключами `scenes`, поэтому опечатка — ошибка
компиляции. `E` и `R` накапливаются и из роутера, и из каждой сцены, а команды
входа и отмены возвращаются в `manager.router` — так что
`Router.setMyCommands(manager.router)` по-прежнему синхронизирует полное меню.

### Гарды входа

```ts
Conversations.on(book, "booking", {
  guard: isRegistered,
  onReject: Chat.reply("Сначала /start")
})
```

## Когда писать decider руками

`Conversations` покрывает типовую форму. Свой корневой
[`Dialog`](/ru/concepts/dialogs/#decider) над тегированным union пишут, когда
нужно что-то, чего он не моделирует, — например, визард, прерываемый конкретной
командой на полпути с сохранением частичного состояния.
[Пример restaurant-booking](https://github.com/fibergram/fibergram/tree/main/examples/restaurant-booking)
делает ровно это.

## Durable-режим

Выше нигде не упоминалась персистентность. Недозаполненный визард переживёт деплой
тогда и только тогда, когда слой `DialogStore` durable:

```ts
Effect.provide([PersistedDialogStore.layer, Dedup.layerMemory])
```

См. [Режимы персистентности](/ru/concepts/persistence/).
