# C32 evidence

## Provenance

- Baseline: `main` at 888ce0f.
- Method: each Case's `run()` is imported and called over that tree plus the two Cases.

## Result

| Case | Tests | On the baseline |
| --- | --- | --- |
| release/T330 | F53 | RED: `05-src/scope/scope-judge.mjs` is absent |
| release/T331 | F53 | RED: kaal-release 0.0.1 has no declared scope |

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each of the two `.red.mjs` files import it, call `run()` and report RED-observed when it throws an assertion error.
