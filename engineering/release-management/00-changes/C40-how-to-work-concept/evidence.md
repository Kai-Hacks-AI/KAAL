# C40 evidence

## Provenance

- Baseline: `origin/main` at the time of the PLAN.
- Method: each Case's `run()` is imported and called over that tree.

## Result

| Case | Tests | On the baseline |
| --- | --- | --- |
| release/T560 | C40 | RED: the Definition is absent from release management |
| release/T561 | C40 | RED: the Definition is absent |
| release/T562 | C40 | RED: the Definition is absent |

## Reproduce

Run from a checkout of this branch with Node 22 and no dependencies. Import each `.red.mjs`, call `run()` and report RED-observed when it throws an assertion error.

## After the DO

`engineering/release-management/HOW-TO-WORK.md` is equal to the draft in `interface.md`. T560 to T562 are renamed to `.test.mjs` and pass: `run()` of each returns without an assertion error.
