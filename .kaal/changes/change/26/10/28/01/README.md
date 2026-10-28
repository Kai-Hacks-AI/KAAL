# change/C2 PLAN: Features Accept Regression

Capability: `kaal-change`. Collector: `kaal/change`.

## Why

Testing's PLAN `testing/C4` (#385), revised per the Owner's review 5658056782, gives FAR (Features Accept Regression) to Change. FAR's meaning, the proposal, the negotiation, the decision authority, the decided outcome and its record are Change's. Testing consumes only the outcome `far: [{ change, tests }]`, and Engineering's gates hand it in. This PLAN is Change's side of that interface.

## How

This is a PLAN Change. It ships no code.

- `packages/skills/kaal-change/plan/far/`: the Intent, the Requirements, the Architecture and the Testing plan.
- `packages/skills/kaal-change/test/plan/far.test.mjs`: change/T9–change/T14. They are RED and blocked before behavioural assertion, outside `npm test` until the DO Change.

## Open decisions

- One FAR decision per Change (recommended), or several rounds in one record.
- `far.json` in the Change's record (recommended), or a typed Node once `change/C1` (#530) lands.

## What did not change

Change Records, the Change Lifecycle, `lib/record.mjs`, Branching's gate, every Definition `kaal-change` ships, and Testing's PLAN.
