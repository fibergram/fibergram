---
title: Трансформы
description: Перехватчики исходящих вызовов Bot API — дефолты, пейсинг под flood-лимиты, автоматический ретрай и свои собственные.
sidebar:
  order: 13
---

Каждый метод Bot API проходит через единственный шов `call`. **Трансформ**
оборачивает этот шов, поэтому поведение на весь бот настраивается один раз на краю,
а не в каждом месте вызова.

```ts
import { TelegramClient, Transform } from "@fibergram/core/client"
import { Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

const layer = TelegramClient.transformed(
  Transform.defaults({ parseMode: "HTML" }),
  Transform.throttle(),
  Transform.autoRetry(),
  Transform.logging,
  Transform.metrics
).pipe(Layer.provide(FetchHttpClient.layer))
```

Трансформы композируются слева направо: первый в списке — самый внешний.

## Встроенные

### `defaults(values)`

Подставляет поля на весь бот в каждый вызов — но только туда, где схема параметров
метода их действительно объявляет, и только если вызывающий их не указал:

```ts
Transform.defaults({ parseMode: "HTML" })
```

`parseMode` дойдёт до `sendMessage` и молча пропустится для `getMe`. Явный
`parseMode` в месте вызова никогда не перетирается.

:::tip
Если вы вообще тянетесь к `parseMode`, посмотрите на
[`Fmt`](/ru/guides/keyboards-and-formatting/#форматирование-без-parse_mode):
деревья сущностей не требуют экранирования, и пользовательский ввод их не сломает.
:::

### `throttle(options?)`

Держит темп исходящих под опубликованными flood-лимитами Telegram: 30 сообщений в
секунду глобально, 1 в секунду на чат, 20 в минуту на группу. Любой из них
переопределяется через `global`, `perChat`, `group`.

Пейсинг работает на `Effect.sleep`, поэтому им управляет `TestClock` — можно
проверить, что рассылка соблюдает лимиты, не дожидаясь реальных секунд.

### `autoRetry(options?)`

Прозрачно ретраит `429`, соблюдая `retry_after`. Опции: `maxAttempts`, `maxDelay`.

Это двойник [`Retry.retryRateLimited`](/ru/concepts/errors/#ретрай-по-семантике-telegram)
на весь бот, тогда как комбинатор применяется к одному эффекту. Трансформ — для
общей политики, комбинатор — когда одному конкретному вызову нужно другое
обращение.

### `logging`

Открывает span `telegram.<method>` на вызов и логирует вызовы и сбои, подключая
исходящий трафик к амбиентным `Tracer` и `Logger`. No-op, если ни того, ни другого
не подключено.

### `metrics`

Пишет `fibergram_api_calls_total`, `fibergram_api_errors_total` и гистограмму
`fibergram_api_call_duration`. Читаются через `Metric.value` по тем же именам. См.
[Наблюдаемость](/ru/guides/observability/).

## Свой трансформ

`Transform.make` принимает функцию над транспортным вызовом:

```ts
import { Transform } from "@fibergram/core/client"
import { Effect } from "effect"

const trace = Transform.make(
  (next) => (method, paramsSchema, resultSchema, params) =>
    Effect.tap(next(method, paramsSchema, resultSchema, params), () => Effect.log(`вызван ${method}`))
)
```

Типы `method` и `params` приходят прямо из сгенерированных схем, поэтому трансформ
может смотреть и переписывать типизированные параметры, а не безымянный мешок.

Полезные формы, которые так строятся:

- **Квоты на чат** сверх того, что моделирует `throttle`.
- **Редактирование** пользовательского контента до того, как он дойдёт до логгера.
- **Запись** в файл фикстур для реплея в тестах.
- **Фичефлаги**, превращающие отправку в no-op на стенде.

Композируются через `Transform.identity`, `Transform.compose` и
`Transform.applyAll`.

## Почему это, а не middleware

Перехват исходящих — действительно сквозной аспект, и это единственное место, где
fibergram его принимает. Отличие от общей цепочки middleware в том, что он
**привязан к одному шву**: трансформ может только наблюдать и менять вызовы Bot
API. Он не умеет ни вносить сервисы, ни мутировать объект контекста, ни менять,
какой хендлер сработает, — а значит, не может стать местом, где прячется
поведение.

Его входящий двойник — вообще не трансформ, а
[опция роутера](/ru/concepts/routing/#входящий-рейт-лимит): `rateLimit` у
`toDialog`.

## Тестирование

[`TestTelegram`](/ru/guides/testing/) сам построен на этом шве — поэтому он и
захватывает *каждый* вызов без заглушек на каждый метод. Тестируемый трансформ
композируется над дублёром так же, как над настоящим клиентом.
