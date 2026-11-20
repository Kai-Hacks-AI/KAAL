# C17 evidence

The RED of this PLAN, in the tree of this PLAN. No job executes the Cases yet.

| Case | Tests | In this PLAN |
| --- | --- | --- |
| T27 | F17 | RED: `checkAddresses` reports a resolved Defect id as INVALID |
| T28 | F18 | RED: `addressing` is not exported by `lib/records.mjs` |
| T29 | N3 | RED: the same, and the exports are not yet the expected ones |

## Reproduce

```
node red.mjs $(find packages/kaal-architecture/00-changes/C17-defect-placement -name 'T*.red.mjs' | sort -V)
```
