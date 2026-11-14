# Cases (retro/C3)

| Case | Shows | Requirement |
| --- | --- | --- |
| retro/T16 | `npm test` run in the package exits 0 and reports the 15 Cases of T1 to T15 passing | R1 |

T16 is in `test/plan/testscript.test.mjs`, unwired, and runs RED now: `npm test` fails at `pretest` with "No workspaces found". R2 and R3 are held by the diff and by retro/T1 to T15 staying green. R4 is a record, checked by review.

Nothing here authorizes a sync, promotion, publication or enforcement.
