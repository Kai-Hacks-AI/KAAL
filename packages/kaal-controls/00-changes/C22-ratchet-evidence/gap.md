# C22 gap

| Gap | Where | Is | Should be |
| --- | --- | --- | --- |
| controls/G99 | F35 and F36, and the evidence of C21 | the accepted-baseline lifecycle across runs is not defined: a blocked run still carries `next`, so a consumer can advance on a run that did not pass; the command throws a stack trace and exits 1 on a missing file or malformed JSON, and its exit codes are covered only on the function level; the sensitivity of the Cases was shown at an earlier head and the author-run trial is described more broadly than its observations | the lifecycle is defined and walked by a Case; `next` only on PASS; the command's contract is covered; the weakenings were run on the final version; misleading evidence claims are corrected where they appear |
