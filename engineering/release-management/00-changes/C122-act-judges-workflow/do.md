# C122 do

The DO adds, from the drafts in `interface.md`: the Intent `01-intent/I65-act-is-judged-where-it-is-made/I65.md`, the Requirement `02-requirements/F90-act-judges-run-on-collector-pull-requests/F90.md` and the Architecture `03-architecture/A101-act-judges-workflow/A101.md`; the library `05-src/phase/lib/tree-facts.mjs`; the runner `05-src/phase/run-act-judges.mjs`; the workflow source `05-src/wiring/workflows/act-judges.yml`; and the Cases T1339 to T1345 with the fixtures `act-fixtures.mjs` (not a Case).

`tree-facts.mjs` is the Dispatcher's reader (release/C116) moved to the library, without its Git part: `changedPaths` stays with the runner, and takes a revision of one parent (a squash) or two (the merge result of a pull request), the base being the first. The Dispatcher is not yet on `main`, so this collector carries the library alone; the Dispatcher's Change replaces its own `tree.mjs` by an import of it. No other judge is touched.

## Decisions taken in the DO

- The check names are the four job names, stable, because a later ruleset requires a check by name. The CPO asked that a red advisory check be labelled; the label is in the verdict line and the job summary ("advisory, not required"), not in the name.
- hold Act answers UNKNOWN "Testing's observation of the Cases at this revision is not available" until Testing's adapter supplies `observed`; the adapter replaces that one input of the runner and nothing else. `judge-act.mjs` keeps its name.
- demand Act's `observed` is not supplied either: when a carried Change has no retro the work cannot be told finished, and the answer is UNKNOWN, never a pass.
- No YAML anchors in the workflow source: the four jobs are written out.

## Verified

T1339 to T1345 pass. `node --test engineering/cases/cases.test.mjs`: see the pull request; the known failures are unchanged. Nothing is installed: no `.github` file, no variable, no ruleset. The WIRE (copying `act-judges.yml` into `.github/workflows/`, the Owner setting the four variables) and every flag and ruleset step are separate decisions of the Owner.

## Accepted edit

T1314 (release/A77) pins the library to its layers and forbids a process in it. `tree-facts.mjs` is one more layer, above `tree` and `collector`, and it reads no Git: `changedPaths` is the runner's, the one place that reads Git. T1314 lists the new layer and its imports; its pin on the rest is unchanged.
