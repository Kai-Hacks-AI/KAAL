# C63 interface

The draft of the template, as it is added in the DO. Case T830 reads it. It is not a file of `main` until the DO.

## Draft of hotfix.md

`````
<!-- A HOTFIX pull request. Exactly four chapters in this order and nothing else: no extra headings, commentary, test results, CI status or execution logs. The Change, the Cases, the diff and the checks hold everything else; discussion goes into comments. -->

**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.

## Change

<!-- One line, `<id> <name>`: the stable id and the name of the Change. An identity, not a description; the Defect says what is broken. -->

## Defect

<!-- The KAAL Defect, by its identity `<capability>/D<n>`; a GitHub issue or URL is not that identity. What is broken, and which state is defective: production (the package and its published version), main, or a collector. They are different states; name the one you mean and claim no production impact that does not exist. -->

## Urgency

<!-- Why this cannot follow the ordinary Change path, and the consequence of waiting. A ticket number or a priority label is not an answer. -->

## Approach

<!-- Why this is the fastest safe path from the RED Case to GREEN, not a broader improvement or a refactoring: the choice and what it trades off, not the implementation. If production is affected, say what else from main a new published version would carry. -->

## HOW TO WORK

<!-- The process between work and review, one row per step. The table keeps this format: Step | Who | Action | Status | Details; step 0 is the Predecessor and the last step the Successor; Who is Predecessor, Worker, Owner, Reviewer, Dependency or Successor; a Dependency row carries its pull request as #<number> in Details. Status is open or done on a Worker, Owner or Reviewer row and merged or pending on a border or Dependency row; a stale Status is accepted. The wording of a step is judged by the Reviewer. -->

| Step | Who | Action | Status | Details |
| --- | --- | --- | --- | --- |
| 0 | Predecessor | The hotfix branch exists, started at main's tip, and a RED Case shows the Defect | pending | — |
| 1 | Worker | Open a draft HOTFIX PR from the hotfix branch | open | — |
| 2 | Worker | Make the RED Case GREEN with the smallest change; keep to the files of the Change; every check the hotfix branch requires is green on its exact head | open | — |
| 3 | Reviewer | Verify the RED to GREEN evidence, that the Defect names its state and that the Urgency holds, and approve the exact head | open | — |
| 4 | Successor | Merge the approved HOTFIX; approval alone does not merge | pending | — |
`````

## Where it lives

`engineering/release-management/05-src/wiring/templates/hotfix.md`. Nothing under `.github` is touched.

## What the chapter says

The table has the five default rows: Predecessor, Worker (opens a draft PR), Worker (does the work), Reviewer, Successor. It is argued from the `hotfix/*` branch the pull request comes from: that branch starts at main's tip, carries one correction, and its required checks are green on the exact head. The Action of the rows:
  - step 0 names `hotfix branch`, `main's tip` and `RED Case`
  - step 1 names `draft HOTFIX PR`
  - step 2 names `smallest change`, `GREEN` and `exact head`
  - step 3 names `RED to GREEN`, `Urgency` and `approve the exact head`
  - step 4 names `Merge the approved HOTFIX` and `approval alone does not merge`

No row names a PLAN, a DO, an ACT, a SYNC, a PROMOTION or a WIRE: the template argues from its own branch and does not name another process.
