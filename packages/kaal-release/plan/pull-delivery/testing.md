# Pull Promotion: the next delivery by class (testing)

Runnable Cases `T43` to `T46`, `.red.mjs`. They are RED because `laneStep` ignores `deliveries` today. They are not wired into any CI run; the DO moves them to `test/pull/` as `.test.mjs`. Run from the repository root: `node -e "import('./packages/kaal-release/plan/pull-delivery/T43.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T43 | F43 | Priority: with all three eligible the HOTFIX is selected, and a KAAL candidate of any value does not outrank it. A HOTFIX that fails OUT or IN does not block an eligible WIRE, and a WIRE that is not eligible does not block a KAAL collector. Within KAAL the C9 choice is made over eligible collectors only. |
| pull/T44 | F44 | Non-preemption: with the seat held (KAAL holder behind, awaiting re-qualification, PASS, FAIL), an eligible HOTFIX changes nothing in the holder's step. Once the seat is free it is selected. |
| pull/T45 | F43, F44 | Unavailable and UNKNOWN candidates: FAIL, UNKNOWN, missing fields and a source that does not match its class are not eligible; an UNKNOWN higher class with an eligible lower one is judged naming both; two eligible HOTFIXes are judged; no candidates wait. |
| pull/T46 | F45 | Regression: without `deliveries`, results equal the approved ones (a free seat pulls `next`, a behind holder is synced). With `deliveries`, a KAAL choice is held by the pulse (an open PROMOTION waits, an invalid pulse is judged) and no result mentions an approval or a merge. |

They do not show the live host, any workflow or any ruleset.
