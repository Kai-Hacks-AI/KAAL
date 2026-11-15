# C7 evidence

The PLAN of C7 observes its RED against `main`. Work that is not on `main` is not delivered functionality, and C7 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `9201fce593e7058e6a287364c072287833d613ec`. `main` holds the PLAN template and no DO template.
- Method: the seven Cases of this PLAN (T98 to T104) are copied over a tree that holds `main`'s PLAN template and none of this PLAN's documents, and each Case's `run()` is called. A second execution in the tree of this PLAN shows which Cases stay red with the documents of this PLAN present.
- A throwaway reference template, outside the repository, was used once to show that the Cases can pass: all seven were green with it. It carries the three chapters of F11 with a hint each and implies no wording of the delivered template.

## Result

| Case | Tests | On `main` (assertion that failed) | In the tree of this PLAN |
| --- | --- | --- | --- |
| release/T98 | I6 | I6 is absent | the DO template is absent |
| release/T99 | F11 | the DO template is absent | the DO template is absent |
| release/T100 | A31 | A31 is absent | green |
| release/T101 | A32 | the DO template is absent | the DO template is absent |
| release/T102 | G31 | I6 is absent | green |
| release/T103 | G32 | F11 is absent | the DO template is absent |
| release/T104 | G33 | A31 is absent | the DO template is absent |

On `main`: 7 RED-observed, 0 error, 0 green. In the tree of this PLAN: 5 RED-observed and 2 green, about documents this PLAN adds. The red Cases wait for the DO template, a `.github` change that the DO delivers.

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each `T98` to `T104` `.red.mjs` file import it, call `run()` and report RED-observed when it throws an assertion error.
