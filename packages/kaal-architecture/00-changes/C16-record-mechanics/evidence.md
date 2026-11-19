# C16 evidence

The RED of this PLAN, in the tree of this PLAN. No job executes the Cases yet.

| Case | Tests | In this PLAN |
| --- | --- | --- |
| T23 | F14 | RED: cannot load, `lib/records.mjs` is absent |
| T24 | F15 | RED: cannot load, the same |
| T25 | F16 | RED: cannot load, the same |
| T26 | N2 | RED: cannot load, the same |

## Reproduce

```
node red.mjs $(find packages/kaal-architecture/00-changes/C16-record-mechanics -name 'T*.red.mjs' | sort -V)
```
