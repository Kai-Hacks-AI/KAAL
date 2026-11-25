# C111 do

The DO adds, from the drafts in `interface.md`, the Intent `01-intent/I60-act-is-a-well-formed-retro/I60.md`, the Requirement `02-requirements/F86-verify-act/F86.md`, the Architecture `03-architecture/A76-judge-verify-act/A76.md`, the control `04-controls/CTL31-verify-act/CTL31.md` and the judge `05-src/phase/judge-verify-act.mjs`. T1305 to T1309 are renamed from `.red.mjs` to `.test.mjs`.

## What the DO changes against the PLAN's drafts

The collector was synchronised with `main`, which now holds the library (release/C112) and the answer module (release/C113). As release/C113 said, this judge gets the flag in its own DO, so the drafts of the judge, F86 and A76 in `interface.md` are amended and the files are made from the amended drafts:

- The judge takes `changeIdOf` and `walk` from the library, not from another judge (the library imports no judge, and no judge imports another), and builds its answers with `lib/result.mjs`. Every answer carries `applies`: false only on a PASS where no retro reflects a carried Change (there is no ACT to verify); true on every other PASS, and on every FAIL and UNKNOWN.
- F86 and A76 say so, once. Every verdict, message and exit code of the command line is as the PLAN had it.
- T1307 learns the flag (eight assertions). No other Case changes.

`parent: release/A68` is not added to A76: release/C105's DO is not on `main` yet.

## Verified

The five Cases pass. The 16 failures of `node --test engineering/cases/cases.test.mjs` on `main` are the same before and after this DO (the same Cases, T268 to T279 and T386 to T389); nothing that was green is red. A mutation of the flag (`applies: true` on every PASS) is caught.

## What this shows and does not show

That the judge says what the form answers of kaal-retro mean for the carried Changes, carries `applies` as the Dispatcher will need it, never passes what it cannot read, never reads Git or GitHub, and does not define the form. It does not show that a retro is true, that a job runs it or that a station requires it: those are the next Changes, and the control stays `designed` until its evidence exists.
