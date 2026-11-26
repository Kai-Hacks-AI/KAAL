# C148 change

## PLAN

1. Add the intent I26, the Requirement F212, the architecture A209 and the Case T1540 (plain `.test.mjs`, never renamed). The Case is RED on the collector.
2. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. Then `scripts/observe-adapter.mjs`, the Case GREEN, the package suite GREEN.

## ACT

A retro entry in the collector.

## Linked work (release's, separate PLAN)

Release owns the delivery map, the station, the flag `KAAL_CONTROLS_VERIFY_ADAPTER` and the runner that reads each delivered entry at the merge result and passes it to `observeAdapted` and then to `findUnadapted` (controls/F206), detective and advisory. That PLAN links to controls/F212 and controls/F206 by id. No workflow, flag, required check or ruleset is part of this Change.

## Left open (for the CPO, with a recommendation)

- Static reading of the entry (the import of `runControl` from the adapter module and its call) is a first form. Recommendation: accept it as the detective form; a stronger proof, a run record of the entry, belongs to the adapter's own evidence (controls/F203) and to a later Change.
- A control whose entry builds the call dynamically is unknown, not false. Recommendation: unknown is correct and keeps the check honest.
- Ids C148, I26, F212, A209 and T1540 are taken by hand; on a clash the newer pull request renumbers.
