# C106 change

## PLAN

1. Add the draft in `interface.md`: the requirement release/F82, the `ruleset` key of a stage, the judge's comparison, and the six names.
2. Add the Cases T1280 to T1284, all RED: the real sources and the declaration agree on the six numbered names (T1280); a source with another name fails under its own check, for each of the six, naming the ruleset and both names (T1281); the judge holds no name in code, so a declared name decides (T1282); a stage with no ruleset name, or one that is not a string, fails closed (T1283); nothing else the judge decides changes (T1284).
3. Observe the expected RED and that each Case can pass with the DO's content (`evidence.md`).
4. The PLAN changes no judge, no declaration, no ruleset source and nothing under `.github`.

## Ids

Change `release/C106`, Requirement `release/F82`, Cases T1280 to T1284. No new Architecture or control: the ruleset sources stay with their Architecture elements and release/CTL1 judges them.

## DO

On the merged PLAN, into the collector of this Change:

1. In `stages.json`, add `ruleset` to Integrating, to each of its parts, to Promoting and to Publishing, with the six names of `interface.md`.
2. In `judge.mjs`, replace the two name checks by the comparison with the declared name; a missing or non-string name is a finding.
3. Rename the `name` of the six sources. File names stay (`promoting.json`).
4. Add `02-requirements/F82-stage-ruleset-names/F82.md` from the draft and rename T1280 to T1284 from `.red.mjs` to `.test.mjs` when green.
5. Amend the four Cases that hold the old names: release/T481 and T487 (the name assertions), T862 and T1132 (the draft they compare the source with).
6. In `05-src/wiring/rulesets/README.md` and `controls.md`, name each ruleset by its number.

## Accept list

release/T481, T487, T862, T1132: each amended in the DO and green after it. All others stay as they are; the 16 that fail on main still fail.

## Order with C105

Both DOs touch `promoting.json` and `stages.json`, in different places. C105's draft of `promoting.json` adds `non_fast_forward`; its `stages.json` entry adds a rule. Whichever DO lands second takes the other's lines in its collector; C105's own `A68` already calls the ruleset `30 - promoting`.

## Not authorized

Loading, renaming or deleting a ruleset in force is the Owner's step. After the DO the sources match the numbered rulesets in force by name; nothing is installed by this Change.
