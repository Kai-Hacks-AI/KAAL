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
- **The optional complement.** Graph is loaded once, when `./delivery` loads. Only Graph's own absence becomes `cannot-assess`, with the peer and the two next steps of `change/F29`. Any other failure propagates. `change/A12` now says "when `./delivery` loads", so that `assess` stays synchronous.
- **The peer's name.** Graph is still `kaal-graph` in this repository, so the finding names `kaal-graph`. Graph's rename to `@kaihacksai/kaal-graph` is Graph's to make, and `change/C4`'s DO moves Change to it (`change/A11`). change/T33 holds the scoped name at `change/C6`.
- **Packaging.** `./delivery` is exported. `capability/Change.md` names the two new Definitions, and `ownership.kaal.json` follows its id.

## Verified by

- All eighteen planned tests in `test/plan/delivery.test.mjs` are GREEN, and now run in `npm test`.
- `test/delivery.test.mjs` adds four Code tests: the shipped Definitions are the ones the runtime names; the Capability Node provides them; without Graph there is `cannot-assess` and nothing else; and a missing dependency of Graph propagates.
- `npm test -w kaal-change` passes 90 of 90. `npm run test:engineering`, `npm run test:acceptance` and `npm test -w kaal-testing` pass.

## What did not change

No sync, promotion, version change or publication. Registration of `Change`, Succeeds and Delivers with Core stays a later Change of Change's own (`change/N5`).
