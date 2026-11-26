# C148 change

## PLAN

1. Add the intent I26, the Requirement F212, the architecture A209, an amendment to F206 and the Case T1553 (plain `.test.mjs`, never renamed). The Case is RED on the collector.
2. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. Then `scripts/recognize-adapter.mjs` and the matching read in `scripts/verify-adapter.mjs`, the Case GREEN, the package suite GREEN.

## DO record

`scripts/recognize-adapter.mjs` is added and `scripts/verify-adapter.mjs` reads a recognition as observed. T1553 is GREEN and T1517 stays GREEN. The unit tests are `test/recognize-adapter.test.mjs`; the package suite runs 89 tests, all passing, when run with a glob. This collector's `test` line is not changed, so that main merges clean; the glob arrives with controls/C143 and then runs this test file.

The recognition is structure: comments and literals are masked first, so nothing inside them is read; the import must resolve exactly to the adapter path; a branch that a constant condition keeps from running is removed. It is not execution, and a call that is reachable but never executed is still recognized. An entry that does not show the integration throws.

## ACT

A retro entry in the collector.

## Linked work (release's, separate PLAN)

Release owns the delivery map, the station, the flag `KAAL_CONTROLS_VERIFY_ADAPTER` and the runner that reads each delivered entry at the merge result and passes it, with the adapter path, to `recognizeIntegration` and then to `findUnadapted` (controls/F206), detective and advisory (release/C139). That PLAN links to controls/F212 and controls/F206 by id and treats a recognition as structure, never as execution. No workflow, flag, required check or ruleset is part of this Change.

## Decided by the CPO review (kept here as the record)

- Static inspection is structural evidence, not operational proof. The function recognizes an integration and never claims execution; runtime evidence is separate (controls/F203).
- No recognition from strings, comments, unused or unreachable calls, or an unrelated adapter module.
- Absence of a recognizable pattern is unknown, never nonconformance; only `adapted: false`, established by other evidence, is a finding.
- F206 is amended to read a recognition as observed without a finding.
- A recognized integration of the same revision never overrides a confirmed `adapted: false`: the finding stays. Structural and runtime evidence stay apart, and contradictory runtime observations stay unknown, with or without a recognition (F206 items 7 and 8, Case T1553).

## Left open (for the CPO, with a recommendation)

- Reachability is only partly decided: a branch that cannot run by a constant condition is refused, a call that is reachable but never executed is not. Recommendation: that is the limit of structure; execution is shown by the run record.
- A call built dynamically is unknown. Recommendation: unknown is correct.
- Ids C148, I26, F212, A209 and T1553 are taken by hand (T1540 was release's, so the Case was renumbered); on a clash the newer pull request renumbers.
