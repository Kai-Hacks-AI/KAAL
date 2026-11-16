# C43 interface

The draft of the template, as it is added in the DO. Case T630 reads it. It is not a file of `main` until the DO.

## Draft of do.md

`````
<!-- A DO pull request. Exactly four chapters in this order and nothing else: no extra headings, commentary, test results, CI status or execution logs. The Change, the Cases, the diff and the checks hold the evidence; discussion goes into comments. -->

## Change

<!-- One line, `<id> <name>: <short description>`: the stable id, the name and the scope of this DO. -->

## Implement

<!-- The behavior or functionality this DO intends to deliver, briefly. -->

## Refactor

<!-- The improvement intended while behavior stays as it is, briefly. If no refactoring is planned, say so. -->

## HOW TO WORK

<!-- The process between work and review, one row per step. The table keeps this format: Step | Who | Action | Status | Details; step 0 is the Predecessor and the last step the Successor; Who is Predecessor, Worker, Owner, Reviewer, Dependency or Successor; a Dependency row carries its pull request as #<number> in Details. Status is open or done on a Worker, Owner or Reviewer row and merged or pending on a border or Dependency row; a stale Status is accepted. The wording of a step is judged by the Reviewer. -->

| Step | Who | Action | Status | Details |
| --- | --- | --- | --- | --- |
| 0 | Predecessor | The PLAN has merged; create the DO branch, the workspace, and a draft PR may open from here | pending | — |
| 1 | Worker | Implement and refactor against the approved PLAN until the Cases are GREEN; keep to the files of the Change | open | — |
| 2 | Reviewer | Verify the GREEN evidence and approve the DO | open | — |
| 3 | Successor | Merge the approved DO; approval alone does not start the ACT, the merge does: the ACT starts on merge | pending | — |
`````

## Where it lives

`engineering/release-management/05-src/wiring/templates/do.md`. Nothing under `.github` is touched.

## What the chapter says

The table has the four default rows: Predecessor, Worker, Reviewer, Successor. The Action of the rows:
  - step 0 names `The PLAN has merged` and `create the DO branch`
  - step 1 names `GREEN`
  - step 2 names `approve the DO`
  - step 3 names `Merge the approved DO` and `the ACT starts on merge`

