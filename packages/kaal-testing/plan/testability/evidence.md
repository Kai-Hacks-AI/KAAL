# Testability Assessment: Evidence

## RED of this PLAN

Baseline: `main` at `cce35a7`. `node packages/kaal-testing/test/plan/testability/run-red.mjs`, Node 22, Linux: T156 to T160 are RED-observed, 0 error, 0 green. T156 and T157: the Skill has no such section. T158 and T159: no DO trial records. T160: the Skill has no new section.

**Can each Case pass, and fail for the right reason.** Against a throwaway reference outside the repository (the proposed section inserted in the Skill, and DO records built from the pilot runs below), all five were GREEN. Of 18 mutants, 17 were caught by at least one Case and one was a no-op by construction (its hash edit changed nothing) and was redone as an effective one, which was caught. They covered a missing owner, swapped outcome order, a section after the loops, the three rules removed one by one, an answer edited away from the raw output, a wrong prompt hash, the section leaking into the baseline prompt, one run only, a pushback without a real owner, a dropped disagreement, a key edited silently, a disagreement marked resolved, no stated limits, a new export, a new Skill, and the author as observer. The reference is not part of this PLAN and implies no wording of the Skill.

## Pilot: does the idea help

The pilot ran before DO, on the **proposed** wording as it stood before Kai's principle ("review is judgement, test is proof") was added to it. The wording then gained that boundary and the hand-over to Review, so the DO trial must be run on the installed text (testing/T158 checks that). The pilot ran on the proposed wording (`proposed-skill-section.md`), not on an installed Skill, so it informs this PLAN and does not stand in for the DO trial. Records are in `trial/pilot/`: prompts, the author's key written before any run, and the raw outputs. Four fresh subagents (claude-sonnet-5-5, no tools but reading the prompt), two per arm. Raw outputs are as handed back, with the harness's indentation removed.

| Claim | Author's key | Baseline, run 1 and 2 | Skill, run 1 and 2 |
| --- | --- | --- | --- |
| E1: a response completes within two seconds under specified conditions | deterministic | deterministic, deterministic | **pushback to Requirements**, pushback to Requirements |
| E2: an Architecture Skill should usefully distinguish Solution from Delivery, including ambiguity | judgment | judgment, judgment | judgment, judgment |
| E3: a system must be sufficiently reliable | pushback to Requirements | pushback to Requirements, same | pushback to Requirements, same |

What the pilot shows, and what it does not:

- **A disagreement, kept.** On E1 both arms were stable and they differ from each other and, for the Skill arm, from the key. The baseline took the two-second bound as testable and listed the unspecified conditions as open. The Skill arm withheld a deterministic Case until Requirements names the conditions, completion event and percentile. The key itself doubted E1 (`trial/pilot/key.json`: "specified conditions" is not specified in the claim as given). Neither position is declared right. If DO shows the same, the finding is that the claim needs the question put to Requirements, and the key is the one that is open to challenge. It is not an instance of the Skill failing.
- **Where the Skill changed behaviour.** On E1 only. Both arms already got E2 and E3 as keyed, and every run listed the unresolved questions. The baseline named independent review and recorded differences without the Skill. The pilot does not show the Skill raises the quality of E2 and E3 answers.
- **The Skill arm echoes the section.** Its E2 answers reuse the section's phrases ("validation, not a passing test", "where the key and the reviewer differ, both are recorded"). That shows the section is read and applied. It is not independent evidence that the answer is better.
- **Limits.** n=2 per arm, one model family, the author wrote prompt, key and section, three claims chosen to contrast, no real Case being designed. A fresh independent review of the key and of the comparison is still wanted (compare the Architecture ACT's "Lacked").

## The existing Skill, assessed against the bar

An honest read of `skills/kaal-testing/SKILL.md` at `cce35a7` (640 words), with `references/findings.md`. It is concise and its strengths are real: ownership of contracts, three loops kept apart, four finding kinds never merged, and the rule "never weaken a test to make it pass". Gaps, in order of weight:

1. **It assumes the claim is testable.** Nothing asks whether a claim has an observable result and an unambiguous oracle before a Case is designed. This is the Change's gap.
2. **No outcome for an untestable claim.** The finding kinds cover what was checked and what was not. None tells an agent to hand a claim back to its owner. `Unknown` is the nearest and says nothing about who must act.
3. **The Skill has never been trialled.** `kaal-testing` has no record of an agent with the Skill against one without it. Its Cases test the library and the form of the Skill, not whether it changes what an agent does. What the Skill claims to do for an agent, calibrated findings, is therefore unobserved. This Change brings that trial for its section only. A trial of the rest is a separate Change.
4. **Judgment is asked for but not shaped.** "Record each judged validation item with its judgment" is said for architecture conformance only. Who may judge, from which seat, is not.
5. **Method and tool usage share one file.** About a third of the body is how to call `accept`, `cover` and `report`. That is the package's own API, not method. Moving it to a reference would shorten what an agent must read. Not proposed here.
6. **The `kaal/testing` line has concepts main lacks** (failing results point at the route to fix, loops as a graph, RED as a Case role). This Change does not touch them and depends on none.

Only gaps 1 to 3 are in this Change. Gaps 4 to 6 are named for the CPO, and the Change does not grow to close them.

## Reproduce

```
node packages/kaal-testing/test/plan/testability/run-red.mjs
```
