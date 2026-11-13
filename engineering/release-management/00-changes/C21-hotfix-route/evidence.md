# C21 evidence

## Provenance

- Baseline: the collector `kaal/release/check-pr-envelope` (ACT #1514), without the documents of this PLAN. The SYNC of `main` into it (#1522) does not touch the files the Cases read.
- Method: T188, T189 and T190 are run, each Case's `run()` called, over that tree plus the three Cases.

## Result

| Case | Tests | On the baseline |
| --- | --- | --- |
| release/T188 | F17 | RED: a HOTFIX from a head outside hotfix/ is accepted |
| release/T189 | A33 | RED: an envelope with unjudged parts does not exit 3 |
| release/T190 | G53 | RED: F17 does not state the HOTFIX head |

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each of the three `.red.mjs` files import it, call `run()` and report RED-observed when it throws an assertion error.
