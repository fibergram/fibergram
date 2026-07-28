---
title: Установка
description: Как поставить fibergram, выбрать нужные пакеты и получить токен бота.
sidebar:
  order: 2
---

## Требования

- **Node.js ≥ 20** (или любой ESM-рантайм — Bun, Deno и workerd тоже работают:
  вебхук-транспорт говорит на веб-стандартных `Request`/`Response`).
- **`effect` v4**. fibergram собран против беты и пинит точную версию; ваше
  приложение должно резолвить **ту же самую**, иначе теги `Context` из Effect не
  совпадут.

:::caution[Пините `effect`]
Ставьте `effect` без каретки и держите версию в такт с той, что объявляет
fibergram. Две копии `effect` в одном дереве зависимостей — самая частая причина
ошибки «сервис не найден» в рантайме.
:::

## Установка

```bash
pnpm add @fibergram/core effect
```

`@fibergram/core` — один пакет с пятью subpath-модулями, отдельно `client`,
`polling`, `testing` и `ui` ставить не нужно:

| Импорт | Что там живёт |
|---|---|
| `@fibergram/core` | `Dialog`, `Router`, `Dispatcher`, `Coroutine`, `Chat`, `Session`, `Command`, `CallbackData`, `StartLink` |
| `@fibergram/core/client` | `TelegramClient`, сгенерированные типы Bot API, `Transform`, `InputFile`, `WebApp` |
| `@fibergram/core/polling` | long polling с управлением оффсетом |
| `@fibergram/core/testing` | записывающий дублёр `TestTelegram`, синтетические `Updates` |
| `@fibergram/core/ui` | `InlineKeyboard`, `Keyboard`, `Fmt`, `Emoji`, `Reaction` |

Пакеты-спутники ставьте по мере надобности:

```bash
pnpm add @fibergram/webhook       # вебхук-ингест, адаптеры Express/Fastify
pnpm add @fibergram/menu          # инлайн-меню с состоянием
pnpm add @fibergram/i18n          # локализация на Fluent (.ftl)
pnpm add @fibergram/durable       # персистентные диалоги, durable-таймеры, пассивация
pnpm add @fibergram/chat-members  # кэш членства в чатах
```

Почему граница пакетов проведена именно так — и почему `client` **не** отдельный
пакет — разбирается в [Архитектуре](/ru/concepts/architecture/).

## Получите токен

Напишите [@BotFather](https://t.me/BotFather), отправьте `/newbot` и сохраните
токен. По умолчанию fibergram читает его из переменной окружения `BOT_TOKEN` через
`Config` из Effect:

```bash
export BOT_TOKEN="123456:ABC-DEF..."
```

```ts
import { TelegramClient } from "@fibergram/core/client"

TelegramClient.layer // читает BOT_TOKEN через Config.redacted
```

Чтобы передать токен явно — несколько ботов в одном процессе или токен из вашего
хранилища секретов:

```ts
import { TelegramClient } from "@fibergram/core/client"

const layer = TelegramClient.layerToken({ token: "123456:ABC-DEF..." })
```

Токен — это `Redacted<string>`, поэтому он не утечёт в логи и сообщения об
ошибках, даже если вы напечатаете конфигурацию клиента.

## Подключите HTTP-клиент

fibergram не тащит с собой реализацию HTTP: `TelegramClient` построен на
`HttpClient` из Effect, так что бэкенд выбираете вы:

```ts
import { TelegramClient } from "@fibergram/core/client"
import { Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

const layer = TelegramClient.layer.pipe(Layer.provide(FetchHttpClient.layer))
```

`FetchHttpClient.layer` работает везде, где есть `fetch`. Для прокси, кастомных
агентов или пула соединений подставьте другой `HttpClient`-слой.

## Настройка TypeScript

fibergram — **только ESM**, а `.d.ts` собраны под современный резолвинг. В
`tsconfig.json` нужно:

```jsonc
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    // от этих флагов зависит машинерия типов Effect:
    "exactOptionalPropertyTypes": true,
    "strictNullChecks": true
  }
}
```

Настоятельно рекомендуем поставить в dev-зависимости
[`@effect/language-service`](https://github.com/Effect-TS/language-service): он
превращает ошибки типов Effect в читаемые. Сам репозиторий fibergram использует
именно его.

Дальше — [первый бот](/ru/getting-started/your-first-bot/).
