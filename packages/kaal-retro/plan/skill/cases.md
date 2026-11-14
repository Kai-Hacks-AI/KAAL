# Cases (retro/C1)

All Cases are in `test/plan/retro.test.mjs`, unwired, and run RED because the Skill and checker do not exist yet. The DO moves them to green and wires them.

| Case | Shows | Requirement |
| --- | --- | --- |
| retro/T1 | A copy of `skills/kaal-retro/` alone in an empty folder holds SKILL.md and references/4l.md, and every link resolves inside it | R1 |
| retro/T2 | The installed Skill declares no dependency and links nothing outside itself | R2 |
| retro/T3 | The checker clears a retrospective of an arbitrary non-work subject, and of an ongoing subject | R3, R6 |
| retro/T4 | SKILL.md routes to the 4L reference, which defines four categories; a 4L record missing one is reported | R4 |
| retro/T5 | A proposal from each of Liked, Learned, Lacked and Longed For is accepted and counted | R4 |
| retro/T6 | An unlabeled entry is reported; a proposal written as decided is reported | R5 |
| retro/T7 | A record that creates a Change, or a decision without an owner, is reported; `None made.` is clear; the checker writes nothing | R7, R8 |
| retro/T8 | An empty or unreadable record is unknown, never clear | R8 |

Advisory, not a Case: in the DO, an agent given only the installed Skill runs three retrospectives on unlike subjects (an ongoing project, a one-off event, a personal decision). The records are kept in the Change and read by the checker. Judgment about their quality is recorded in the ACT and claims no pass.

Promotion path: PLAN, DO and ACT squash into `kaal/retro/skill`; then one promotion PR to main when the promotion seat is free. No sync before then, no npm publication, no hooks, CI, rulesets or Change creation.
