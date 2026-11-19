# C41 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The rule judges format only, so it stayed small: one function, `howToWorkProblems`, called by `verifyEnvelope`, and silent when the chapter is absent. The separator hole was found in review and became a Case that fails on the previous head, so the fix is proven and not only claimed. Owner stayed optional in the middle and never a border row, as the Definition says.

## Learned

A table check that only counts cells in the header lets a four-cell separator pass: every row, the separator included, needs the same width test. A Dependency row is only checkable by its reference, so `#<number>` in Details is the one content rule the format needs. Whoever writes a format rule should write the malformed cases first (missing, extra and malformed separator cells), because the happy path hides these.

## Lacked

A shared table reader for the envelope checks, so each rule does not split cells on its own. A fixture of real template bodies; the templates for PLAN, DO, ACT, SYNC, PROMOTION and DEFAULT are still to come (C42 to C47), so the rule ran on built fixtures only.

## Longed For

The six templates carrying the chapter, so the rule meets real bodies. The Predecessor and Successor links checked live, which is a different control and not this Change. A single table reader under the envelope checks.

## Follow-ups

- Each template Change (C42 to C47) adds the chapter and runs this rule on its real body.
