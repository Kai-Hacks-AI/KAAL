# C25 do

The DO adds the layout check and its control, as the PLAN said.

## What was added

- `skills/kaal-engineering/scripts/check-layout.mjs`, moved from `draft/`: `judgeLayout` for a capability folder and `judgeWorkspace` (`--workspace`) for `packages/` itself.
- The control `engineering/02-controls/CTL2-verify-layout/CTL2.md`, with its Test Case T1237 beside it.
- T1230 to T1238 renamed from `.red.mjs` to `.test.mjs`. The `draft/` folder is removed.
- N19 and T1177 amended to allow the one script, and to look for no control under `02-controls`. N20 (body and Done when) and T1227 carried the same "no script" assertion and are amended the same way: the one layout check is allowed, any other script is not.
- The control text states the baseline as findings per package, never a count.

## Boundaries kept

No package is migrated, nothing is wired, no ruleset, no preventive mode, no publication, and no existing control moved.

## Evidence

All ten Cases (T1230 to T1238, T1177) are GREEN. The package run has two failures that are not from this Change: T1178 and T1228 need `@kaihacksai/kaal-hosting`, which is not installed in this checkout, and they fail the same on the collector.
