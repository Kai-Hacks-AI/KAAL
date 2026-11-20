# C103 do

The DO adds, from the drafts in `interface.md`: the Intent `01-intent/I56-act-enters-when-the-plan-cases-are-green/I56.md`, the Requirement `02-requirements/F80-hold-act/F80.md`, the Architecture `03-architecture/A71-hold-act-from-the-tree/A71.md`, the control `04-controls/CTL24-hold-act/CTL24.md` (`hold Act`, detective, designed) and the judge `05-src/phase/judge-act.mjs` (`applicableCases`, `retrosOf`, `judgeHold`, `judgeFinished`, `judgeAct` and the command line). T1260 to T1266 and T1299 are renamed from `.red.mjs` to `.test.mjs`.

## Cases amended

None.

## Verified

`node --test engineering/cases/cases.test.mjs`: 308 tests, 292 pass, the same 16 pre-existing failures as the collector. The eight Cases of this Change pass. Nothing enforces anything: no workflow, no hook, no station or ruleset change, and the control stays detective and `designed` until its evidence exists.
