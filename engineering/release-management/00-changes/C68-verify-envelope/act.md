# C68 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The slice was the smallest that makes the control exist: one control file, one Intent link, two Cases. The finder listed CTL11 and the declared text was equal to the draft on the first run. The scope of the control (the envelope of a pull request, not the truth of what is written; PASS authorizes nothing) was written into CTL11 and checked by T881, so a later reader cannot read more into it.

## Learned

The report of the Cases runner differed between two of my statements: `do.md` says 190 pass and 12 fail, a run on the merged collector (98541f7) gives 201 tests, 189 pass and 12 fail. The 12 failures are the same unnamed Cases of `collector-capability/00-changes/C15-collector-capability` (T268 to T279) that fail on `main`; the count that moved is the passing one, by one, and I did not keep the run that gave 190, so I cannot say which Case it counted. The figure to trust is the later one, 189 of 201, and `do.md` is corrected to it. A count in prose without the run's total and the run's tree is not evidence.

## Lacked

A `status` for CTL11. The finder on `main` refuses a `status` line until release/C62 is on `main`, so the control was declared without one. The CPO asked that it be declared before CTL11 is promoted into the status-aware finder.

## Longed For

The runner writing its count with the total and the commit it ran on, so that a Change quotes a line and not a number.

## Follow-ups

- Declare `status: designed` for release/CTL11 after release/C62 is on `main` and a SYNC has brought it into this collector, before this collector is promoted. A control that is declared and not wired is Designed, not Implemented.
- Slice S2 (release/C69, T890), the interpreter of the rules, starts after release/C67 is on `main`.
- Nothing here wires or enforces the check.
