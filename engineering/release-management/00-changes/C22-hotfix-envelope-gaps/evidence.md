# C22 evidence

## Provenance

- Baseline: `main` at the promotion of release/C12, C20 and C21 (#1536).
- Method: T191 and T192 are run, each Case's `run()` called, over that tree plus the two Cases.

## Result

| Case | Tests | On the baseline |
| --- | --- | --- |
| release/T191 | F17 | RED |
| release/T192 | G54 | RED |

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each of the two `.red.mjs` files import it, call `run()` and report RED-observed when it throws an assertion error.
