# C27 do

The DO makes the layout of the PLAN real in the Skill, the control and the Cases, and nothing more.

## What was done

- The revised template and the check moved from `draft/` into `skills/kaal-engineering/` (`references/package-layout.json`, `scripts/check-layout.mjs`), and `draft/` is removed. The template has `02-learnings` (closed, one child `retros`), `14-operations` (closed, children `controls` and optional `runs`, verified by `controls`) and `15-defects`, and no `02-controls` or `14-defects`. The check's stray-child rule reads the `closed` flag.
- The reference page `package-layout.md` states the order, the steering group and the two things the template says apart: what a folder may hold (its children, and a closed folder holds nothing else) and what verifies it (`verifiedBy`, which for `14-operations` is `controls`).
- CTL2 moved from `engineering/02-controls/CTL2-verify-layout/` to `engineering/14-operations/controls/CTL2-verify-layout/`, and its text names the closed folders. T1237 is removed; T1244 supersedes it.
- Existing Cases amended to the new layout and nothing else: T1221 (the numbered list), T1225 (the controls of `14-operations`), T1230 to T1236 and T1238 (their fixtures use `15-defects`, hold controls in `14-operations`, and the workspace Case names a current numbered folder), T1232 (operations without its controls is FAIL and named) and T1177 (no `14-operations` in the package). F45, F48, F49 and A4 name the new folders.
- T1241 to T1245 renamed from `.red.mjs` to `.test.mjs`.

## Boundaries kept

No package is migrated, nothing is wired, no ruleset, no preventive mode, no publication. The Exchange folder, the finders and the trial and research protocol are not here.

## Evidence

All Cases of the package are GREEN except T1178 and T1228, which need `@kaihacksai/kaal-hosting` in the checkout and fail the same on the collector. The Cases of `engineering/cases` fail four times (T386 to T389, the collector check of C22) in this sandbox; I did not establish that they fail on the collector too, and the CI run is the check.
