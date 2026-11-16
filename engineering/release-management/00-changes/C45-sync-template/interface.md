# C45 interface

The draft of the template, as it is added in the DO. Case T650 reads it. It is not a file of `main` until the DO.

## Draft of sync.md

`````
## Change

<!-- One line: the id and name of the primary incoming Change that drives this synchronization, for example release/C7 do template. The id stays here, not in the title. -->

## Reason

<!-- Why this Change needs the synchronization now: to make a promotion fresh, to unblock development, or another specific purpose. One short paragraph. If several Changes would benefit, say why this one is the primary driver and name another only with its relationship. If it decides something itself at a conflict, say what here. -->

## HOW TO WORK

<!-- The process between work and review, one row per step. The table keeps this format: Step | Who | Action | Status | Details; step 0 is the Predecessor and the last step the Successor; Who is Predecessor, Worker, Owner, Reviewer, Dependency or Successor; a Dependency row carries its pull request as #<number> in Details. Status is open or done on a Worker, Owner or Reviewer row and merged or pending on a border or Dependency row; a stale Status is accepted. The wording of a step is judged by the Reviewer. -->

| Step | Who | Action | Status | Details |
| --- | --- | --- | --- | --- |
| 0 | Predecessor | The promotion or the work that needs main, named with its pull request | pending | — |
| 1 | Worker | Branch from the collector's tip, merge a main commit, resolve every conflict explicitly in that merge commit | open | — |
| 2 | Reviewer | Confirm the merge commit names the main commit and holds only the conflict resolutions | open | — |
| 3 | Successor | The PROMOTION or the unblocked work starts on merge | pending | — |
`````

## Where it lives

`engineering/release-management/05-src/wiring/templates/sync.md`. Nothing under `.github` is touched.

## What the chapter says

The table has the four default rows: Predecessor, Worker, Reviewer, Successor. The Action of the rows:
  - step 1 names `tip`
  - step 2 names `merge commit`
  - step 3 names `PROMOTION`

