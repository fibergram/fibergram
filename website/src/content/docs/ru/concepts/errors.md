---
title: Ошибки
description: Тегированный union TelegramError, ретрай по семантике retry_after и что происходит при падении хендлера.
sidebar:
  order: 4
---

## Union, а не базовый класс

Любой вызов через `TelegramClient` падает ровно одним union:

```ts
type TelegramError =
  | RateLimited // { method, retryAfter: Duration }
  | BotBlocked // { method }
  | MessageNotModified // { method }
  | ChatMigrated // { method, newChatId }
  | Forbidden // { method, description }
  | BadRequest // { method, description, errorCode }
  | TransportError // { method, cause } — сетевой или декодный сбой
```

Каждый член — `Data.TaggedError`, поэтому `catchTag` сужает точно:

```ts
import { Chat } from "@fibergram/core"
import { Effect } from "effect"

const safeEdit = Chat.editLast("Обновлено").pipe(
  // Правка на идентичный текст — норма, а не исключение.
  Effect.catchTag("MessageNotModified", () => Effect.void),
  Effect.catchTag("BotBlocked", () => markUserInactive)
)
```

`TelegramError.fromResponse(method, envelope)` — место, где ответы Bot API
становятся членами union: `429` с `retry_after` → `RateLimited`,
`migrate_to_chat_id` → `ChatMigrated`, «message is not modified» →
`MessageNotModified`, `403` → `BotBlocked` или `Forbidden`, остальное →
`BadRequest`.

:::tip[Почему union, а не иерархия классов]
Иерархия ошибок заставляет писать цепочки `instanceof`, полноту которых компилятор
не проверит, и провоцирует общий базовый класс, глотающий случаи, о которых никто
не подумал. Union с тегами означает, что компилятор скажет вам, что `ChatMigrated`
не обработан.
:::

## Ваши ошибки остаются вашими

Фреймворк никогда не оборачивает, не глотает и не перетегирует доменную ошибку.
Если репозиторий падает `UserNotFound`, именно это появляется в `E` хендлера —
рядом с `TelegramError`, если хендлер ещё и говорит с Telegram:

```ts
const handler: Effect.Effect<void, UserNotFound | TelegramError, UserRepo | TelegramClient>
```

`E` накапливается по роутам так же, как `R`, поэтому канал ошибок готового бота —
честный перечень всего, что может пойти не так.

## Ретрай по семантике Telegram

Слепой экспоненциальный backoff — неверный ответ на `429`: Telegram сам говорит,
сколько ждать.

```ts
import { Retry } from "@fibergram/core"

const send = Retry.retryRateLimited(Chat.reply("привет"), { maxAttempts: 3 })
```

`retryRateLimited` читает `retryAfter` из ошибки `RateLimited` и спит ровно
столько. Любая другая ошибка падает сразу — `BadRequest` не станет `BadRequest`
трижды. Каждый пойманный `RateLimited` инкрементит метрику
`Telemetry.rateLimitHits`.

Сон идёт через `Clock` из Effect, поэтому им крутит `TestClock`: поведение под
рейт-лимитом тестируется без ожидания.

Для политики на весь бот, применяемой к каждому исходящему вызову, берите
[трансформ](/ru/guides/transforms/) вместо обёртки в местах вызова:

```ts
TelegramClient.transformed(Transform.throttle(), Transform.autoRetry())
```

`throttle` держит темп под опубликованными flood-лимитами Telegram (30/с
глобально, 1/с на чат, 20/мин на группу); `autoRetry` прозрачно ретраит `429`,
соблюдая `retry_after`.

## Когда хендлер всё-таки упал

`EntityManager` супервизит границу адреса через `Effect.catchCause`. Это сделано
намеренно:

- **Падение одного чата не роняет бота.** Умирает fiber конкретного апдейта,
  остальные адреса продолжают дренить свои мейлбоксы.
- **Сохраняется весь `Cause`** — включая defect'ы и interrupt'ы, а не только
  `Error`.
- Хук `onDefect: (address, Cause<E>) => Effect<void>` позволяет отправить это
  куда нужно; по умолчанию — `Effect.logError`.

```ts
Dispatcher.run({
  updates,
  dialog,
  onDefect: (address, cause) => reportToSentry(address, cause)
})
```

Логи автоматически аннотируются `chatId` и `updateId` на границе диспатча (см.
[Наблюдаемость](/ru/guides/observability/)), поэтому сбой приходит уже с
контекстом, по которому его можно найти.

## Модель отказов у портов

Порты персистентности (`DialogStore`, `Dedup`, `CallbackStore`) объявляют `never`
в канале ошибок. Сбои хранилища и сериализации становятся **defect'ами**, а не
типизированными ошибками. Это решение, а не недосмотр: хендлер не должен ставить
`catchTag` на «база может лежать» при каждом чтении состояния. Defect'ы всплывают
через тот же супервизор на границе адреса — один плохой апдейт теряет один ход, а
хук сообщает об этом.
