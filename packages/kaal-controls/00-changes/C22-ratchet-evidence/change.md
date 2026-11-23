# C22 change

## PLAN

1. Add the gap G99, the Requirements F35 and F36, the definition of the lifecycle (`lifecycle.md`) and the Cases T1115 to T1117 (plain `.test.mjs`, never renamed).
2. Keep the four weakenings of C21 as exact patches with a runner (`mutations/`) and run them on the final head of C21.
3. Correct the misleading evidence claims in C21: the superseded sensitivity preview and the J3 evidence wording.
4. Name the research-method improvements as deferred (`C22.md`).
5. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector:

1. `judge-mode.mjs`: a verdict carries `next` only when it passes; the command reads its files inside a handler and answers `UNKNOWN`, `blocked: true`, reason `unreadable-input` or `malformed-input`, naming the file, as JSON with exit 2.
2. `modes.md`: one short paragraph of the lifecycle in generic words (store `next` only after an accepted run; keep the accepted baseline after a rejected one).
3. `mutations/`: add the weakenings of the new behaviour (M5 a blocked run still carries `next`; M6 the command exits 0 when blocked), re-base the four on the DO's script, run all of them on the DO's head and record the baseline GREEN, the loaded mutation and the failing assertion.
4. Testing restates J3 in two statements at the DO's head: design placement, satisfied by inspection; agent application, observed in an author-run check with persistence of the next baseline unresolved, no benefit of the Skill seen.

## ACT

A short correction and addition to the retro `controls/RT1`, in the collector: the trial claims it makes are marked author-reported and not retained, and what was learned from the CRO assessment.

## Left open

- The research-method improvements named in `C22.md` are deferred to their own scope.
- The ids G99, F35, F36 and T1115 to T1117 were taken by hand; on a clash the newer pull request renumbers.
- T1116 is coverage of behaviour that is already correct, so it is GREEN against the collector; its sensitivity is shown by M6 in the DO.
