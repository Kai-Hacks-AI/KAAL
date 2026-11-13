# C10 trial report

The independent trial of `trial-design.md` on the integrated guidance (`kaal-change` `SKILL.md` with its pointer step, plus `references/transition.md`), with what it showed and where it differs from the key. Nothing below was corrected to match the key.

## History kept

An earlier DO tried the guidance as a separate Skill, nested beside its element, before the Owner decided there is one `kaal-change` Skill. Its records stay: `trial/skill-run1.*` (differed from the key at S7) and `trial/skill-nested-run2.*` (equal to the key), with `trial/observer-verdict-nested.json`. The nested Skill text is the origin of the reference. The no-Skill baseline `trial/baseline.*` is unchanged, because its prompt is unchanged.

## A repair and a re-run

CI found that the widened description of `SKILL.md` was not valid YAML (a colon in a plain value). The description was reworded and the inventory digest updated. Because the prompt holds the Skill as shipped, the integrated arm was run again with a fresh agent, and a fresh blind observer read the replies again. The first integrated run and its observer verdict stay as history (`trial/skill-before-yaml-fix.*`, `trial/observer-verdict-before-yaml-fix.json`, `trial/existing-before-yaml-fix.json`). The tables below are the re-run. It repeated the first result: the same labels, with D1 now justified in the reply.

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
