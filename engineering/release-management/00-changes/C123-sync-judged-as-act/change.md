# C123 change

## PLAN

The judges of the ACT receive the pull request's own changes as a shared input computed from files. Three folders are read and nothing else: the collector before the pull request, the merge result (the collector after), and the default branch (main). Git and GitHub are transport: they bring the three folders to the runner, as they bring the two folders the check reads today.

### The input

`lib/own-changes.mjs`, pure over the folders (it reads files and runs nothing, in the layer of `tree-facts`): `ownChanges({ before, after, main })` returns `{ own: [paths], inherited: [paths] }`.

- A path is **changed** when its bytes differ between `before` and `after`, or it exists in only one (a rename is both ends, a deletion and an addition are paths).
- A changed path is **inherited** when it exists in `main` with the same bytes as in `after`, or is absent from both `after` and `main` (the deletion main made too). It is content that main already holds.
- Every other changed path is **own**: a contribution of the collector, an edit made in a conflict resolution included, since it equals neither side.
- Without a folder, or with an unreadable one, the answer is UNKNOWN naming the missing folder: never a guess, never PASS.

### The consumer contract

A judge judges `own` only. limit Act receives `own` as its changed paths; a pure SYNC has none and limit Act answers "not an ACT" (PASS, applies false), so demand, verify and hold, which ask limit first, say the same. A FAIL on an `own` path stays a FAIL: nothing genuine is lost. No judge reads Git, a label, a title or a declared "SYNC" type; none is proof of origin.

### Main moves after a SYNC

A path main changed again after the SYNC no longer equals the merge result, so it is read as `own`: a FAIL on a SYNC that is behind main. That is the right state to FAIL in: the collector is behind main, Branching forces a SYNC before it can merge, and the SYNC makes the path equal again. No history is read to excuse it and nothing is tolerated as a residual risk. A mixed file (some lines inherited, some own) is judged as a whole file: the unit is the path.

### Where the folders come from

The check already checks out main (the judge) and the merge result (data). It also needs the collector before the pull request: a third checkout of `github.event.pull_request.base.sha`, into a folder `before`, no credentials, nothing run. The runner takes `--before`. The change of the workflow source is in the DO; installing it is a WIRE, on Kai's go. Order: the DO first (an older runner ignores `--before`), then the WIRE. Between the DO reaching main and the WIRE, the installed workflow passes no `--before`, so the runner answers UNKNOWN "the collector before the pull request is not available" and the flags are unset: a report only.

### Cases (file fixtures, no Git)

Pure SYNC (all changed paths equal main's: `own` empty); mixed contributions (an own path and an inherited path: only the own is judged); conflict resolution (a path equal to neither side is own); main moved after the SYNC (a path differing from main is own); a missing or unreadable folder (UNKNOWN, never PASS); and limit Act on a pure SYNC (PASS, applies false). The Cases travel with the source in the DO, because the Engineering check runs every Case. T1350 and T1351 of the closed hotfix read Git and are replaced by file fixtures; they are not carried.

### Identifier

This Change keeps release/C123, already on the PLAN pull request and in the Defect record. The workflow-source against installed consistency control, queued earlier as C123, moves to release/C126 (C124 workflow names and C125 hold reads evidence are unchanged). Nothing of that scope is dropped; C126 is used on no branch or pull request (checked 21 Nov).

### Records

The Defect is `D18-sync-judged-as-act.md` in this folder.
