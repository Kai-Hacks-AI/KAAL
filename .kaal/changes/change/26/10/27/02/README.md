# change/C1 PLAN: Change Nodes, succession and delivery

Capability: `kaal-change`. Collector: `kaal/change`.

## Why

The Owner's invariants in Slack #kaal (thread "PR dependency map", 2026-10-27) are that KAAL owns the content, with one authoritative owner, navigable without extensions, and that priority is not dependency. Engineering's re-evaluation found one genuine gap: a Change is not a typed Node, so the relationships between Changes cannot be walked or reversed. The Owner's review of #280 already said that Change owns its Change objects, with an identity and relationships independent of record placement.

## How

This is a PLAN Change. It ships no code.

- `packages/skills/kaal-change/plan/delivery/`: the Intent, the Requirements, the Architecture and the Testing plan.
- `packages/skills/kaal-change/test/plan/delivery.test.mjs`: change/T1–change/T8 and change/T17–change/T23. They are RED and blocked before behavioural assertion, outside `npm test` until the DO Change.

## Owner semantic alignment 6503873746

It supersedes the earlier "Depends On" wording.
- **Succeeds.** Change B —succeeds→ Change A is a temporal delivery prerequisite, stated by B (`change/I2`). It is not Packaging's package dependency and not Project's `before`.
- **Delivers.** Change —delivers→ Intent is Change's outgoing relationship (`change/I9`). The release path's separate Delivers Change folds into this one.
- **Delivery.** A Change is delivered when every Case it `requires` is `passed` in Testing's evidence, and every Change it succeeds is delivered (`change/I10`, `change/F15`–`change/F17`, `change/A10`).
  - Own-test satisfaction is distinct from delivery.
  - Anything other than `passed`, including a missing result, is unmet under Testing's own word.
  - No Change is delivered on zero Cases.
  - "Is on main" is a Case a Change may require, never a universal rule.

## Owner review 5694623370 and decision 6491567974

- **Immutability (Owner decision 6491567974):** the consumer of Change decides what is immutable and when. Change provides identity, its outgoing relationships, stale-reference detection and derived navigation, and imposes no freeze. The earlier A/B/C decision is removed (`change/A4`).
- **Acyclicity:** no longer asserted without a test.
  - change/T17 establishes it under Graph's actual construction: closing a cycle yields a stale pin.
  - It is qualified, because Graph does not recompute ids, so `assess` reports any cycle among resolved Edges (`change/F12`, change/T18).
  - Cycle findings are Change's succession semantics, distinct from Core's traces and Graph's mechanics.

## Owner alignment 6505123872

Presence, registration, admission and use are distinct (`change/N5`, change/T23).
- `assess` reads only the Nodes it is given. A Change Node on disk but not given is absent.
- Nothing in its result claims registration, admission or KAAL verification.
- Registration is a later Change of Change's own, pointing at the Change Nodes' Edges without duplicating them. Any Core index is Core's separate PLAN.

## What did not change

Change Records, the Change Lifecycle, `lib/record.mjs`, Branching's gate, and every Definition `kaal-change` ships.
