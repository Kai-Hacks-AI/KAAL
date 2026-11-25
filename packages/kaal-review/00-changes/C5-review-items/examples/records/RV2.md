---
id: example/RV2
appraises: example/V1
revision: 36766a0f4df6c2fdaef37b871f0273ec0b49f1ed
carries: example/RV1
appraiser: CTO-side Agent
relation: not-author
execution: performed
conclusion: satisfied
source: PR #2319, review 6011563310
mapped-by: this PLAN (the review states "satisfied, unchanged")
---
# example/RV2

## Execution

Read the one commit since RV1, 36766a0: applyBaseline was extracted, T1114 was added, and F34 item 10, A20 and modes.md gained wording. Compared the ratchet path before and after, line by line. The suite was not re-run; the author reports 58 of 58.

## Result

Carried from RV1. The property is still membership by name, not severity, and I15, C21 and judgments.md say it as before. The extraction moves the filter and does not touch the property, so the subject and the evidence of RV1 remain applicable. The limitation is as before: a known finding that worsens under the same name passes.

For the owner: nothing to decide on this item.
