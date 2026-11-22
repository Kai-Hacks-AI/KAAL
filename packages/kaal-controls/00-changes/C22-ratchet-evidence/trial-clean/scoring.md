# Scoring record: clean three-arm trial

Scored blind by a separate agent from `rubric.md` and `runs/R1..R9.txt` only; the key (`key.json`) was kept apart until after scoring. Items: 1 stops only what is new, 2 preventive control in a ratchet way (not detective), 3 baseline can grow, 4 stale allowance, 5 unknown blocks, 6 declare exit, 7 remove at zero, 8 no unobserved claim. The scorer's quotes per cell are not kept here (only yes/no): the answers in `runs/` are the evidence to check them against.

| Run | Arm (key) | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | none-2 | yes | no | no | yes | no | no | yes | yes |
| R2 | with-1 | yes | yes | yes | yes | yes | yes | yes | yes |
| R3 | with-2 | yes | yes | yes | yes | yes | yes | yes | yes |
| R4 | before-2 | yes | no | no | yes | no | no | yes | yes |
| R5 | none-1 | yes | no | no | yes | no | no | yes | yes |
| R6 | with-3 | yes | yes | yes | yes | yes | yes | yes | yes |
| R7 | before-1 | yes | no | no | yes | no | no | yes | yes |
| R8 | none-3 | yes | no | no | yes | no | no | yes | yes |
| R9 | before-3 | yes | no | no | yes | no | no | yes | yes |

Note: in `key.json` the arm called `main` here is `before` (the Skill on the collector before the DO, git 26d094dc) and `new` is `with` (the Skill of the DO at 68230a6f). Table arms were renamed accordingly.

## Setup that cannot be re-checked from these files alone

- Isolation: each run was `claude -p` with `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1 CLAUDE_CODE_DISABLE_TEAM_MEMORY=1`, in its own copy of the fixture. A direct question under that setting returned that the agent knew nothing of KAAL or ratchets; without it the same question returned the session's team memory (the leak of the first trial).
- Exposure: arms `with` and `before` had the Skill directory under `.claude/skills/kaal-controls`; arm `none` had an empty `.claude/skills`. Whether a run opened the Skill was not recorded.
- The raw model transcripts and the scorer's quotes are not retained.
