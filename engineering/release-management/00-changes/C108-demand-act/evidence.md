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

Mutations of the judge in that copy, each caught by T1296 and T1297: a Change due whether the work is finished or not; a Change reflected by two retros accepted; a reflected Change due; UNKNOWN ignored; FAIL not outranking UNKNOWN. T1296's draft-equality assertion is set aside for the mutation runs, because it fails first and masks the others.

## What this shows and does not show

That the judge says what is due from given facts, never reads Git or GitHub, never passes on what it cannot read, and takes its notion of finished from the judge of `hold Act`. It does not show that the carried Changes are the right ones, that a job runs it or that a station requires it: those are the next Changes, and the control, declared detective and meant to become preventive, stays `designed` until its Cases and evidence exist.

Revised on 20 Nov 2026 after the Owner moved the ACT: the ACT is the retro of the collector, `retro -reflects-> Changes`, in `02-learnings/retros/`, not a file of a Change. The judge is over the carried Changes, the retros read only by `reflects`, and the observations; the Cases use fixtures, and both T1296 and T1297 were rewritten. In the throwaway copy (the judge of release/C103 revised the same way, and the drafts placed) all five Cases are green; the mutations above were repeated, each caught by T1297.

## Revised on 20 Nov 2026: one collector, one ACT, the full set

The CPO's review of the DO of release/C103 (#2165) restated the Owner's contract: one collector, exactly one ACT, which reflects the complete set of the Changes it carries; checking each Change alone is not enough if several retros are allowed. The judge now also says FAIL, at any time, when more than one retro reflects the carried Changes (`acts`), whatever the split, and a retro that reflects only some of them leaves the others due. T1296 and T1297 were revised (two retros, one for each Change, are now a FAIL; a retro that reflects some Changes leaves the rest due; a retro of no carried Change is not an ACT of the collector); the command line reads qualified Change ids through `changeIdOf(root, dir)` of the merged DO of release/C103, and T1297's fixture no longer spells the id declaration that pull/T34 reads.

In a throwaway copy of the collector at 2b5c8cd (the DO of release/C103 merged) with the drafts placed and the five Cases renamed, all five are green and the runner has 313 tests, 297 pass, 16 fail (the 16 of the collector). Mutations of the judge in that copy (also made in the draft), each caught by T1296 and T1297: cardinality ignored; cardinality only above two; a partial ACT accepted; a Change due whether the work is finished or not; UNKNOWN ignored.
