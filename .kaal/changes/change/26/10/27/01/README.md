# change/C1 PLAN: Change Nodes and their dependencies

Capability: `kaal-change`. Collector: `kaal/change`.

## Why

The Owner's invariants in Slack #kaal (thread "PR dependency map", 2026-10-27) are that KAAL owns the content, with one authoritative owner, navigable without extensions, and that priority is not dependency. Engineering's re-evaluation found one genuine gap: a Change is not a typed Node, so its dependencies cannot be walked or reversed. The Owner's review of #280 already said that Change owns its Change objects, with an identity and relationships independent of record placement.

## How

This is a PLAN Change. It ships no code.

- `packages/skills/kaal-change/plan/dependencies/`: the Intent, the Requirements, the Architecture and the Testing plan.
- `packages/skills/kaal-change/test/plan/dependencies.test.mjs`: change/T1–change/T8, change/T17 and change/T18. They are RED and blocked before behavioural assertion, outside `npm test` until the DO Change.

## Owner review 5694623370 and decision 6491567974

- **Immutability (Owner decision 6491567974):** the consumer of Change decides what is immutable and when. Change provides identity, Depends On, stale-reference detection and derived navigation, and imposes no freeze. The earlier A/B/C decision is removed (`change/A4`).
- **Acyclicity:** no longer asserted without a test.
  - change/T17 establishes it under Graph's actual construction: closing a cycle yields a stale pin.
  - It is qualified, because Graph does not recompute ids, so `assess` reports any cycle among resolved Edges (`change/F12`, change/T18).
  - Cycle findings are Change's dependency semantics, distinct from Core's traces and Graph's mechanics.

## What did not change

Change Records, the Change Lifecycle, `lib/record.mjs`, Branching's gate, and every Definition `kaal-change` ships.
