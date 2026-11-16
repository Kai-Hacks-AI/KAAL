# C38 evidence

## Provenance

- PLAN baseline: `origin/main` at the time of the PLAN, with both Cases RED because `strategy.md` was absent from the root of release-management.
- DO: `strategy.md` is added at the root of `engineering/release-management`, equal to the draft in `interface.md`; T520 and T521 are renamed to `.test.mjs`.

## Result

| Case | Tests | Baseline | After the DO |
| --- | --- | --- | --- |
| release/T520 | C38 | RED: `strategy.md` is absent | GREEN |
| release/T521 | C38 | RED: `strategy.md` is absent | GREEN |

## Reproduce

Run from a checkout of this branch with Node 22 and no dependencies. Import each `.test.mjs`, call `run()` and expect no assertion error.
