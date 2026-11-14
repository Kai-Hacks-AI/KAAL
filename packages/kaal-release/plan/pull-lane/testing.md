# Pull Promotion: the lane is pulled (testing)

Runnable Cases `T40` and `T41`, `.red.mjs`. They are RED because `laneStep` does not exist. They are not wired into any CI run; the DO moves them to `test/pull/` as `.test.mjs`. Run from the repository root: `node -e "import('./packages/kaal-release/plan/pull-lane/T40.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T40 | F39 | A free seat opens the PROMOTION of `next`; a judged `next` opens nothing and names the candidates. A held seat that is current waits. Only the holder is synced, and only when behind `main`. PASS is ready for the CPO; FAIL pulls the best other qualifier (never the failed one) or is judged; UNKNOWN and absent wait. |
| pull/T41 | F40 | Over every combination of seat, behind, re-qualification and `next`, the action is one of the five advisory actions, and never an approval or a merge. |

They do not show the live host or any workflow.
