# C28 change

## PLAN

1. Add C28 with its gaps G63 and G64 and its Cases T289 and T290, RED on `main`: the DO records the needs in `05-src/wiring/rulesets/analyze-code.needs.json` (T289) and the merge-group acceptance in `acceptance.md` (T290).
2. Record the baseline: the realization already exists as `.github/workflows/codeql.yml` and reports two contexts, one per language.
3. State the naming (`naming.md`) and what the rulesets need, one entry per context and target (`ruleset-needs.json`).
4. The PLAN moves nothing and touches no `.github` path, no live ruleset and no declaration.

## DO

Not authorized by this PLAN. The DO would record the needs in the Engineering source, observe a merge group report both contexts (acceptance), and prepare new rulesets beside the old ones, disabled. Any `.github` change is a WIRE (release/A47) and travels alone. The ruleset activation is the Owner's go.

## ACT

A 4L retrospective of the Change, in `act.md`, before the promotion.

## Not in this Change

Ruleset activation, any change to `codeql.yml`, the default code scanning setup, the retirement of anything, and any other control.

## Dependencies

release/C18 is the sibling and is independent. release/C27 (WIRE) installs what the DO would later prepare.
