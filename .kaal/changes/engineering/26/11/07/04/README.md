# Engineering: Cases for the queue workflows (B1 F1b and F2)

Capability: Engineering. Target: kaal/engineering-b1-cases. Record number is provisional until integration (01 and 02 travel in #1119, 03 is F1a).

## Intent

F1b (Branching reads the base branch's rules) and F2 (the pull request side of `Change Isolation (review)` admits to the queue only) are `.github` only Changes, so they travelled without Cases. This Change gives them their Cases, so that the properties the CPO approved are held by a test and not by reading: the rules are read from the trusted source and fail closed, no permission is added, and the admission job holds no permission, reads and runs nothing of the candidate, and is not an attestation.

## Content

`engineering/github/queue-workflows.red.mjs`, hand-run (no suite or lane names it):

- T137, T138 (F1b): both Branching jobs read `rules/branches/<base>` before judging, only for the default branch, export `KAAL_RULES`, fail with exit 2 when it cannot be read and swallow nothing; no permission is added or widened, no write permission anywhere, the checkout is still the default branch.
- T139, T140 (F2): the admission workflow is its own file, `pull_request_target` only, `permissions: {}` at workflow and job level, the job named exactly `Change Isolation (review)`; no `uses`, checkout, secret, token or event data; nothing but `echo` runs, and the notice says it is not an attestation.
- T141, T142 (F2): `merge-group-review.yml` keeps its kind (merge_group only, no skipped step, read-only permissions, still derives the attestation and judges); exactly two workflows carry the context name, one per event, and neither answers to the other's event.

These Cases are static. They show the workflows hold the approved shape, not GitHub's queue behaviour. The live proof is the trial on main, above all Case 6: a ledger-bearing promotion admitted on the pull request head's success must FAIL the group's own review check and must not merge (hard stop).

No ledger entry is carried.

## Check

`node --test engineering/github/queue-workflows.red.mjs`: 6 of 6 GREEN against `main`'s workflows. Mutating the admission workflow (a `contents: read` permission) turns T139 RED; adding a `pull_request` trigger to the review workflow turns T141 and T142 RED.

## Act

Hand-run until the trial; whether to wire them into `test:engineering` is a later decision, as for T112 to T127. No queue, ruleset, promotion or publication.
