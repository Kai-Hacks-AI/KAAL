# Evidence of check 1, Change Isolation (release/CTL42, release/CTL23)

Counts follow release/C153, chapter "Amendment: the evidence before enforcement, per control". One distinct revision of one pull request counts once per control and situation. Read from this file only.

## Count at the head of this file

| Situation | Kind | Required | Counting |
| --- | --- | --- | --- |
| PASS on an ordinary change | A | 5 | 2 |
| PASS on a WIRE (`.github` alone) | A | 5 | 1 |
| A verified synchronization, judged by its own resolutions | A | 5 | 1 |
| FAIL on `.github` mixed with another path | P | 3 | 0 |
| A head already on the default branch | N | none required (Owner, 27 Nov) | not required |
| All situations together | A | 15 | 4 |

## Why most runs do not count yet

Every record written before release/C165 carries the test merge commit of the run (release/D20), not the head of the pull request, so none can be matched to a revision. The judge is the default branch's copy, so a run counts only once the HOTFIX is on `main` (14:34 UTC). A run counts here only when its `kaal-control` line was read from the job log, its record names the revision, and the old check's result on the same revision was read. Rows are listed as read; nothing is estimated.

## Counting (record names the head; old check read on the same revision)

| Pull request | Revision (head) | Run | CTL42 | CTL23 | Old check `Change Isolation` | Situation |
| --- | --- | --- | --- | --- | --- | --- |
| #2845 | a194fbe8366832efcd8b6d780bc5d96b330edff5 | 46027489946 | PASS | PASS | success | PASS on an ordinary change |
| #2877 | 694682a90f843e739f1da7eaa9e8022ab6b8932c | 46030777959 | PASS | PASS | success | PASS on an ordinary change |
| #2874 | 2e75fd9142e064f05c02091aa46484221c685dab | 46028266423 | PASS | not read | success | PASS on a WIRE (`.github` alone) |
| #2876 | 558755bc2b954f239fec79ce9231b5e13e14358f | 46029976543 | PASS (a verified synchronization) | PASS | success | A verified synchronization |

## Inspected and disqualified (record sha is the merge commit)

| Pull request | Revision (head) | Run | Verdict of the entry | Old check | Why not counting |
| --- | --- | --- | --- | --- | --- |
| #2816 (provoked, `.github` mixed) | d836d9365b305d611b13fb5a38ac59da26851335 | 46000343997 | REPORT (CTL42), record sha d4751363… | Change Isolation: failure | record names the merge commit, not the head (release/D20) |

## Uninspected (not read yet, so not evidence of anything)

| Pull request | Revision (head) | Note |
| --- | --- | --- |
| #2787 (WIRE) | 9cedb8936558fa036aa388f5e3dee3e696480aa5 | before release/C165: disqualified by the same rule once read |
| #2811 (WIRE) | e5d530eb8ad3f28a448fe027d83c0b49b3259834 | before release/C165: disqualified by the same rule once read |

Verdicts read, old check not yet read on the same revision (so not counting): #2862 a0996ab9c8934beb9c34d951a081a6a2e589d38c (run 46030470146, CTL42 PASS, CTL23 PASS) and testing/c83-restore 8fb488342772d7f65c5008e87513166006fceee8 (run 46027859017, CTL42 PASS, CTL23 PASS). About 15 further revisions since 14:34 UTC (SYNCs, ACTs and promotions of other threads) are not read at all.

The HOTFIX (release/C165 and release/C166) is on `main` since 14:34 UTC (PROMOTION f76ee86b). Runs from then on count, by head.

## V and A, P, N rows

No FAIL (REPORT) has occurred naturally since the HOTFIX, so no P is counted. The three probe pull requests (#2816 to #2818) need a fresh revision on a current base to demonstrate FAIL.
