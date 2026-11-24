# C108 do

The DO adds, from the drafts in `interface.md` (as revised by the PLAN of #2169: one collector, exactly one ACT, reflecting the complete set of the carried Changes): the Intent `01-intent/I58-change-closed-by-act/I58.md`, the Requirement `02-requirements/F84-demand-act/F84.md`, the Architecture `03-architecture/A74-judge-demand-act/A74.md`, the control `04-controls/CTL29-demand-act/CTL29.md` (`demand Act`, detective, designed) and the judge `05-src/phase/judge-demand-act.mjs` (`judgeDemandAct` and the command line), which reuses `retrosOf`, `changeIdOf` (qualified ids from the Change records), `applicableCases` and `judgeFinished` of release/C103. T1294 to T1298 are renamed from `.red.mjs` to `.test.mjs`.

`parent: release/A68` is not added to A74: release/C105's DO is not on `main` yet (step 2 of the PLAN's DO).

## Verified

The five Cases pass; `node --test engineering/cases/cases.test.mjs`: 313 tests, 297 pass, the same 16 pre-existing failures as the collector; pull/T34 passes. Nothing enforces anything: no workflow, no hook, no station or ruleset change, and the control stays detective and `designed` until its evidence exists.
