# C123 do

The DO adds the control attribute Changes as specified in `change.md`: the library `05-src/phase/lib/attribute-changes.mjs` (pure over three folders of files, no Git), its use in `run-controls-act.mjs` (the runner takes `--before` and `--contained`, asks the control once and hands each judge its answer), the workflow source `05-src/wiring/workflows/controls-act.yml` bringing the two folders, and the Cases T1352 to T1358 with their fixture `attribution-fixtures.mjs`.

## Decisions taken in the DO

- The runner no longer reads Git: `changedPaths` and the import of `node:child_process` are gone. The judges and the library read files only (T1358 pins it).
- A judge judges the `own` paths. If the attribution is incomplete (a folder is absent or unreadable) and limit Act has no FAIL on the own paths, every judge answers UNKNOWN, "cannot tell what the pull request changed itself: no attribution without <folders>". A FAIL on an own path stays a FAIL. `judgeOf` takes the attribution as a fourth argument; without one the paths in the tree are taken as given.
- The workflow brings the folders with Git as transport and no credential: the judge checkout and the merge-result checkout are fetched with their history (`fetch-depth: 0`); the merge result then fetches the judge checkout's HEAD from the local workspace, and two worktrees are made from the merge result: `before` at its first parent, and `contained` at the merge-base of the result and main. Nothing is fetched from GitHub in these steps, nothing is installed, nothing of the pull request is run.
- `judge-act.mjs` and the `judge-*-act.mjs` files are unchanged.
- No flag: the control is the input of the existing judges, whose flags decide a report as before (change.md).

## Verified

T1352 to T1358 pass. The three commands that make the folders were run over a repository in which main moved after the SYNC: `contained` held main at the SYNC and not the later commit, and the control attributed only the own path. `node --test engineering/cases/cases.test.mjs`: 357 of 373 pass, the 16 known failures unchanged (collector-capability T268 to T279, engineering T386 to T389). Nothing is installed: no `.github` file, no variable, no ruleset. Between this DO reaching main and the WIRE the installed workflow passes no `--before` or `--contained`, so every judge answers UNKNOWN "no attribution without before, contained": a report, the flags being unset. That UNKNOWN is not evidence for advisory readiness (CPO on the PLAN).

## Accepted edits

- T1314 (release/A77) lists the new layer `attribute-changes`, which imports nothing of the library and no process.
- T1342 (release/F90) ended with an end-to-end run over a real merge commit and `changedPaths`; it now runs over the three folders of attribute Changes. Its pin on the flag deciding the exit code only is unchanged.
- The Case release/T1350 of the defect thread (`kaal` branch `claude/project-thread-00qaa8-sync`) reads `changedPaths` over Git and is RED on main; it belongs to the closed hotfix path and is replaced by T1352 to T1355, which test the same Defect over files. It is not carried.
