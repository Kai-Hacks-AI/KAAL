# C25 evidence

## Provenance

- Baseline: `main` at the promotion of release/C24 (#1602).
- Method: `T200.red.mjs` is imported and `run()` is called over that tree plus the Case.

## Result

| Case | Tests | On the baseline |
| --- | --- | --- |
| release/T200 | G58 | RED: `.github/PULL_REQUEST_TEMPLATE/plan.md` does not open its body with the Change envelope cue |

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. Import the `.red.mjs` file, call `run()` and report RED-observed when it throws an assertion error.
