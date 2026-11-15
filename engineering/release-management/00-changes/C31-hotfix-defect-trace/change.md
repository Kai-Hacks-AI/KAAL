# C31 change

## PLAN (revised 15 Nov after two CPO reviews)

The first head treated a test-shaped file in the diff as the Case of the defect and one capability root as the scope of a defect. Both are withdrawn: a single defect may need corrections across roots, a one-root diff may hold unrelated work, and an existing unchanged Case may already reproduce the defect.

1. Add C31 with the gap G66 and two Cases, T380 (the judge) and T381 (the requirement text). Both are RED on `main` (`evidence.md`).
2. The semantic boundary is one HOTFIX, one identified defect. The judge models the trace HOTFIX, Defect, reproducing Case, verified correction: `judgeHotfixTrace(facts)` in `05-src/plan-body/hotfix-trace.mjs`.
3. Two judgments, kept apart in the result. **Trace validity** is structural: the links HOTFIX, Defect, reproducing Case exist. **Correction evidence** is revision-bound: the Case observed RED against the defect-bearing baseline and GREEN against the corrected revision. The first needs no run; the second needs evidence, and the judge only reads it.
4. Its facts: `defects` (the KAAL Defect references of the Defect chapter), `paths` (the paths the HOTFIX changes), `baseRev` and `headRev` (the two revisions the HOTFIX connects), and three lookups supplied by the caller: `lookupDefect(id)` (the recorded Defect with the Cases that reproduce it, or nothing), `caseExists(caseId)` and `caseEvidence(caseId)` (`{ baseline: { rev, result }, head: { rev, result } }`, each result GREEN or RED, either part may be absent). The judge holds no knowledge of where Defects, Cases or runs are stored.
5. Trace findings, each a broken link: no Defect reference; more than one; a Defect that is not recorded; a recorded Defect that names no reproducing Case; a named Case that does not exist; an empty diff. The Case need not be in the diff, changed or not.
6. Correction evidence, one of three states. VERIFIED: the baseline result is RED at `baseRev` and the head result is GREEN at `headRev`. NOT VERIFIED, and a finding: the head result is RED (the correction is not verified), or the baseline result is GREEN (the Case did not reproduce the defect at the baseline). UNKNOWN, and listed under not judged: a part of the evidence is absent, or is bound to another revision than `baseRev` or `headRev` (stale). RED at the baseline is expected and never a finding. GREEN at the head alone is UNKNOWN: it does not show that the Case reproduced the defect.
7. Attention, not a finding: a diff that spans more than one capability root (`packages/<name>`, `engineering/<name>`, any other top-level path as its own root) is listed for the reviewer to justify. It never changes the verdict.
8. The verdict is FAIL with a finding and UNKNOWN without one, whatever the correction state. It is never PASS: even VERIFIED does not show that the Case corresponds to the Defect, that the diff is minimal, or that it holds no unrelated work, and these are always listed under not judged.
9. F16 states the trace, the RED-then-GREEN evidence and what stays unjudged, in one short paragraph.

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
