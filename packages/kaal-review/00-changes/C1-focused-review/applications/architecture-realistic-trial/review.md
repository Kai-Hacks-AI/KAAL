# Review: the five-request trial of the kaal-architecture Skill, against the Intent of Architecture

## Focus

capability: the Intent of the capability is compared with what it delivers. The application is the independent Review of Architecture DO #1595 for the Owner's decision on promoting the Skill. It does not touch the earlier application `architecture-classification`, whose record of the S4 trial stays as it is.

## Reference

architecture/I1 and architecture/F5 at a9e19a9, with the boundary and the four questions the CPO set for this review on 14 Nov. I1: an agent classifies the statements about the target state of a plateau as Solution or Delivery before design proceeds, from one concise Skill. F5: a recorded comparison of an agent with the Skill and one without it, on realistic requests of this project. The CPO's boundary: Solution Architecture describes what the intended solution is and must do, Delivery Architecture describes how it is realized, operated and made available, and Change moves from one state to another and is not Architecture's work. Solution and Delivery are the things themselves, and the two Architectures are their descriptions. The CPO's questions: the quality of the architectural judgment, the separation of Architecture from Change, the incremental value over the baseline, and the limits of the evidence.

## Actual

the five-request trial of the kaal-architecture Skill, Architecture DO #1595 as merged into kaal/architecture/classify at a9e19a9: five frozen requests (agent hosting, Review installation, Pull Promotion, incident reporting, Testing and Review integration), one run of a fresh agent with the Skill and one without it, each with prompt, raw output and a record with hashes, and the Cases T10 and T11 that verify the evidence only.

## Comparison

Marks. Proven: a Case or recorded trial shows it, cited by id or path with its result, and not repeated here. Judged: only judgement can settle it, and the reasoning is given. Testable, not tested: a test could show it and none exists, and the finding says what a test would have to show.

### Promised, not delivered

- Judged. I1 promises that an agent classifies before design proceeds, and the trial cannot tell activation from execution, which is a confound (raised by the CPO). Both arms were instructed to examine the architectural boundary and classify, so the baseline was told to look. Activation (does an agent recognize the need and invoke the Skill without explicit architectural prompting?) was not tried: the Skill arm was handed the Skill and the instruction. Execution (once invoked, does it improve judgment?) was tried, and showed only the differences described below. The Skill's distinct value may lie in activation, and this trial says nothing about it. Checked: `skill.prompt.txt` and `baseline.prompt.txt`, which both carry the instruction to classify.
- Judged. C2 and F5 promise evidence for the Owner on whether the Skill adds value over the baseline, and the trial does not show it. Both arms were given the same boundary text and the same six lists, including the definitions of Solution and Delivery, so the baseline already holds the core of the Skill. There is one run per arm. Checked: `skill.prompt.txt` against `baseline.prompt.txt` (the baseline prompt is the Skill prompt without the Skill block), and `do.md`.
- Judged. I1 promises that statements are sorted by the concern they constrain. The Skill arm followed the definition it was given more consistently than the baseline did. For R1 the baseline files "Agents run in a hosted container" and "Container has no direct access to the repository" under solution, and for R2 "Review is installed by adding one package" under solution, though both prompts define Delivery as how the solution is realized, operated and made available. The Skill arm files the same statements under delivery and asks whether the limit "no direct access to the repository" is an accepted Solution requirement, which is what the Skill prescribes. The baseline could be right if the limit is an accepted requirement, and it does not say so. Checked: `skill.raw.txt` and `baseline.raw.txt`, R1 and R2.
- Judged. F5 promises realistic requests, and the Skill arm's questions are more often about the boundary but less wide. Counted by hand from the raw outputs: of the 12 unresolved items of the Skill arm, 7 ask whether something is a requirement of the solution or only a means (R1 two, R2 two, R3 one, R4 one, R5 one); of the 14 of the baseline, none does. The baseline raises design questions the Skill arm does not (how agents reach repository content without direct access in R1, how the architecture shows that no rule changes in R2, what the new result format is in R5) and marks the R2 and R4 architecture statements as mixed with the solution constraint they describe, where the Skill arm lists them as architecture only. These are different, not better. Checked: `skill.raw.txt` and `baseline.raw.txt`, the unresolved and mixed lists.
- Testable, not tested. Whether the differences above, which F5 asks to be shown, survive repetition. A test would have to show, over at least three runs per arm of the same frozen requests, how often each arm files hosting and installation means under delivery and how often each asks the requirement-or-means question, read by someone other than the author. Inferred: one run per arm cannot tell the Skill from sampling.
- Testable, not tested. The integrity of the five-request evidence, which C2 relies on, is covered by the Cases T10 and T11, but their result is not recorded outside the author's tree, because the package is not run in CI. By hand, the sha256 of both prompts and of `requests.json` equal the recorded hashes and the recorded answers equal the raw outputs. Checked: those hashes, as an inspection and not as the Cases. A test would have to show it as a run of T10 and T11 in a job whose result is kept.

### Delivered, not promised

- Judged. Both arms separate Architecture from Change in the same way, so the separation does not distinguish the Skill from the baseline. In R1, R3 and R5 each arm lists the transition steps in change, quoted from the request, and in R2 and R4 each lists none. Neither arm proposes a plan or a sequence. The architecture list holds the statement about the architecture description in R2 and R4 in both arms and is empty in the others. The boundary text both arms were given says that moving from one state to another is Change's work, so the credit goes to that text. Checked: the change and architecture lists of `skill.raw.txt` and `baseline.raw.txt`.
- Judged. Each arm's unresolved list reaches a little into the transition. Counted by hand, the baseline has 3 of 14 items about the move (what happens if the new check never blocks, who decides the removal, how Review learns it has switched), the Skill arm 1 of 12 (whether "at least once" suffices in R3). These are questions for Change and not for Architecture. Checked: the unresolved lists of `baseline.raw.txt` and `skill.raw.txt`, R3 and R5.
- Judged. The trial does not test the Skill alone on the boundary. The prompt of both arms carries the boundary text and the six lists, and the Skill's report shape (parts, finding, next move) is not used. So the Skill's own Scope section, which is partly a negative list, and its finding values are not exercised here. Checked: `skill.prompt.txt` against the Skill's "What to report" and "Scope".
- Judged. `requests.json` carries the author's own labels of which requests mix a transition and which speak of the architecture description, hidden from the agents. They are not a key, and both arms agree with them, so they cannot tell the arms apart. Checked: the note in `requests.json` and the lists of both raw outputs.

### Promised and delivered

- Proven. The Owner's decision to ask for the next move was carried out: in run 4 both arms chose ask for S4 and S5, the Skill arm answered S4 delivery with finding none and the baseline ambiguous, and Case T9 verifies the contract and names each disagreement. Checked: `trial/next` records and Case T9 as recorded in the C1 `do.md`. Not re-run by this review.
- Proven. The original T3 stays red on the unchanged run 3, as preserved evidence of the disagreement on S4. Checked: Case T3 and `trial/skill.json` of C1, which the later runs left unchanged.

## Evidence

Inspected: requests.json, frozen in #1591; skill.prompt.txt and baseline.prompt.txt; skill.raw.txt and baseline.raw.txt; skill.json and baseline.json; do.md and evidence.md of C2; trial/next (run 4) and act.md of C1.

- **Is the architectural judgment of the Skill arm better than the baseline's?** Not shown as better; it is different. The Skill arm follows the supplied definition of Delivery more consistently (R1, R2) and asks the question the Skill prescribes. The baseline is wider on design questions and notices that an architecture statement can also hold a solution constraint. A different classification is not scored as a better one except where it contradicts a definition both arms were given.
- **Do both arms separate Architecture from Change?** Yes, and equally. Both quote the transition steps into change, add no plan and leave change empty where the request has none. The boundary text in both prompts is the likely cause, so this does not credit the Skill.
- **Activation or execution?** Only execution was tried, and only in part, since both arms were told to classify. Activation, the likelier source of the Skill's own value, is untested.
- **Does the trial show incremental value of the Skill over the baseline?** No. It shows two differences, in the assignment of means to delivery and in the share of questions about the boundary, in one run per arm and against a baseline that already holds the Skill's core. They are signals worth repeating, not evidence of superiority. On S4, "delivery, none, ask" is defensible, "ambiguous" communicates the unresolved boundary better, and the Owner has allowed ambiguous where the evidence supports it.
- **What do the limits of the evidence allow?** A statement of what each arm did on five requests, and a case for repeating the trial. They do not allow a claim that the Skill is better, that the baseline is worse, or that either classification is right.

No trial and no test is run by this review.

## Not checked

- Activation: no run without an explicit architectural instruction exists.
- Repeatability: no second run of either arm exists.
- Whether any of the 130-odd listed items is right beyond the points above; the review read all five requests and both outputs, and judged the points where the arms differ or where a definition given to both is contradicted.
- The Cases T10 and T11 as a run, and the Cases T1 to T9 beyond what the C1 `do.md` records.
- Any reader other than this reviewer: no second reader has judged the outputs.

## Limits

The reviewer is an Agent, and its judgement is not proof. It is of the same model family as the trial agents, which may lean toward their output and toward the Skill's wording. The counts above are made by hand from the outputs and are counts of a judgement, not measurements. The instruction to the trial agents to use nothing else was not enforced. No human has judged this review or the outputs.

## For the Owner

1. Promoting the Skill on this evidence (outperforming a baseline that already holds the Skill's core instructions is not required as the sole criterion): option one, promote it as the project's stated Solution and Delivery boundary, without any claim that it improves agent quality over the baseline, and with the comparison recorded as not showing it; option two, hold the promotion until an activation trial is recorded (the same requests with no architectural instruction, to see whether an agent with the Skill available invokes it) and at least three runs per arm of the same frozen requests are recorded and read by someone other than the author; option three, promote after the Cases T10 and T11 run in a job whose result is kept. Review's reading: option one is supportable if the claim is limited to what the trial shows, and the two differences are worth option two as a follow-up.
2. S4: option one, leave as decided, with T3 red as preserved history, "delivery, none, ask" accepted as defensible and ambiguous allowed where the evidence supports it; option two, amend the key so that it matches, with the change made in the open.
3. The Skill's Scope section and the boundary: option one, replace the negative list in the Skill by the positive boundary Kai described and test the Skill alone, with the boundary text only in the Skill; option two, keep the Skill and accept that this trial did not test its Scope.
4. What a human should observe for themselves: R1 and R5 of both outputs side by side, to see whether the Skill arm's boundary questions are the ones an architect would ask.

## No authority

This review grants no authority. It approves, merges and decides nothing, and it recommends nothing to promote. It changed nothing of the reviewed work and no change is asked of it for the sake of this review.
