# C27 evidence

The PLAN of C27 observes its RED against the collector `kaal/engineering/setup` at `e3a096d4`. It cites nothing that is not on that collector.

## Provenance

- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 20 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T1241 | I5 | RED: the concerns are not in the order |
| T1242 | F56 | RED: `02-controls` is still in the layout |
| T1243 | F57 | RED: a correct setup is not PASS |
| T1244 | CTL2 | RED: CTL2 is still in `02-controls` |
| T1245 | F58 | RED: `02-learnings` is absent |

5 RED-observed, 0 error, 0 green. Every Case fails on its own assertion.

## Can each Case pass

In a throwaway root outside the repository, holding this tree with `draft/` copied over `skills/kaal-engineering/` and CTL2 moved to `engineering/14-operations/controls/CTL2-verify-layout/`: all five are GREEN.

## Can a Case fail for the right reason

Four edits in that copy (the last one for T1245: setting `closed` false on `02-learnings` turned it RED): reading the `closed` flag by name (the earlier check) turned T1243 RED; setting `closed` false on `14-operations` turned T1242 and T1243 RED; moving the controls folder back before the source turned T1241 RED.

## The amended Cases

In the same copy T1220 is GREEN once `14-operations` says what verifies it, and T1221, T1225, T1230, T1231, T1234 and T1236 are RED, as the Amends chapter says. T1232, T1233, T1235, T1238 and T1177 are GREEN. They are amended in the DO all the same.

## What this shows and does not show

The Cases show that the template states the order, that the check follows the template and names the earlier numbering, and that CTL2 sits in its new place. They do not show that the order is the right one (the Owner's and the CPO's judgement), nor that any package follows it: no package is migrated.
