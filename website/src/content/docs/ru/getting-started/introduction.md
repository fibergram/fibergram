---
title: Введение
description: Что такое fibergram, чем он сознательно не является и кому подойдёт.
sidebar:
  order: 1
---

fibergram — это **Effect-нативный фреймворк для Telegram-ботов**. Хендлер здесь
не колбэк, получающий объект контекста, а `Effect<A, E, R>`:

```ts
import { Chat } from "@fibergram/core"
import { Effect } from "effect"

const handler = Effect.gen(function* () {
  const user = yield* UserRepo // требование, отражённое в R
  yield* Chat.reply(`Привет, ${user.name}`) // может упасть TelegramError — это в E
})
```

Всё остальное следует из этого одного решения:

| Понятие Effect | Что это значит для бота |
|---|---|
| `R` — требования | Репозитории, конфиг и клиенты — сервисы. Нет ни `ctx.session`, ни middleware, которая мутирует общий мешок. |
| `E` — типизированные ошибки | `RateLimited`, `BotBlocked`, `MessageNotModified` — значения в типе, а не строки, которые вы проверяете через `instanceof`. |
| `Layer` | Персистентность, транспорт и тестовые дублёры меняются проводкой, а не переписыванием хендлеров. |
| `Stream` | Long polling и вебхуки — оба продюсеры в одну очередь; диспетчер никогда не узнает, какой сработал. |
| `Schema` | Аргументы команд, payload кнопок и ответы Bot API декодируются и валидируются на краю. |

## Чем он не является

fibergram не пытается быть более приятным набором типов Bot API — они генерируются
механически из [официальной спеки](https://core.telegram.org/bots/api) и это самая
неинтересная часть проекта. Отличие — в **рантайм-интеграции с Effect**.

Сознательно вынесено за скобки:

- **Нет цепочки middleware.** Композиция — это композиция `Effect`, а сквозные
  аспекты выражаются через `Layer` и [трансформы](/ru/guides/transforms/).
- **Нет объекта `ctx`.** Что приходит на замену и почему — в
  [«Жизнь без `ctx`»](/ru/concepts/no-ctx/).
- **Нет движка виджетов.** Самый высокоуровневый примитив —
  [корутина](/ru/guides/conversations/); инлайн-меню живут в
  [отдельном пакете](/ru/guides/menus/) поверх неё.
- **Нет MTProto.** Это фреймворк над Bot API.

## Кому подойдёт

Вам будет комфортно, если вы уже пишете на Effect или готовы начать: фреймворк не
прячет Effect за фасадом, а документация исходит из того, что `Effect.gen`, `Layer`
и `Schema` вам знакомы. Если нет — предпосылка не этот сайт, а
[документация Effect](https://effect.website).

Если вы пришли из другого фреймворка:

| Что вы знаете | Ближайший аналог здесь |
|---|---|
| `bot.command("start", handler)` в grammY | `Router.command(Command.make("/start"), handler)` |
| `ctx.reply` в grammY | `Chat.reply` — свободная функция поверх амбиентного состояния апдейта |
| `@grammyjs/menu` | [`@fibergram/menu`](/ru/guides/menus/) |
| `@grammyjs/i18n` | [`@fibergram/i18n`](/ru/guides/i18n/) |
| FSM / `StatesGroup` в aiogram | [`Coroutine`](/ru/guides/conversations/) — автомат выводится, а не объявляется |
| middleware в aiogram | `Layer` для зависимостей, [`Transform`](/ru/guides/transforms/) для исходящих вызовов |

## Статус проекта

Все вехи вплоть до функционального паритета с grammY и aiogram закрыты. Осталась
релизная инфраструктура и этот сайт документации. Ограничение, которое определяет
всё остальное: fibergram таргетит **Effect v4**, который сейчас в бете и
[запинен точной версией](/ru/concepts/architecture/#волатильный-периметр).

Готовы? [Установите его](/ru/getting-started/installation/).
