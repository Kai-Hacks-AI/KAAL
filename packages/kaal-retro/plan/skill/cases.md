# Cases (retro/C1)

All Cases are in `test/plan/retro.test.mjs`, unwired, and run RED because the Skill does not exist yet. The DO moves them to green and wires them.

| Case | Shows | Requirement |
| --- | --- | --- |
| retro/T1 | A copy of `skills/kaal-retro/` alone in an empty folder holds SKILL.md and references/4l.md, and every link resolves inside it | R1 |
| retro/T2 | The installed folder holds only those two files, links nothing outside itself, and names no KAAL package, WORK, PDCA, GitHub, repository, hook or CI | R2 |
| retro/T3 | SKILL.md covers finished and ongoing work, a decision, an event, an experience, a process and a product, and states no completed-work prerequisite | R3 |
| retro/T4 | SKILL.md selects the method and routes to references/4l.md, which defines Liked, Learned, Lacked and Longed For, each with its question | R3, R4 |
| retro/T5 | Each 4L category says it can yield potential improvements, and none is ranked above another | R4 |
| retro/T6 | SKILL.md separates observations, interpretations and potential improvements, leaves decisions to their owners, and instructs creating or authorizing no Change | R3, R5 |

These Cases read the installed files, so they show the Skill is complete, self-contained and says the required things. They do not show an agent follows it. That evidence is advisory, in the DO: an agent given only the installed Skill runs retrospectives on unlike subjects (an ongoing project, a one-off event, a personal decision); the records are kept in the Change and judged in the ACT, which claims no pass.

Promotion path: PLAN, DO and ACT squash into `kaal/retro/skill`; then one promotion PR to main when the promotion seat is free. No sync before then, no npm publication, no hooks, CI, rulesets or Change creation.
