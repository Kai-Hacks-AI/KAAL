# Engineering promotion: the review workflows that make a carried ledger entry attestable (.github only)

Capability: Engineering. Target: main, from a focused collector (kaal/ledger-review-workflows).
Record number is provisional until integration.

## Intent

A promotion carries its own transition ledger entry, attested by an author-independent code owner at the exact head (Owner, 5 November 2026; PLAN #1019). The checker side is on main (#1105). This is the second promotion: the trusted review-event workflows that turn a code owner's exact-head approval into the attestation the checker consumes. `.github` travels alone, so this change contains nothing else.

## Content

Two workflows, as reviewed in the Engineering collector (#1101): `change-isolation-review-relay.yml` (untrusted `pull_request_review` relay that uploads only the pull request number) and `change-isolation-review.yml` (`workflow_run` handler, run from the default branch, that reacquires every fact, sets the `Change Isolation` check in progress first, and completes it only for the judged, unmoved head). No ledger entry, no checker change, no ruleset change.

## Check

RED Cases `ledger-in-promotion.red.mjs`: 20 of 20 GREEN with the workflows present (T108 to T110 are their static checks). The handler runs only from main, so its live behaviour, including how the ruleset resolves two `Change Isolation` runs, cannot be proven before this lands.

## Act

The live acceptance trial (engineering/change-isolation/ledger-hotfix-first-use-acceptance plan) follows immediately on a never-merged trial pull request. No ledger-bearing promotion, including Hosting 0.0.1, is eligible until its record is committed. No publication.
