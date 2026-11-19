# C48 evidence

## Provenance

- PLAN: Cases T580 to T583 RED on `main`, see `baseline.md` and `gap.md`.
- DO 1 (this step): the Engineering source `05-src/wiring/workflows/analyze-vulnerabilities.yml` and the detective-reports section of `05-src/wiring/rulesets/controls.md`. No ruleset source changed; no `.github` path changed.

## Result

| Case | Tests | After DO 1 |
| --- | --- | --- |
| release/T580 | G69 | green: `controls.md` lists the control per stage as detective, required by no ruleset |
| release/T581 | G69 | green: the same, and no ruleset source requires the control |
| release/T582 | G70 | green: the workflow source reports each stage-named check on a pull request and a merge group |
| release/T583 | G71 | RED on purpose: no real merge-queue run is recorded yet; it is closed after the PROMOTION and the WIRE |

## Reproduce

Run from a checkout of this branch with Node 22 and no dependencies. Import each Case, call `run()` and report green when it returns without an assertion error.
