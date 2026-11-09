# change/C8 DO: Change Nodes, succession and delivery

Capability: `kaal-change`. Collector: `kaal/change`. It is the DO of `change/C1` (#530), as `change/C7` (#635) revised it, and it carries the optional-peer loading that `change/C4` (#636) assigns to it (`change/A12`).

## Why

The Owner's alignment on #530 named Succeeds, Delivers and the delivery criterion, and the Owner approved the PLANs on #530, #635 and #636. Change 0.0.1 is one of the Owner's five delivery objectives (2026-10-29). Each DO is gated separately, and the Owner's approval of this Change is that gate.

## How

- **The Definitions.** `capability/Succeeds.md` and `capability/Delivers.md`, typed by KAAL Definition. `lib/definitions.mjs` names them, and the Change Definition, as `{ name, id }`, so the runtime reads no file. `test/delivery.test.mjs` holds each reference to its shipped file.
- **`kaal-change/delivery`.** `assess(nodes, { evidence })` (`change/A2`).
  - **Graph represents and resolves.** It finds Change Nodes by type, reads their stated Edges, and resolves or names every target.
  - **Change's own meaning.** Every meaning and every finding are Change's. These are the identity, the held keys, stale, unresolved and not-a-change targets, cycles, `requires`, and the delivery criterion with Testing's evaluated evidence and the caller's selection.
  - **Transitive views.** They walk the resolved predecessors. Graph's `traverse` follows an Edge by id alone, so it would cross Edges that Change holds from succession.
  - **Purity.** It imports only `./definitions.mjs` and, dynamically, Graph. It imports no host module and no Testing module (`change/A10`).
- **No recursion over succession** (the Owner's review 6533996746). Cycles are found as strongly connected components by an iterative Tarjan's algorithm, which yields them predecessors first. Delivery is then decided in that order, so every predecessor is decided before its successors. The transitive views walk breadth first. No depth of succession reaches the call stack.
- **The optional complement.** Graph is loaded once, when `./delivery` loads. Only Graph's own absence becomes `cannot-assess`, with the peer and the two next steps of `change/F29`. Any other failure propagates. `change/A12` now says "when `./delivery` loads", so that `assess` stays synchronous.
- **The peer's name.** Graph is still `kaal-graph` in this repository, so the finding names `kaal-graph`. Graph's rename to `@kaihacksai/kaal-graph` is Graph's to make, and `change/C4`'s DO moves Change to it (`change/A11`). change/T33 holds the scoped name at `change/C6`.
- **Packaging.** `./delivery` is exported. `capability/Change.md` names the two new Definitions, and `ownership.kaal.json` follows its id.

## Verified by

- All eighteen planned tests in `test/plan/delivery.test.mjs` are GREEN, and now run in `npm test`.
- `test/delivery.test.mjs` adds eight Code tests: the shipped Definitions are the ones the runtime names; the Capability Node provides them; the basis cites a counted evaluation that does not pass; a Change with malformed Edges is not walked; delivery along a chain of 20,000 Changes is decided without recursion, with an unmet first Change propagating to the end; without Graph there is `cannot-assess` and nothing else; and a missing dependency of Graph propagates.
- **Held succession** (the Owner's comment 6548694764). A Code test, "never lets a held Succeeds Edge contribute to delivery", gives every held kind a target whose id names a given Node, so following an Edge by id alone, as `traverse()` does, would reach it. The kinds are a misnamed pin (unresolved), a pin named for one Change and pinned to another (stale), a target that is not a Change, and a target that is a duplicate Change. Each holder is satisfied and not delivered, awaits the held name, and has an empty transitive view, though the Changes the ids name are delivered. A resolved successor of a held Change is not delivered, and its transitive view stops there. A stale pin named for its own successor and pinned to a delivered Change neither closes a cycle nor delivers either Change.
  - **Discriminating.** The test fails against four mutants: resolving a held target by id, resolving it by name, ignoring held Edges in delivery, and following a target that is not a Change. change/T6, change/T17 and change/T21 already hold that a stale Edge is not listed, is never a cycle, and holds its successor.
- `npm test -w kaal-change` passes 94 of 94. `npm run test:engineering`, `npm run test:acceptance` and `npm test -w kaal-testing` pass.

## What did not change

No sync, promotion, version change or publication. Registration of `Change`, Succeeds and Delivers with Core stays a later Change of Change's own (`change/N5`).
