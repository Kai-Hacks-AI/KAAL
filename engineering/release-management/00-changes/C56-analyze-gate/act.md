# C56 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The control and the detection stay apart: release/CTL2 is the report, and release/CTL5 is the requirement that uses it, with its own Intent (release/I30). The settings are stated and not inherited: severity low, scope runtime, no exemption, in both jobs, and Integrating stays warn-only. The CPO's review found a real gap before the DO: the Intent promised that a promotion whose analysis cannot be made does not proceed, and no Case showed it. T735 now runs the adapter on unavailable, incomplete and inconclusive input and shows each one ending non-zero.

## Learned

The judge of `Engineering / verify Stages` is the default branch's own. A ruleset source that requires a second check cannot pass the check while main's judge expects one, so a gate that adds a required check to an existing ruleset needs the judge to accept it first. The PLAN trial missed it because it ran the Cases on the candidate's tree, with the candidate's judge. The DO found one more Case to amend than the trial listed (T482).

## Lacked

A trial that runs the judge the way the workflow does: main's judge against the candidate's sources. It would have shown the order of the two Changes in the PLAN.

## Longed For

A way for a stage to declare its required checks in one place, so that adding a gate is a declaration and not an edit of the judge. The precursor release/C59 does the first step.

## Follow-ups

- Promote release/C59 first, then sync main into this collector (the judge line is in both) and promote C56.
- Installing the changed workflow is a WIRE and loading the ruleset is the Owner's step by the ruleset update procedure. Neither is decided here.
