# C17 evidence

The RED of this PLAN, in the tree of this PLAN. No job executes the Cases yet.

| Case | Tests | In this PLAN |
| --- | --- | --- |
| T27 | F17 | RED: cannot load, `lib/placement.mjs` is absent |
| T28 | F17 | RED: cannot load, the same |
| T29 | F18 | RED: cannot load, the same |
| T30 | N3 | RED: cannot load, the same |

## Reproduce

```
node red.mjs $(find packages/kaal-architecture/00-changes/C17-defect-placement -name 'T*.red.mjs' | sort -V)
```
