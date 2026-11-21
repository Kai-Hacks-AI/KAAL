# C112 change

## PLAN

1. Add the drafts in `interface.md`: Intent I61, Requirement F87 and Architecture element A77 (the library `05-src/phase/lib/` and its four layers). The library itself has no draft: the DO moves existing code, and the Cases judge what the modules offer, not what their text is.
2. Add the Cases T1310 to T1314, all RED, written Given-When-Then where they judge behaviour: T1310 the Intent, the Requirement and the Architecture element are placed and linked; T1311 the tree and the facts of a collector (files in order, frontmatter, the qualified id of a Change, what a Change justifies, the Cases that apply with the parked ones, the retros, the carried Changes and the refusal of one that is not known); T1312 whether Cases are really green (PASS, FAIL for parked or RED, UNKNOWN for unobserved or none, FAIL outranking UNKNOWN, the Cases of several Changes judged together); T1313 the matching of a path against a route of the write map relative to the roots (folder, file, `*` for exactly one segment, the folder itself not in it, a path under no root outside); T1314 the layers stay one-way (the library holds exactly the four layers, each imports only the layer below it and Node, none starts a process; no judge imports another judge).
3. Observe the expected RED and that each Case can pass with the DO's content (`evidence.md`).
4. The PLAN changes no judge, no declaration, no workflow, no ruleset source, no hook and nothing under `.github`.

## Ids

Change `release/C112`, Intent `release/I61`, Requirement `release/F87`, Architecture `release/A77`, Cases T1310 to T1314. No control and no gap id.

## What it does, and what it leaves alone

- **Does**: moves the reading of the tree, the facts of a collector, the state of the Cases and the matching of the write map out of the judges into four modules; makes the judges import them; renames `judgeFinished` (what it answers: the Cases that apply to all the carried Changes are really green) to `applicableCasesAreGreen`, in the library, and the core of `judgeAct` to `casesAreGreen`; adds `carriedChanges(root, dirs)` for the step the two command lines each wrote.
- **Leaves alone**: every verdict and message, every command line and exit code, `write-map.json`, the declared controls, the Cases that exist but for the accept list. Nothing is parameterised that was not: `casesAreGreen` still asks for the Cases that apply and the observations, nothing about phases.
- **SOLID**: one reason to change per module (the tree; what a collector holds; whether Cases are green; where a route may write), the judges depend on those abstractions and on nothing above them, a new judge or the Dispatcher is added without opening an existing module, and the layering is a Case.
- **What a judge keeps**: its judge, its command line, and the facts or matchers it has always exported, as re-exports of the library (`judge-act.mjs`: `elementsOf`, `justifiedBy`, `applicableCases`, `retrosOf`, `changeIdOf`; `judge-limit-act.mjs`: `inFolder`, `isFile`), so the Cases written against them stay valid.
- **Why before the next judge**: `verify Act` (release/C111) needs `changeIdOf` and the carried Changes; the flag `applies` and the Dispatcher need the facts without importing a judgement. Built on the judges they would deepen the dependency this Change removes.

## DO

On the merged PLAN, into the collector `kaal/release/act-lib`, after the promotion of `limit Act` (#2175) is on `main` and the collector has been synchronised (the write map module moves code that arrives with it):

1. Add `01-intent/I61-act-lib/I61.md`, `02-requirements/F87-act-lib/F87.md` and `03-architecture/A77-act-lib/A77.md` from the drafts; add `parent: release/A68` to A77 once release/C105 has placed A68.
2. Add the four modules of `05-src/phase/lib/` by moving the code out of the judges, and make the judges import them and re-export what they exported before.
3. Make the accept list below; rename T1310 to T1314 from `.red.mjs` to `.test.mjs` when green.
4. Run every Case: a refactor passes only when nothing that was green is red.

## Accept list

The DO changes these existing Cases, and only as stated; none is renamed or inverted.

- release/T1264, release/T1296 and release/T1302 each lose the assertion that a source file (`judge-act.mjs`, `judge-demand-act.mjs`, `judge-limit-act.mjs` and `write-map.json`) is equal to its PLAN draft. A Case that pins a file to its text fails on a faithful move and says nothing of behaviour (the Owner, 20 Nov 2026). Their behaviour assertions stay.
- release/T1299 calls `applicableCasesAreGreen` of the library where it called `judgeFinished` of the judge.

## ACT

A 4L retrospective in the ACT before the promotion, written by the thread that did the work; one retro for the collector.

## Left open

- The result shape `{ verdict, applies, message }` of every judge, and the switch of the Dispatcher to the judges (`final-step.mjs` deciding from the merged tree): the next Changes, planned on this library.
- Whether `retrosOf` stays in `collector.mjs` or moves with kaal-retro's finder: it is thin on purpose (it reads only `reflects`), and kaal-retro's finder is reached through the Exchange where the form is judged.
