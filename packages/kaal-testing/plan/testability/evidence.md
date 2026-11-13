# Testability Assessment: Evidence

## RED of this PLAN

Baseline: `main` at `cce35a7`. `node packages/kaal-testing/test/plan/testability/run-red.mjs`, Node 22, Linux: T156 to T160 are RED-observed, 0 error, 0 green. T156 and T157: the Skill has no such section. T158 and T159: no DO trial records. T160: the Skill has no new section. T156 and T157 check structure only, so they do not verify wording (testing/N28).

**Can each Case pass, and fail for the right reason.** Against a throwaway reference outside the repository (the proposed section inserted in the Skill, and DO records built from the pilot 2 runs below), all five were GREEN, with the E4 disagreement listed as recorded. Nine mutants were each caught by the Case that owns them: swapped outcome order, a dropped or emptied rule label, a named other Skill, a missing owner, the section after the loops, a dependency on `kaal-review`, a key edited silently, and a dropped disagreement. The reference is not part of this PLAN and implies no wording of the Skill.

## Pilots: does the idea help

Both pilots ran before DO, on the **proposed** wording (`proposed-skill-section.md`), so they inform this PLAN and do not stand in for the DO trial, which must run on the installed text (testing/T158). Records are in `trial/pilot/` and `trial/pilot2/`: prompts, the author's key written before any run, and the raw outputs. Each pilot used four fresh subagents (claude-sonnet-5-5, no tools but reading the prompt), two per arm. Raw outputs are as handed back, with the harness's indentation removed.

**Pilot 1** (wording before the CPO's verification and validation model; three claims). Key: E1 deterministic, E2 judgment, E3 pushback to Requirements.

| Claim | Baseline x2 | Skill x2 |
| --- | --- | --- |
| E1 two-second response under "specified conditions" | deterministic, deterministic | pushback to Requirements, pushback to Requirements |
| E2 an Architecture Skill should "usefully" distinguish | judgment, judgment | judgment, judgment |
| E3 "sufficiently reliable" | pushback to Requirements, same | pushback to Requirements, same |

**Pilot 2** (wording after the model: Verify, Challenge, Point at judgement, Reject a brittle Case; four claims; the baseline prompt now also carries the three definitions). Key: E1 to E3 unchanged, E4 pushback to Architecture, with a stated doubt. E4 is the Architecture T3/S4 situation: a Case whose oracle is an author's key.

| Claim | Baseline x2 | Skill x2 |
| --- | --- | --- |
| E1 | **pushback to Requirements**, deterministic | deterministic, deterministic |
| E2 | judgment, judgment | judgment, judgment |
| E3 | pushback to Requirements, same | pushback to Requirements, same |
| E4 | judgment, judgment | judgment, judgment |

What the two pilots show, and what they do not:

- **The E1 difference did not hold.** In pilot 1 the Skill arm withheld a Case on E1 and the baseline did not. In pilot 2, with the Skill's wording changed ("automated or not", challenge only when its owner could make it decidable), the Skill arm is deterministic twice and the baseline split. So E1 is sensitive to wording and to run, and neither pilot supports "the Skill moves E1" or "the Skill is right on E1". The key doubted E1 from the start and was not retuned.
- **E4 disagrees with the key in every run.** All four runs, both arms, answered judgment where the key says pushback to Architecture. The key's own doubt allows that. The Skill arm named the Case as brittle ("proves nothing as written", "reject the Case") and asked for the author's key and an independent answer side by side. The baseline also refused to treat the author's say-so as an oracle. The approach labels do not separate the arms, and the answer format has no place to say "reject this Case", so a DO trial needs one. Architecture's key for T3 is untouched, and the disagreement stays recorded.
- **Where the Skill changed behaviour.** Only in the wording of E4's reasoning (brittle, reject, record both). Both arms already got E2 and E3 as keyed on both pilots. The pilots do not show the Skill raises the quality of those answers.
- **The Skill arm echoes the section.** Phrases such as "judgement, not a passing test" and "record the author's key and the independent answer" come from the text. That shows the section is applied, not that the answers are better.
- **Limits.** n=2 per arm, one model family, the author wrote prompts, key and section, claims chosen to contrast, no real Case being designed, and the second pilot's baseline prompt is not a no-Skill agent in the sense of pilot 1 because it carries the definitions. An independent review of the key and the comparison is still wanted.

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
