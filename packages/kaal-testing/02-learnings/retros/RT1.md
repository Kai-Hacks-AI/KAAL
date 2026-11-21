---
id: testing/RT1
format: 4L
reflects: [testing/C71, testing/C72, testing/C73]
---
Account of: I am the Testing thread, the CTO side of this collector. I did not build C71, C72 or C73: a separate technical agent built the PLAN (#2213) and the two DOs (#2217, #2224). I reviewed each of them against the PLAN and the CPO's conditions, posted the CTO comment reviews, set squash auto-merge when Kai agreed, and wrote this retro. This is my account only: the builder, the CPO and the research capability have not been asked what they lacked.

## Liked
- subject: the four finding kinds held, with no fifth kind for uncovered behaviour
  keeps: the uncovered-behaviour question was answered inside the existing kinds (unknown, architectural concern, potential defect), so Defect, Review and Architecture keep their own work and Testing stays a reporter.
- subject: the claim, mutation, witness, observation and judgment table in c73-sensitivity.md with each mutant's from and to and the subject SHA
  keeps: a reader can recreate any of the sixteen mutants and see which named test detects it, without the one-off runner being in the repository.
- subject: the BASS judgment that a mutation runner Script is not earned from one bounded exercise
  keeps: Testing stays small and no research framework grows inside it; the eleven deterministic checks sit at Script level in the suite and the judgment about claims stays Skill guidance.

## Learned
- subject: a surviving mutant is a candidate for a test gap, not proof of one, because an equivalent mutant cannot be killed by any test
  source: mutation-testing literature found by web search (UCL ICSE 2014 paper, ISSTA 2024 equivalent-mutants paper, Schuler and Zeller ICST 2010), read as search summaries, so secondhand. It says deciding between hard-to-kill and equivalent is manual and costs minutes per mutant.
- subject: position bias in an LLM judge is measured by reversing option order and eased by permuting it, judges differ in whether they favour the first or the last option, and none of the sources found tests blinding as a remedy for self-preference
  source: arXiv 2406.07791 (Judging the Judges), an EMNLP 2026 Findings paper on rubric judging and arXiv 2410.21819 (self-preference bias), found by web search and read as summaries, so secondhand.
  searched: blinding the source of an answer against self-preference, and nothing relevant came back.

## Lacked
- subject: nothing in a comment's author field says which role is speaking
  decision-point: labelling each comment on #2213, #2217 and #2224 as CPO, builder or CTO review.
  cost: the builder's comments, the CPO's reviews and my own reviews came from the same two accounts, so I labelled by the comment's own heading and style and had to say I could not confirm the author; one wrong label would have mixed a builder's claim with a decision.
  findable: no
  address: AGENTS.md
- subject: nothing said what a CPO review's "No merge authorized" means when auto-merge is already on
  decision-point: reading the CPO approval of #2213 at 10:32 while auto-merge was set.
  cost: the PR merged three seconds after the approval, before Kai's switch-off instruction reached me, and I could only report that it was too late.
  findable: no
  address: AGENTS.md
- subject: nothing marked a red Branching on a PR whose auto-merge is off as expected
  decision-point: classifying review points on #2213 before Kai's rule that auto-merge waits for agreement.
  cost: I counted the red check as an open review point, told the coordinator a fresh Branching run was in progress when it had failed again, and then had to withdraw both.
  findable: no
  address: Skill
- subject: the trial rule did not say whose trial it applied to
  decision-point: reading #2217, which already held the builder's n = 2 runs, after Kai's rule that no trial starts before the finish line.
  cost: I reported the runs as a rule violation and had to retract that and reframe the review after Kai's correction.
  findable: no
  address: AGENTS.md

## Longed For
- subject: a statement in the contracts README on whether the order of review evidence hashes matters
  worked-anyway: mutant M11 stayed unpinned as unknown and a proposed clarification, nothing was blocked; Testing owns README.md and lib/contracts.mjs, so the clarification is a small follow-up Change of its own.
- subject: evidence from real KAAL capability work that the new Testing loops section is used and helps
  worked-anyway: the CPO accepted C72 with qualified observation reuse and real-world test execution named as validation gaps, and nothing was held up.
- subject: an independent, blinded Skill trial run from the kaal-research capability
  worked-anyway: the builder's n = 2 trial was enough evidence for C72 as the CPO bounded it, and the research checklist (n = 5 per arm descriptive only, a shuffled blinded judge with a mapping file, loading shown from the skill location, a control pilot, fresh sessions, pinned model and settings, pre-stated outcomes, a key that does not name the expected result) is recorded for later.

Decisions: none made, the owner decides.
