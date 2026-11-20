# C108 evidence

## Provenance

- Baseline: the collector `kaal/release/act-real-green` at 1168212. Method: each Case's `run()` is called in the tree of this PLAN; for the throwaway copy the drafts of release/C103's judge (its PLAN, #2125, head 126bc40) are placed first, because this judge reuses it. Observed 20 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T1294 | release/I58 | RED: I58.md is absent |
| release/T1295 | release/F84 | RED: F84.md is absent |
| release/T1296 | release/A74, release/F84 | RED: A74.md is absent |
| release/T1297 | release/F84 | RED: judge-demand-act.mjs is absent |
| release/T1298 | release/CTL29 | RED: release/CTL29 is not listed |

5 RED-observed, 0 error, 0 green.

## Can each Case pass

In a throwaway copy of the collector with the judge of release/C103 and the drafts of this Change placed as the DO's files and the five Cases renamed: all five are green, and the runner on that copy has 305 tests, 289 pass, 16 fail, the 16 of the collector.

Mutations of the judge in that copy, each caught by T1296 and T1297: every unclosed Change due whether finished or not; an `act.md` of an unknown kind accepted; UNKNOWN ignored; FAIL not outranking UNKNOWN; work judged as if the ACT were already there. T1296's draft-equality assertion is set aside for the mutation runs, because it fails first and masks the others.

## What this shows and does not show

That the judge says what is due from given facts, never reads Git or GitHub, never passes on what it cannot read, and takes its notion of finished from the judge of `hold Act`. It does not show that the carried Changes are the right ones, that a job runs it or that a station requires it: those are the next Changes, and the control stays `designed` until its Cases and evidence exist.
