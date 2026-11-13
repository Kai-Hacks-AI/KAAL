# C14 evidence

The RED of this PLAN is observed against `main`. Work that is not on `main` is not delivered functionality, and C14 cites nothing that is not on `main`. This evidence replaces the earlier one, which read the wired `.github` file.

## Provenance

- Baseline: `main`, which holds the default template with the chapters Intent, Design, Verified by and Validated by, beside the specialized templates, and no fallback text.
- Method: the Cases T172 to T176 and T178 to T180 are run over the tree of this PLAN, each Case's `run()` called, once without `fallback-template.md` (this PLAN) and once with a throwaway reference text outside the repository (the state after the DO). The reference carries the DEFAULT declaration, the two chapters of F18, a leading comment and a hint each.

## Result for the Cases of C14

| Case | Tests | In this PLAN | With the text |
| --- | --- | --- | --- |
| release/T172 | I8 | green (I8 is present) | green |
| release/T173 | F18 | RED: the fallback template is absent | green |
| release/T174 | F18 | RED: the fallback template is absent | green |
| release/T175 | A41 | RED: the fallback template is absent | green |
| release/T176 | A41 | RED: the fallback template is absent | green |
| release/T178 | G45 | green | green |
| release/T179 | G46 | green (F18 is present) | green |
| release/T180 | G47 | RED: the fallback template is absent | green |

The contract Cases T173 to T176 and the gap Case T180 are red because the DO has not yet added the text. They need nothing from GitHub or from release/C15.

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each of the listed `.red.mjs` files import it, call `run()` and report RED-observed when it throws an assertion error.
