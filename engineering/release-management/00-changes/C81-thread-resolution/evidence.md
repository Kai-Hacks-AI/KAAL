# C81 evidence

## Provenance

- Baseline: `main` 104b17e (release/C66 on main).
- Method: each Case's `run()` is imported and called in the tree of this PLAN; then the drafts of `interface.md` were written as the DO's files in a throwaway copy of the tree (`/tmp/feas-81`, not committed). Observed 18 Nov 2026, Node 22 on Linux.

## Result in the tree of this PLAN

| Case | Tests | Result |
| --- | --- | --- |
| release/T1042 | release/CTL10 | RED: `I46.md` is absent from `01-intent` |
| release/T1043 | release/CTL10 | RED: `required_review_thread_resolution` is false in `integrating.json` |
| release/T1044 | release/CTL10 | RED: the Integrating declaration does not state thread resolution |
| release/T1045 | release/I46 | RED: `I46.md` is absent (the workflow scan before it passes: no workflow creates an inline review thread today) |

4 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Can each Case pass

In the throwaway tree, with `I46.md`, `F63.md`, `A58.md` and `CTL10.md` written equal to the drafts, the setting changed to true in `integrating.json` and `stages.json`, and the four Cases renamed to `.test.mjs`: T1042 to T1045 were all green, and the judge passed on the real sources. In the same tree the runner had 235 Cases and 221 pass, 14 fail: the 12 that fail on `main` (release/C15 T268 to T279) and two old Cases the drafts make fail, release/T860 (CTL10 `has` equals only I36 and the file equals the C66 draft) and release/T862 (`integrating.json` equals the C66 draft). Both are amended in the DO, never skipped. T864 and T863 stayed green.

## Not shown

Nothing is loaded and no live ruleset was changed. That a live unresolved thread blocks a merge into `kaal/**`, `hotfix/**` or `wire/**` needs the Owner's load of CTL10 and a real refusal; until then the control is Implemented at most, never Running.
