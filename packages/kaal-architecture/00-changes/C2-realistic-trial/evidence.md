# C2 evidence

The RED of this PLAN, observed on `kaal/architecture/classify` at `54a2662` and in the tree of this PLAN. No job executes the Cases yet. Node 22 on Linux.

| Case | Tests | On the collector | In this PLAN |
| --- | --- | --- | --- |
| T10 | F5 | RED: F5 is absent | RED: the skill record is absent |
| T11 | F5 | RED: the same | RED: the same |

Every Case waits for the DO: the recorded trial. T1 to T9 are unchanged; T3 stays RED on the unchanged run 3.

## Reproduce

```
node red.mjs $(find packages/kaal-architecture -name 'T1[01].red.mjs' | sort -V)
```
