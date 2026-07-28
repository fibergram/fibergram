---
title: Наблюдаемость
description: Логи, трейсы и метрики, которые включены по умолчанию, — и как их экспортировать.
sidebar:
  order: 14
---

Включать нечего. Бот, собранный на `Dispatcher.run`, инструментирован из коробки, а
все три механизма амбиентны в Effect — они **ничего не добавляют** в `R` хендлера.

## Аннотированные логи

Обработка каждого апдейта идёт внутри `Effect.annotateLogs({ chatId, updateId })`,
поэтому любой `Effect.log` из хендлера уже несёт апдейт, для которого он выполнялся:

```ts
const handler = Effect.gen(function* () {
  yield* Effect.log("обрабатываю бронь") // придёт с chatId и updateId
})
```

Это касается и сбоев, о которых сообщает супервизор на границе адреса, — именно
благодаря этому продакшен-отчёт об ошибке применим на практике; см.
[Ошибки](/ru/concepts/errors/#когда-хендлер-всё-таки-упал).

## Трейсы

| Span | Что покрывает |
|---|---|
| `fibergram.update` | load → decide → effects → save, с атрибутами `telegram.chatId`, `telegram.updateId` и `fibergram.dialog.kind` |
| `fibergram.webhook` | вебхук-ингест с HTTP-статусом |
| `telegram.<method>` | один исходящий вызов Bot API (с [`Transform.logging`](/ru/guides/transforms/#logging)) |

Поскольку и поллинг, и вебхуки кормят один диспетчер, `fibergram.update`
покрывает любой транспорт без дополнительной проводки.

Спаны уходят в тот `Tracer`, который подключён на краю. Если его нет — они no-op,
то есть инструментирование ничего не стоит, пока вы его не экспортируете:

```ts
Effect.provide([
  otelTracerLayer, // любой слой OpenTelemetry Tracer
  DialogStore.layerMemory,
  Dedup.layerMemory,
  TelegramClient.layer
])
```

## Метрики

| Метрика | Тип | Что считает |
|---|---|---|
| `Telemetry.updatesTotal` | счётчик | обработанные апдейты |
| `Telemetry.dialogDuration` | таймер | сколько занял каждый |
| `Telemetry.rateLimitHits` | счётчик | `429`, пойманные `Retry` |
| `fibergram_api_calls_total` | счётчик | исходящие вызовы (с `Transform.metrics`) |
| `fibergram_api_errors_total` | счётчик | сбои исходящих |
| `fibergram_api_call_duration` | гистограмма | задержка исходящих |

Это обычные значения `Metric`, поэтому одну можно прочитать на лету:

```ts
const total = yield * Metric.value(Telemetry.updatesTotal)
```

…или выгрузить весь реестр через `Metric.snapshot`.

`dialogDuration` меряется от `Clock.currentTimeMillis` через `Effect.onExit`, то
есть **виртуально под `TestClock`** — проверки задержек в тестах детерминированы.

## Инструментировать свои шаги

Это дефолты, а не потолок. Свои спаны и метрики накладываются как обычно:

```ts
const handler = Effect.gen(function* () {
  const booking = yield* createBooking.pipe(Effect.withSpan("app.createBooking"))
  yield* Chat.reply(`Забронировано № ${booking.id}`)
})
```

Ваш span вложится в `fibergram.update`, поэтому трейс покажет границу апдейта,
вашу работу и исходящие отправки одним деревом.

## За чем следить в продакшене

- **Растущий `rateLimitHits`** означает, что вы упираетесь во flood-лимиты.
  Добавьте [`Transform.throttle()`](/ru/guides/transforms/#throttleoptions), а не
  увеличивайте число ретраев.
- **Растущий p99 у `dialogDuration`** на durable-бэкенде обычно означает задержку
  стора, а не работу хендлера: чтение и запись входят в span.
- **`fibergram_api_errors_total` сам по себе не тревожен**: `BotBlocked` — штатный
  исход рассылки. Разбивайте алерт по тегу ошибки.
- **Молчащий поллинг** — единственное, о чём метрики не скажут, потому что цикл
  опроса не умирает. Алертить надо на *остановку* `updatesTotal`, а не на ошибки.
