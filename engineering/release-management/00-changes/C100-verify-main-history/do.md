# C100 do

On the merged PLAN (CPO approved, PR #2073), into the collector `kaal/release/verify-main-history`.

## What was done

- Added `01-intent/I54-main-history-is-kept/I54.md`, `02-requirements/F77-verify-history/F77.md`, `03-architecture/A68-verify-history/A68.md` and `04-controls/CTL22-verify-history/CTL22.md`, each equal to its draft in `interface.md`.
- Added `05-src/history/verify-history.mjs` and `05-src/wiring/workflows/verify-history.yml`, equal to their drafts. Nothing is installed: no file under `.github`, no ruleset, no setting.
- Renamed T1173 to T1180 from `.red.mjs` to `.test.mjs`.

## Observed

- T1173 to T1180: 8 of 8 pass, run alone.
- The controls checker lists release/CTL22 as valid, status designed, with its `evidence` declaration.
- `node --test engineering/cases/cases.test.mjs`: 302 tests, 286 pass, 16 fail. The same 16 fail on `main` (the 12 collector-capability Cases T268 to T279 and engineering T386 to T389); no other Case fails.

## Not done, by design

CTL22 claims `designed` and no more. No run is recorded, so no evidence minimum is met. A deletion of `main` is not observed (a missing commit after the push is UNKNOWN). Registration in a station, the WIRE of the workflow and any preventive twin are separate steps with the Owner's decisions.
