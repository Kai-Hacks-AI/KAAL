# C36 evidence

## Provenance

- Baseline: `main` at aa6e7ad.
- Method: each Case's `run()` is imported and called over that tree plus the four Cases.

## Result

| Case | Tests | On the baseline |
| --- | --- | --- |
| release/T500 | F54 | RED: `05-src/stage-declaration/declaration-judge.mjs` is absent |
| release/T501 | F54 | RED: `05-src/stage-declaration/declaration-judge.mjs` is absent |
| release/T502 | F54 | RED: the KAAL example set is absent |
| release/T503 | F54 | RED: the vocabulary reference is absent |

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each of the four `.red.mjs` files import it, call `run()` and report RED-observed when it throws an assertion error.
