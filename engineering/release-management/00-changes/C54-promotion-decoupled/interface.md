# C54 interface

The rows as they are written in the DO. The Cases read the template, not this file, except where noted.

## The rows

| Step | Who | Action | Status | Details |
| --- | --- | --- | --- | --- |
| 0 | Predecessor | Main requires the branch quality of the source branch: name it and its last merged PR; this promotion holds the single-promotion seat | pending | — |
| 1 | Worker | Check the source holds main's tip; if behind, add a Dependency row with the #<PR> bringing it in, in Details, and finish it first; else omit it | open | — |
| 2 (Dependency, expanded table) | Dependency | The pull request that brings main's tip into the source | pending | #1234 |
| last | Successor | Merge the approved PROMOTION into main, which requires the approved exact head; this releases the seat and nothing starts automatically | pending | — |

## What else changes in the DO

T662 (step 0 `kaal/`, `hotfix/`, `wire/`; step 1 `SYNC for PROMOTION`) and T663 (the expanded table) are reworded in the DO to the new rows.

## The expanded table (the source is behind main)

When the source does not hold main's tip the Worker adds one Dependency row after the freshness check, with the number of its pull request in Details, and the steps after it are renumbered in sequence. Case T711 reads this table.

| Step | Who | Action | Status | Details |
| --- | --- | --- | --- | --- |
| 2 | Dependency | The pull request that brings main's tip into the source | pending | #1234 |
