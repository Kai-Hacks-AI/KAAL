# C12 do

## What the DO added

- `skills/kaal-controls/scripts/find-controls.mjs` (A10, F19, F20): `status` is the sixth field of a control, mandatory, one of `designed`, `implemented`, `running` or `tested`. The finder lists every control, complete or not. Each carries its declared `status`, a `rank` from 1 to 4 for a valid status, `valid` and `problems` (field, reason, recovery). `refused` is kept as the view of the controls that fail validation.
- `skills/kaal-controls/scripts/check-controls.mjs` (F21, F22): `checkControls(files)` returns `{ ok, controls, problems }` with the whole inventory, and exports `DIRT`. The command prints every control, prints each problem with its recovery on stderr, exits 1 when a control is invalid, and writes nothing.
- `skills/kaal-controls/references/declaring-controls.md` and the new `references/judging-status.md` (F24): the `status` line, the four values and their cumulative meaning, the finder and the check, and what to look at to judge a claimed status. `SKILL.md` points at both, no longer points at the `kaal-testing` Skill, and stays at 599 words (N8).
- `engineering/controls/03-architecture/A11-check-deployed/migration.md`, and the Case T778 that runs the product check on `engineering/`. Engineering holds no copy of the rule (T779).
- `status: running` on `release/CTL1` and `status: implemented` on `release/CTL2`, the values release gave. The Cases T540 and T600 of release leave the status line out of their draft comparison.
- The Cases T470 to T479 and T530 to T536 of C8 and C9 build their controls with a `status`. T471, T472, T474, T531, T532 and T533 now assert that an incomplete item stays listed and fails validation, where they asserted a refusal. T12 of C7 no longer asserts that the Skill cites Testing. F13, F14, F16 and F17 point at F20.
- The Cases T770 to T779 renamed from `.red.mjs` to `.test.mjs`. All 39 Cases of the package pass with `node --test test/cases.test.mjs`, and T778 and T779 pass in the Engineering Cases.

## Not done, as planned

No GitHub workflow, required check or enforcement, no lifecycle, and no status for any control other than the two of release. The controls on other collectors declare theirs when they next sync with `main`, and until then the finder lists them and the check names the missing status. Nothing is published.
