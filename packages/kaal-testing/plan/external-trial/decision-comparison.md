# T20 trial: decisions for the Owner

The Owner redefined the trial (5 Nov): compare a bare agent, an agent with Agent instructions only, and the agent with kaal-review as a Skill (including its deterministic scripts) on the same task and the same change. If the Skill improves the result over both, Review has passed validation. This replaces the earlier acceptance bar options A, B and C. Nothing here starts the trial, selects a target or claims External readiness. Testing offers the options and chooses none.

## Already decided

- Review is validation, Testing is verification. "Correct" is not a manageable bar; "useful" is.
- Truth rests on deterministic facts. Records, ratings and rankings are judgment, recorded as judgment, attributed to whoever gives it.
- kaal-review judges, kaal-testing proves. Review's record sits on the Skill side of BASS and claims no proof.
- Target: a real pending change in an Owner non-KAAL repository, in a throwaway copy, through the CPO.
- Who judges "improves" (5 Nov): the Owner experiences the three arms' output and judges. The CPO and CTO observe and steer the experiment and the Owner toward results. They are observers and steerers, not judges, and each steer is recorded.
- Runs (5 Nov): two complete runs over all three arms, one steered and observed by the CTO and one by the CPO, each recorded in this PR as markdown files (`records/cto/`, `records/cpo/`).
- The checklist and the neutral script are applied by a fresh Claude session with no KAAL context (3 Nov), as its own recorded judgment.

## Open, one at a time

1. **What the Owner sees.** A: the three records anonymous and in random order, then the arms revealed. B: the records labelled by arm from the start. Recommended: A, so the Owner's first judgment is not steered by the label, which also keeps steering by the CPO and CTO from tilting it.
2. **On what the Owner judges.** A: usefulness for validating the change against its Intent (the checklist and a useful, partly useful or not useful rating, each with a reason). B: only which record the Owner would rather have, with a reason. Recommended: A.
3. **How the two runs combine.** A: arm 3 must improve over both other arms in both runs. B: in at least one run, with the other recorded beside it. Recommended: A, since a pass that depends on which observer steered it says little.
4. The repository, the change and its Intent, and when the trial may start. The Owner says.

## What every arm is measured by

Facts, by the same neutral script on all three records: every `path:line` pointer resolves, the Intent is quoted unchanged, the effect diff matches the declared effects, the arm inputs match their recorded hashes. Judgment, by the checker (checklist readings) and the Owner (usefulness): the checklist's judged parts and the usefulness comparison. The Skill's own `check-record` is a fact about arm 3 only and is not used to compare arms.

## Consequences

- **Improves over both.** The two comparison Cases pass for this commit, change and Intent only. It is input to the Owner's decision and never a gate, and it does not grant External readiness.
- **Not over one or both.** The Case fails and returns to Review as a Finding. A Finding the CPO confirms becomes a Defect in Review's context with a RED Case in `review/E7`.
- **Undecided.** The Case stays `skipped`, reads as `unknown`, and is never a pass.
