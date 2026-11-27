# Evidence of check 1, Change Isolation (release/CTL42, release/CTL23)

Counts follow release/C153, chapter "Amendment: the evidence before enforcement, per control". One distinct revision of one pull request counts once per control and situation. Read from this file only.

## Count at the head of this file

| Situation | Kind | Required | Counting |
| --- | --- | --- | --- |
| PASS on an ordinary change | A | 5 | 0 |
| PASS on a WIRE (`.github` alone) | A | 5 | 0 |
| A verified synchronization, judged by its own resolutions | A | 5 | 0 |
| FAIL on `.github` mixed with another path | P | 3 | 0 |
| A head already on the default branch | N | none required (Owner, 27 Nov) | not required |
| All situations together | A | 15 | 0 |

## Why nothing counts yet

Every record written before release/C165 carries the test merge commit of the run (release/D20), not the head of the pull request, so none can be matched to a revision. The HOTFIX (release/C165 with release/C166) is merged on `hotfix/record-judged-head` and has not promoted. The judge is the default branch's copy, so a run counts only once the HOTFIX is on `main`: runs before that are listed below and counted as nothing.

## Runs read, not counting (record sha is the merge commit)

| Pull request | Revision (head) | Run | Verdict of the entry | Old check | Why not counting |
| --- | --- | --- | --- | --- | --- |
| #2816 (provoked, `.github` mixed) | d836d9365b305d611b13fb5a38ac59da26851335 | 46000343997 | REPORT (CTL42), record sha d4751363… | Change Isolation: failure | record names the merge commit, not the head |
| #2787 (WIRE) | 9cedb8936558fa036aa388f5e3dee3e696480aa5 | not read | | | record names the merge commit |
| #2811 (WIRE) | e5d530eb8ad3f28a448fe027d83c0b49b3259834 | not read | | | record names the merge commit |

## V and A, P, N rows

None yet.
