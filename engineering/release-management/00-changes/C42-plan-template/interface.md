# C42 interface

The draft of the template, as it is added in the DO. Case T620 reads it. It is not a file of `main` until the DO.

## Draft of plan.md

`````
<!-- A PLAN pull request. Exactly five chapters in this order and nothing else: no extra headings, commentary, test output or status reports. The files of the Change hold the detail; discussion goes into comments. -->

## Change

<!-- One line, `<id> <name>: <short description>`: the stable id, the name and what the Change is about. Do not repeat From, To or Because here. -->

## From

<!-- A, the current state, briefly. -->

## To

<!-- B, the target state, briefly. -->

## Because

<!-- X, the value delivered, briefly. The value, not who asked for it. -->

## HOW TO WORK

<!-- The process between work and review, one row per step. The table keeps this format: Step | Who | Action | Status | Details; step 0 is the Predecessor and the last step the Successor; Who is Predecessor, Worker, Owner, Reviewer, Dependency or Successor; a Dependency row carries its pull request as #<number> in Details. Status is open or done on a Worker, Owner or Reviewer row and merged or pending on a border or Dependency row; a stale Status is accepted. The wording of a step is judged by the Reviewer. -->

| Step | Who | Action | Status | Details |
| --- | --- | --- | --- | --- |
| 0 | Predecessor | The PLAN request is available; no PLAN comes before it | pending | — |
| 1 | Worker | Create the PLAN branch, the workspace, and open a draft PR | open | — |
| 2 | Worker | Develop the PLAN and verify the Cases are RED | open | — |
| 3 | Reviewer | Review and approve the PLAN only; its DO and ACT are not approved with it | open | — |
| 4 | Successor | Merge the approved PLAN; approval alone does not start the DO, the merge does: the DO starts on merge | pending | — |
`````

## Where it lives

`engineering/release-management/05-src/wiring/templates/plan.md`. Nothing under `.github` is touched.

## What the chapter says

The table has the five default rows: Predecessor, Worker (creates the branch and opens a draft PR), Worker (does the work), Reviewer, Successor. The Action of the rows:
  - step 0 names `PLAN request`
  - step 1 names `Create the PLAN branch` and `draft PR`
  - step 2 names `RED`
  - step 3 names `PLAN only`
  - step 4 names `Merge the approved PLAN` and `the DO starts on merge`
