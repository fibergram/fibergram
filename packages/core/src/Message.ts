/**
 * `Message` - pure read helpers over an incoming {@link module:BotApi.Message}: its
 * text (or caption), and its entities sliced back into the substrings they mark.
 * These back the text/entity matchers in {@link module:Router} (`hears`, `entity`)
 * and let a handler read the incoming message's entities directly.
 *
 * @since 0.1.0
 */
import { Option } from "effect"

import type { BotApi } from "@fibergram/client"

/**
 * The message an update carries for text matching: a new or edited message or
 * channel post. Business and callback messages are intentionally excluded - text
 * routing targets the ordinary message stream.
 *
 * @category combinators
 * @since 0.1.0
 */
export const of = (update: BotApi.Update): Option.Option<BotApi.Message> => {
  const message = update.message ??
    update.editedMessage ??
    update.channelPost ??
    update.editedChannelPost
  return Option.fromNullishOr(message)
}

/**
 * The text of a message: its `text`, or its media `caption` when there is no
 * text. `None` for a message that is neither.
 *
 * @example
 * import { Message } from "@fibergram/core"
 * import { Option } from "effect"
 *
 * const text = Message.text({
 *   updateId: 1,
 *   message: { messageId: 1, date: 0, chat: { id: 1, type: "private" }, text: "hello" }
 * })
 * Option.getOrNull(text) // "hello"
 *
 * @category combinators
 * @since 0.1.0
 */
export const text = (update: BotApi.Update): Option.Option<string> =>
  Option.flatMap(of(update), (message) => Option.fromNullishOr(message.text ?? message.caption))

/**
 * A parsed message entity paired with the substring it marks. `offset`/`length`
 * are UTF-16 code units (Telegram's convention, which matches JS string
 * indexing), so `text` is exactly `source.slice(offset, offset + length)`.
 *
 * @category models
 * @since 0.1.0
 */
export interface Entity {
  readonly entity: BotApi.MessageEntity
  readonly text: string
}

/**
 * Every entity of a message (from `entities` and caption `captionEntities`),
 * paired with the substring it marks. Returns an empty array when the message has
 * none.
 *
 * @example
 * import { Message } from "@fibergram/core"
 *
 * const found = Message.entitiesOf({
 *   messageId: 1,
 *   date: 0,
 *   chat: { id: 1, type: "private" },
 *   text: "see https://x.com",
 *   entities: [{ type: "url", offset: 4, length: 13 }]
 * })
 * found[0]?.text // "https://x.com"
 *
 * @category combinators
 * @since 0.1.0
 */
export const entitiesOf = (message: BotApi.Message): ReadonlyArray<Entity> => {
  const source = message.text ?? message.caption ?? ""
  const entities = message.entities ?? message.captionEntities ?? []
  return entities.map((entity) => ({
    entity,
    text: source.slice(entity.offset, entity.offset + entity.length)
  }))
}

/**
 * The entities of a message whose `type` matches `kind` (e.g. `"url"`,
 * `"email"`, `"hashtag"`, `"mention"`), each paired with its substring.
 *
 * @example
 * import { Message } from "@fibergram/core"
 *
 * const hashtags = Message.entitiesOfType({
 *   messageId: 1,
 *   date: 0,
 *   chat: { id: 1, type: "private" },
 *   text: "#a #b",
 *   entities: [{ type: "hashtag", offset: 0, length: 2 }, { type: "hashtag", offset: 3, length: 2 }]
 * }, "hashtag")
 * hashtags.map((e) => e.text) // ["#a", "#b"]
 *
 * @category combinators
 * @since 0.1.0
 */
export const entitiesOfType = (
  message: BotApi.Message,
  kind: string
): ReadonlyArray<Entity> => entitiesOf(message).filter(({ entity }) => entity.type === kind)
