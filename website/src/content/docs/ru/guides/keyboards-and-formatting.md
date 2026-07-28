---
title: Клавиатуры и форматирование
description: Инлайн- и reply-клавиатуры, форматирование деревом сущностей через Fmt, типизированные эмодзи и реакции.
sidebar:
  order: 3
---

Всё с этой страницы живёт в `@fibergram/core/ui`.

## Инлайн-клавиатуры

Иммутабельный билдер: кнопки добавляются в текущий ряд, `row()` начинает новый:

```ts
import { Chat } from "@fibergram/core"
import { InlineKeyboard } from "@fibergram/core/ui"
import { Effect } from "effect"

const handler = Effect.gen(function* () {
  const keyboard = InlineKeyboard.empty.text("Да", "yes").text("Нет", "no")
  yield* Chat.reply("Подтверждаете?", { replyMarkup: yield* InlineKeyboard.build(keyboard) })
})
```

`build` — это `Effect`, потому что кодирование типизированных payload может упасть;
см. ниже.

Виды кнопок: `text`, `data` (типизированный payload), `url`, `webApp`, `login`,
`switchInline`, `switchInlineCurrent`, `copyText`, `pay`. Раскладка: `row()` для
ручного переноса или `adjust(...sizes)`, чтобы переформатировать всё сразу —
последний размер повторяется, так что `.adjust(2)` даёт две колонки.

### Типизированные payload

Вместо строкового `callback_data` отдайте билдеру кодек:

```ts
import { CallbackData } from "@fibergram/core"
import { Schema } from "effect"

const Vote = CallbackData.make("vote", Schema.Struct({ id: Schema.Number }))

const keyboard = InlineKeyboard.empty.data("👍", Vote, { id: 1 }).data("👎", Vote, { id: 2 })
```

`InlineKeyboard.build` кодирует их и падает `CallbackDataTooLong`, если payload
превысил 64 байта Telegram, а `CallbackStore` для перелива не подключён.
Подробности — в [Callback data](/ru/guides/callback-data/).

## Reply-клавиатуры

```ts
import { Keyboard } from "@fibergram/core/ui"

const keyboard = Keyboard.empty
  .text("Да")
  .text("Нет")
  .row()
  .requestContact("Поделиться номером")
  .resized()
  .oneTime()

yield * Chat.reply("Выберите", { replyMarkup: yield* Keyboard.build(keyboard) })
```

Ещё доступны `requestLocation`, `requestPoll`, `requestUsers`, `requestChat`,
`webApp`. Флаги: `resized()`, `oneTime()`, `adjust(...)`. Убрать клавиатуру —
отправить `Keyboard.remove()`.

:::note[Reply-клавиатуры и визарды]
Нажатая кнопка reply-клавиатуры приходит обычным текстовым сообщением. Именно это
позволяет им сочетаться с [корутинами](/ru/guides/conversations/): `d.prompt`
декодирует подпись как любой другой ответ, поэтому шаг визарда с клавиатурой не
требует отдельной поддержки.
:::

## Форматирование без `parse_mode`

`parse_mode` — грабли: каждую пользовательскую строку надо экранировать, и одна
забытая правка превращает имя в разметку. `Fmt` вместо этого строит сообщение
**деревом сущностей**, считая смещения по ходу. Ничего не парсится — значит, нечего
экранировать:

```ts
import { Fmt } from "@fibergram/core/ui"

const message = Fmt.fmt`Добро пожаловать, ${Fmt.bold("Ада")}! Читайте ${Fmt.link("документацию", "https://effect.website")}.`
message.text // "Добро пожаловать, Ада! Читайте документацию." — плюс типизированные сущности
```

```ts
yield * Chat.reply(message)
```

Доступные разметки: `bold`, `italic`, `underline`, `strikethrough`, `spoiler`,
`code`, `pre`, `link`, `mention`, `customEmoji`, `blockquote`,
`expandableBlockquote`. Композиция — через `Fmt.concat` и `Fmt.join`.

Вложенность работает ожидаемо, а пользовательский ввод, подставленный в шаблон
`fmt`, — это *текст*, а не разметка:

```ts
Fmt.fmt`Привет, ${Fmt.bold(userSuppliedName)}` // безопасно при любом значении
```

## Типизированные эмодзи

```ts
import { Emoji } from "@fibergram/core/ui"

Emoji.emoji`Поздравляем ${"tada"} получилось ${"fire"}`
// "Поздравляем 🎉 получилось 🔥"
```

Имена проверяются на этапе компиляции — опечатка становится ошибкой типа, а не
буквальным `:tada:`, улетевшим пользователю. Функциональная форма — `Emoji.get(name)`.

## Реакции

```ts
import { Reaction } from "@fibergram/core/ui"

yield * Chat.react(Reaction.thumbsUp)
```

Для частых есть именованные константы (`thumbsUp`, `thumbsDown`, `heart`, `fire`,
`clap`, …); остальное покрывает `Reaction.of(emoji)`, а
`Reaction.isReactionEmoji` сужает произвольную строку.

Чтобы *обработать* входящую реакцию, заведите роут:

```ts
Router.reaction("👍", (reaction) => Effect.log(`лайк от ${reaction.user?.firstName ?? "кого-то"}`))
```

Хендлер получает гидратированную реакцию с уже посчитанным диффом добавленных и
снятых — Telegram присылает списки «до» и «после», работать с которыми напрямую
почти никогда не хочется.

## Отправка других медиа

У `Chat` есть вариант `reply` на каждый тип медиа — `replyPhoto`, `replyDocument`,
`replyVideo`, `replyAudio`, `replyVoice`, `replyAnimation`, `replySticker`,
`replyLocation`, `replyContact`, `replyPoll`, `replyDice`, `replyMediaGroup`, — и
все принимают одни и те же формы `InputFile`:

```ts
import { InputFile } from "@fibergram/core/client"

yield * Chat.replyPhoto(InputFile.fromPath("./chart.png"), { caption: "За неделю" })
```

`InputFile` принимает путь, байты, стрим или URL и сам переключает запрос на
multipart. Строку `file_id`, уже известную Telegram, он пропускает как есть.
