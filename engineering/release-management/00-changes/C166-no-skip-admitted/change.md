# release/C166: check 1 does not skip a head already on the default branch

A HOTFIX, driven with release/C165 in one PROMOTION (the Owner: "we might drive it as a hotfix"). The Defect is release/D21 (below): the evidence of check 1 on a fast-forward synchronization would be a false "does not apply". Urgency: the evidence must be gathered before 2 December and a skip that the Owner has ruled out would leave an N nobody can count. Approach: remove the skip, one deletion, with the Cases below.

## Reason
The entries of check 1 (`judge-github-alone.mjs`, `judge-delivery.mjs`, through `lib/report.mjs`) answer "does not apply" for a head that is already on the default branch. They inherited the skip from the old check (`engineering/github/change-isolation.sh`, `push-check.sh`). The Owner ruled (27 Nov, "b") that the skip goes: it is parity with the old check, and no reason to keep it was found. The only real pull request that reaches it is a fast-forward synchronization: a collector with no commits of its own, behind `main`, whose head is a commit already on `main`. The Owner's rule is that a synchronization is always a real merge commit, never a fast-forward.

## What changes, and what does not
1. **The skip is removed** from `changedPaths` in `report.mjs`. A head already on the default branch is judged like any other change: the complete change of the head against the target's tip. For a fast-forward synchronization that is everything `main` carried, so check 1 reports `.github` mixed with other paths. This is a changed verdict, in that one situation, and it is intended.
2. **Who checks that a synchronization is a merge commit: no new check is needed.** The verdict of `engineering/github/lineage.ts synchronization` already refuses it. A head that carries `main` commits the collector does not hold, outside a merge, is "neither an ordinary Change nor a synchronization" (exit 1). That verdict is the one judged by release/CTL38 (verify synchronization, check 2), by `verify Sync` (release/C152) and by the Dispatcher; `docs`: `engineering/github/branching.md` ("Synchronize"). Case release/T1606 pins it so that removing the skip cannot leave a fast-forward unjudged.
3. **Until this lands**, a fast-forward synchronization that check 1 reports is not counted as a disagreement with the old check (the Owner's ruling), and it is not evidence of kind A or V.
4. **Release/T1590 is amended, not retired whole.** It also holds the verified synchronization by its own resolutions and the whole judgment of an ordinary change, which stay. Only its expectation that a head already on the default branch "does not apply" is superseded by this PLAN, explicitly; the DO removes that step and keeps the rest.

## Acceptance expectations
- A head already on the default branch gets a verdict by the same rule as any other change, never "does not apply", and an entry writes its record for it.
- A fast-forward synchronization is refused by the lineage verdict, whatever check 1 says.
- Nothing else of check 1 changes: a verified synchronization (a real merge commit) is still judged by its own resolutions only.

## Cases
- T1605 (RED on main, GREEN here): the two entries, run on a head already on the default branch, do not say "does not apply"; they judge it whole (REPORT for `.github` mixed with other paths).
- T1606 (green now, pins the refusal): the lineage synchronization verdict on a fast-forward head exits 1 with "neither an ordinary Change nor a synchronization".

## What was done
The skip is removed from `report.mjs`, the "does not apply" step of T1590 is deleted and T1605 is a `.test.mjs`. The installed workflows are unchanged: the entries live under `05-src` and run from the default branch, so no WIRE is needed.

## Not in this Change
No WIRE, ruleset, flag or required check; no change to the lineage verdict or to check 2.
