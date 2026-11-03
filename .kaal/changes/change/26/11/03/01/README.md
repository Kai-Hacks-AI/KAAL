# change/C2 PLAN amendment: FAR is Change's concept, using Testing and Guard

Capability: `kaal-change`. Collector: `kaal/change`.

## Why

The Owner ruled on 2026-11-03 that FAR is a Change concept that uses Testing and Guard: kaal-change drives and owns the Features Test Plan, the Regression Test Plan and the Accept List, uses Testing's concepts, and is wired up in Guard's setup. Testing owns testing semantics, Guard owns guard semantics, Change owns change semantics. The CPO handover of the same day names it Features Accept Regression and gives the three inputs in order: Feature Test Plan and Accept List from the source branch, Regression Test Plan from the target.

## How

This is a PLAN Change. It ships no code and changes no planned test.

- **Intent.** change/I6 (Change owns both Plans as FAR concepts; Testing owns Plan semantics), change/I7 (the Accept List is versioned and travels with the source Change), change/I8 (Change drives the gate and judges; Guard reports). Five open questions are listed in the Intent.
- **Architecture.** change/A8: the gate is Change's and is wired up in Guard's setup; Engineering supplies revision evidence only. The ownership and Change-graph tables follow.
- **Requirements and Testing.** Naming only: Accept List, Features Accept Regression. change/T9 to change/T16 are unchanged.

## Open questions (for the Owner and named capabilities)

Guard's reporting outputs, PREACH escalation, entry-point visibility, the name's expansion against Review's #270, and consistency with #662. The Intent lists them.

## Verified by

Documentation only. `packages/skills/kaal-change/test/plan/far.test.mjs` is untouched and remains RED, blocked before behavioural assertion.
