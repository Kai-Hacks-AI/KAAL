# C20 evidence

## Provenance

- Baseline: the collector `kaal/release/check-pr-envelope` after release/C12 was delivered (ACT #1456), without the documents of this PLAN.
- Method: T185, T186 and T187 are run, each Case's `run()` called, over that tree plus the three Cases.

## Result

| Case | Tests | On the baseline |
| --- | --- | --- |
| release/T185 | A40 | RED: DEFAULT is not in the registry |
| release/T186 | F17 | RED: DEFAULT is reported as an unsupported TYPE |
| release/T187 | G52 | RED: F17 does not state that DEFAULT is a TYPE |

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each of the three `.red.mjs` files import it, call `run()` and report RED-observed when it throws an assertion error.
