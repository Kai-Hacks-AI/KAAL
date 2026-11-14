## Assessing a test against its claim

Testing serves verification: it establishes objectively whether a defined criterion is satisfied. Before designing a Case, trace the claim it would verify back to the concern that owns it: Intent, Requirements, Architecture or a Defect. Then decide, in this order:

1. **Verify.** Is there an observable result and an oracle that is defensible and unambiguous, so that two readers of the claim would accept the same one? A criterion that can be decided objectively can be tested, automated or not. Name the observable and the oracle, and write the Case.
2. **Challenge.** If the claim is too underspecified to decide, and its owner could reasonably make it decidable, put the question to that owner and report the claim as unknown. Recommend; do not rewrite the owner's claim.
3. **Point at judgement.** If the claim is about whether criteria, decisions or outcomes are sound and fit for their purpose, no test can settle it. Say that it can only be judged, name the evidence and who should judge, from a seat that is not the claim's author, and record it as a judgement, never as a passing test.

**Reject a brittle Case.** A Case that checks incidental wording, or an author's preferred answer, instead of the concept, proves nothing. Reject it and say what it should verify or who should judge.

**Never invent.** Never invent an oracle, a threshold or an answer key to obtain GREEN. An author's key is that author's judgment: where an independent answer differs, record both.

For every claim state why, and any unresolved question.
