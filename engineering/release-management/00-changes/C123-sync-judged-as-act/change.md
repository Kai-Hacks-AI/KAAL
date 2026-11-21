# C123 change

Records release/D18 and its Case release/T1350 for a valid HOTFIX (one Defect, a Case RED on main, GREEN on hotfix/*). The fix is release's: `changedPaths` and the judges in `05-src/phase`. This Change changes no source.

## The fix

`changedPaths` (05-src/phase/run-controls-act.mjs) drops a path of the merge result that arrived from main. A SYNC makes the head of the pull request a merge, and what main brought is not the pull request's own change.

- Where the history of the head is read (two parents known), a path whose content in the merge result equals its content on the main-side parent is dropped. T1350 pins this.
- Where the history is cut off (the check fetches the merge result at depth 2), the runner hands in the folder of main and a path whose bytes equal main's is dropped (`sameContent` in `lib/tree-facts.mjs`, which already reads files; the runner reads none, T1345). T1351 pins this.

A path changed after the SYNC on main is not equal to the merge result and is read as the pull request's own: a possible false FAIL on a SYNC, narrow and visible, never a false PASS of an ACT. A SYNC that carries an own change keeps that change.
