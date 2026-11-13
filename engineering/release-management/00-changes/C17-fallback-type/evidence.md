# C17 evidence

## Provenance

- Baseline: the collector `kaal/release/fallback-template` after release/C14 was delivered, without the documents of this PLAN.
- Method: T182, T183 and T184 are run, each Case's `run()` called, over the baseline, over the tree of this PLAN, and over the tree of this PLAN with a throwaway F18 that points to F19, outside the repository.

## Result

| Case | Tests | On the baseline | In this PLAN | With F18 pointing to F19 |
| --- | --- | --- | --- | --- |
| release/T182 | F19 | RED: F19 is absent | green (F19 is present) | green |
| release/T183 | F18 | RED: F18 says that DEFAULT is not a TYPE | RED: F18 still says it | green |
| release/T184 | G49 | RED: F19 is absent | RED: F18 does not point to F19 | green |

The Cases T183 and T184 wait for the DO, which changes one sentence of F18.

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each of the three `.red.mjs` files import it, call `run()` and report RED-observed when it throws an assertion error.
