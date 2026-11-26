# C17 evidence

The Cases of this Change, in the tree of the DO. No job executes the Cases yet.

| Case | Tests | PLAN | DO |
| --- | --- | --- | --- |
| T27 | F17 | RED: `checkAddresses` reported a resolved Defect id as INVALID | GREEN |
| T28 | F18 | RED: `addressing` was not exported by `lib/records.mjs` | GREEN |
| T29 | N3 | RED: the same, and the exports were not the expected ones | GREEN |

The package suite is green: 44 of 44 tests of `packages/kaal-architecture`.

## Reproduce

```
node --test $(find packages/kaal-architecture -name '*.test.mjs' | sort)
```
