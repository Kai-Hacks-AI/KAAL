# Evidence of check 3, admission of Change Isolation (review) (release/C157, not a control)

Admission is not verification and has no PASS or FAIL record. It refuses nothing by design, so no refused pull request is asked for. Counts follow release/C153, chapter "Amendment: the evidence before enforcement, per control". Read from this file only.

## Count at the head of this file

| Situation | Required | Counting |
| --- | --- | --- |
| Pull requests shown admitted, in agreement with the old trigger on the same revision | 5 | 1 |
| Merge-group runs of the Review check whose verdict the admission leaves unchanged | 5 | 0 |

## Admitted

| Pull request | Revision (head) | Run of the admission | Old check `Change Isolation (review)` on the same revision | Counting |
| --- | --- | --- | --- | --- |
| #2816 | d836d9365b305d611b13fb5a38ac59da26851335 | 46000344082, `Change Isolation (review, plain pull_request)`: success | success (run 46000344484) | yes |

## Merge-group preservation

None read yet. The merge-group runs of pull requests that went through the queue since the WIRE (#2811) are to be read with the revision each judged.
