---
title: Участники чатов
description: Кэш членства, наполняемый апдейтами chat_member, чтобы не звать getChatMember на каждую проверку.
sidebar:
  order: 12
---

```bash
pnpm add @fibergram/chat-members
```

Effect-нативный аналог `@grammyjs/chat-members`: отслеживать, кто в каком чате, без
вызова `getChatMember` на каждую проверку.

## Наполнить кэш

```ts
import { ChatMembers } from "@fibergram/chat-members"
import { Router } from "@fibergram/core"

const router = Router.make(ChatMembers.route)
const allowed = Router.allowedUpdates(router) // → ["chat_member"]
```

`ChatMembers.route` сворачивает каждый апдейт `chat_member` в хранилище.

:::caution[`chat_member` не входит в дефолтный набор Telegram]
Бот, который его не запросил, **не получает** апдейтов о членстве, а кэш молча
остаётся пустым. Смонтированный роут кладёт его в вычисленный список
`allowedUpdates` — передайте этот список в `Polling.make` или `setWebhook`, и
проблема исчезнет. См.
[Роутинг](/ru/concepts/routing/#выводится-из-смонтированных-роутов).
:::

## Спросить кэш

```ts
import { ChatMembers } from "@fibergram/chat-members"
import { Effect, Option } from "effect"

const program = Effect.gen(function* () {
  const members = yield* ChatMembers.ChatMembers
  const cached = yield* members.get(-100, 42)
  return Option.isSome(cached)
}).pipe(Effect.provide(ChatMembers.layerMemory))
```

| Метод | Поведение |
|---|---|
| `get(chatId, userId)` | Чистый поиск в кэше → `Effect<Option<ChatMember>>`. `None` означает «никогда не видели». |
| `set(chatId, userId, member)` | Перезаписать закэшированное членство. |
| `resolve(chatId, userId)` | Кэш или запрос: при промахе один `getChatMember`, ответ пишется обратно и дальше отдаётся из кэша. Нужен `TelegramClient`, падает `TelegramError`. |

Обратите внимание на различие, которое проводит `get`: `"left"` и `"kicked"` —
это **закэшированные значения**, а не отсутствие. `None` значит, что такой пары
кэш никогда не видел, — ради этого и существует `resolve`.

## Выбрать бэкенд

```ts
import { ChatMembers } from "@fibergram/chat-members"
import { Layer } from "effect"
import { KeyValueStore } from "effect/unstable/persistence"

const members: Layer.Layer<ChatMembers.ChatMembers> = ChatMembers.layer.pipe(
  Layer.provide(KeyValueStore.layerMemory)
)
```

`ChatMembers.layer` использует тот `KeyValueStore`, что есть в контексте, — тот же
порт, на котором [`@fibergram/durable`](/ru/guides/durable/) держит снапшоты
диалогов, так что одно решение о хранилище закрывает оба.
`ChatMembers.layerMemory` — самодостаточный вариант для тестов и прототипов.

Ключи лежат под `"fibergram:chatMembers:"` в виде `` `${chatId}:${userId}` ``,
значения — camelCase `BotApi.ChatMember`, закодированные в JSON.

## Модель отказов

Сбои хранилища и сериализации становятся defect'ами (`Effect.orDie`), повторяя
контракт порта `DialogStore`: собственный канал ошибок сервиса остаётся чистым.
Типизированная ошибка есть только у `resolve`, и это `TelegramError` от
единственного вызова API, который он может сделать.
