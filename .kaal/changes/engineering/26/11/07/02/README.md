# Engineering: Cases for the merge group jobs (B1 steps 2a and 3)

Capability: Engineering. Target: kaal/engineering-b1. Record number is provisional until integration.

## Intent

The merge group jobs (step 2a) and the merge-time review job (step 3) are `.github` only Changes, so they travel without Cases. This Change gives them their Cases, so that the properties the CPO approved are held by a test and not by reading: nothing is skipped, nothing writes a check, the trusted checker is pinned to the real default branch, and the review job is the last to answer and re-reads the approvals as its final act.

## Content

`engineering/change-isolation/merge-group.red.mjs`, hand-run (no suite or lane names it):

- T112 to T116: the three group jobs (`Change Isolation`, `Branching`, `Promotion Source`) and the ci and CodeQL triggers: no condition skips a job, no unconditional success, no check write, exact context names, `--base` pinned to the default-branch checkout, every `KAAL_DEFAULT` the real default branch with no trial target, and the promotion predicate with `main` as target.
- T123 to T127: the review job: exact context name `Change Isolation (review)` and only on `merge_group`; read-only permissions and no API write; the queued PR bound to the group by ancestry; approvals read twice with the last read the final act, both returning the queued head; waits for every other required check and fails on one that did not succeed; judges the group against its own base with the derived attestation; its wait fits inside the queue's timeout.

These Cases are static. They show the workflows hold the approved shape, not GitHub's merge_group behaviour; that is the trial on main (group contains the PR head, CodeQL reports on a group, the wait on a live group).

No ledger entry is carried.

## Check

`node --test engineering/change-isolation/merge-group.red.mjs`: 10 of 10 GREEN against `merge-group.yml` and `merge-group-review.yml`. Mutating the review workflow (`checks: write`; dropping the queued-head comparison) turns T123 and T124 RED. The Cases need `merge-group-review.yml` on the target, so this Change lands after the review workflow Change.

## Act

Hand-run until the trial on main; whether to wire them into `test:engineering` is a later decision, after the trial shows which of them still earn a place. No queue, ruleset, promotion or publication.
