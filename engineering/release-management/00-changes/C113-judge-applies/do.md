# C113 do

The DO adds, from the drafts in `interface.md`, the Intent `01-intent/I62-judge-applies/I62.md`, the Requirement `02-requirements/F88-judge-applies/F88.md` and the Architecture `03-architecture/A78-judge-applies/A78.md`, and the module `05-src/phase/lib/result.mjs` (`answer`, `pass`, `fail`, `unknown`, `judgedAndFine`). `cases-green.mjs`, `judge-act.mjs`, `judge-demand-act.mjs` and `judge-limit-act.mjs` build their answers with it: every answer carries `applies`, false only on a PASS with nothing to judge (`hold Act` with no retro reflecting a carried Change; `demand Act` without exactly one retro that reflects every carried Change; `limit Act` for a pull request that is not an ACT). Every verdict, message and command line is as it was. T1315 to T1319 are renamed from `.red.mjs` to `.test.mjs`.

The accept list of the PLAN is made and nothing else of an existing Case changes: T1314 lists the fifth layer, `result`, which imports nothing. `parent: release/A68` is not added to A78: release/C105's DO is not on `main` yet.

## Verified

The five Cases pass, and so do the other Cases of the release capability. `node --test engineering/cases/cases.test.mjs` is run in CI; the Cases of the release capability were also run directly here.
