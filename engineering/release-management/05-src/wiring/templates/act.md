<!-- KAAL-PR-template: ACT -->
<!-- An ACT pull request. Exactly three chapters in this order and nothing else: no extra headings, retrospective text, test output or status reports. The files of the Change hold the detail; discussion goes into comments. -->

## Change

<!-- One line, `<id> <name>: <short description>`: the stable id, the name and what the Change is about. -->

## Records

<!-- What this ACT adds to the Change, named and not repeated. Today that is the 4L retrospective; it is a hint, not a closed list. -->

## HOW TO WORK

<!-- The process between work and review, one row per step. The table keeps this format: Step | Who | Action | Status | Details; step 0 is the Predecessor and the last step the Successor; Who is Predecessor, Worker, Owner, Reviewer, Dependency or Successor; a Dependency row carries its pull request as #<number> in Details. Status is open or done on a Worker, Owner or Reviewer row and merged or pending on a border or Dependency row; a stale Status is accepted. The wording of a step is judged by the Reviewer. -->

| Step | Who | Action | Status | Details |
| --- | --- | --- | --- | --- |
| 0 | Predecessor | The DO has merged into the collector, which enables the ACT | pending | — |
| 1 | Worker | Create the ACT branch, the workspace, and open a draft PR | open | — |
| 2 | Worker | Write the 4L retrospective in act.md, from the viewpoint of the agent that carried the Change | open | — |
| 3 | Reviewer | Review and approve the ACT records | open | — |
| 4 | Successor | Merge the approved ACT into the collector, which requires the 4L retrospective recorded and green checks; the merge starts nothing | pending | — |
