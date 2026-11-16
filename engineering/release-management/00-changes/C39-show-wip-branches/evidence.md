# C39 evidence

## Provenance

- Baseline: `origin/main` at df31a72.
- Method: each Case's `run()` is imported and called over that tree.

## Result

| Case | Tests | On the baseline |
| --- | --- | --- |
| release/T550 | C39 | RED: the report holds no inventory |
| release/T551 | C39 | RED: no inventory |
| release/T552 | C39 | RED: no inventory |
| release/T553 | C39 | RED: no inventory |
| release/T554 | C39 | RED: `renderInventory` is absent |
| release/T555 | C39 | RED: facts with branches produce no inventory |
| release/T556 | C39 | RED: no package inventory |
| release/T557 | C39 | RED: no package inventory |
| release/T558 | C39 | RED: `parseTag` is absent from the reader |

## Reproduce

Run from a checkout of this branch with Node 22 and no dependencies. For each of the nine `.red.mjs` files import it, await `run()` and report RED-observed when it throws.

## After the DO

`showWip` builds the inventory when the facts carry branches, `renderInventory` renders the overview and a dive-in, and `read.mjs` reads branches, tags and npmjs. T550 to T558 are renamed to `.test.mjs` and pass.

The host-term list of `coordination/T36` no longer holds the word `branch`: the Script now names branches by design (`facts.branches`, the places). Every other host term (pull request, merge, PR, git, commit) stays forbidden. `run.mjs` reads branches and packages only when asked for a view (`overview` or a place), so the command of `coordination/T38` still reads the open pieces and nothing else.

CPO review at a8b44dd asked for two proofs; T559 (the last free id of the allocation) covers them: every page of release tags is read and an unfinished list gives no tags and a gap, and a cut list of changed files (`COMPARE_FILE_LIMIT`) never shows a package as unchanged, so the stock stays UNKNOWN.
