# C106 evidence

## Provenance

- Baseline: `main` ff6926c. Method: each Case's `run()` is called in the tree of this PLAN. Observed 20 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T1280 | release/F82 | RED: Integrating does not declare the ruleset name 20 - integrating |
| release/T1281 | release/F82 | RED: same, so a later failure cannot be a pass by accident |
| release/T1282 | release/F82 | RED: same |
| release/T1283 | release/F82 | RED: same |
| release/T1284 | release/F82 | RED: same |

5 RED-observed. Each Case first requires the numbered names to be declared, in the sources and accepted by the judge, so its later assertions are reached only when the DO's content is there.

## Can each Case pass

A throwaway copy of `main` with the DO applied from `interface.md` (declaration, judge, six sources) and the five Cases renamed: all five green. Mutations in that copy: a judge that stops comparing the name fails T1281 and T1282; comparing against a name held in code is caught by T1282 (a declared `99 - other` must decide).

The full runner on that copy: 314 tests plus the five new, the 16 failures of main unchanged, and exactly four further failures, release/T481, T487, T862 and T1132, the Accept list. Other Cases that read the sources (T483, T511 to T518, T900 to T903, T1133) stay green.

## What this does not show

That the numbered rulesets in force match the sources: that is read from GitHub by Hosting, a later slice of release/C105.
