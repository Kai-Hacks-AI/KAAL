<!-- A WIRE pull request. Exactly four chapters in this order and nothing else: no extra headings, commentary, test results, CI status or execution logs. The Change, the Cases, the diff and the checks hold everything else; discussion goes into comments. -->

**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.

## Source

<!-- The approved Engineering artifact, by its path on `main`. It is already on `main`; a WIRE never carries a source. -->

## Target

<!-- The operational destination, by path: `.githooks/` or `.github/`. -->

## Verification

<!-- The Case that compares each installed file with its source byte for byte, and the installation contract it satisfies. -->

## HOW TO WORK

<!-- The process between work and review, one row per step. The table keeps this format: Step | Who | Action | Status | Details; step 0 is the Predecessor and the last step the Successor; Who is Predecessor, Worker, Owner, Reviewer, Dependency or Successor; a Dependency row carries its pull request as #<number> in Details. Status is open or done on a Worker, Owner or Reviewer row and merged or pending on a border or Dependency row; a stale Status is accepted. The wording of a step is judged by the Reviewer. -->

| Step | Who | Action | Status | Details |
| --- | --- | --- | --- | --- |
| 0 | Predecessor | The approved artifact is on main; its Source path and the Change that delivered it are named, with their pull request | pending | — |
| 1 | Worker | Create the wire/ branch from main's tip, the workspace, and open a draft PR | open | — |
| 2 | Worker | Install the artifact at the Target byte for byte and run the Case that compares each installed file with its source; a WIRE never develops | open | — |
| 3 | Reviewer | Confirm the Source is on main, the Case is green and the diff holds only the installed files | open | — |
| 4 | Successor | Merge the approved WIRE; for a changed ruleset file the Owner loads it beside the old, runs both and retires the old; nothing starts automatically | pending | — |
