---
title: Роутинг
description: Конструкторы роутов, фильтры и то, как E и R накапливаются по роутеру на уровне типов.
sidebar:
  order: 5
---

`Router` — это список `Route`, перебираемых по порядку. `Route<E, R>` — матчер,
который либо отдаёт эффект для запуска, либо отказывается:

```ts
interface Route<out E, out R> {
  readonly match: (update: Update) => Option<Effect<void, E, R>>
}
```

Всё остальное — команды, коллбэки, `hears` — сахар поверх этого.

## Конструкторы роутов

### По виду апдейта

`Router.on(kind, handler)` сужает тип payload по виду, поэтому копаться в `Update`
и делать приведения не нужно:

```ts
Router.on("editedMessage", (message) => Chat.reply(`поправлено: ${message.text ?? ""}`))
Router.on("inlineQuery", (query) => query.answer(results))
```

### Команды

```ts
const setAge = Command.make("/setage", Schema.Struct({ age: Schema.NumberFromString }), {
  description: "Указать возраст"
})

Router.command(setAge, ({ age }) => Chat.reply(`возраст ${age}`))
```

Токены раскладываются на поля схемы позиционно, `/cmd@yourbot` обрабатывается, и
хендлер запускается только при успешном декоде. См. [Команды](/ru/guides/commands/).

### Кнопки-коллбэки

```ts
const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number }))

Router.callback(Vote, ({ id }) => Chat.answerCallback({ text: `голос за ${id}` }))
```

Совпадение — дешёвая проверка префикса до всякого декода. См.
[Callback data](/ru/guides/callback-data/).

### Текст

```ts
Router.hears("Меню", () => showMenu) // точная строка
Router.hears(/^найди (.+)$/, (m) => search(m[1])) // RegExp → RegExpMatchArray
Router.hears(Schema.NumberFromString, (n) => Chat.reply(`${n * 2}`)) // типизированное уточнение
```

Интереснее всего перегрузка со `Schema`: роут срабатывает **только когда текст
декодируется**, и хендлер получает декодированное значение. Ошибка декода в `E` не
утекает.

### Всё остальное

| Конструктор | Что матчит |
|---|---|
| `Router.entity(kind, handler)` | сообщения с сущностью `url` / `email` / `hashtag` / `mention` и извлечёнными подстроками |
| `Router.reaction(emoji?, handler)` | `message_reaction` с посчитанным диффом добавленных и снятых |
| `Router.chatMember(handler)` / `Router.myChatMember` | переходы членства |
| `Router.chatJoinRequest(handler)` | заявки на вступление |
| `Router.inlineQuery(pattern?, handler)` | инлайн-запросы, гидратированные `.answer(results)` |
| `Router.preCheckout` / `Router.shippingQuery` | платёжный поток, гидратированный `.answer(…)` |
| `Router.start(handler)` | `/start` с [payload диплинка](/ru/guides/deep-linking/) |
| `Router.commandNotFound(options)` | неизвестную команду с нечётким «может, вы имели в виду» |
| `Router.when(predicate, handler)` | произвольный предикат над апдейтом |
| `Router.route(match)` | сырой матчер для всего, чего не покрывает сахар |

## Фильтры

`Filter` — библиотека предикатов над апдейтом с `and` / `or` / `not` для
комбинирования. Часто используемые ре-экспортированы из `Router`, поэтому
фильтрованный роут читается в один импорт:

```ts
import { Filter, Router } from "@fibergram/core"

Router.when(Router.and(Router.chatType("group"), Router.not(Filter.isCommand)), handler)
```

Готовые фильтры: `chatType`, `isPrivate`, `isGroup`, `isText`, `isCommand`,
`textEquals`, `textStartsWith`, `hasEntity`, `fromUser`, `fromUsers`, `inChat`.

## Композиция и зачем нужны типы

```ts
const router = Router.make(routeA, routeB).add(routeC).concat(otherRouter)
```

`Route<out E, out R>` **ковариантен** по обоим параметрам, поэтому `make`, `add` и
`concat` копят их как union:

```ts
Router.Router<UserNotFound | TelegramError, UserRepo | TelegramClient>
```

Вот выгода отказа от middleware: тип роутера — полная, проверенная компилятором
опись всего, чем бот может упасть и что ему нужно. Забыли слой — не соберётся.

## Запуск роутера

```ts
Dispatcher.run({ updates, dialog: Router.toDialog(router) })
```

Опции `toDialog`:

| Опция | Что делает |
|---|---|
| `kind` | Пространство адресов итогового диалога (по умолчанию `"router"`). |
| `fallback` | Хендлер для апдейтов, не подошедших ни одному роуту (по умолчанию ничего). |
| `rateLimit` | Входящее ограничение частоты — ниже. |

### Входящий рейт-лимит

```ts
Router.toDialog(router, {
  rateLimit: {
    limit: 5,
    window: Duration.seconds(10),
    onLimit: () => Chat.reply("Помедленнее!")
  }
})
```

Фиксированные окна с ключом по отправителю по умолчанию. `key`, вернувший
`undefined`, освобождает апдейт от лимита (например, для админов). Применяется
**до** матчинга роутов, поэтому считается каждый диспатченный апдейт. Без
`onLimit` превысившие лимит апдейты молча отбрасываются.

Это входящий двойник [`Transform.throttle()`](/ru/guides/transforms/), который
держит темп *исходящих* вызовов бота.

## Выводится из смонтированных роутов

Два списка, которые иначе пришлось бы вести руками, вычисляются:

```ts
Router.allowedUpdates(router) // → ["message", "callback_query", "chat_member", …]
Router.setMyCommands(router) // синхронизирует меню команд по вашим описаниям
```

`allowedUpdates` важнее, чем кажется: `chat_member` **не входит** в дефолтный
набор Telegram, поэтому бот, забывший его запросить, молча не получает апдейтов о
членстве. Смонтированный `ChatMembers.route` попадает в вычисленный список
автоматически.

```ts
const updates = yield * Polling.make({ allowedUpdates: Router.allowedUpdates(router) })
```

`Router.commands` и `Router.commandGroups` отдают те же метаданные, если хочется
нарисовать свой текст помощи.
