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

<!-- The process between work and review, one row per step. The table keeps this format: Step | Who | Action | Status | Details; step 0 is the Predecessor and the last step the Successor; Who is Predecessor, Worker, Owner, Reviewer, Dependency or Successor; a Dependency row carries its pull request as #<number> in Details. Status is open or done on a Worker, Owner or Reviewer row and merged or pending on a border or Dependency row; a stale Status is accepted. The wording of a step is judged by the Reviewer. -->

| Step | Who | Action | Status | Details |
| --- | --- | --- | --- | --- |
| 0 | Predecessor | Name the source kind (a kaal/<capability>/* collector, a hotfix/* branch or a wire/* branch) and its last merged pull request | pending | — |
| 1 | Worker | List the Changes delivered; confirm the head holds main's tip | open | — |
| 2 | Reviewer | Approve the exact head | open | — |
| 3 | Successor | The WIRE or the next promotion starts on merge | pending | — |
`````

## Where it lives

`engineering/release-management/05-src/wiring/templates/promotion.md`. Nothing under `.github` is touched.

## What the chapter says

The table has the four default rows: Predecessor, Worker, Reviewer, Successor. The Action of the rows:
  - step 0 names `kaal/`
  - step 0 names `hotfix/`
  - step 0 names `wire/`
  - step 2 names `head`

