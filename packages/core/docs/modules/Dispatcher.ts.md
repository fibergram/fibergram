---

title: Dispatcher.ts
nav_order: 6
parent: Modules
---

## Dispatcher overview

`Dispatcher` - the seam between ingestion and dialogs (design section 7). It reads
the transport-agnostic `Stream<Update>` and feeds each update into an
{@link module:EntityManager.EntityManager}. Polling and webhook are both just
producers into the queue this stream drains, so the dispatcher never knows
which transport it is on.

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [run](#run)
- [models](#models)
  - [RunOptions (interface)](#runoptions-interface)

---

# constructors

## run

Runs the dispatch loop: consume `updates` sequentially, routing each into the
dialog's mailboxes. Blocks for as long as the stream produces (i.e. forever,
for a live bot); for a finite stream it returns once all accepted updates have
been fully processed.

Requires the dialog's `R`, a {@link DialogStore}, a {@link Dedup} and a
`Scope` owning the address fibers - provided once at the edge (design section 5.1).

**Signature**

```ts
export declare const run: <State, Event, E, R>(
  options: RunOptions<State, Event, E, R>
) => Effect.Effect<void, never, R | DialogStore | Dedup | Scope.Scope>
```

**Example**

```ts
import { Dispatcher, Dialog, DialogStore, Dedup } from "@fibergram/core"
import { Effect, Stream } from "effect"

const echo = Dialog.stateless({ onUpdate: () => Effect.void })

const program = Dispatcher.run({
  updates: Stream.empty,
  dialog: echo
}).pipe(Effect.scoped, Effect.provide([DialogStore.layerMemory, Dedup.layerMemory]))
```

Added in v0.1.0

# models

## RunOptions (interface)

Options for {@link run}.

**Signature**

```ts
export interface RunOptions<State, Event, E, R> {
  /** The ingestion stream (from polling/webhook, via a shared `Queue`). */
  readonly updates: Stream.Stream<BotApi.Update>
  /** The dialog handling every routed update. */
  readonly dialog: Dialog<State, Event, E, R>
  /** Address extractor; defaults to per-chat by the dialog's `kind`. */
  readonly keyExtractor?: DialogAddress.KeyExtractor
  /** Per-address failure hook; defaults to logging and carrying on. */
  readonly onDefect?: (address: DialogAddress.DialogAddress, cause: Cause.Cause<E>) => Effect.Effect<void>
}
```

Added in v0.1.0
