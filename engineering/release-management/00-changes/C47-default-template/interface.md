# C47 interface

The draft of the template, as it is added in the DO. Case T670 reads it. It is not a file of `main` until the DO.

## Draft of default.md

`````
<!-- This pull request is a stable Change envelope. Execution history belongs in comments, reviews and checks. -->

## Intent

<!-- What this Change must achieve. -->

## Design

<!-- Optional. Only boundary or end-to-end design that is part of the Change contract. If the Worker could change it during implementation without changing the intended Change, leave it out. -->

## Verified by

<!-- The deterministic evidence required: tests, checks, reproducible verification. -->

## Validated by

<!-- The judgment required: independent review, Owner review or other explicit validation. -->

## HOW TO WORK

<!-- The process between work and review, one row per step. The table keeps this format: Step | Who | Action | Status | Details; step 0 is the Predecessor and the last step the Successor; Who is Predecessor, Worker, Owner, Reviewer, Dependency or Successor; a Dependency row carries its pull request as #<number> in Details. Status is open or done on a Worker, Owner or Reviewer row and merged or pending on a border or Dependency row; a stale Status is accepted. The wording of a step is judged by the Reviewer. -->

| Step | Who | Action | Status | Details |
| --- | --- | --- | --- | --- |
| 0 | Predecessor | Whatever this pull request follows, with its pull request, or none | pending | — |
| 1 | Worker | Do the work the title names, to the Intent | open | — |
| 2 | Reviewer | Review the diff against the Intent, the verification and the validation named above | open | — |
| 3 | Successor | Whatever starts on merge, with its pull request, or none | pending | — |
`````

## Where it lives

`engineering/release-management/05-src/wiring/templates/default.md`. Nothing under `.github` is touched.

## What the chapter says

The table has the four default rows: Predecessor, Worker, Reviewer, Successor. The Action of the rows:
  - step 1 names `Intent`
  - step 2 names `Intent`

