# C136 baseline

The baseline is `main` with release/C93 merged. `05-src/promotion-raise/final-step.mjs` reads the chapters of a pull request body (`stepOf`) and `decide.mjs` reads the title (`^ACT:`) and a `## Change` line of a body. A merge whose body has another shape is skipped (`not-a-final-step`) and `dispatch.mjs final` exits 0, so the classify job is green and `raise Dispatch` is skipped. The workflow `dispatcher-raise.yml` hands the base, the merge commit and the body in, and checks out only the default branch.

The files that already say whether work is done are read by the ACT judges (`05-src/phase`): a Change folder in the collector that main does not hold is a carried Change (`carriedFolders`), its id is the `id` of its record `C<n>.md` (`changeIdOf`), and a retro under `02-learnings/retros` whose front matter `reflects` names the id is the ACT of that Change (`retrosOf`, the rule of `hold Act`).
