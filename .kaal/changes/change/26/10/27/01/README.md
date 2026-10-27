# change/C1 PLAN: Change Nodes and their dependencies

Capability: `kaal-change`. Collector: `kaal/change`.

## Why

The Owner's invariants in Slack #kaal (thread "PR dependency map", 2026-10-27) are that KAAL owns the content, with one authoritative owner, navigable without extensions, and that priority is not dependency. Engineering's re-evaluation found one genuine gap: a Change is not a typed Node, so its dependencies cannot be walked or reversed. The Owner's review of #280 already said that Change owns its Change objects, with an identity and relationships independent of record placement.

## How

This is a PLAN Change. It ships no code.

- `packages/skills/kaal-change/plan/dependencies/`: the Intent, the Requirements, the Architecture and the Testing plan.
- `packages/skills/kaal-change/test/plan/dependencies.test.mjs`: change/T1–change/T8. They are RED and blocked before behavioural assertion, outside `npm test` until the DO Change.

## Open decision

The Owner decides when a Change Node may still change, given Edges pinned by content (`change/A4`): A, editable while Proposed and fixed once Accepted (recommended); B, always editable with re-pinning; or C, references by identity alone, which needs a Graph Change and is not proposed.

## What did not change

Change Records, the Change Lifecycle, `lib/record.mjs`, Branching's gate, and every Definition `kaal-change` ships.
