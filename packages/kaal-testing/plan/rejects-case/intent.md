# Reject-a-Case Enforcement: Intent

This is `testing/C61`, a PLAN Change. It ships no Skill text and no code. `testing/C62` (DO, not yet authorized) runs the trial and records it.

**What is missing.** `testing/C59` and `testing/C60` put the section "Assessing a test against its claim" in the Testing Skill, including the rule "Reject a brittle Case". The trial of that section showed one difference between the Skill arm and the baseline: `rejectsCase` on E4, a constructed claim. The answer format carries the field, but nothing requires it. An answer may leave it out or fill it where the claim is no Case, and the one Case claim was constructed to contrast, not taken from a Case being designed.

- **testing/I39**: When Testing assesses a claim that is a proposed Case, the answer says whether the Case is rejected, every time, and says nothing of the kind about a claim that is no Case. The rule is checked on a Case that exists in the repository, not only on a constructed one. Testing never rewrites or tunes the Case or its owner's key.

Principle: a rule that is only judged by reading prose is not yet a rule an agent can be held to. The Script verifies the shape of the answer, deterministically. The Skill exercises the judgment, and whether a rejection is right stays with whoever judges the Case.

**Out of scope.** No change to the Skill, to `testing/T156` to `T160` or to the trial in `plan/testability/`. No new gate, export, finding kind or capability. No change to Architecture's T3 or its key.
