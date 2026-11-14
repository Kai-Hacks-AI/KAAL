# C24 evidence

## Provenance

- Baseline: `main` at the promotion of pull/C6 (#1583).
- Method: T198 and T199 are run, each Case's `run()` called, over that tree plus the two Cases.

## Result

| Case | Tests | On the baseline |
| --- | --- | --- |
| release/T198 | G55 | RED: the envelope judge does not export the cue it accepts |
| release/T199 | G55 | RED: the exact cue is rejected before the first chapter |

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each of the two `.red.mjs` files import it, call `run()` and report RED-observed when it throws an assertion error.
