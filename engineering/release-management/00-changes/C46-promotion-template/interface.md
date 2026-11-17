# C46 interface

The draft of the template, as it is added in the DO. Case T660 reads it. It is not a file of `main` until the DO.

## Draft of promotion.md

`````
<!-- A PROMOTION pull request. Exactly three chapters in this order and nothing else: no source or destination (the pull request shows them), PLAN, test or check results, approvals, retrospective, attribution or merge method. The Changes, the checks and the review history hold the rest; discussion goes into comments. The title is `PROMOTION: <meaningful description>`. -->

## Change

<!-- One line per Change delivered, `<id> <name>: <phases carried>`: the stable id of the Change, not of a pull request, and PLAN, DO or ACT. Do not describe the Change. -->

## Why now

<!-- Why deliver to main now rather than later, briefly: what this delivery unblocks or enables. Name only other Changes that bear on this decision, each with its reason (a dependency, what it unblocks or enables, or why it takes precedence). No backlog and no earlier promotions told as history. -->

## HOW TO WORK

<!-- The process between work and review, one row per step. The table keeps this format: Step | Who | Action | Status | Details; step 0 is the Predecessor and the last step the Successor; Who is Predecessor, Worker, Owner, Reviewer, Dependency or Successor; a Dependency row carries its pull request as #<number> in Details. Status is open or done on a Worker, Owner or Reviewer row and merged or pending on a border or Dependency row; a stale Status is accepted. The wording of a step is judged by the Reviewer. The Dependency row is conditional: when the source is behind main's tip it is a Dependency row, renumbered in sequence, for the pull request that brings main's tip in; when the source is current the row is omitted. -->

| Step | Who | Action | Status | Details |
| --- | --- | --- | --- | --- |
| 0 | Predecessor | Main requires the branch quality of the source branch: name it and its last merged PR; this promotion holds the single-promotion seat | pending | — |
| 1 | Worker | Check the source holds main's tip; if behind, add a Dependency row with the #<PR> bringing it in, in Details, and finish it first; else omit it | open | — |
| 2 | Worker | Create the draft PROMOTION PR from the ready source; verify the Changes delivered and the exact head | open | — |
| 3 | Reviewer | Approve the exact head | open | — |
| 4 | Successor | Merge the approved PROMOTION into main, which requires the approved exact head; this releases the seat and nothing starts automatically | pending | — |
`````

## Where it lives

`engineering/release-management/05-src/wiring/templates/promotion.md`. Nothing under `.github` is touched.

## What the chapter says

The table has the five default rows: Predecessor, Worker (creates the branch and opens a draft PR), Worker (does the work), Reviewer, Successor. The Action of the rows:
  - step 0 names `Main requires`, `source branch`, `branch quality` and `single-promotion seat`
  - step 1 names `main's tip` and `omit`
  - step 2 names `draft PROMOTION PR` and `exact head`
  - step 3 names `exact head`
  - step 4 names `into main, which requires`, `releases the seat` and `nothing starts automatically`

## The expanded table (the source is behind main)

When the source does not hold main's tip, the Worker adds one Dependency row for the pull request that brings main's tip in after the freshness check, with the number of its pull request in Details, and the steps after it are renumbered in sequence. When the source is current the row is omitted and the table is the five default rows. Case T663 reads this example (`#1234` stands for the pull request that brings main's tip in):

| Step | Who | Action | Status | Details |
| --- | --- | --- | --- | --- |
| 0 | Predecessor | Main requires the branch quality of the source branch: name it and its last merged PR; this promotion holds the single-promotion seat | pending | — |
| 1 | Worker | Check the source holds main's tip; if behind, add a Dependency row with the #<PR> bringing it in, in Details, and finish it first; else omit it | open | — |
| 2 | Dependency | The pull request that brings main's tip into the source | pending | #1234 |
| 3 | Worker | Create the draft PROMOTION PR from the ready source; verify the Changes delivered and the exact head | open | — |
| 4 | Reviewer | Approve the exact head | open | — |
| 5 | Successor | Merge the approved PROMOTION into main, which requires the approved exact head; this releases the seat and nothing starts automatically | pending | — |

Case T663 names: the Dependency role at step 2, an actual `#<number>` in its Details, steps 0 to 5 in sequence, the other rows equal to the default rows in the template, and the five-row path (no Dependency row) in the template itself.
