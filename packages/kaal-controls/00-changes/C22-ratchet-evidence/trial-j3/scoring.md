# Scoring record: targeted check of the responsibility split (J3)

Scored blind by a separate agent from `rubric.md` and `runs/S1..S6.txt` only. Items: 1 reference read from main, 2 PR concluded blocked, 3 comparison by a script, 4 owner/CI acquires the reference, 5 owner/CI persists the next baseline, 6 owner makes the verdict stop the merge, 7 owner keeps names stable, 8 owner decides the mode switch, 9 nothing impossible asked of the script. The scorer's quotes per cell are not kept (yes/no only).

| Run | Arm (key; `with` = Skill of the DO) | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | with-3 | yes | yes | yes | yes | no | yes | yes | yes | yes |
| S2 | with-1 | yes | yes | yes | yes | no | yes | yes | yes | yes |
| S3 | with-2 | yes | yes | yes | yes | no | yes | yes | no | yes |
| S4 | none-3 | yes | yes | yes | yes | no | yes | yes | yes | yes |
| S5 | none-2 | yes | yes | yes | yes | no | yes | yes | no | yes |
| S6 | none-1 | yes | yes | yes | yes | no | yes | yes | yes | yes |

The Skill under test was the DO at 68230a6f. Same isolation and exposure as `../trial-clean/scoring.md`. The agents could read git and files read-only. Whether a run opened the Skill was not recorded; the raw transcripts are not retained.
