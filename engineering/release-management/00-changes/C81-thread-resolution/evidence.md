# C81 evidence

## Provenance

- Baseline: `main` 104b17e (release/C66 on main).
- Method: each Case's `run()` is imported and called in the tree of this PLAN; then the drafts of `interface.md` were written as the DO's files in a throwaway copy of the tree (`/tmp/feas-81`, not committed), the old Cases T860 and T862 amended as the DO would, and the six Cases renamed to `.test.mjs`. Observed 18 Nov 2026, Node 22 on Linux.

## Result in the tree of this PLAN

| Case | Tests | Result |
| --- | --- | --- |
| release/T1042 (in CTL10's folder) | release/CTL10 | RED: CTL10 does not have both Intents |
| release/T1043 (in F63's folder) | release/F63 | RED: F63 is absent from `02-requirements` |
| release/T1044 (in A58's folder) | release/A58 | RED: A58 is absent from `03-architecture` |
| release/T1045 (in I46's folder) | release/I46 | RED: I46 is absent from `01-intent` |
| release/T1046 | release/G104 | RED: thread resolution is still off in the source |
| release/T1047 | release/C81 | RED: T860 does not read the Intent I46 |

6 RED-observed, 0 error, 0 green. Each fails on its own assertion, not on a missing module.

## Element folders that do not hold the element yet

The PLAN holds `.red.mjs` files in `01-intent/I46-thread-resolution`, `02-requirements/F63-thread-resolution` and `03-architecture/A58-thread-resolution` before the element files exist (as `01-intent/I4-analyze-vulnerabilities/T72.red.mjs` already does). With those files in place: the control finder (`find-controls.mjs`) refused nothing; the Cases runner stayed at 231 Cases, 219 pass and the same 12 failures as `main` (it does not load `.red.mjs`); the judge of `verify Stages` passed on the real sources. The other repository suites were not run here.

## Can each Case pass

In the throwaway tree, with `I46.md`, `F63.md`, `A58.md` and `CTL10.md` equal to the drafts, the setting true in `integrating.json` and `stages.json`, T860 and T862 amended to read the current target, and the six Cases renamed: T1042 to T1047 were all green, the judge passed, and the runner had 237 Cases, 225 pass, with only the 12 failures that fail on `main` (release/C15 T268 to T279). Before the amendment of T860 and T862, those two failed, which is what T1047 holds the DO to.

## Not shown

Nothing is loaded and no live ruleset was changed. That a live unresolved thread blocks a merge into `kaal/**`, `hotfix/**` or `wire/**` needs the Owner's load of CTL10 and a real refusal; until then the control is Implemented at most, never Running.
