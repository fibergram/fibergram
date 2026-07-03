---
"@fibergram/core": minor
"@fibergram/webhook": patch
"@fibergram/durable": patch
---

**Package consolidation + M9 (Keyboards & formatting).**

Packaging: `@fibergram/client`, `@fibergram/polling`, `@fibergram/testing` and the new UI surface are consolidated into **`@fibergram/core`** as subpath exports (design §6, revised D7 — mirrors effect-smol's one-package/many-modules layout). Only `@fibergram/webhook` and `@fibergram/durable` remain separate packages (the concerns with their own change axis). Import map:

- `@fibergram/core` — invariant model (unchanged)
- `@fibergram/core/client` — `TelegramClient`, `BotApi`, `TelegramError`, `InputFile`, `Multipart`
- `@fibergram/core/polling` — `Polling`
- `@fibergram/core/testing` — `TestTelegram`, `Updates`
- `@fibergram/core/ui` — `InlineKeyboard`, `Keyboard`, `Fmt`, `Emoji`, `Reaction`

M9 (`@fibergram/core/ui`):
- `InlineKeyboard` — immutable builder with typed `CallbackData` buttons (`.data`); `build` → `InlineKeyboardMarkup` (effectful).
- `Keyboard` — reply-keyboard builder + `remove()`.
- `Fmt` — entity-tree formatter (`fmt` tagged template + nodes), `{ text, entities }`, no `parse_mode`.
- `Emoji` — compiler-checked emoji tagged template.
- `Reaction` — closed reaction-emoji union + `of`/`isReactionEmoji`.

`@fibergram/core`: `Chat.reply`/`editLast`/captions accept pre-formatted `{ text, entities }` (`Chat.Text`/`Chat.FormattedText`), so a `Fmt` result feeds them directly.

`@fibergram/webhook` / `@fibergram/durable`: repointed `@fibergram/client` → `@fibergram/core/client` (and `@fibergram/testing` → `@fibergram/core/testing`); dropped the `@fibergram/client` dependency.
