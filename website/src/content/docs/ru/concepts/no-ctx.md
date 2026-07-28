---
title: Жизнь без `ctx`
description: Что приходит на замену объекту контекста — амбиентное состояние апдейта в Context.Reference и зависимости в канале R.
sidebar:
  order: 3
---

Любой Telegram-фреймворк передаёт хендлеру объект контекста:

```ts
// форма, которой в fibergram нет
bot.command("start", async (ctx) => {
  await ctx.reply("привет")
  ctx.session.step = "name"
  const user = ctx.db.users.find(ctx.from.id)
})
```

Этот объект делает сразу три несвязанные работы: несёт **факты об апдейте** (кто,
что и в каком чате отправил), служит **поверхностью API** (`ctx.reply`) и работает
**сервис-локатором** (`ctx.db`, приделанный посреди цепочки middleware). Именно
сплавление трёх ролей заставляет `ctx` расти без границ и делает его тип ложью:
существует ли `ctx.session`, зависит от порядка middleware, которого компилятор не
видит.

fibergram разводит эти три роли.

## 1. Факты об апдейте: амбиентная ссылка

Диспетчер выставляет небольшую запись перед запуском хендлера, ровно на один
апдейт:

```ts
interface UpdateEnv {
  readonly chatId: number
  readonly threadId: Option<number>
  readonly fromId: Option<number>
  readonly update: Update
  readonly lastSent: Ref<Option<number>> // цель для editLast
}
```

Она живёт в `UpdateContext.current` — это **`Context.Reference` со значением по
умолчанию**. (В Effect v4 нет `FiberRef`; механизм амбиентного состояния —
`Context.Reference`.) Дефолт и делает всё эргономичным: чтение **ничего не
добавляет в `R`** хендлера.

## 2. Поверхность API: свободные функции-аксессоры

```ts
import { Chat } from "@fibergram/core"

Chat.reply(text, options?)      // знает chatId/threadId; запоминает messageId в lastSent
Chat.editLast(text, options?)   // правит последнее отправленное; откатывается к reply
Chat.answerCallback(options?)   // подтверждает нажатие инлайн-кнопки
Chat.chatId                     // Effect<number>
Chat.thread                     // Effect<Option<number>>
Chat.from                       // Effect<Option<User>>
Chat.withTyping(effect)         // индикатор набора на время effect
```

Они намеренно тонкие. Каждая требует **только `TelegramClient`** — никакого
амбиентного тега «чат» — и делает ровно один вызов Bot API. Ни наследования, ни
плагинной поверхности, ни места, где вырастет `ctx.session`: проектное ограничение
в том, чтобы `Chat` не превратился в god-объект через заднюю дверь.

```ts
const handler = Effect.gen(function* () {
  yield* Chat.reply("Работаю…")
  yield* Chat.withTyping(doSomethingSlow)
  yield* Chat.editLast("Готово.")
})
```

`Chat.withTyping` — хрестоматийный `acquireRelease`: сразу шлёт `sendChatAction`,
форкает дочерний fiber, обновляющий индикатор каждые четыре секунды (с запасом до
протухания примерно через пять), и прерывает его по завершении обёрнутого эффекта —
успешном или нет.

## 3. Зависимости: канал `R`

Всё остальное — сервис, который вы запрашиваете:

```ts
const handler = Effect.gen(function* () {
  const repo = yield* UserRepo // добавляет UserRepo в R
  const id = yield* Chat.chatId // не добавляет ничего (амбиентно); Chat.reply добавит TelegramClient
  const user = yield* repo.byId(id)
  yield* Chat.reply(user.name)
})
```

`R` накапливается вверх по роутам и роутеру до бота целиком, а закрывает его один
`Layer` на краю. Забыли подключить `UserRepo` — программа не скомпилируется, в
отличие от `ctx.db`, оказавшегося `undefined` в три часа ночи из-за middleware,
зарегистрированной не в том порядке.

`EntityManager` захватывает этот контекст один раз (`Effect.context<R>()`) и
реплеит его в каждый адресный fiber, поэтому сервисы резолвятся однократно, а не
на каждый апдейт.

## Вне хендлера

У амбиентной ссылки дефолт `None`, поэтому `Chat.*` вне цикла диспатча падает
предсказуемо, а не читает чужой чат. Когда нужно написать в конкретный чат из
крон-задачи или HTTP-эндпоинта, работайте с клиентом напрямую:

```ts
const notify = Effect.gen(function* () {
  const tg = yield* TelegramClient.TelegramClient
  yield* tg.sendMessage({ chatId: 12345, text: "Ночной отчёт готов" })
})
```

То же разделение встречается в [`Session`](/ru/guides/sessions/), где есть
амбиентные `get`/`set`/`update` для хендлеров и явные `getAt`/`setAt`/`updateAt`
для всего остального, и в [`@fibergram/i18n`](/ru/guides/i18n/), чей `t` резолвит
амбиентную локаль, но её можно закрепить через `I18n.withLocale`.

## Чем приходится платить

Честно: обнаруживаемостью. `ctx.` в редакторе показывает всё, что фреймворк умеет;
`Chat.` покажет восемь функций, а про то, что репозитории приходят через `yield*`,
надо знать. Это и есть размен: меньшая и честная поверхность в обмен на худший
первый час, если вы привыкли исследовать API автодополнением.
