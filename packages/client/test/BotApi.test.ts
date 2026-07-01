import { BotApi, TelegramError } from "@fibergram/client"
import { Duration, Schema } from "effect"
import { describe, expect, it } from "vitest"

describe("BotApi naming boundary (section 5.3)", () => {
  it("decodes snake_case wire fields into camelCase", () => {
    const update = Schema.decodeUnknownSync(BotApi.Update)({
      update_id: 7,
      message: {
        message_id: 3,
        date: 0,
        chat: { id: 42, type: "private" },
        from: { id: 1, is_bot: false, first_name: "Ada" },
        text: "hi",
        message_thread_id: 9
      }
    })

    expect(update.updateId).toBe(7)
    expect(update.message?.messageId).toBe(3)
    expect(update.message?.messageThreadId).toBe(9)
    expect(update.message?.from?.isBot).toBe(false)
    expect(update.message?.from?.firstName).toBe("Ada")
  })

  it("encodes camelCase params back into snake_case wire fields", () => {
    const encoded = Schema.encodeUnknownSync(BotApi.SendMessageParams)({
      chatId: 42,
      text: "yo",
      messageThreadId: 9,
      replyToMessageId: 3
    })

    expect(encoded).toEqual({
      chat_id: 42,
      text: "yo",
      message_thread_id: 9,
      reply_to_message_id: 3
    })
  })

  it("drops unknown fields for forward compatibility", () => {
    const update = Schema.decodeUnknownSync(BotApi.Update)({
      update_id: 1,
      some_future_field: { nested: true }
    })
    expect(update).toEqual({ updateId: 1 })
  })
})

describe("TelegramError.fromResponse (section 5.2)", () => {
  it("maps 429 to RateLimited carrying retry_after as a Duration", () => {
    const error = TelegramError.fromResponse("sendMessage", {
      errorCode: 429,
      description: "Too Many Requests",
      parameters: { retryAfter: 5 }
    })
    expect(error._tag).toBe("RateLimited")
    if (error._tag === "RateLimited") {
      expect(Duration.toSeconds(error.retryAfter)).toBe(5)
    }
  })

  it("maps a supergroup migration to ChatMigrated", () => {
    const error = TelegramError.fromResponse("sendMessage", {
      errorCode: 400,
      description: "Bad Request: group chat was upgraded to a supergroup chat",
      parameters: { migrateToChatId: -100123 }
    })
    expect(error._tag).toBe("ChatMigrated")
    if (error._tag === "ChatMigrated") {
      expect(error.newChatId).toBe(-100123)
    }
  })

  it("distinguishes BotBlocked from a generic Forbidden", () => {
    const blocked = TelegramError.fromResponse("sendMessage", {
      errorCode: 403,
      description: "Forbidden: bot was blocked by the user"
    })
    const forbidden = TelegramError.fromResponse("sendMessage", {
      errorCode: 403,
      description: "Forbidden: bot can't initiate conversation with a user"
    })
    expect(blocked._tag).toBe("BotBlocked")
    expect(forbidden._tag).toBe("Forbidden")
  })

  it("recognises MessageNotModified as its own tag", () => {
    const error = TelegramError.fromResponse("editMessageText", {
      errorCode: 400,
      description: "Bad Request: message is not modified"
    })
    expect(error._tag).toBe("MessageNotModified")
  })

  it("falls back to BadRequest with the error code", () => {
    const error = TelegramError.fromResponse("sendMessage", {
      errorCode: 400,
      description: "Bad Request: chat not found"
    })
    expect(error._tag).toBe("BadRequest")
    if (error._tag === "BadRequest") {
      expect(error.errorCode).toBe(400)
    }
  })
})
