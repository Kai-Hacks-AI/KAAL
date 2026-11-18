# C62 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The PLAN named the six files the controls patch would not apply to and said what to do by hand, so the DO was an application and not a discovery. T810 and T811 went green on the first run with the finder, and the Cases runner kept to the 12 failures `main` already has. The CPO's check of the rebuilt PLAN found CTL5 missing from the executable Cases and the DO scope, and fixing it there was cheap.

## Learned

A SYNC cannot always be both pure and green. The first collector of this Change was cut at an older `main`; a pure merge of `main` made six files conflict, and reverting them made CTL5 reach the collector without the `status` its finder now demands. The Owner chose to rebuild the collector from `main`, and that cost one closed PR and a replay of the PLAN, far less than an exception to the pure SYNC would have cost every later SYNC. The saved patch also did not apply to T811, because the replayed PLAN had already edited it; I split the patch by file and applied the rest.

## Lacked

A way to know before the PLAN which controls the finder will refuse. The finder refused CTL5 only when run over the merged tree. A listing of the controls on `main` with and without the new rule, run at PLAN time, would have named CTL5 at once.

## Longed For

The finder deciding the status of every control from one declaration, and the DIRT status on `main` read from the controls themselves, so that a report of "Implemented, Running, Tested" is not hand-built.

## Follow-ups

- Promote this collector. It sits behind release/C67 on the seat.
- release/CTL11 (release/C68) has no `status` line yet; declare it after this Change is on `main`, as the CPO asked.
- Declaring a status is not evidence that a control protects anything. No control moves beyond Implemented here.
