# C25 evidence

## Provenance

- Baseline: `main` after the promotion of release/C24 (#1602) and pull/C9 (#1622).
- Method: each `.red.mjs` is imported and `run()` is called over that tree plus the Cases.

## Result

| Case | Tests | On the baseline |
| --- | --- | --- |
| release/T200 | G58 | RED: `05-src/wiring/templates/plan.md` is absent |
| release/T214 | G58 | RED at WIRE: the Engineering source is absent and the installed templates carry no cue |
| release/T215 | G58 | RED: T117 and T121 still name the cue and read the installed SYNC template |

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. Import each `.red.mjs`, call `run()` and report RED-observed when it throws an assertion error.
