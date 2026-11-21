# C114 change

## PLAN

1. Add the Defect `D12-branching-first-run.md` (the record of the hotfix track, with the source named as where it is corrected).
2. Add the Case release/T1320, a plain `.test.mjs`, RED by its content, at `05-src/wiring/T1320.test.mjs`, where the wiring sources are judged: the source of the Branching workflow gives one run per pull request (a concurrency group by the pull request number with `cancel-in-progress`), and the judging step takes the auto-merge from the pull request as it is when the run judges, not from the event. It is RED while the source is absent and GREEN when the DO adds it; the Case is never renamed.
3. Observe the expected RED and that the Case can pass with the DO's content (`evidence.md`).
4. The PLAN changes nothing under `.github`, no judge, no gate, no ruleset source and no hook.

## Ids

Change `release/C114`, Defect `release/D12`, Case `release/T1320` (the ids the hotfix track took; they are free on `main`). No Intent, Requirement or Architecture: the Defect names what is wrong, the Case what is right.

## DO

On the merged PLAN:

1. Add `05-src/wiring/workflows/lineage-synchronization.yml`: the installed workflow, byte for byte, with the two corrections. Nothing else of it changes (name, triggers, permissions, steps and checker call as installed).
2. T1320 stays as it is: nothing is renamed.

## Accept list

None. No existing Case reads this source.

## What this does not do

It does not touch `.github`: the installed copy follows from the source in a WIRE (the Owner's step), which copies `lineage-synchronization.yml` and nothing else. It does not change the Branching gate, its requirement of auto-merge or any verdict: a pull request without auto-merge still fails Branching, and the first run of a new pull request may still fail until the WIRE is installed and the runs are observed. The live proof is the first pull request into a collector after the WIRE: one verdict, no cycling of auto-merge.

## ACT

A 4L retrospective in the ACT before the promotion; one retro for the collector.
