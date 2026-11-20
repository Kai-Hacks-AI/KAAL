# C49 do

## What the DO added

- `engineering/release-management/04-controls/CTL2-analyze-vulnerabilities/CTL2.md`: the control `release/CTL2`, equal to the draft in `interface.md`. Type `detective`, it has `release/I4`. It states that `analyze Vulnerabilities (Integrating)` and `(Promoting)` report and block nothing by themselves.
- T600 and T601 renamed from `.red.mjs` to `.test.mjs`. Both are green: the finder lists `release/CTL2` with type `detective`, `has: [release/I4]` and `release/T600` as a control test, with nothing refused, and `release/I4` is answered by it.

## Not done, as planned

No workflow, check, adapter, ruleset or declaration changed. The reports of release/C48 are untouched, and no ruleset requires them. No Requirement or Architecture is added.
