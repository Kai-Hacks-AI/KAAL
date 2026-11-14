# Pull Promotion: the lane is pulled (testing)

Runnable Cases `T40`, `T41` and `T42`, `.red.mjs`. They are RED because `laneStep` does not exist. They are not wired into any CI run; the DO moves them to `test/pull/` as `.test.mjs`. Run from the repository root: `node -e "import('./packages/kaal-release/plan/pull-lane/T40.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T40 | F39 | A free seat opens the PROMOTION of `next`; a judged `next` opens nothing and names the candidates. A held seat that is current waits. Only the holder is synced, and only when behind `main`. PASS is ready for the CPO; FAIL re-ranks the others with the pull/C9 rule: the failed holder being the original `next`, an alternative with a valid density is pulled, a tie or incomparable alternatives are judged with the candidates named, and none remaining waits; UNKNOWN and absent wait. |
| pull/T40 | F41 | `open-sync` names a SYNC with the chapters Change and Reason; `open-promotion` names a PROMOTION with Change and Why now. |
| pull/T42 | F42 | Idempotency (an open PR of the same type and collector means wait), WIP 1 lane-wide for PROMOTION and for SYNC (each independent of the other), no re-open under the same trigger and a re-open under a new one, the attempt cap going to `judge`, and fail closed on a missing or invalid pulse, counter or cap. |
| pull/T41 | F40 | Over every combination of seat, behind, re-qualification and `next`, the action is one of the five advisory actions, and never an approval or a merge. |

They do not show the live host or any workflow.
