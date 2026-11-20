# C107 evidence

## Provenance

- Baseline: `main` e3a096d (checked again against `origin/main` on 20 Nov 2026). Method: each Case's `run()` is called in the tree of this PLAN. Observed 20 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T1285 | release/I57 | RED: I57.md is absent |
| release/T1286 | release/F83 | RED: F83.md is absent |
| release/T1287 | release/A73, release/F83 | RED: A73.md is absent |
| release/T1288 | release/F83 | RED: the judge is absent |
| release/T1289 | release/F83 | RED: the judge is absent |
| release/T1290 | release/F83 | RED: the command line is absent, so no verdict is printed |
| release/T1291 | release/CTL27 | RED: release/CTL27 is not listed |
| release/T1293 | release/F83 | RED: the judge is absent |

8 RED-observed, 0 error, 0 green. T1288 and T1289 first require the judge to PASS good input, so a failure below says something.

## Can each Case pass

In a throwaway copy of `main` with the drafts as the DO's files and the eight Cases renamed: all eight are green, and the runner on that copy has 322 tests, 306 pass, 16 fail, the 16 of `main`.

Mutations of the judge in that copy, each caught: the promotion not excluded (T1288, T1290); the completeness not required (T1289, T1290); the base compared by `includes` (T1287, once its draft-equality assertion is set aside, because the equality assertion fails first and masks it); both a number and a group ref accepted (T1290); a group ref with a leading zero accepted (T1293); a short or long sha accepted (T1293, which first missed it and gained the two lengths). The first draft declared the control preventive and a second control `block Queue`; the Owner's protocol (every new control starts detective) removed the second, and the detective CTL27 declares `real:1`.

## What this shows and does not show

That the judge decides from given facts: it never reads Git or GitHub, never blocks by itself and never passes on a fact it cannot read. It does not show that the facts are right, that a job runs it or that a station requires it: those are the next Changes, and the controls stay `designed` until their Cases and evidence exist.
