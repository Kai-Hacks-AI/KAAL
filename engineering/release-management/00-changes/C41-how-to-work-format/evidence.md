# C41 evidence

## Provenance

- Baseline: `origin/main` at df31a72.
- Method: each Case's `run()` is imported and called over that tree.

## Result

| Case | Tests | On the baseline |
| --- | --- | --- |
| release/T570 | C41 | RED: `howToWorkProblems` is absent from `envelope.mjs` |
| release/T571 | C41 | RED: `howToWorkProblems` is absent |
| release/T572 | C41 | RED: `howToWorkProblems` is absent |
| release/T573 | C41 | RED: a Dependency row without a reference is accepted |

## Reproduce

Run from a checkout of this branch with Node 22 and no dependencies. Import each `.red.mjs`, await `run()` and report RED-observed when it throws an assertion error.
