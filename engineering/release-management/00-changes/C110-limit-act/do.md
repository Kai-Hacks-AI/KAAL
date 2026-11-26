# C110 do

The DO adds, from the drafts in `interface.md` (as revised in #2166, relative entries and the capability roots as a third fact): the Intent `01-intent/I59-act-does-only-act-work/I59.md`, the Requirement `02-requirements/F85-limit-act/F85.md`, the Architecture `03-architecture/A75-judge-limit-act/A75.md`, the control `04-controls/CTL30-limit-act/CTL30.md` (`limit Act`, detective, designed), the judge `05-src/phase/judge-limit-act.mjs` and the write map `05-src/phase/write-map.json` (the first row, `act`). T1300 to T1304 are renamed from `.red.mjs` to `.test.mjs`.

The judge is independent of the other controls of the ACT: it imports nothing from `judge-act.mjs`.

## Verified

The five Cases pass; `node --test engineering/cases/cases.test.mjs`: 320 tests, 304 pass, the same 16 pre-existing failures as the collector; pull/T34 passes. Nothing enforces anything: no workflow, no hook, no station or ruleset change, and the control stays detective and `designed` until its evidence exists.
