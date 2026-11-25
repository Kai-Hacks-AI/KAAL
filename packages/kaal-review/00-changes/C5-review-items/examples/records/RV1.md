---
id: example/RV1
appraises: example/V1
revision: 68230a6f2d17e0026735ca49463ad1a8fab3df49
appraiser: CTO-side Agent
relation: not-author
execution: performed
conclusion: satisfied
source: PR #2319, review 6011520678
mapped-by: this PLAN (the review states "satisfied")
---
# example/RV1

## Execution

Appraised by reading the documents I15, C21, judgments.md and F34, the script and Cases T1109 and T1112, and the author's sensitivity table taken at f4e099f. The suite was not re-run.

## Result

The property now reads in one sentence: no finding name outside the accepted baseline gets in, by membership and not by severity. F34 items 3 to 5 each serve it without restating it.

Limitation, stated in the documents and in modes.md: a known finding that gets worse under the same name passes, so the ratchet is only as sharp as the finding names.

For the owner: the property is as stated. This informs the approval of the DO and is not one.
