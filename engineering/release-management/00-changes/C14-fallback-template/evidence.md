# C14 evidence

The RED of this PLAN is observed against `main`. Work that is not on `main` is not delivered functionality, and C14 cites nothing that is not on `main`. This evidence replaces the first one, written before the split into release/C14 and release/C15.

## Provenance

- Baseline: `main` at `a7ce82dae43a9232ba2b3b90db62d7a1fbe58234`, whose default template has the chapters Intent, Design, Verified by and Validated by, beside the specialized templates `plan.md`, `act.md` and `do.md`.
- Method: the ten Cases of C14 and C15 (T172 to T181) are run over a tree that holds the documents of both Changes and the old default template, each Case's `run()` called. The same Cases are run over a tree that holds the wired default template of release/C15.
- A throwaway reference template was used once to show that the Cases can pass; the template file of release/C15 passes them too (see its `evidence.md`).

## Result for the Cases of C14

| Case | Tests | With the old default template | With the wired template |
| --- | --- | --- | --- |
| release/T172 | I8 | green (I8 is present) | green |
| release/T173 | F18 | RED: the chapters are not Change and Because | green |
| release/T174 | F18 | RED: the default does not declare DEFAULT | green |
| release/T175 | A41 | RED: the default does not start with the DEFAULT declaration | green |
| release/T176 | A41 | RED: the default does not point to the directory of specialized templates | green |
| release/T178 | G45 | green | green |
| release/T179 | G46 | green (F18 is present) | green |
| release/T180 | G47 | green (A41 is present) | green |

The gap Cases T178 to T180 close on documents alone. The contract Cases T173 to T176 read the template file and stay red until release/C15 wires it, which is the purpose of the split.

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each `T172` to `T181` `.red.mjs` file import it, call `run()` and report RED-observed when it throws an assertion error.
