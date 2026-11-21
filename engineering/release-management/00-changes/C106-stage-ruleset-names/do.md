# C106 do

The DO of the merged PLAN, on the collector after the SYNC that brought the judge of release/C120 (the stage declares the name, the judge compares and holds none) and the queue of release/C117 into the collector.

## What changed

- `05-src/stages/stages.json`: the declared `ruleset` of release/C120 changes to Integrating (`20 - integrating`), Hotfixing (`21 - hotfixing`), Wiring (`22 - wiring`), Collecting (`23 - collecting`), Promoting (`30 - promoting`) and Publishing (`40 - publishing`).
- `05-src/stages/judge.mjs`: unchanged here; release/C120 already compares the source with the declared name.
- The `name` of the six sources in `05-src/wiring/rulesets/`; the file names stay.
- `02-requirements/F82-stage-ruleset-names/F82.md`, from the draft; T1280 to T1284 renamed from `.red.mjs` to `.test.mjs`.
- `05-src/wiring/rulesets/README.md` and `controls.md` name each ruleset by its number.

## Accept list

T481 and T487 (the name assertions), T862 (the draft it compares the source with, but for the name), T734 and T1321 (the row of the table of controls is `30 - promoting`) and T1346 to T1349 of release/C120 (the declared names they pin are now the numbered ones). T1132 compares only the checks, so it needed no change.

## Verified

`node --test engineering/cases/cases.test.mjs`: see the pull request; the known failures are unchanged. Nothing is installed: the live rulesets keep their names until the Owner renames them, and the sources now match the numbered names by name.
