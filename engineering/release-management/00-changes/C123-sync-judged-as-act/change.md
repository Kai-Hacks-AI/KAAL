# C123 change

## PLAN

`changedPaths` leaves out a path that arrived from main, so a SYNC is judged "not an ACT" and nothing it brings is read as its own change.

### Decisions (the approval of this pull request is the go for the DO)

1. **By content, not by a name or a title.** A path of the merge result is not the pull request's own when its bytes equal the main side's. Where the history of the head is read (the head is a merge with two known parents), the main side is the parent that is not the collector's tip. Where the history is cut off, as in the check (the merge result is fetched at depth 2), the runner hands in the folder of the default branch it already has, and a path whose bytes equal main's there is left out. No history is needed in the check, and the workflow does not change.
2. **A SYNC that carries an own change keeps that change.** Only paths equal to main's are left out; a path the author edited differs and is read.
3. **The accepted limit.** A path that main changed again after the SYNC is no longer equal to the merge result and is read as the pull request's own: a possible false FAIL on a SYNC, narrow and visible, never a false PASS of a real ACT. If it shows in the C20 evidence it is a later Change.
4. **One reader of files.** The comparison of two folders is `sameContent` in `lib/tree-facts.mjs`, which already reads files; the runner reads none (T1345).
5. **Cases, in the DO.** release/T1350 (a SYNC read with its history: the paths are empty and limit Act is PASS, applies false; RED on main) and release/T1351 (the same SYNC in a depth-2 checkout with the folder of main handed in; without it the paths are read, as designed). They travel with the source in the DO because the Engineering check runs every Case.
6. **No flag, no WIRE.** The fix is source in `05-src/phase`; the installed workflow is unchanged. The flags stay unset.

### Records

The Defect is `D18-sync-judged-as-act.md` in this folder.
