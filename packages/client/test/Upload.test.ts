import { it } from "@effect/vitest"
import { Effect, Layer, Ref, Stream } from "effect"
import { HttpClient, HttpClientResponse } from "effect/unstable/http"
import { describe, expect } from "vitest"

import { InputFile, TelegramClient } from "@fibergram/client"

import type { HttpClientRequest } from "effect/unstable/http"

type WebResponse = Parameters<typeof HttpClientResponse.fromWeb>[1]
const WebResponse = (globalThis as typeof globalThis & {
  Response: new (body: string, init?: { headers: Record<string, string> }) => WebResponse
}).Response

// Records each request so a test can assert how the seam encoded the body.
const recordingClient = (seen: Ref.Ref<ReadonlyArray<HttpClientRequest.HttpClientRequest>>) =>
  HttpClient.make((request, url) =>
    Effect.gen(function* () {
      yield* Ref.update(seen, (all) => [...all, request])
      const method = url.pathname.split("/").pop() ?? ""
      // Requests to /file/bot<token>/<path> download bytes; everything else is JSON RPC.
      if (url.pathname.includes("/file/bot")) {
        return HttpClientResponse.fromWeb(request, new WebResponse("file-bytes"))
      }
      const message = { message_id: 1, date: 0, chat: { id: 42, type: "private" } }
      const envelopes: Record<string, unknown> = {
        sendPhoto: { ok: true, result: message },
        sendMediaGroup: { ok: true, result: [message, message] },
        getFile: { ok: true, result: { file_id: "F", file_unique_id: "U", file_path: "photos/a.png" } }
      }
      const envelope = envelopes[method] ?? { ok: true, result: true }
      return HttpClientResponse.fromWeb(
        request,
        new WebResponse(JSON.stringify(envelope), { headers: { "content-type": "application/json" } })
      )
    })
  )

const withRecorder = Effect.gen(function* () {
  const seen = yield* Ref.make<ReadonlyArray<HttpClientRequest.HttpClientRequest>>([])
  const layer = TelegramClient.layerToken({ token: "TEST" }).pipe(
    Layer.provide(Layer.succeed(HttpClient.HttpClient, recordingClient(seen)))
  )
  return { seen, layer }
})

describe("multipart upload seam", () => {
  it.effect("switches to multipart/form-data when a payload carries an uploaded file", () =>
    Effect.gen(function* () {
      const { layer, seen } = yield* withRecorder

      yield* Effect.gen(function* () {
        const tg = yield* TelegramClient.TelegramClient
        yield* tg.sendPhoto({
          chatId: 42,
          photo: InputFile.fromBytes(new Uint8Array([1, 2, 3]), { filename: "a.png", contentType: "image/png" }),
          caption: "hi"
        })
      }).pipe(Effect.provide(layer))

      const [request] = yield* Ref.get(seen)
      expect(request?.body._tag).toBe("FormData")
      if (request?.body._tag !== "FormData") throw new Error("expected FormData body")
      const fd = request.body.formData
      expect(fd.get("chat_id")).toBe("42")
      expect(fd.get("caption")).toBe("hi")
      // The file field references the attached part, and the part is a Blob.
      expect(fd.get("photo")).toBe("attach://file0")
      const part = fd.get("file0")
      expect(part).toBeInstanceOf(Blob)
      expect(yield* Effect.promise(() => (part as Blob).text())).toBe("")
    }))

  it.effect("keeps a URL input file inline as JSON (no multipart)", () =>
    Effect.gen(function* () {
      const { layer, seen } = yield* withRecorder

      yield* Effect.gen(function* () {
        const tg = yield* TelegramClient.TelegramClient
        yield* tg.sendPhoto({ chatId: 42, photo: InputFile.fromUrl("https://example.com/a.png") })
      }).pipe(Effect.provide(layer))

      const [request] = yield* Ref.get(seen)
      expect(request?.body._tag).toBe("Uint8Array")
      if (request?.body._tag !== "Uint8Array") throw new Error("expected JSON body")
      const json = JSON.parse(new TextDecoder().decode(request.body.body)) as { photo: string }
      expect(json.photo).toBe("https://example.com/a.png")
    }))

  it.effect("wires files nested inside a media group through attach://", () =>
    Effect.gen(function* () {
      const { layer, seen } = yield* withRecorder

      yield* Effect.gen(function* () {
        const tg = yield* TelegramClient.TelegramClient
        yield* tg.sendMediaGroup({
          chatId: 42,
          media: [
            { type: "photo", media: InputFile.fromBytes(new Uint8Array([1]), { filename: "1.png" }) },
            { type: "photo", media: InputFile.fromBytes(new Uint8Array([2]), { filename: "2.png" }) }
          ]
        })
      }).pipe(Effect.provide(layer))

      const [request] = yield* Ref.get(seen)
      if (request?.body._tag !== "FormData") throw new Error("expected FormData body")
      const fd = request.body.formData
      const media = JSON.parse(fd.get("media") as string) as ReadonlyArray<{ media: string }>
      expect(media.map((m) => m.media)).toEqual(["attach://file0", "attach://file1"])
      expect(fd.get("file0")).toBeInstanceOf(Blob)
      expect(fd.get("file1")).toBeInstanceOf(Blob)
    }))
})

describe("file download", () => {
  it.effect("resolves a file_id via getFile and streams its bytes", () =>
    Effect.gen(function* () {
      const { layer } = yield* withRecorder

      const bytes = yield* Effect.gen(function* () {
        const tg = yield* TelegramClient.TelegramClient
        const url = yield* tg.getFileUrl("F")
        expect(url).toBe("https://api.telegram.org/file/botTEST/photos/a.png")
        return yield* Stream.runCollect(tg.downloadFile("F"))
      }).pipe(Effect.provide(layer))

      const text = new TextDecoder().decode(new Uint8Array(bytes.flatMap((chunk) => [...chunk])))
      expect(text).toBe("file-bytes")
    }))
})
