# C14 evidence

The PLAN of C14 observes its RED against `main`. Work that is not on `main` is not delivered functionality, and C14 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `247f35a32c3083c1dcd0d038bb4e1578b1241559`. `main` holds the default template with the chapters Intent, Design, Verified by and Validated by, and the specialized templates `plan.md` and `act.md`.
- Method: the nine Cases of this PLAN (T172 to T180) are run over two trees, each Case's `run()` called. The first holds `main`'s templates and none of this PLAN's documents. The second holds this PLAN's documents and the old default template.
- A throwaway reference template, outside the repository, was used once to show that the Cases can pass: all nine were green with it. It carries the two chapters of F18 with a leading comment and a hint each, and implies no wording of the delivered template.

## Result

| Case | Tests | On `main` | In the tree of this PLAN |
| --- | --- | --- | --- |
| release/T172 | I8 | RED: I8 is absent | green |
| release/T173 | F18 | RED: F18 is absent | RED: the chapters are not Change and Because |
| release/T174 | F18 | RED: F18 is absent | RED: the default does not start with the shared Change chapter |
| release/T175 | A41 | RED: A41 is absent | RED: the leading comment does not call the template the fallback |
| release/T176 | A41 | RED: A41 is absent | RED: the default does not point to the directory of specialized templates |
| release/T177 | A42 | RED: A42 is absent | RED: the default does not say that it is the fallback |
| release/T178 | G45 | RED: I8 is absent | green |
| release/T179 | G46 | RED: F18 is absent | RED: the chapters are not Change and Because |
| release/T180 | G47 | RED: A41 is absent | RED: the chapters are not Change and Because |

On `main`: 9 RED-observed, 0 error, 0 green. In the tree of this PLAN: 7 RED-observed and 2 green, about documents this PLAN adds. The red Cases wait for the new default template, a `.github` change that the DO delivers.

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each `T172` to `T180` `.red.mjs` file import it, call `run()` and report RED-observed when it throws an assertion error.
