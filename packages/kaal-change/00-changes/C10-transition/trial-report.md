# C10 trial report

The independent trial of `trial-design.md` on the integrated guidance (`kaal-change` `SKILL.md` with its pointer step, plus `references/transition.md`), with what it showed and where it differs from the key. Nothing below was corrected to match the key.

## History kept

An earlier DO tried the guidance as a separate Skill, nested beside its element, before the Owner decided there is one `kaal-change` Skill. Its records stay: `trial/skill-run1.*` (differed from the key at S7) and `trial/skill-nested-run2.*` (equal to the key), with `trial/observer-verdict-nested.json`. The nested Skill text is the origin of the reference. The no-Skill baseline `trial/baseline.*` is unchanged, because its prompt is unchanged.

## A repair and a re-run

CI found that the widened description of `SKILL.md` was not valid YAML (a colon in a plain value). The description was reworded and the inventory digest updated. Because the prompt holds the Skill as shipped, the integrated arm was run again with a fresh agent, and a fresh blind observer read the replies again. The first integrated run and its observer verdict stay as history (`trial/skill-before-yaml-fix.*`, `trial/observer-verdict-before-yaml-fix.json`, `trial/existing-before-yaml-fix.json`). The tables below are the re-run. It repeated the first result: the same labels, with D1 now justified in the reply.

## An orchestration correction and a re-run

The CPO set the architecture of the Skill: two reasoning concerns, Transition and Isolation, each owning its own findings, uncertainty, evidence and decisions. `references/worksheet.md` is Isolation-specific (all six sections are isolation reasoning; it predates this Change), so `SKILL.md` now makes step 6 the isolation report, used when isolation is in play, and step 7 points to the transition guide's own output format and says that when both concerns arise their findings are reported separately with their relationship stated. The reference files are unchanged. Because the prompt holds the Skill as shipped, the integrated arm was run again with a fresh agent and a fresh blind observer read it with the existing-Skill and baseline replies (shuffled, unlabelled). The previous integrated run and verdict stay as history (`trial/skill-before-orchestration.*`, `trial/observer-verdict-before-orchestration.json`). The tables below describe the run before this correction unless marked.

Re-run result: the labels equal the key at S1 to S9, D1 is one Change and D2 three with the state each hands over. The new observer (`trial/observer-verdict.json`, three replies) preferred the revised integrated reply for D2 (each Change names what it hands over and why the order holds; D1 justified), found the existing-Skill reply's transition evidence the sharpest (a Case that is red on the old export and green on the new one) and the integrated reply's evidence concrete but without that discriminating Case, and again doubts S7 `none` (closer to mixed). The key is unchanged and the disagreement stays visible. One run per arm: a single run cannot separate this from ordinary variation.

## Whole-capability comparison (isolation, boundaries, evidence, protection)

Eight fresh runs, two per arm and task, on two prompts that are not the A to B example: a shared validator with three consumers (one known only from the Graph view), and a rename that changes meaning with an outside dashboard. A blind observer scored shuffled replies 0 to 2 on isolation, boundaries, transition evidence and protection. Every reply scored 2 on every dimension in both arms; differences were depth (for example, whether the proposal was seen to be a no-op) and did not follow the arm. No regression was observed and the sample is too small to exclude a small effect. The raw replies are not stored in the repository.

## Runs on the integrated guidance

Fresh subagents given only a prompt file; a fresh blind observer read the task and the three replies, shuffled and unlabelled (`trial/observer-verdict.json`).

| Arm | Differs from the key | D1 / D2 Changes | Observer: history apart from target |
| --- | --- | --- | --- |
| Integrated guidance (`trial/skill.*`) | none | 1 / 3 | yes |
| Existing Skill, no guide (`trial/existing.*`) | S7 (mixed; the key says transition) | 1 / 3 | yes |
| No Skill (`trial/baseline.*`) | S6, S7 | 1 / 3 | yes |

## What the observer found

- All three replies keep historical and target truth apart, give one Change for D1 and three for D2, and none justifies leaving D1 as one Change.
- The integrated reply has the best boundary reasoning for D2: for each Change it says what is handed over and why the order matters.
- The observer preferred the existing-Skill reply overall, for the clearest transition evidence: a Case that fails on the old export and passes on the new one, the enduring Cases kept green, the superseded Cases recorded rather than deleted. It found the integrated reply's evidence weaker.
- The observer considers the integrated reply's S7 label (transition, none) closer to mixed than the key. The key says transition. The disagreement stays visible and the key is unchanged. The earlier observer said the same about S7.

## Is the integrated guidance useful

Partly, on this example. It improves the handover reasoning at the boundaries and makes the S7 label equal the key, but the key itself is disputed there. It does not improve the transition evidence over the existing Skill, and labels were already near the key without it. The pointer step alone is not evidence of behaviour: the trial shows the guidance changes what an agent writes about boundaries, and shows no change in how it states the evidence. A harder example, several runs per arm and an observer who is the Owner would be a stronger test. The earlier tuning sentence about labelling by what a statement shows is in the reference; run 2 of the nested trial showed its effect on S7, and this trial repeats it.

## Limits

One example, one run per arm, subagents of the same model family as the author, an observer who is not the Owner, and an unverified serving model.
