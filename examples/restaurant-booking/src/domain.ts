/**
 * The domain layer: `User`, `Table`, and `Booking` models plus three
 * repositories exposed as Effect services.
 *
 * Each repository is a `Context.Service` (a stable **port**) whose default
 * `Layer` persists through the shared `KeyValueStore` (the swappable
 * **backend**). Handlers depend on the port and never see the storage — the
 * fibergram design invariant, "the volatile backend hides behind a port", at
 * the application level.
 *
 * Infrastructure faults (a failed disk write) become defects here, so the
 * repository interfaces speak only in domain terms: the one thing a caller must
 * handle is {@link NoTablesAvailable}.
 */
import { Array as Arr, Context, Data, Effect, Layer, Option, Schema } from "effect"
import { KeyValueStore } from "effect/unstable/persistence"

// --- Models -----------------------------------------------------------------

/** A registered guest, keyed by their Telegram id within a chat. */
export const User = Schema.Struct({
  userId: Schema.Number,
  chatId: Schema.Number,
  name: Schema.String,
  phone: Schema.String,
  /** Empty string when the guest skipped it. */
  email: Schema.String
})
export type User = Schema.Schema.Type<typeof User>

/** A physical table in the restaurant. */
export const Table = Schema.Struct({
  id: Schema.Number,
  number: Schema.Number,
  capacity: Schema.Number,
  location: Schema.String
})
export type Table = Schema.Schema.Type<typeof Table>

/** A reservation status. */
export const BookingStatus = Schema.Literals(["confirmed", "pending", "cancelled"])
export type BookingStatus = Schema.Schema.Type<typeof BookingStatus>

/**
 * A confirmed reservation. Table number/capacity are denormalized onto the
 * booking so the "my bookings" view needs no join.
 */
export const Booking = Schema.Struct({
  id: Schema.Number,
  userId: Schema.Number,
  tableId: Schema.Number,
  tableNumber: Schema.Number,
  capacity: Schema.Number,
  location: Schema.String,
  date: Schema.String,
  time: Schema.String,
  guests: Schema.Number,
  specialRequests: Schema.String,
  status: BookingStatus,
  confirmationCode: Schema.String
})
export type Booking = Schema.Schema.Type<typeof Booking>

/** Raised when no table can seat the party at the requested slot. */
export class NoTablesAvailable extends Data.TaggedError("NoTablesAvailable")<{
  readonly guests: number
  readonly date: string
  readonly time: string
}> {}

// --- Small JSON-over-KeyValueStore helpers ----------------------------------

const IdList = Schema.Array(Schema.Number)

const readJson = <A, I>(
  kvs: KeyValueStore.KeyValueStore,
  schema: Schema.Codec<A, I>,
  key: string
): Effect.Effect<Option.Option<A>> =>
  Effect.flatMap(kvs.get(key), (raw) =>
    raw === undefined
      ? Effect.succeedNone
      : Schema.decodeUnknownEffect(Schema.fromJsonString(schema))(raw).pipe(Effect.map(Option.some))).pipe(
    Effect.orDie
  )

const writeJson = <A, I>(
  kvs: KeyValueStore.KeyValueStore,
  schema: Schema.Codec<A, I>,
  key: string,
  value: A
): Effect.Effect<void> =>
  Schema.encodeUnknownEffect(Schema.fromJsonString(schema))(value).pipe(
    Effect.flatMap((raw) => kvs.set(key, raw)),
    Effect.orDie
  )

const readIds = (kvs: KeyValueStore.KeyValueStore, key: string) =>
  readJson(kvs, IdList, key).pipe(Effect.map(Option.getOrElse((): ReadonlyArray<number> => [])))

// --- UserRepo ---------------------------------------------------------------

export interface UserRepoService {
  readonly find: (chatId: number, userId: number) => Effect.Effect<Option.Option<User>>
  readonly upsert: (user: User) => Effect.Effect<void>
}

export class UserRepo extends Context.Service<UserRepo, UserRepoService>()(
  "restaurant-booking/UserRepo"
) {}

const userKey = (chatId: number, userId: number) => `user:${chatId}:${userId}`

export const UserRepoLayer: Layer.Layer<UserRepo, never, KeyValueStore.KeyValueStore> = Layer.effect(
  UserRepo,
  Effect.gen(function* () {
    const kvs = yield* KeyValueStore.KeyValueStore
    return UserRepo.of({
      find: (chatId, userId) => readJson(kvs, User, userKey(chatId, userId)),
      upsert: (user) => writeJson(kvs, User, userKey(user.chatId, user.userId), user)
    })
  })
)

// --- TableRepo --------------------------------------------------------------

export interface TableRepoService {
  readonly all: Effect.Effect<ReadonlyArray<Table>>
}

export class TableRepo extends Context.Service<TableRepo, TableRepoService>()(
  "restaurant-booking/TableRepo"
) {}

const tableKey = (id: number) => `table:${id}`
const TABLE_INDEX = "table:index"

/** The dining room, seeded on first run. */
const seedTables: ReadonlyArray<Table> = [
  { id: 1, number: 1, capacity: 2, location: "By the window" },
  { id: 2, number: 2, capacity: 2, location: "Main hall" },
  { id: 3, number: 3, capacity: 4, location: "Main hall" },
  { id: 4, number: 4, capacity: 4, location: "Terrace" },
  { id: 5, number: 5, capacity: 6, location: "Main hall" },
  { id: 6, number: 6, capacity: 6, location: "Terrace" }
]

export const TableRepoLayer: Layer.Layer<TableRepo, never, KeyValueStore.KeyValueStore> = Layer
  .effect(
    TableRepo,
    Effect.gen(function* () {
      const kvs = yield* KeyValueStore.KeyValueStore

      const load = readIds(kvs, TABLE_INDEX).pipe(
        Effect.flatMap((ids) =>
          Effect.forEach(ids, (id) => readJson(kvs, Table, tableKey(id)))
        ),
        Effect.map((options) => Arr.getSomes(options))
      )

      // Seed once, idempotently: only when the table index is empty.
      const existing = yield* readIds(kvs, TABLE_INDEX)
      if (existing.length === 0) {
        yield* Effect.forEach(seedTables, (table) => writeJson(kvs, Table, tableKey(table.id), table))
        yield* writeJson(kvs, IdList, TABLE_INDEX, seedTables.map((t) => t.id))
      }

      return TableRepo.of({ all: load })
    })
  )

// --- BookingRepo ------------------------------------------------------------

export interface BookingRepoService {
  /** Tables that can seat `guests` and are free at the given slot. */
  readonly availableTables: (
    guests: number,
    date: string,
    time: string
  ) => Effect.Effect<ReadonlyArray<Table>>
  /** Reserve the first available table, or fail with {@link NoTablesAvailable}. */
  readonly create: (input: {
    readonly userId: number
    readonly date: string
    readonly time: string
    readonly guests: number
    readonly specialRequests: string
  }) => Effect.Effect<Booking, NoTablesAvailable>
  readonly listForUser: (userId: number) => Effect.Effect<ReadonlyArray<Booking>>
}

export class BookingRepo extends Context.Service<BookingRepo, BookingRepoService>()(
  "restaurant-booking/BookingRepo"
) {}

const bookingKey = (id: number) => `booking:${id}`
const userBookingsKey = (userId: number) => `booking:index:${userId}`
const slotKey = (date: string, time: string) => `slot:${date}:${time}`
const BOOKING_COUNTER = "booking:counter"

const confirmationCode = (id: number): string =>
  `BK${id.toString().padStart(4, "0")}${Math.floor(Math.random() * 900 + 100)}`

export const BookingRepoLayer: Layer.Layer<
  BookingRepo,
  never,
  KeyValueStore.KeyValueStore | TableRepo
> = Layer.effect(
  BookingRepo,
  Effect.gen(function* () {
    const kvs = yield* KeyValueStore.KeyValueStore
    const tables = yield* TableRepo

    const availableTables = (guests: number, date: string, time: string) =>
      Effect.gen(function* () {
        const all = yield* tables.all
        const booked = yield* readIds(kvs, slotKey(date, time))
        return all.filter((t) => t.capacity >= guests && !booked.includes(t.id))
      })

    const nextId = Effect.gen(function* () {
      const current = yield* readJson(kvs, Schema.Number, BOOKING_COUNTER).pipe(
        Effect.map(Option.getOrElse(() => 0))
      )
      const id = current + 1
      yield* writeJson(kvs, Schema.Number, BOOKING_COUNTER, id)
      return id
    })

    return BookingRepo.of({
      availableTables,
      create: (input) =>
        Effect.gen(function* () {
          const free = yield* availableTables(input.guests, input.date, input.time)
          const table = Arr.head(free)
          if (Option.isNone(table)) {
            return yield* new NoTablesAvailable({
              guests: input.guests,
              date: input.date,
              time: input.time
            })
          }
          const chosen = table.value
          const id = yield* nextId
          const booking: Booking = {
            id,
            userId: input.userId,
            tableId: chosen.id,
            tableNumber: chosen.number,
            capacity: chosen.capacity,
            location: chosen.location,
            date: input.date,
            time: input.time,
            guests: input.guests,
            specialRequests: input.specialRequests,
            status: "confirmed",
            confirmationCode: confirmationCode(id)
          }
          yield* writeJson(kvs, Booking, bookingKey(id), booking)

          const userIndex = yield* readIds(kvs, userBookingsKey(input.userId))
          yield* writeJson(kvs, IdList, userBookingsKey(input.userId), [...userIndex, id])

          const slot = yield* readIds(kvs, slotKey(input.date, input.time))
          yield* writeJson(kvs, IdList, slotKey(input.date, input.time), [...slot, chosen.id])

          return booking
        }),
      listForUser: (userId) =>
        readIds(kvs, userBookingsKey(userId)).pipe(
          Effect.flatMap((ids) => Effect.forEach(ids, (id) => readJson(kvs, Booking, bookingKey(id)))),
          Effect.map((options) => Arr.getSomes(options))
        )
    })
  })
)

/** All repositories, wired over whatever `KeyValueStore` is provided. */
export const layer: Layer.Layer<
  UserRepo | TableRepo | BookingRepo,
  never,
  KeyValueStore.KeyValueStore
> = Layer.mergeAll(
  UserRepoLayer,
  TableRepoLayer,
  BookingRepoLayer.pipe(Layer.provide(TableRepoLayer))
)
