# C49 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The Owner's remark that a control should be declared on the same collector as its implementation made the Change small and its order clear: C48 builds the reports, C49 declares them as `release/CTL2` beside them, and main never holds the workflow without its control. The finder did the judging: T600 lists the control, its type and its Intent from the frontmatter alone, and T601 shows that `release/I4` is answered by it. Nothing but one control item was added, and no check, ruleset or workflow was touched.

## Learned

A control is declared in the new form only when the control shape and `release/CTL1` are in the tree, so the collector first needed a SYNC from main. My first two SYNC branches failed the Branching check for a real reason: they were not branched from the collector's current tip, and the fix was to fetch the tip explicitly and merge a main commit into a branch made from it. A plan is a plan only when its Cases run RED, and here both Cases failed on their own assertion before the control file existed. Detective stays detective: making the reports required is a second control with its own decision.

## Lacked

Requirements and Architecture for `release/I4`: the control answers the Intent only through its control test, so the claim stops at what T600 and T601 observe. A merge-queue run of the reports, which C48's T583 still waits for.

## Longed For

A promotion that carries C48 and C49 together, then the WIRE that installs the workflow, with a recorded run. After that, a separate preventive control, if the Owner decides one, that wires the detective control into a ruleset.

## Follow-ups

- Promote C48 and C49 together, then WIRE `wire/analyze-vulnerabilities`.
- Add Requirements and Architecture of `release/I4` in later Changes.
- Make the reports required only through a separate preventive control with its own Owner decision.
