# kaal/release/plan: concluding ACT of the collector (4L)

This is the **concluding collector-level retrospective** of `kaal/release/plan` (`pull/F34`): the qualification retrospective for the whole collected work. The retrospectives of the individual Changes stay where they are, as Change history: `plan/release`, `plan/coordination`, `plan/coordination-review`, `plan/pull`, `plan/pull-v1`, `plan/pull-integration`, `plan/pull-state` and `plan/pull-act`. It is written after the last PLAN, DO and Case change of the collector and after those retrospectives, by the agent that carried the Pull Promotion Changes (`pull/C1` to `pull/C5`). Show WIP and the release PLAN were carried by other threads: for them this retrospective only says what the collector holds, and their own retrospectives say how they went.

## What the collector holds

- **Pull Promotion**: the capability that reports which declared collectors qualify for promotion from their file state (`pull/C4`), scoped to the work each collector owns (`pull/F32`), with test-file completeness enforced (`pull/F33`), and the concluding collector-level ACT told from the Change-history retrospectives (`pull/F34`); the command that gathers the facts read-only (`pull/C2`, as built); the earlier piece-based capability (`pull/C3`), kept as history.
- **Show WIP** (`coordination/`), its review sequence and clean-for-review, and the release PLAN (`release/`).

## Liked

- Every requirement of Pull Promotion went RED to GREEN: the Cases failed on the Script before it existed and passed on a reference first, so each PLAN was a real PLAN and each DO was small.
- The CPO's reviews narrowed the contract one gap at a time (the collector as the unit, delta against head tree, scope, completeness, the concluding ACT), and each gap became a Case and not a comment.
- Six real-host runs were kept unedited beside each other, so the history of what the host showed is itself evidence, and none of them was read as green.

## Learned

- A collector qualifies from the work it owns, not from the whole tree: inherited evidence has to be excluded by a declared scope, and a scope has to be checked against the collector's real delta.
- Completeness of the Cases can be enforced (a test file no pattern names makes a collector not judged); completeness of the PLAN, DO and ACT shapes cannot, and stays the declaration's review.
- Two kinds of retrospective need two names in the declaration. The per-Change retrospectives are history; one concluding file concludes the collected work.
- A squash merge of a PLAN into a collector puts its RED files back into any DO branch that moved them, and a strict up-to-date rule makes every sync a new head to review.

## Lacked

- **Execution evidence on the host for many Cases.** CI on this repository does not run the engineering Cases, and it reports the Cases in the `plan/<change>/` folders and the Cases of older heads under bare ids. The host therefore holds no per-Case record under a scoped id for them, so their CHECK is **not judged**, never read as green. This is a gap of the repository's CI, not of the Script.
- A real collector that qualifies: the qualifying path is shown on a host-shaped fixture (T14, T33), not on the host.
- The Owner's order of the collectors in `declaration.json`.

## Longed For

- CI that runs every Case of every collector and logs each under its scoped id (`scope/T<n>`), so the Check of the exact head can be GREEN for all expected Cases on the host.
- This file to be the first `concluding-act.md` of a real collector, so the qualifier can be shown on the host.
- Promotion decided by the Owner on the advisory report, not by the report.
