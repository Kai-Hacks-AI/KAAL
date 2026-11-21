# C106 do

The DO of the merged PLAN, on the collector after the SYNC that brought the queue of release/C117 into `promoting.json`.

## What changed

- `05-src/stages/stages.json`: `ruleset` on Integrating (`20 - integrating`), Hotfixing (`21 - hotfixing`), Wiring (`22 - wiring`), Collecting (`23 - collecting`), Promoting (`30 - promoting`) and Publishing (`40 - publishing`).
- `05-src/stages/judge.mjs`: the two name checks compare the source's `name` with the name the stage declares and hold no name in code; a stage with no name, or one that is not a string, is a finding.
- The `name` of the six sources in `05-src/wiring/rulesets/`; the file names stay.
- `02-requirements/F82-stage-ruleset-names/F82.md`, from the draft; T1280 to T1284 renamed from `.red.mjs` to `.test.mjs`.
- `05-src/wiring/rulesets/README.md` and `controls.md` name each ruleset by its number.

## Accept list

T481 and T487 (the name assertions) and T862 (the draft it compares the source with, but for the name). T1132 compares only the checks, so it needed no change.

## Verified

`node --test engineering/cases/cases.test.mjs`: 355 tests, 339 pass; the 16 failures are the same as on the collector before this DO. Nothing is installed: the live rulesets keep their names until the Owner renames them, and the sources now match the numbered names by name.
