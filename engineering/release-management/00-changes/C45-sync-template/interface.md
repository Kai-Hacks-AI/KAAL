# C45 interface

The draft of the template, as it is added in the DO. Case T650 reads it. It is not a file of `main` until the DO.

## Draft of sync.md

`````
## Change

<!-- One line: the id and name of the primary incoming Change that drives this synchronization, for example release/C7 do template. The id stays here, not in the title. -->

## Reason

<!-- Why this Change needs the synchronization now. Start with the purpose, exactly one of: `for PROMOTION` or `to unblock development`. A SYNC is never routine branch maintenance. For PROMOTION: the collector is ready for promotion and must take in current main; name the promotion candidate and its place in the promotion queue, preferring one promotion at a time. To unblock development: the branch is blocked because it lacks specific changes of main; name the concrete blocker and why a SYNC is necessary, and use it only for an otherwise blocked branch. One short paragraph. If several Changes would benefit, say why this one is the primary driver and name another only with its relationship. If it decides something itself at a conflict, say what here. -->

## HOW TO WORK

<!-- The process between work and review, one row per step. The table keeps this format: Step | Who | Action | Status | Details; step 0 is the Predecessor and the last step the Successor; Who is Predecessor, Worker, Owner, Reviewer, Dependency or Successor; a Dependency row carries its pull request as #<number> in Details. Status is open or done on a Worker, Owner or Reviewer row and merged or pending on a border or Dependency row; a stale Status is accepted. The wording of a step is judged by the Reviewer. -->

| Step | Who | Action | Status | Details |
| --- | --- | --- | --- | --- |
| 0 | Predecessor | For PROMOTION: the candidate and its place in the queue; to unblock: the blocked branch and its concrete blocker; each with its pull request | pending | — |
| 1 | Worker | Create the SYNC branch from the collector's tip, the workspace, and open a draft PR | open | — |
| 2 | Worker | Merge a main commit into it and resolve every conflict explicitly in that merge commit | open | — |
| 3 | Reviewer | Confirm the purpose and the evidence of its trigger, and that the merge commit names the main commit and holds only conflict resolutions | open | — |
| 4 | Successor | Merge the approved SYNC into its branch, which requires a merge commit of main and green checks; the merge starts nothing | pending | — |
`````

## Where it lives

`engineering/release-management/05-src/wiring/templates/sync.md`. Nothing under `.github` is touched.

## What the chapter says

The table has the five default rows: Predecessor, Worker (creates the branch and opens a draft PR), Worker (does the work), Reviewer, Successor. The Action of the rows:
  - step 0 names `For PROMOTION` and `to unblock`
  - step 1 names `tip` and `draft PR`
  - step 2 names `merge commit`
  - step 3 names `purpose` and `evidence`
  - step 4 names `which requires` and `starts nothing`
  - the Reason chapter of the draft (Case T653) names the purposes `for PROMOTION` and `to unblock development`, the evidence each needs (`promotion queue`, `concrete blocker`) and that a SYNC is `never routine branch maintenance`
