# release/C165 the record binds the judged head

A HOTFIX. Release/C153 counts evidence by the revision a run judged: the head of the pull request. The shared command line of the two entries of check 1 builds the boundary of the record from `GITHUB_SHA`, which on `pull_request` is the test merge commit of the run, and so it changes whenever the base moves and equals no head. Every record written by a run of check 1 is therefore unusable as evidence, and the DIRT Running fact (controls/C158) would find none of them.

The Defect is release/D20, shown by the first provoked run (#2816). The Case release/T1603 is RED on `main`. The correction: the boundary takes `sha` from the `--head` the workflow supplies, which it has already checked against the event's head, and a command line without `--head` writes no record, as a run without a run id does today.

## Defect, Urgency, Approach

- **Defect:** release/D20, above.
- **Urgency:** it blocks all evidence of check 1 (and later checks 2 and 4, which carry the same line on their collectors), which must be gathered before 2 December.
- **Approach:** one line of `report.mjs`. The same repair is made in `lineage/lib/answer.mjs` (C158) and in the C159 DO on their own collectors.

Not in this Change: any workflow, WIRE, ruleset, flag or required check; check 3, which is admission and writes no record.
