# Engineering: the B1 first-use record and the unreadable-reads Case (T111)

Capability: Engineering. Target: kaal/engineering-b1-record. Record number is provisional until integration.

## Intent

B1 is proven live on `main`: a promotion carrying its own ledger entry is admitted by structural validation at the pull request and its attestation is judged at merge time by `Change Isolation (review)`. The CPO reviews the acceptance record before Hosting #1030 returns for promotion assessment, and the Owner confirmed that the merge queue and the required review check are the permanent configuration. This Change commits the record, including that governance dependency, and the by-hand Case the plan reserved for reads that fail.

## Content (3 paths, no `.github`, no ledger entry)

- `engineering/change-isolation/first-use-acceptance.md`: what was shown, the run and check ids of the control, the activation, F5, Case 6 and the positive case, the defects found on the way, the governance dependency of the queue and R2, and the limits.
- `engineering/change-isolation/review-unreadable.red.mjs`: T111, hand-run (no suite or lane names it). With every GitHub read failing (a stub `gh` for the two shell steps, a failing `fetch` for the attestation adapter), the wait step, the group binding and the attestation adapter each end in exit 2 with no attestation printed, and the review job holds no condition, tolerated failure or second unconditional success.
- This record.

## Check

`node --test engineering/change-isolation/review-unreadable.red.mjs`: 4 of 4 GREEN on `main`. Mutations on a copy of the tree (this file copied into it): a wait step that tolerates the failed read turns the wait Case and the structure Case RED; `continue-on-error` on the job turns the structure Case RED; the adapter swallowing the unreadable fact turns its Case RED.

## Act

Hand-run until the next window. No queue, ruleset, promotion or publication.
