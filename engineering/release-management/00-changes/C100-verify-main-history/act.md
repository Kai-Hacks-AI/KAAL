# C100 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The CPO's review of the PLAN found the one claim the control could not honour: a deleted `main` cannot be seen from a push to `main`. Cutting the control back to what it can observe (a rewrite of history is a failure, a missing commit is UNKNOWN) made the judge small and its four verdicts easy to test. The same four Cases turned RED to GREEN in the DO without a change of meaning.

## Learned

A control must name what it cannot see, as plainly as what it sees. Declaring the evidence minimum in the format the controls capability uses (`fixture`, `real` and a `:fail` kind) kept the control inside the common judgement, instead of one more special case. An old rule that guards against deletion and rewrites in one sentence is really two protections, and each needs its own observation.

## Lacked

A credible observation for the deletion of `main`: it needs an event or a read that survives the deletion, so it is its own Intent and control. There is also no recorded run of the workflow, so CTL22 stays `designed` and no minimum is met.

## Longed For

The workflow installed by a WIRE, with the Owner's decision, so the first real runs can be recorded and the control can reach Tested. The retirement of the matching legacy ruleset protection follows only then, in the controls-first order.
