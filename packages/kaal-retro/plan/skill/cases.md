# Cases (retro/C1)

All Cases are in `test/plan/retro.test.mjs`, unwired, and run RED because the Skill does not exist yet. The DO moves them to green and wires them.

| Case | Shows | Requirement |
| --- | --- | --- |
| retro/T1 | A copy of `skills/kaal-retro/` alone in an empty folder holds SKILL.md and references/4l.md, and every link resolves inside it | R1 |
| retro/T2 | The installed folder holds only those two files, links nothing outside itself, and names no KAAL package, WORK, PDCA, GitHub, repository, hook or CI | R2 |
| retro/T3 | SKILL.md covers finished and ongoing work, a decision, an event, an experience, a process and a product, and states no completed-work prerequisite | R3 |
| retro/T4 | SKILL.md selects the method and routes to references/4l.md, which defines Liked, Learned, Lacked and Longed For, each with its question | R3, R4 |
| retro/T5 | Each 4L category says it can yield potential improvements, and none is ranked above another | R4 |
| retro/T6 | SKILL.md separates observations, interpretations and potential improvements, leaves decisions to their owners, and states that nothing is created or decided | R3, R5 |
| retro/T7 | references/4l.md states the six result expectations, each with its reason | R6 |
| retro/T8 | A conforming 4L record raises no finding (T7 holds first) | R6, R7 |
| retro/T9 | Records missing a category, an unlabeled entry, missing participants, a recorded decision, or no method each raise their finding (T7 holds first) | R6, R7 |
| retro/T10 | `plan/skill/trial.json` records, for the Skill-only arm and the baseline arm on the same subjects, instruction lookups and evidence lookups separately, tool calls, and context with each value marked measured, estimated or unavailable; the Skill-only arm shows no instruction lookup | R2, R8 |

T1 to T9 are deterministic: they read the written contract, the package and fixture records. T3 and T6 prove wording presence only. T10 checks that the accounting exists, keeps instruction and evidence lookups apart, and does not present an unobservable figure as measured. It does not check that the Skill performs well. Evidence lookups are allowed in both arms.

Behavioral quality is reported in the DO separately, from the actual trials. It is nondeterministic, has stated limitations, and claims no pass.

Promotion path: PLAN, DO and ACT squash into `kaal/retro/skill`; then one promotion PR to main when the promotion seat is free. No sync before then, no npm publication, no hooks, CI, rulesets or Change creation.
