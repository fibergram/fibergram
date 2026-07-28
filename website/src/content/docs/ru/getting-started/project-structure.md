---
title: Структура проекта
description: Как разложить бота на fibergram, когда он перерос один файл.
sidebar:
  order: 4
---

Бот, помещающийся в один файл, пусть в нём и остаётся. Как только перестаёт —
работающая форма диктуется Effect, а не fibergram: **сервисы внизу, хендлеры
посередине, один модуль проводки наверху**.

## Раскладка

Так устроен
[пример restaurant-booking](https://github.com/fibergram/fibergram/tree/main/examples/restaurant-booking) —
законченный бот с визардами, меню с пагинацией, двумя локалями и durable-хранилищем:

```
src/
  config.ts        конфигурация приложения как сервис (Config.* на краю)
  storage.ts       KeyValueStore, на котором держится всё durable
  domain.ts        модели и репозитории — Effect-сервисы поверх хранилища
  i18n.ts          загрузка locales/*.ftl и сборка переводчика
  wizard.ts        общие хелперы для корутин
  registration.ts  визард /start
  booking.ts       визард /book
  menu.ts          инлайн-меню
  commands.ts      команды и коллбэки без состояния
  app.ts           корневой диалог: композиция Router с визардами
  main.ts          проводка слоёв и ингест
locales/
  en.ftl, ru.ftl
```

Правило, благодаря которому это работает: **всё ниже `main.ts` — значения, а не
программы**. `registration.ts` экспортирует корутину, `domain.ts` — теги сервисов
и слои, `menu.ts` — меню. Ничего не запускается, не читает переменные окружения и
не открывает соединений. `main.ts` — единственный модуль, который знает, что бот
настоящий.

## Сервисы вместо импортов

Хендлер просит нужное через `R`:

```ts
// domain.ts
import { Context, Effect, Layer, Option } from "effect"

export interface UserRepoService {
  readonly byId: (id: number) => Effect.Effect<Option.Option<User>>
  readonly save: (user: User) => Effect.Effect<void>
}

export class UserRepo extends Context.Service<UserRepo, UserRepoService>()("app/UserRepo") {}

export const layerUserRepo: Layer.Layer<UserRepo> = Layer.effect(UserRepo, /* … */)
```

Это та же форма `Context.Service`, которой fibergram описывает собственные порты —
`DialogStore`, `Dedup`, `TelegramClient` объявлены точно так же.

```ts
// commands.ts — ни импорта реализации, ни глобалей
import { Chat, Command, Router } from "@fibergram/core"
import { Effect, Option } from "effect"
import { UserRepo } from "./domain.js"

export const whoami = Router.command(Command.make("/whoami"), () =>
  Effect.gen(function* () {
    const repo = yield* UserRepo
    const id = yield* Chat.chatId
    const user = yield* repo.byId(id)
    yield* Chat.reply(Option.match(user, { onNone: () => "Не зарегистрированы", onSome: (u) => u.name }))
  })
)
```

`Router.make(whoami, …)` накопит `UserRepo` в `R` роутера. Компилятор не даст
`main.ts` запустить бота, пока это требование не удовлетворено — вот и вся история
про внедрение зависимостей, никакого контейнера.

## Один модуль проводки

```ts
// main.ts
import { Dedup, DialogStore, Dispatcher, Router } from "@fibergram/core"
import { TelegramClient } from "@fibergram/core/client"
import { Polling } from "@fibergram/core/polling"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import { router } from "./app.js"
import { layerUserRepo } from "./domain.js"

const program = Effect.gen(function* () {
  const updates = yield* Polling.make({
    allowedUpdates: Router.allowedUpdates(router)
  })
  yield* Router.setMyCommands(router)
  yield* Dispatcher.run({ updates, dialog: Router.toDialog(router) })
}).pipe(
  Effect.scoped,
  Effect.provide([
    layerUserRepo,
    DialogStore.layerMemory,
    Dedup.layerMemory,
    TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
  ])
)

Effect.runFork(program)
```

Каждое решение, отличающее разработку от продакшена, живёт в этом единственном
массиве `Effect.provide`:

| Что меняем | С | На |
|---|---|---|
| Транспорт | `Polling.make()` | [`Webhook.make()`](/ru/guides/webhooks/) |
| Персистентность диалогов | `DialogStore.layerMemory` | [`PersistedDialogStore.layer`](/ru/guides/durable/) |
| Клиент Telegram | `TelegramClient.layer` | [`TestTelegram`](/ru/guides/testing/) |
| Поведение исходящих | `TelegramClient.layer` | [`TelegramClient.transformed(…)`](/ru/guides/transforms/) |

## Один диалог на чат

fibergram диспатчит **один диалог на адрес**, поэтому боту с роутером и
визардами нужен явный ответ на вопрос «какой разговор активен». Два варианта:

1. **[`Conversations`](/ru/guides/conversations/#композиция-с-роутером)** —
   встроенная композиция роутера с именованными сценами. Начинайте отсюда.
2. **Свой корневой диалог** над небольшим тегированным union
   (`Idle | Registration | Booking`), чей `decide` делегирует активному визарду и
   откатывается к роутеру. Больше кода, полный контроль — так устроен пример
   restaurant-booking, которому нужно, чтобы `/cancel` прерывал визард на полпути.

Оба — обычные `Dialog`; см. [Диалоги](/ru/concepts/dialogs/).

## Тесты рядом

Поскольку ниже `main.ts` ничего не выполняется при импорте, тесты подставляют
другой краевой слой и гонят синтетические апдейты через тот же диалог:

```ts
// test/commands.test.ts
import { Dedup, DialogStore, Dispatcher, Router } from "@fibergram/core"
import { TestTelegram, Updates } from "@fibergram/core/testing"
import { Effect } from "effect"
import { router } from "../src/app.js"

const run = Effect.gen(function* () {
  const tg = yield* TestTelegram.make
  yield* Dispatcher.run({
    updates: Updates.stream([Updates.command({ updateId: 1, chatId: 1, command: "/whoami" })]),
    dialog: Router.toDialog(router)
  }).pipe(
    Effect.scoped,
    Effect.provide([DialogStore.layerMemory, Dedup.layerMemory, tg.layer, layerUserRepo])
  )
  return tg.sent
})
```

Подробнее — в [Тестировании](/ru/guides/testing/).
