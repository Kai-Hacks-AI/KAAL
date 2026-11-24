# C15 evidence

The RED of this PLAN, observed on `kaal/architecture/classify` at `4b6642b` and in the tree of this PLAN. No job executes the Cases yet. Node 22 on Linux.

| Case | Tests | On the collector | In this PLAN |
| --- | --- | --- | --- |
| T18 | F1 | RED: cannot load, the Target library `test/lib.mjs` is absent | RED: cannot load, the same |
| T19 | F3 | RED: cannot load, the same | RED: cannot load, the same |
| T20 | F4 | RED: cannot load, the same | RED: cannot load, the same |
| T21 | F13 | RED: cannot load, the same | RED: cannot load, the same |
| T22 | F13 | RED: cannot load, the same | RED: cannot load, the same |

Every Case waits for the DO: the Target library, the relocation, the renumbering and the README note. T1 to T11 are unchanged by this PLAN; the historical T3 is not touched here, and is still red on the collector.

## Reproduce

```
node red.mjs $(find packages/kaal-architecture -name 'T*.red.mjs' | sort -V)
```
