# C30 evidence

The PLAN of C30 observes its RED against the collector `kaal/engineering/layout-complete`, cut at `main` 41253d8a. It cites nothing that is not on that collector.

## Provenance

- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 22 Nov 2026, Node 22 on Linux.
- The draft check and the draft template are under `draft/`, for review only.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T1380 | F91 | RED: a folder without AGENTS.md is not FAIL |
| T1381 | F91 | RED: an unnumbered folder lib is not FAIL |
| T1382 | F91 | RED: the template marks no folder required |

3 RED-observed, 0 error, 0 green. Each Case is a plain `.test.mjs` from the PLAN and fails on its own assertion; none is renamed at the DO.

## Can each Case pass

In the working tree with the draft check and the draft template copied over the real ones, T1380, T1381 and T1382 are GREEN: each required part missing, one at a time, is FAIL and named alone; each of the seven unnumbered folders seen in packages and an unknown root file is FAIL and named alone; the optional parts and a `*.kaal.json` file are PASS; and a template copy that requires `15-defects` makes its absence FAIL with the same check.

## Can a Case fail for the right reason

T1380 and T1381 assert the exact one finding, so a check that also reported a second fault, or none, fails them. T1382 changes only the template, so a check that ignores the flag fails it.

## What the draft breaks

With the draft, the existing layout Cases that were GREEN stay GREEN except three, which the DO amends: T1231 (it pinned "a folder with no numbered folder says none of the layout"; the missing parts now say it, and it pinned that unnumbered folders are not judged), T1243 (a package with no `14-operations` was PASS) and T1335 (its fixture had no required folders). T1228 is RED as on the collector (it needs the Hosting environment).

## The first run over every package (the baseline, not a count to keep)

With the draft check over the 14 folders in `packages/` that have a `package.json` at `main`: all 14 are FAIL, with 10 to 17 findings each: kaal-architecture 13, kaal-change 17, kaal-controls 12, kaal-core 17, kaal-engineer-skill 11, kaal-engineering 13, kaal-foundation 12, kaal-graph 10, kaal-guard 14, kaal-hosting 16, kaal-release 12, kaal-retro 12, kaal-review 14, kaal-testing 14 (findings counted by `;`). The ratchet tightens against the findings per package, never these numbers; no job or ruleset reads them.

## What this shows and does not show

The Cases show that the check can say in or out of the specification in both directions and that the template decides what is required. They do not show that the required set is the Owner's (Question 1), that the consumer places share it (Question 2), or that any package is near the layout: none is.
