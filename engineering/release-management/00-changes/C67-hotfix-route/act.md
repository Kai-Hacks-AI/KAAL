# C67 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The PLAN held the correction as drafts and named, in advance, the six old Cases that would fail with them. The DO was therefore an application and not a discovery: the drafts applied as written, T870 to T873 went green at once, and the six predicted Cases (T161, T188 to T192) were the only ones that failed, so a surprise would have shown. The Defect had its own record (release/D1) with an owner, acceptance criteria and the verification, and the verification ran: the filled HOTFIX template of release/C63, sent into a `hotfix/` base from a Development head, gives UNKNOWN with no finding.

## Learned

I first wrote that the envelope check was live. It is not: it runs by hand, and no workflow, ruleset or hook runs it. I corrected the baseline, the Defect record, the change and the evidence, and told the coordinator. Nothing was refusing a real HOTFIX, so the defect cost nothing yet; it would have as soon as the check became a gate. The cause is the shape of the control: the route of each type is hard-coded in the judge as a row, in the requirement as words and in Cases as expected values, so a change of the flow has to be made three times and one of the three is forgotten. That is what happened to the first hotfix idea. The Owner's answer, rules as data per template with the check as a generic interpreter (the design of release/CTL11), removes the shape of the problem and not only this instance.

## Lacked

A single statement of what each pull request type goes into, kept where the check reads it. Today it is in the judge's rows, in F17 and in several template comments. I also lacked a way to run the check on a real pull request: the Cases show the rows, not an acceptance of a real body.

## Longed For

The check reading the route from the base branch's template declaration, and running read-only on every pull request, so that a template and the check cannot disagree without a Case going red.

## Follow-ups

- One assertion of T188 is removed: that a HOTFIX from a collector head is refused. The agreed route refuses only a `hotfix/` head, and whether a collector head is acceptable for a HOTFIX is for the Reviewer. If the Owner wants the route to refuse it, that is a new rule with its own Case.
- Promote this collector. It has delivery priority. The release/D1 verification is done in the DO (`do.md`); whether the templates WIRE may proceed is the Owner's and the CPO's.
- The route rows are replaced by the declaration a template carries when release/C69 (the interpreter of release/CTL11) lands; T870 to T873 are its regression. Nothing here wires or gates the check.
