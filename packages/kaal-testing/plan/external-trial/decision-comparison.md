# T20 trial: decisions for the Owner

The Owner redefined the trial (5 Nov): compare a bare agent, an agent with Agent instructions only, and the agent with kaal-review as a Skill (including its deterministic scripts) on the same task and the same change. If the Skill improves the result over both, Review has passed validation. This replaces the earlier acceptance bar options A, B and C. Nothing here starts the trial, selects a target or claims External readiness. Testing offers the options and chooses none.

## Already decided

- Review is validation, Testing is verification. "Correct" is not a manageable bar; "useful" is.
- Truth rests on deterministic facts. Records, readings and arguments are judgment, recorded as judgment, attributed to whoever gives it.
- kaal-review judges, kaal-testing proves. Review's record sits on the Skill side of BASS and claims no proof.
- Target: a real pending change in an Owner non-KAAL repository, in a throwaway copy, through the CPO.
- Who judges "improves" (5 Nov): nobody scores or picks. The CTO and CPO each argue the comparison from their own seat and need not agree; they also observe and steer. The Owner discusses each argument with that seat, and the shared plan is the outcome.
- What the Owner sees (5 Nov): the records labelled by arm. Blinding is artificial because the Owner helps the runs succeed, and a blind judgment would need a second human. The checker still reads them anonymous.
- Runs (5 Nov): two complete runs over all three arms, one steered and observed by the CTO and one by the CPO, each recorded in this PR as markdown files (`records/cto/`, `records/cpo/`).
- The checklist and the neutral script are applied by a fresh Claude session with no KAAL context (3 Nov), as its own recorded judgment.

## Open, one at a time

1. *On what the Owner judges: superseded (5 Nov, cmsg_01Rm7j7LZSnurdg3KFfnH5czEW72KMd6VWBMwvqDRot2Pt).* The Owner does not score or pick records. Each seat argues the comparison from its own seat, they need not agree, and the Owner discusses each with that seat; the shared plan is the outcome. There is no judging basis to choose.
2. *How the two runs combine: decided (5 Nov), they are not combined.* Each seat argues the comparison from its own seat in its own run record, and they need not agree. The Owner discusses each seat's findings with that seat, and the shared plan comes out of that.
3. The repository, the change and its Intent, and when the trial may start. The Owner says.

## What every arm is measured by

Facts, by the same neutral script on all three records: every `path:line` pointer resolves, the Intent is quoted unchanged, the effect diff matches the declared effects, the arm inputs match their recorded hashes. Judgment, by the checker (checklist readings) and the Owner (usefulness): the checklist's judged parts and the usefulness comparison. The Skill's own `check-record` is a fact about arm 3 only and is not used to compare arms.

## Consequences

- **Whether Review improved the result** is not a Case and has no pass line. It is argued by each seat and discussed with the Owner, and it never grants External readiness.
- **A failed Case** (independence, arms, facts or effects) returns to Review as a Finding. A Finding the CPO confirms becomes a Defect in Review's context with a RED Case in `review/E7`.
- **Undecided.** The Case stays `skipped`, reads as `unknown`, and is never a pass.
