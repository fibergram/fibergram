---
title: Durable-режим
description: Персистентное состояние диалогов, таймеры, переживающие рестарт, и пассивирующий цикл диспатча.
sidebar:
  order: 11
---

```bash
pnpm add @fibergram/durable
```

Код хендлеров не меняется, когда бот становится durable: durability — это смена
`Layer`. Концептуальная часть разобрана в
[Режимах персистентности](/ru/concepts/persistence/), эта страница — про механику.

## Персистентное состояние диалогов

```ts
import { DialogStore } from "@fibergram/core"
import { PersistedDialogStore } from "@fibergram/durable"
import { Layer } from "effect"
import { KeyValueStore } from "effect/unstable/persistence"

const durableStore: Layer.Layer<DialogStore.DialogStore> = PersistedDialogStore.layer.pipe(
  Layer.provide(KeyValueStore.layerMemory) // либо layerFileSystem / layerSql
)
```

Снапшоты кодируются в JSON под префиксом `"fibergram:dialog:"`. Подключите это
вместо `DialogStore.layerMemory`, и durable сразу станут все диалоги,
[сессии](/ru/guides/sessions/), [меню](/ru/guides/menus/) и
[выбранные локали](/ru/guides/i18n/) — они едут на одном порту.

`PersistedDialogStore.layerMemory` — самодостаточный вариант: durable в пределах
пассивации, но не настоящего рестарта. Он существует для тестов.

## Таймеры, переживающие рестарт

```ts
import { DialogAddress } from "@fibergram/core"
import { DurableTimer } from "@fibergram/durable"
import { Effect } from "effect"

const armNextTurn = (address: DialogAddress.DialogAddress) =>
  Effect.gen(function* () {
    const timer = yield* DurableTimer.DurableTimer
    yield* timer.schedule({ address, key: "next-turn", delay: "3 days" })
  })
```

`schedule` персистит **абсолютный дедлайн**, а не задержку. При старте каждый
ожидающий таймер перечитывается и перевзводится на оставшееся время; просроченные
срабатывают немедленно (с обрезкой до нуля). `cancel(address, key)` снимает
таймер, а планирование идемпотентно по `(address, key)` — взвести одно и то же
пробуждение дважды это no-op, а не два пробуждения.

Срабатывания приходят через колбэк `onFire`.

:::caution[At-least-once]
Падение между срабатыванием и удалением записи приведёт к повторному
срабатыванию. Держите `onFire` идемпотентным — это та же дисциплина, что нужна
`d.run` в [корутине](/ru/guides/conversations/#replay-модель).
:::

## Пассивация

`PassivatingEntityManager.run` — durable-двойник `Dispatcher.run`:

```ts
import { Dedup } from "@fibergram/core"
import { PassivatingEntityManager, PersistedDialogStore } from "@fibergram/durable"
import { Effect } from "effect"

const program = PassivatingEntityManager.run({ updates, dialog }).pipe(
  Effect.scoped,
  Effect.provide([PersistedDialogStore.layerMemory, Dedup.layerMemory])
)
```

Простаивающие диалоги вытесняются из памяти через `passivateAfter` (по умолчанию
5 минут) и рехидрируются из стора на следующем апдейте. Опции: `passivateAfter`,
`keyExtractor`, `onDefect`. Тестовые швы: `awaitIdle` и `activeCount`.

Эвикция **кооперативная**: адресный fiber меряет простой таймаутным `Queue.take`
и снимает себя сам, когда очередь пуста. Работающий хендлер никогда не прерывают.
Per-address latch, который эвикция не чистит, сериализует эвикцию и доставку,
поэтому апдейт, пришедший посреди рехидрации, не теряется.

## Тестирование durable-поведения

Всё работает от `Clock` из Effect:

```ts
import { TestClock } from "effect/testing"

yield * TestClock.adjust("10 minutes") // вызывает эвикцию, поджигает таймеры
```

Сравните `activeCount` до и после, чтобы доказать, что диалог вытеснился, затем
отправьте ещё один апдейт и проверьте, что состояние вернулось.

## Бэкенды

`PersistedDialogStore` написан против `KeyValueStore` из
`effect/unstable/persistence`:

| Слой | Для чего |
|---|---|
| `KeyValueStore.layerMemory` | тесты |
| `KeyValueStore.layerFileSystem(dir)` | однонодовые боты |
| `KeyValueStore.layerSql` | всё, где узлов больше одного |

В `@fibergram/durable` есть ещё `FileKeyValueStore` — файловый бэкенд без внешних
зависимостей.

## Ограничения

- **Состояние должно круглиться через JSON.** Для снапшотов корутин это верно; для
  decider'ов, написанных руками, проверьте.
- **Миграций схемы пока нет.** Состояние, записанное старой версией диалога,
  прочитается как есть. Версионируйте форму сами, если планируете её менять.
- **Сбои стора — defect'ы.** Канал ошибок порта — `never`, поэтому провал записи
  всплывает через супервизор на границе адреса, а не типизированной ошибкой в
  каждом хендлере. Один плохой апдейт теряет один ход, бот остаётся жив.

:::note[Этот пакет несёт бета-риск]
`@fibergram/durable` — единственный, кто трогает периметр persistence из
Effect v4, а связка с `@effect/workflow` / cluster — альтернативный бэкенд за теми
же портами, намеренно убранный с критического пути. Именно эта изоляция позволяет
`@fibergram/core` оставаться стабильным; см.
[волатильный периметр](/ru/concepts/architecture/#волатильный-периметр).
:::
