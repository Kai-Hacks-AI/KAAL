# CHAOS, corrected into kaal-change

Capability: `kaal-change`. Collector: `kaal/change`.

## Why

The Owner ruled that CHAOS, Changes Help Agents Organize Systematically, belongs to kaal-change, and that its old payload must not be moved verbatim. That payload, on `kaal/communication`, described the routing of discussion, so its meaning belonged to Communication, not to Change.

- Owner approval: Slack #kaal, thread "Change · CHAOS" (ts 1792349860.046179), "Owner decision — CHAOS and contextual Change placement approved": this is the second of two separate, bounded kaal-change Changes. It keeps the deliberate wordplay on Order versus Chaos and its historical provenance, and it adds no mandatory state, step or rule.
- Ownership ruling: Slack #kaal, CCC thread (ts 1792340894.320849).

## Semantic trace

1. Coined on KAAL #92, 2026-10-16. The first form was "Changes Helping Agent Orders Systematically" (15:24 UTC), and the current wording dates from 16:36 UTC.
2. Realized as `payload/CHAOS.md` on `kaal/communication`, carrying a four-step routing order (blob `40a2c06`). It never reached main.
3. KAAL #254 replaced it in Communication with CCCC, which now carries the routing meaning.
4. This Change: `packages/skills/kaal-change/capability/CHAOS.md`, a new `KAAL Definition` with a new identity, carrying the Change-management meaning in the Owner's words.

## How

- `capability/CHAOS.md`, together with its provenance section.
- `capability/Change.md` now provides the CHAOS Definition, and `ownership.kaal.json` carries the Capability Node's new id.
- `README.md` lists it, and `test/chaos.test.mjs` is the new test file.

## Evidence

`npm test -w kaal-change` checks four things: the CHAOS Definition is admitted, it carries the expansion and the wordplay, it adds no rule and holds no routing order, and its provenance names #92 and #254.

## Linked

CHAOS will cite ORDER once ORDER has an architectural home. That work is in its own subject thread and is out of scope here.
