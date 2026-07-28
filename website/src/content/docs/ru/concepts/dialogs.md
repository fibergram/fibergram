---
title: Диалоги
description: Примитив адресуемой сущности — одна абстракция для команд без состояния, визардов и многодневных разговоров.
sidebar:
  order: 2
---

## Смена рамки

Три сценария, которые большинство фреймворков считают тремя разными фичами:

| Сценарий | Fiber | Состояние |
|---|---|---|
| Команда без состояния | эфемерный, живёт один апдейт | нет |
| Визард (минуты) | приостановлен, горячий в памяти | снапшот-чекпоинт |
| Цикл ходов RPG (дни) | пассивирован между апдейтами | durable |

Они различаются **политикой персистентности**, а не природой. Поэтому в fibergram
один примитив — **виртуальный актор**:

- стабильный **адрес**,
- **мейлбокс** (порядок внутри адреса, параллельность между адресами),
- **персистентное состояние**,
- хендлер, умеющий **приостановиться до следующего апдейта**.

Какую из трёх строк выше вы получите, решает подключённый `Layer`, а не хендлер.
Это самая важная идея фреймворка.

## Адрес

```ts
interface DialogAddress {
  readonly chatId: number
  readonly threadId?: number // форум-топики
  readonly fromId?: number // диалог на пользователя, а не на чат
  readonly kind: string // "registration", "combat", …
}
```

`DialogAddress.toKey` сериализует это в `` `${kind}:${chatId}:${threadId}:${fromId}` ``.
Эта строка *и есть* идентичность мейлбокса: апдейты с одним ключом обрабатываются
по порядку на одном fiber'е, разные ключи — параллельно.

Экстрактор подключаемый, потому что разным ботам нужна разная форма адреса:

```ts
type KeyExtractor = (update: Update) => Option<DialogAddress>
```

Из коробки:

| Экстрактор | Форма адреса | Когда брать |
|---|---|---|
| `DialogAddress.byUpdate(kind)` | чат и тред, **тотально** по всем видам апдейтов | Дефолт диспетчера. Апдейты без чата адресуются по отправителю, поэтому `Router.on("inlineQuery")`, `Router.reaction` и `Router.chatMember` действительно получают свои события. |
| `DialogAddress.byChat(kind)` | чат и тред | Один разговор на чат, только апдейты с сообщением. |
| `DialogAddress.byUser(kind)` | чат и отправитель | У каждого участника группы свой независимый разговор. |

Возврат `Option.none()` отбрасывает апдейт. Свой экстрактор передаётся в
`Dispatcher.run({ keyExtractor })`.

## Decider

Под каждым диалогом лежит event-sourced decider — инспектируемый, реплеящийся и
служащий фундаментом для durable-режима:

```ts
type Handler<State, Event, E, R> = (
  state: State,
  update: Update
) => Effect<Decision<Event, E, R>, E, R>

interface Decision<out Event, out E = never, out R = never> {
  readonly events: ReadonlyArray<Event> // фиксируются → сворачиваются в новое состояние
  readonly effects: ReadonlyArray<Effect<void, E, R>> // отправки, правки, …
}

interface Dialog<State, Event, E, R> {
  readonly kind: string
  readonly initialState: State
  readonly reduce: (state: State, event: Event) => State
  readonly decide: Handler<State, Event, E, R>
}
```

Разделение принципиальное: **`events` меняют состояние, `effects` трогают мир**.
Диалог на реплее сворачивает события и не переисполняет эффекты.

```ts
import { Chat, Decision, Dialog } from "@fibergram/core"
import { Effect } from "effect"

type State = { readonly count: number }
type Event = { readonly _tag: "Ticked" }

// `E` и `R` выводятся из эффектов решения — здесь это TelegramError
// и TelegramClient, которые приносит Chat.reply.
const counter = Dialog.make({
  kind: "counter",
  initialState: { count: 0 },
  reduce: (state, _event) => ({ count: state.count + 1 }),
  decide: (state, update) =>
    Effect.succeed(
      update.message === undefined
        ? Decision.empty
        : Decision.make({
            events: [{ _tag: "Ticked" }],
            effects: [Effect.asVoid(Chat.reply(`Сообщение № ${state.count + 1}`))]
          })
    )
})
```

Конструкторы `Decision`: `empty`, `run(...effects)`, `emit(...events)` и
`make({ events?, effects? })`.

### Сокращение для случая без состояния

У большинства хендлеров состояния нет. `Dialog.stateless` — сахар, чей `decide`
возвращает `Decision.run(onUpdate(update))`:

```ts
const echo = Dialog.stateless({
  onUpdate: (update) =>
    Effect.gen(function* () {
      const text = update.message?.text
      if (text !== undefined) yield* Chat.reply(text)
    })
})
```

## Эргономичный слой: корутины

Писать decider руками ради «задать три вопроса» утомительно. `Coroutine` — это
генератор, элаборирующийся *в* decider:

```ts
import { Coroutine } from "@fibergram/core"
import { Schema } from "effect"

const registration = Coroutine.make("registration", function* (d) {
  const name = yield* d.prompt("Имя?", Schema.NonEmptyString)
  const age = yield* d.prompt("Возраст?", Schema.NumberFromString)
  yield* d.reply(`Ок, ${name}, ${age}`)
  return { name, age }
})
```

Каждый `prompt` — **атомарная граница шага**: спросить, приостановиться,
возобновиться на следующем апдейте с декодированным ответом. Драйвер
**replay-based** (модель Temporal / Effect Workflow): на каждом апдейте генератор
перезапускается с нуля, уже отвеченные `prompt` и записанные результаты активностей
подаются из персистентного лога, и исполняется только фронтир-побочка — ровно один
раз, в порядке программы.

Отсюда правило: **код между шагами должен быть детерминирован**. Ветвление на
незаписанном чтении часов или случайном значении разъедется на реплее, и fibergram
ловит это как defect `NonDeterminismError`, а не портит состояние молча.
Недетерминированные данные втаскивайте через `d.run(effect, schema)`, который
записывает результат.

Полный DSL и правила композиции — в [Разговорах](/ru/guides/conversations/).

## Это одно и то же

Корутина — это `Dialog`, чей `reduce` работает по снапшот-семантике: эмитированное
событие *и есть* следующее состояние. Поэтому decider'ы и корутины
интероперабельны: корневой decider может делегировать корутине и забрать её
снапшот обратно — ровно так работает
[`Conversations`](/ru/guides/conversations/#композиция-с-роутером), когда гоняет
роутер вместе с N именованными визардами.

## Один диалог на адрес

`Dispatcher.run({ updates, dialog })` запускает **один** диалог. Бот, которому
нужны и роутер команд, и визарды с состоянием, композирует их в один диалог, а не
регистрирует два. Для типовой формы берите `Conversations`, а корневой decider
пишите сами, когда нужен более тонкий контроль.

## Где выбирается режим

Выше нигде не упоминалась персистентность. В этом и смысл:

```ts
// горячее в памяти, исчезает при рестарте
Effect.provide([DialogStore.layerMemory, Dedup.layerMemory])

// переживает рестарт; простаивающие диалоги вытесняются и рехидрируются по требованию
Effect.provide([PersistedDialogStore.layer, Dedup.layerMemory])
```

Что гарантирует каждый режим — в
[Режимах персистентности](/ru/concepts/persistence/).
