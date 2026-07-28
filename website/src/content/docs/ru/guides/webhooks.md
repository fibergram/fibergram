---
title: Вебхуки
description: Веб-стандартный вебхук-ингест, адаптеры фреймворков и несколько ботов на одном эндпоинте.
sidebar:
  order: 10
---

```bash
pnpm add @fibergram/webhook
```

Вебхук — просто ещё один продюсер в ту же `Queue<Update>`, которую наполняет long
polling; см. [Ингест](/ru/concepts/ingestion/). Выше очереди не меняется ничего.

## Веб-стандарт

```ts
import { Dedup, Dialog, DialogStore, Dispatcher } from "@fibergram/core"
import { TelegramClient } from "@fibergram/core/client"
import { Webhook } from "@fibergram/webhook"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

const program = Effect.gen(function* () {
  const webhook = yield* Webhook.make({ secretToken: "s3cret" })
  yield* Effect.forkScoped(Dispatcher.run({ updates: webhook.updates, dialog }))

  // Serverless, Bun, workerd и Hono уже говорят на веб-`Request`:
  //   export default { fetch: (request) => webhook.handle(request) }
  return webhook
}).pipe(
  Effect.scoped,
  Effect.provide([
    DialogStore.layerMemory,
    Dedup.layerMemory,
    TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
  ])
)
```

`webhook.handle` замыкается на очередь в памяти и гоняется на дефолтном
рантайме — наружу не течёт никакой машинерии Effect, поэтому его можно уронить в
любой императивный хост.

## Effect-нативный путь

Для серверов в стиле `@effect/platform` `httpApp` — полноценный роут, сквозь
который текут спаны и `R`:

```ts
HttpRouter.add("POST", "/webhook", webhook.httpApp)
```

## Express и Fastify

```ts
import { Express, Webhook } from "@fibergram/webhook"

const handler = Express.middleware(webhook)
// app.post("/webhook", express.json(), handler)
```

```ts
import { Fastify, Webhook } from "@fibergram/webhook"

const handler = Fastify.handler(webhook)
// app.post("/webhook", handler)
```

Оба адаптера только пересобирают веб-`Request` из объекта запроса фреймворка: вся
валидация и декодирование остаются за `handle`. `express` и `fastify` —
опциональные peer-зависимости, импортируемые **только для типов**, поэтому они
ничего не добавляют в рантайм, если вы их и так не используете.

## Опции

| Опция | По умолчанию | Что делает |
|---|---|---|
| `secretToken` | — | Должен совпадать с переданным в `setWebhook`. Сравнение за постоянное время, несовпадение → `401`. |
| `capacity` | 1024 | Ограниченная очередь. Заполненная блокирует *до* ответа `200`, поэтому Telegram переотправит, а не потеряет апдейт. |
| `persist` | — | Хук durable-ack: persist → offer → `200`. Провал persist отвечает `500`. |

## Семантика статусов

| Ситуация | Статус | Почему |
|---|---|---|
| Плохой или отсутствующий secret-токен | `401` | Подделанный запрос. |
| Аутентифицирован, но тело кривое | `200` | Логируется и отбрасывается: `4xx` здесь вызвал бы шторм ретраев ради апдейта, который никогда не распарсится. |
| `persist` упал | `500` | Telegram переотправит; dedup по `updateId` уберёт дубль. |
| Принято | `200` | Положено в очередь. |

## Установить вебхук

fibergram не зовёт `setWebhook` за вас: это шаг деплоя, а не рантайма.

```ts
const tg = yield * TelegramClient.TelegramClient
yield *
  tg.setWebhook({
    url: "https://example.com/webhook",
    secretToken: "s3cret",
    allowedUpdates: Router.allowedUpdates(router)
  })
```

Используйте тот же `allowedUpdates`, что вывели для роутера, — см.
[Роутинг](/ru/concepts/routing/#выводится-из-смонтированных-роутов).

:::caution[Поллинг и вебхуки взаимоисключающи]
Telegram отказывает в `getUpdates`, пока установлен вебхук. Перед возвратом к
поллингу в разработке вызовите `deleteWebhook`.
:::

## Много ботов, один эндпоинт

`Multibot` — аналог `TokenBasedRequestHandler` из grammY. У каждого бота свой
`Webhook` (очередь и диспетчер), запросы разводятся по ключу в пути, поэтому
`setWebhook` каждого бота указывает на `https://host/webhook/<token>`:

```ts
import { Multibot, Webhook } from "@fibergram/webhook"

const program = Effect.gen(function* () {
  const alice = yield* Webhook.make({ secretToken: "alice-secret" })
  const bob = yield* Webhook.make({ secretToken: "bob-secret" })
  yield* Effect.forkScoped(Dispatcher.run({ updates: alice.updates, dialog: aliceBot }))
  yield* Effect.forkScoped(Dispatcher.run({ updates: bob.updates, dialog: bobBot }))

  return Multibot.fromMap(
    new Map([
      ["alice-token", alice],
      ["bob-token", bob]
    ])
  )
})
```

Неизвестный ключ отвечает `404`, иначе наружу течёт статус найденного бота.
`Multibot.make({ resolve })` с резолвером `(key) => Effect<Option<Webhook>>`
подходит, когда боты появляются и исчезают в рантайме; `fromMap` — сокращение для
фиксированного реестра. Оба отдают ту же пару `handle` / `httpApp`, что и
одиночный `Webhook`, и `Multibot` ничем не владеет — `Webhook`-и живут в скоупе
вызывающего.

Дефолтный экстрактор ключа — последний сегмент пути; он работает и с абсолютным
`Request.url`, и с голым путём `HttpServerRequest.url`.

## Наблюдаемость

Ингест трассируется span'ом `fibergram.webhook` с HTTP-статусом — no-op, если
трейсер не подключён. См. [Наблюдаемость](/ru/guides/observability/).
