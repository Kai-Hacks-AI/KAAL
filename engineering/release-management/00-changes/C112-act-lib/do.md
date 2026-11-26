# C112 do

The DO adds, from the drafts in `interface.md`, the Intent `01-intent/I61-act-lib/I61.md`, the Requirement `02-requirements/F87-act-lib/F87.md` and the Architecture `03-architecture/A77-act-lib/A77.md`, and moves the code of the three judges into the library `05-src/phase/lib/`: `tree.mjs` (`walk`, `frontmatter`), `collector.mjs` (`elementsOf`, `justifiedBy`, `applicableCases`, `retrosOf`, `changeIdOf`, and `carriedChanges`, which the two command lines each wrote), `cases-green.mjs` (`casesAreGreen`, the former core of `judgeAct`, and `applicableCasesAreGreen`, the former `judgeFinished`) and `write-map.mjs` (`inFolder`, `isFile`, `relativeToRoot`, `inRoute`, from the judge of `limit Act`). The judges keep their judge and command line and import the library; `judge-act.mjs` and `judge-limit-act.mjs` re-export the facts and matchers they exported before. `judge-demand-act.mjs` no longer imports `judge-act.mjs`. T1310 to T1314 are renamed from `.red.mjs` to `.test.mjs`.

The accept list of the PLAN is made and nothing else of an existing Case changes: T1264, T1296 and T1302 lose the assertion that a source file equals its PLAN draft, and T1299 calls `applicableCasesAreGreen`. `parent: release/A68` is not added to A77: release/C105's DO is not on `main` yet.

## Verified

The five Cases pass, and so do the 304 other Cases of the release capability. `node --test engineering/cases/cases.test.mjs`: 338 tests, 322 pass, the same 16 pre-existing failures as `main`. No verdict, message, command line, declaration, workflow, hook or ruleset changed.
