# change/C2 PLAN: FAR, Features Accepted Regression

Capability: `kaal-change`. Collector: `kaal/change`.

## Why

FAR is three artifacts (Owner decision on #558, 6481998415): the incoming Change's **Features** Test Plan, the target's **Regression** Test Plan, and Change's **Accept** list. Features and Regression are ordinary Test Plans of their owners, so Testing stays FAR-agnostic. Accept is Change's separately negotiated and authorized list, justified by Features Cases and applicable only to the one named integration. Accepted Cases stay observed RED while the Regression Plan's evaluation passes under its authorized exceptions. The Owner authorized this PLAN revision on #558 (6483543442); no DO, approval, merge or promotion.

## How

This is a PLAN Change. It ships no code.

- `packages/skills/kaal-change/plan/far/`: the Intent (I5–I8), the Requirements (N3–N4, F7–F11), the Architecture (A5–A8) and the Testing plan.
- `packages/skills/kaal-change/test/plan/far.test.mjs`: change/T9–change/T16. They are RED and blocked before behavioural assertion, outside `npm test` until the DO Change.
- Engineering supplies the integration (source Change and revision, target and protected baseline) as immutable revision evidence; Change only compares it. Features is read at the source revision, Regression at the baseline.
- The old cross-Change outcome list `far: [{ change, tests }]` retires. change/T15 proves exceptions never transfer to another integration.

## Open decisions

- One Accept per integration record (recommended), or several rounds in one record.
- `far.json` in the Change's record (recommended), or a typed Node once `change/C1` (#530) lands.

## What did not change

Change Records, the Change Lifecycle, `lib/record.mjs`, Branching's gate, every Definition `kaal-change` ships, and Testing's PLANs (Testing's revision is its own Change).
