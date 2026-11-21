# C114 change

## HOTFIX

One Defect, release/D2 (`D2-branching-first-run.md`), one Case, release/T1315 (`T1315.test.mjs`), RED on `main` and GREEN on `hotfix/*`. The correction is in `.github/workflows/lineage-synchronization.yml`:

1. A concurrency group per pull request, with `cancel-in-progress`: the newest event's run decides.
2. The judging step takes the auto-merge from the pull request as it is when the run judges (`gh api` on the pull request), not from the event payload. No new permission: the repository is public and the call reads a public pull request, as the rules call already does.

## Ids

Change `release/C114`, Defect `release/D2` (D1 is the only other), Case `release/T1315` (T1314 is the last). Taken as the next free ones; the coordinator allocates.

## Does not do

It changes neither the gate (`lineage.ts`, `branching.sh`) nor any verdict: a pull request without auto-merge still fails Branching, and the first run of a new pull request still does. It does not touch Promoting's handling of the green signal or the Dispatcher.
