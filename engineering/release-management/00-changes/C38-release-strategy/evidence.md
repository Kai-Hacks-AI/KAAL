# C38 evidence

## Provenance

- Baseline: `origin/main` at the time of the PLAN.
- Method: each Case's `run()` is imported and called over that tree.

## Result

| Case | Tests | On the baseline |
| --- | --- | --- |
| release/T520 | C38 | RED: `strategy.md` is absent from the root of release-management |
| release/T521 | C38 | RED: `strategy.md` is absent from the root of release-management |

## Reproduce

Run from a checkout of this branch with Node 22 and no dependencies. Import each `.red.mjs`, call `run()` and report RED-observed when it throws an assertion error.
