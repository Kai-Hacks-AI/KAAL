# C31 change

## PLAN (revised 15 Nov after the CPO review of the first head)

The first head treated a test-shaped file in the diff as the Case of the defect and one capability root as the scope of a defect. Both are withdrawn: a single defect may need corrections across roots, a one-root diff may hold unrelated work, and an existing unchanged Case may already reproduce the defect.

1. Add C31 with the gap G66 and two Cases, T380 (the judge) and T381 (the requirement text). Both are RED on `main` (`evidence.md`).
2. The semantic boundary is one HOTFIX, one identified defect. The judge models the trace HOTFIX, Defect, reproducing Case, verified correction: `judgeHotfixTrace(facts)` in `05-src/plan-body/hotfix-trace.mjs`.
3. Its facts: `defects` (the KAAL Defect references of the Defect chapter), `paths` (the paths the HOTFIX changes), and three lookups supplied by the caller, `lookupDefect(id)` (the recorded Defect with the Cases that reproduce it, or nothing), `caseExists(caseId)` and `caseResult(caseId)` (GREEN, RED or nothing, at the exact head). The judge holds no knowledge of where Defects or Cases are stored.
4. Findings, each a broken link of the trace: no Defect reference; more than one; a Defect that is not recorded; a recorded Defect that names no reproducing Case; a named Case that does not exist; a Case whose result at the head is RED; an empty diff. The Case need not be in the diff, changed or not.
5. Attention, not a finding: a diff that spans more than one capability root (`packages/<name>`, `engineering/<name>`, any other top-level path as its own root) is listed for the reviewer to justify. It never changes the verdict.
6. The verdict is FAIL with a finding and UNKNOWN without one. It is never PASS. A missing Case result is listed under not judged.
7. Always listed under not judged: that the correction is minimal, that the diff holds no work unrelated to the defect, that the Case really corresponds to the Defect, and that the correction genuinely repairs the reproduced behaviour.
8. F16 states the trace and what the judge does not establish, in one short paragraph.

## DO

1. Add `hotfix-trace.mjs` and make T380 and T381 green; rename both to `.test.mjs`.
2. Add the F16 paragraph.
3. Nothing calls the judge from the envelope check, a hook, CI or a ruleset, and no lookup is implemented: the caller and its sources are the Hotfix delivery path, a separate Change.

## ACT

1. A 4L retrospective in `act.md`.

## Not in this Change

The Hotfix delivery path, its base, admission of `hotfix/<name>` into `main`, the `Driven-by` agreement, where Defects and Case results are read from, wiring, hooks, CI, rulesets, promotion and publication. No behaviour of an existing check changes.

## Increment

One small PDCA step of the hotfix capability toward 0.0.1. Reaching `main` does not publish or bump a version.
