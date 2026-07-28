---
title: Тестирование
description: Прогнать бота целиком через синтетические апдейты и проверить, что он отправил, — без сети и без ожидания.
sidebar:
  order: 9
---

Бот тестируем ровно настолько, насколько его транспорт — значение.
`@fibergram/core/testing` даёт два таких значения: записывающий дублёр клиента и
фабрику входящих апдейтов. Ни одного сокета не открывается, а любые задержки
крутит `TestClock`.

## Форма теста

```ts
import { Chat, Dedup, Dialog, DialogStore, Dispatcher } from "@fibergram/core"
import { TestTelegram, Updates } from "@fibergram/core/testing"
import { Effect } from "effect"

const echo = Dialog.stateless({
  onUpdate: (update) =>
    Effect.gen(function* () {
      const text = update.message?.text
      if (text !== undefined) yield* Chat.reply(text)
    })
})

const test = Effect.gen(function* () {
  const tg = yield* TestTelegram.make

  yield* Dispatcher.run({
    updates: Updates.stream([
      Updates.text({ updateId: 1, chatId: 100, text: "привет" }),
      Updates.text({ updateId: 2, chatId: 100, text: "ещё" })
    ]),
    dialog: echo
  }).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer]))

  const sent = yield* tg.sent
  // → [{ chatId: 100, text: "привет" }, { chatId: 100, text: "ещё" }]
})
```

Обратите внимание, за счёт чего это работает: `Updates.stream` — конечный стрим,
поэтому `Dispatcher.run` завершается, когда он выдренен. Боевой ингест не
завершается никогда.

## Фабрикация апдейтов

| Конструктор | Что делает |
|---|---|
| `Updates.text({ updateId, chatId, text, fromId? })` | обычное сообщение |
| `Updates.command({ updateId, chatId, command, args?, fromId? })` | сообщение с корректно выставленной сущностью `bot_command` |
| `Updates.callback({ updateId, chatId, fromId, data, messageId? })` | `callback_query` |
| `Updates.stream([...])` | `Stream` над ними |

`Updates.command` важнее, чем кажется: сообщение с командой без сущности не
является командой ни для Telegram, ни, следовательно, для роутера.

## Проверка отправленного

`TestTelegram` записывает каждый вызов через единственный шов `call`, сквозь
который проходят все методы Bot API, поэтому мимо не проскочит ничего:

| Аксессор | Что читает |
|---|---|
| `tg.calls` | все записанные вызовы по порядку |
| `tg.callsTo(method)` | параметры всех вызовов одного метода |
| `tg.sent` | параметры `sendMessage` |
| `tg.edited` | параметры `editMessageText` |
| `tg.actions` | параметры `sendChatAction` (например, индикаторы набора) |
| `tg.answered` | параметры `answerCallbackQuery` |
| `tg.clear` | забыть всё, между фазами сценария |

Параметры возвращаются в **camelCase** — в той же форме, в какой их передал ваш
хендлер. Граница `snake_case` в тест не протекает.

Дефолтный ответчик синтезирует правдоподобный `Message` для методов отправки (с
автоинкрементным `messageId`, чтобы у `Chat.editLast` была цель), `true` для
остальных и `[]` для `getUpdates`.

## Подмена ответов

Когда хендлер ветвится по тому, что ответил Telegram:

```ts
const tg = yield * TestTelegram.makeWith({
  respond: (method, params) => (method === "getMe" ? Option.some({ id: 1, isBot: true }) : Option.none())
})
```

Возврат `None` проваливается к дефолтному ответчику.

## Тест визарда

Шаги подаются последовательностью апдейтов:

```ts
const test = Effect.gen(function* () {
  const tg = yield* TestTelegram.make

  yield* Dispatcher.run({
    updates: Updates.stream([
      Updates.command({ updateId: 1, chatId: 1, command: "/start" }),
      Updates.text({ updateId: 2, chatId: 1, text: "Ада" }),
      Updates.text({ updateId: 3, chatId: 1, text: "36" })
    ]),
    dialog: Conversations.toDialog(manager)
  }).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer]))

  const sent = yield* tg.sent
  // → ["Как вас зовут?", "Сколько вам лет?", "Приятно познакомиться, Ада (36)."]
})
```

Поскольку состояние корутины идёт через `DialogStore`, этот тест заодно
прогоняет путь реплея — подставьте `PersistedDialogStore.layerMemory`, чтобы
проверить, что визард переживает пассивацию.

## Время

Любая задержка в fibergram идёт через `Clock` из Effect:

```ts
import { TestClock } from "effect/testing"

yield * TestClock.adjust("10 minutes") // сработает пассивация, durable-таймер, окно throttle
```

Это касается и пейсинга `Transform.throttle` под flood-лимиты, и сна
`Retry.retryRateLimited` по `retry_after`, и idle-эвикции
`PassivatingEntityManager`. Поведение под рейт-лимитом тестируется за миллисекунды.

## Детерминизм

Боевой ингест не заканчивается, поэтому естественного момента «бот освободился» у
него нет. Для тестов он есть: entity manager отдаёт `awaitIdle`, который
резолвится, когда выдренены все мейлбоксы. `Dispatcher.run` над конечным стримом
уже дожидается его — обращаться к `awaitIdle` напрямую нужно только тогда, когда
вы управляете менеджером сами.

## С `@effect/vitest`

```ts
import { it } from "@effect/vitest"

it.effect("отвечает эхом", () =>
  Effect.gen(function* () {
    const tg = yield* TestTelegram.make
    // …
    expect(yield* tg.sent).toEqual([{ chatId: 100, text: "привет" }])
  })
)
```

`it.effect` запускает эффект с уже установленным `TestClock` — именно так устроен
собственный набор тестов репозитория fibergram.
