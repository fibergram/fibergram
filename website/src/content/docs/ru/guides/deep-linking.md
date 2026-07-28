---
title: Диплинки
description: Типизированные ссылки t.me/<bot>?start=<payload> — рефералы, приглашения и «открой этот элемент».
sidebar:
  order: 2
---

Telegram позволяет ссылке на `/start` нести до 64 символов из `A-Za-z0-9_-`.
`StartLink` относится к этому бюджету так же, как
[`CallbackData`](/ru/guides/callback-data/) — к своим 64 байтам: как к паре
encode/decode над `Schema`, а не к строке, которую вы разбираете руками.

## Собрать кодек

```ts
import { StartLink } from "@fibergram/core"
import { Schema } from "effect"

const Invite = StartLink.make("mybot", Schema.Struct({ ref: Schema.String }))
```

Значение кодируется в JSON, затем в `base64url` — который как раз использует ровно
тот набор символов, что разрешает Telegram.

## Сделать ссылку

```ts
const link = yield * Invite.encode({ ref: "ada" })
// → "https://t.me/mybot?start=eyJyZWYiOiJhZGEifQ"
```

`encode` падает `StartLinkTooLong`, если payload не помещается. Это типизированная
ошибка, поэтому слишком длинный реферальный код ловится в месте вызова, а не
превращается в ссылку, которая молча обрезалась.

Есть ещё две формы: `encodeGroup` строит `?startgroup=` (добавить бота в группу),
`encodeApp` — `?startapp=` (открыть Mini App). `encodePayload` отдаёт сырой payload
без URL.

## Обработать переход

```ts
import { Chat, Router } from "@fibergram/core"

const router = Router.make(
  Router.start(Invite, ({ ref }) => Chat.reply(`Вас пригласил ${ref}`)),
  Router.command(start, () => Chat.reply("Добро пожаловать!"))
)
```

`Router.start` декодирует за вас, поэтому `ref` в хендлере — это `string`, а
`StartLinkMalformed` появляется в `E` роута: кто-то, правящий URL руками, — случай,
который видно в типе.

**Простой `/start` без payload не матчится** `Router.start`. Поэтому в примере
следом смонтирован обычный роут `command`: те, кто открыл бота обычным способом,
всё равно получат приветствие.

## Типичные формы

```ts
// атрибуция реферала
StartLink.make("mybot", Schema.Struct({ ref: Schema.String }))

// диплинк на элемент
StartLink.make("mybot", Schema.Struct({ item: Schema.Number }))

// тегированный union видов ссылок в одном роуте
StartLink.make(
  "mybot",
  Schema.Union([
    Schema.Struct({ _tag: Schema.Literal("invite"), by: Schema.Number }),
    Schema.Struct({ _tag: Schema.Literal("item"), id: Schema.Number })
  ])
)
```

Держите payload компактным: 64 символа base64url — это примерно 48 байт JSON,
поэтому короткие имена полей важны. `{"r":"ada"}` стоит втрое меньше, чем
`{"referrer":"ada"}`.

:::caution[Диплинк публичен]
URL может расшарить кто угодно и сконструировать тоже кто угодно. Относитесь к
декодированному payload как к недоверенному вводу: он говорит, *что заявляет
ссылка*, а не кто по ней перешёл. Идентичность берите из `Chat.from` и никогда не
зашивайте выдачу прав в payload `?start=`.
:::
