# C26 change

## PLAN

1. Add the gap G103, the Requirement F40 and the Cases T1121 and T1122 (plain `.test.mjs`, never renamed). Both are RED on main.
2. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector:

1. `scripts/scope.mjs` with `holdsProperty` and `decideAdoption`, pure.
2. `modes.md` or `enforcing-controls.md`: the protocol for a new control, in the existing space (SKILL.md stays at or under 600 words): detective, then the property and a provoked RED and a scan, then the proposal, then the Owner's go.
3. Cases T1121 and T1122 GREEN; the package suite GREEN.

## ACT

A retro entry in the collector.

## Left open (for the CPO, with a recommendation)

- One Change or two: the property (item 1) and the gate (item 2) could be separate. Recommendation: one, they share `scope.mjs` and the gate is meaningless without the property.
- Where the stable finding id is defined: the control's own `findingsOf` (recommended), checked here for uniqueness and type only.
- The `provoked` input is two booleans from the caller (`seeded.found`, `removed.cleared`) for now; its relation to C18/C19's provoked evidence is for them when they resume.
- The adoption proposal carries the baseline and the first history line without `at` and `change`: the pull request that adopts adds them (C25).
- Ids G103, F40, T1121, T1122 are taken by hand; on a clash the newer pull request renumbers. Depends on C24 and C25 for the baseline file and the history line; it needs no code from them.
