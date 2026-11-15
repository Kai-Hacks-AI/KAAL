# C31 evidence

## Provenance

- Baseline: `main` at 888ce0f.
- Method: each Case's `run()` is called over that tree plus the two Cases.

## Result

| Case | Tests | On the baseline |
| --- | --- | --- |
| release/T380 | G66 | RED: `05-src/plan-body/hotfix-trace.mjs` is absent |
| release/T381 | G66 | RED: F16 does not state the trace, the baseline and head evidence or what the judge leaves unjudged |

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each of the two `.red.mjs` files import it, call `run()` and report RED-observed when it throws an assertion error.
