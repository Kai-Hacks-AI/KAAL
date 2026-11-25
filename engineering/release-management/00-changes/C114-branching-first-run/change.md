# C114 change

## PLAN

One pull request into the collector, because the Case is a plain `.test.mjs` that is RED until its content exists and the Engineering check runs every Case (the phase judge that would excuse a RED Case at PLAN does not exist yet): the Case and the source travel together, so it is never RED on the collector.

1. The Defect `D12-branching-first-run.md`.
2. The Case release/T1320 at `05-src/wiring/T1320.test.mjs`, where the wiring sources are judged: the source of the workflow has one run per pull request (a concurrency group by the pull request number, `cancel-in-progress`) and takes the auto-merge from the pull request when the run judges, not from the event; `branching.sh`, run in a scratch clone with a stub checker, judges the merge method only when auto-merge is on (off or empty: nothing to judge, exit 0), and fails a wrong method when it is on.
3. `05-src/wiring/workflows/lineage-synchronization.yml`: the installed workflow, byte for byte, with the two corrections (the concurrency group; the step that reads the method from the pull request when the run judges). Nothing else of it changes.
4. `engineering/github/branching.sh`: the merge-method verdict runs only when `KAAL_AUTO_MERGE` is not empty. Nothing else of the check changes: the lineage verdicts, the exit codes and the rules read are as they were. `engineering/github/branching.md` says so in one sentence.
5. Nothing under `.github`, no ruleset, no hook, and nothing of `lineage.ts`.

## Ids

Change `release/C114`, Defect `release/D12`, Case `release/T1320` (the ids the hotfix track took; they are free on `main`). No Intent, Requirement or Architecture: the Defect names what is wrong, the Case what is right.

## Order of delivery

`branching.sh` is run from the default branch's tip, so it changes when this Change is promoted; the workflow follows in the WIRE (the Owner's step: `lineage-synchronization.yml` from the source, nothing else). Until the WIRE the installed workflow still passes the event's method; with the new `branching.sh` an empty method is not judged and a set one is judged as before, so the two orders are both safe.

## Accept list

None. `lineage.test.ts` tests the checker, which does not change.

## What this does not do

It does not change the checker (`lineage.ts`), the method each flow lands by or the audit after the fact. Per-branch allowed merge methods in the rulesets are a candidate home for this control when it is rebuilt; this Change keeps the check as it is. The live proof is the first pull request into a collector after the WIRE: one verdict, no cycling of auto-merge.

## ACT

A 4L retrospective in the ACT before the promotion; one retro for the collector.
