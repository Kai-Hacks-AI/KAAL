# C77 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The setting-to-control trace was a small step once the judge already read declared rules: one `settingControls` map beside the status-check rule, and three findings (a setting with no control, a control for an undeclared setting, a control with no Intent). The throwaway run before the DO made the DO a copy of a result that already held.

## Learned

The PLAN, DO and the two sibling Changes (release/C76 and release/C78) all touch `judge.mjs`, `stages.json` and the shared fixtures, so they have to land one behind the other; building them in parallel from the same collector tip works only because each edits a different part of the judge. The Cases that build the judge's facts (the release/C70 fixtures and the release/C35 helper) must carry every new control and key, or older Cases stop describing the real tree. Two settings share one control here by design: a later Change may split them, and nothing in the judge forbids it.

## Lacked

A list of what each setting in a ruleset answers to, read from the ruleset itself, so a setting nobody traced shows up without a Change that names it. A way to tell, before a DO, which shared Cases a new key will force me to amend.

## Longed For

The live rulesets loaded beside the old ones, so `strict_required_status_checks_policy` and `do_not_enforce_on_create` can be seen holding in the host and the control can move from Implemented to Running. Judge tests that read the real `stages.json` as well as fixtures.
