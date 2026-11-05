# T20 trial: decisions for the Owner

The Owner redefined the trial (5 Nov): compare a bare agent, an agent with Agent instructions only, and the agent with kaal-review as a Skill (including its deterministic scripts) on the same task and the same change. If the Skill improves the result over both, Review has passed validation. This replaces the earlier acceptance bar options A, B and C. Nothing here starts the trial, selects a target or claims External readiness. Testing offers the options and chooses none.

## Already decided

- Review is validation, Testing is verification. "Correct" is not a manageable bar; "useful" is.
- Truth rests on deterministic facts. Records, ratings and rankings are judgment, recorded as judgment.
- kaal-review judges, kaal-testing proves. Review's record sits on the Skill side of BASS and claims no proof.
- Target: a real pending change in an Owner non-KAAL repository, in a throwaway copy, through the CPO. The CPO reviews the judge's verdict. The Owner is not the judge.
- The judge is a fresh Claude session with no KAAL context.

## Open, one at a time

1. **Who judges "improves".** A: the CPO alone, blind to the arm. B: an independent fresh Claude session judges blind, and the CPO reviews and decides where they differ. Recommended: B, so a judgment is first made by someone who is not the user of the record, and the CPO still decides.
2. **On what.** A: usefulness for validating the change against its Intent (the four-item checklist and a useful, partly useful or not useful rating, each with a reason). B: only which record the judge would rather have, blind, with a reason. Recommended: A, because it leaves a reason per item that anyone can read.
3. **Runs per arm.** A: one each. B: three each, and "improves" means the Skill arm is ahead in most. Recommended: A for a first screen; the sample is small either way.
4. The repository, the change and its Intent, and when the trial may start. The Owner says.

## What every arm is measured by

Facts, by the same neutral script on all three records: every `path:line` pointer resolves, the Intent is quoted unchanged, the effect diff matches the declared effects, the arm inputs match their recorded hashes. Judgment, by the judge: the checklist's judged parts and the usefulness comparison. The Skill's own `check-record` is a fact about arm 3 only and is not used to compare arms.

## Consequences

- **Improves over both.** The two comparison Cases pass for this commit, change and Intent only. It is input to the Owner's decision and never a gate, and it does not grant External readiness.
- **Not over one or both.** The Case fails and returns to Review as a Finding. A Finding the CPO confirms becomes a Defect in Review's context with a RED Case in `review/E7`.
- **Undecided.** The Case stays `skipped`, reads as `unknown`, and is never a pass.
