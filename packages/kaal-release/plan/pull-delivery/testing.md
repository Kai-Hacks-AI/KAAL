# Pull Promotion: the next delivery by class (testing)

Runnable Cases `T43` to `T46`. They were `.red.mjs` in the PLAN, RED because `laneStep` ignored `deliveries`; the DO moved them to `test/pull/T<n>.test.mjs`, where CI runs them from `pull.test.mjs`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T43 | F43 | Priority: with all three eligible the HOTFIX is selected, and a KAAL candidate of any value does not outrank it. A HOTFIX that fails OUT or IN does not block an eligible WIRE, and a WIRE that is not eligible does not block a KAAL collector. Within KAAL the C9 choice is made over eligible collectors only. |
| pull/T44 | F44, F45 | Non-preemption: with the seat held (KAAL holder behind, awaiting re-qualification, PASS, FAIL), an eligible HOTFIX changes nothing in the holder's step. Once the seat is free it is selected, but not while the lane is occupied. |
| pull/T45 | F43 | Unavailable and UNKNOWN candidates: FAIL is not eligible and not reported; UNKNOWN, missing fields, invalid candidates and a source that does not match its class are not eligible and are reported as `unknown`; an UNKNOWN higher class does not block an eligible lower one; two eligible HOTFIXes are judged; no eligible with some UNKNOWN is judged naming them; all FAIL or no candidates wait; a non-list is judged. |
| pull/T46 | F45 | One admission lane: a selected HOTFIX or WIRE cannot duplicate an open HOTFIX, WIRE or PROMOTION, waits under the same trigger, is held by the cap and an invalid pulse, and a KAAL selection is held by an open HOTFIX. A SYNC is independent. Without `deliveries` the approved results are unchanged, and no result mentions an approval or a merge. |

They do not show the live host, any workflow or any ruleset.
