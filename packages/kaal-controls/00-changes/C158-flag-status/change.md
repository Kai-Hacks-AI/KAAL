# C158 change

## PLAN

1. Record the intent I30, the Requirements F216 and F217, the architecture A213 and the Cases T1572 and T1573 (plain `.test.mjs`, never renamed). Both are RED on the collector, because the adapter knows no flag and `scripts/judge-running.mjs` is absent. They were run GREEN against a throwaway implementation that is not committed.
2. Amend controls/F203 items 4 and 5 by a sentence each, and Case T1510 to the new shape of the log and the record (the added fields only). Amend controls/F204 item 5 and Case T1511: a record counts as execution evidence with a verdict `PASS`, `FAIL` or `REPORT`, and `UNKNOWN` still counts for nothing. T1510 and T1511 are RED on the collector until the DO.
3. No script, Skill word, record or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector, and with the collector synced with main:

1. `scripts/adapter.mjs`: the flag of the boundary, the mode `off`, and the fields on the log and the record. The proof rule of `executed` is taken out into one function that `executed` and `judgeRunning` both use.
2. `scripts/judge-running.mjs` with `judgeRunning`, pure.
3. One paragraph in `references/adapter.md`. T1572, T1573 and T1510 GREEN; the package suite GREEN. Mutation patches for each weakening, as in C25, C155 and C157.

## DO record

`scripts/adapter.mjs` takes `boundary.flag`, runs a control switched off as `mode: off` and carries the flag on the log and the record, and the proof rule of `executed` is now `provenRuns`, which `executed` and `judgeRunning` both use (REPORT counts, UNKNOWN does not). `scripts/judge-running.mjs` is added with `judgeRunning`, pure. `references/adapter.md` has the flag folded into the mode item (the adapter still does five things) and one sentence on the judge. T1572, T1573, T1511 and T1510 are GREEN and the package suite (116 tests) is GREEN. `mutations/` keeps eleven weakenings as exact patches with a runner, as in C25, C155 and C157: the flag read case-insensitively (M1), a switched-off control run as preventive (M2), an unknown flag read as off (M3), an unset flag read as unknown (M4), a record without the flag (M5), REPORT not execution evidence (M6), no record read as false (M7), a switched-off run read as applied (M8), a mode that contradicts its flag ignored (M9), an unknown flag hidden when another run is off (M10) and an unreal X counted (M11). `mutations/run-at-do-head.txt` is the run on the DO: the baseline is GREEN and each weakening, loaded alone, is RED on at least one Case. The record cannot name its own revision; re-run `sh mutations/run.sh <repo root>` at the DO's head and compare with it. Nothing is wired and no control record changed.

## ACT

A retro entry in the collector.

## The shape

The flag is handed in `boundary.flag = {name, value}` and recorded as `flag: {name, value, state}` with `state` of `on` (exactly `on`), `off` (anything else, including unset) or `UNKNOWN` (missing or malformed). The record becomes `{control, x, run, sha, verdict, by, mode, applied, flag}`: the old fields unchanged, three added. `executed` is untouched in meaning.

## Decided (CTO call, taking the recommendations)

1. **The library is told, never reads.** No environment, repository variable or file. Missing flag facts are `UNKNOWN`, and unknown never stands for on or off. The mode asked still runs when the flag is unknown, so adopting this changes no verdict.
2. **A switched-off control runs.** It is judged as a detective would (never blocked) and recorded with `mode: off`, so silence never stands for a status. A check that throws is still `UNKNOWN`.
3. **Running is a fact about execution, not outcome.** An executed run with the flag off proves Running. The verdicts that count are the three that a judged run gives: `PASS`, `FAIL` and `REPORT` (which a detective run, or a run switched off by its flag, gives when it finds something). `UNKNOWN` is a run that could not be judged and counts for nothing. Tested is a separate fact and is not touched. The rule of `executed` already refused `REPORT` by omission, so a detective control that found something was never counted; this fixes it in one place. The modes and `applied` are told beside it, so "running, off" never reads as applied. No record is `null`, never `false`.
4. **The judge is the library's.** `judgeRunning` sits beside verify Record, which compares a claim with a fact. Release, as the adopter, supplies the raw records and the runs it established, as for `executed`. The Implemented fact from the delivery map is not part of this Change.
5. **The convention stays the adopter's.** The name `KAAL_<CAP>_<CONTROL>` and "only `on` is live" are KAAL's; the library only compares the value with `on`.

## Linked work (release's, separate PLAN)

Release collects the runs, the record lines they printed and the delivery map, and hands them over (release/C162, #2712). That PLAN aligns its Cases to this record shape by an amendment. How a record is printed is release's.
