# kaal/release/plan: concluding ACT of the collector (4L)

This is the **concluding collector-level retrospective** of `kaal/release/plan` (`pull/F34`): the qualification retrospective for the whole collected work. The retrospectives of the individual Changes stay where they are, as Change history: `plan/release`, `plan/coordination`, `plan/coordination-review`, `plan/pull`, `plan/pull-v1`, `plan/pull-integration`, `plan/pull-state`, `plan/pull-act`, `plan/pull-wire`, `plan/pull-history` and `plan/pull-ids`. It is written after the last PLAN, DO and Case change of the collector and after those retrospectives, by the agent that carried the Pull Promotion Changes (`pull/C1` to `pull/C8`). Show WIP and the release PLAN were carried by other threads: for them this retrospective only says what the collector holds, and their own retrospectives say how they went.

## What the collector holds

- **Pull Promotion**: the capability that reports which declared collectors qualify for promotion from their file state (`pull/C4`), scoped to the work each collector owns (`pull/F32`), with test-file completeness enforced (`pull/F33`) and the concluding collector-level ACT told from the Change-history retrospectives (`pull/F34`); the command that gathers the facts read-only (`pull/C2`, as built); the earlier piece-based capability (`pull/C3`), kept as history.
- **The history of a synchronized collector** (`pull/C7`): the gatherer reads the first-parent line, accepts a merge as a SYNC only when the host confirms that `main` contains its other parent, and refuses a development-branch merge instead of dropping its work.
- **Cases where their ids say** (`pull/C8`): the twelve Show WIP Cases and `pull/T34` sit at the paths their scoped ids name, and the runners log each under that id.
- **Show WIP** (`coordination/`), its review sequence and clean-for-review, and the release PLAN (`release/`).

## Liked

- Every requirement of Pull Promotion went RED to GREEN: the Cases failed on the Script before it existed and passed on a reference first, so each PLAN was a real PLAN and each DO was small.
- The CPO's reviews narrowed the contract one gap at a time (the collector as the unit, delta against head tree, scope, completeness, the concluding ACT, the meaning of a SYNC, the inventory of a Case), and each gap became a Case and not a comment.
- The live runs were kept unedited beside each other. The first run on a synchronized collector found a defect no fixture had shown, and the fixes were proven on real Git histories.

## Learned

- A collector qualifies from the work it owns, not from the whole tree: inherited evidence is excluded by a declared scope, and a scope is checked against the collector's real delta.
- A parent count does not make a merge a SYNC. Identity has to be established (here, with the host), and anything else is the collector's own work to account for or refuse.
- The path of a Case file is part of its identity for the qualification. A Case that goes green has to leave `plan/` in the same Change, and a runner has to log it by its scoped id.
- Completeness of the Cases can be enforced; completeness of the PLAN, DO and ACT shapes cannot, and stays the declaration's review.
- A squash merge of a PLAN into a collector, and a catch-up merge into an approved branch, each create a new head to review.

## Lacked

- A statement from the host that this collector qualifies. This file does not claim it: the qualification is a separate run at the exact head after the SYNC, and its raw output is what counts, not this text.
- A shared inventory of Cases for the other packages, as `pull/T36` does for `kaal-release`.
- The nine Hotfix Cases (`engineering/release-management/00-changes/C11-hotfix/case-transfer.md`), which wait for the HOTFIX delivery and are not part of this collector.
- The Owner's order of the collectors in `declaration.json`.

## Longed For

- One definition of where a Case lives and how it is logged, shared by the report and every runner.
- A real collector that qualifies, shown on the host at its exact head.
- Promotion decided by the Owner on the advisory report, not by the report.
