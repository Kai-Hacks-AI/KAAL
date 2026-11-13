## Assessing a test against its claim

A test is proof; a review is judgement. Some claims can only be judged, and some can be tested. Before designing a Case, trace the claim it would verify back to the concern that owns it: Intent, Requirements, Architecture or a Defect. Then decide, in this order:

1. **Deterministic.** Is there an observable result and an oracle that is defensible and unambiguous, so that two readers of the claim would accept the same one? Name the observable and the oracle, and write the Case. Its result is verification.
2. **Judgment.** If no such oracle exists, a test cannot prove the claim, so hand it to judgement, which is Review, or an independent reviewer where there is no Review. Can it be evaluated meaningfully through evidence, comparison or independent review? Name the evidence, who judges, and from which seat, which is not the claim's author. Record the outcome as validation, never as a passing test.
3. **Pushback.** If neither is defined enough, name the concern owner who must clarify or change the claim, and put the question to them. Report the claim as unknown. Recommend; do not rewrite the owner's claim.

For every claim state why, and any unresolved question. What cannot be proven goes to judgement. Never invent an oracle, a threshold or an answer key to obtain GREEN. An author's key is that author's judgment: where an independent answer differs, record both.
