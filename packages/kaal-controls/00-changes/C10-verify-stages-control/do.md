# C10 do

## What the DO added

- `engineering/release-management/04-controls/CTL1-verify-stages/CTL1.md`: the control `release/CTL1`, equal to the draft in `interface.md`. Type `detective`, it has `release/I27`. It states what `verify Stages` is for and that it blocks nothing by itself.
- T540 and T541 renamed from `.red.mjs` to `.test.mjs`. Both are green: the finder lists `release/CTL1` with type `detective`, `has: [release/I27]` and `release/T540` as its control test, with nothing refused.

## Not done, as planned

No check, judge, ruleset or workflow changed, and `verify Stages` itself is untouched. No Requirement, Architecture or gate coverage is added; the control points only at its Intent. The numbered folder `04-controls` stays a proposal the CPO judged with the PLAN. All 28 Cases of kaal-controls still pass.
