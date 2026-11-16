# C36 evidence

## Provenance

- PLAN baseline: `main` at aa6e7ad, with the four Cases RED because the judge, the example set and the reference were absent.
- DO: `05-src/stage-declaration/` holds `declaration-judge.mjs`, `reference.md` (equal to the draft in `interface.md`) and `instance/` (KAAL's four activities in release/C35's names). T500 to T503 are renamed to `.test.mjs`.

## Result

| Case | Tests | Baseline | After the DO |
| --- | --- | --- | --- |
| release/T500 | F54 | RED: the judge is absent | GREEN |
| release/T501 | F54 | RED: the judge is absent | GREEN |
| release/T502 | F54 | RED: the example set is absent | GREEN |
| release/T503 | F54 | RED: the reference is absent | GREEN |

## Reproduce

Run from a checkout of this branch with Node 22 and no dependencies. Import each `.test.mjs`, await `run()` and expect no assertion error.
