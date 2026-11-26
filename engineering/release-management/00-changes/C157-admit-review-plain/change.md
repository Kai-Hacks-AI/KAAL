# release/C157: the plain pull_request replacement of Change Isolation (review) admission, on the controls path

## Reason
From 2 December 2026 the required checks that run on `pull_request_target` stop reporting (release/C153). Kai's ruling: the replacement is the moment to leave the old control structure, so it is built on the controls adapter path and verify Adapter can confirm it. The pull request side of the required context `Change Isolation (review)` is `merge-group-admission.yml`, a `pull_request_target` workflow that reads nothing, judges nothing and holds no permission: it only gives the pull request head the context so it can enter the merge queue. The judging side is `merge-group-review.yml` on `merge_group`, which is not `pull_request_target`. So this replacement shares nothing with check 1 (release/C153 said the same checker; that reading is corrected here).

## The contract
A plain `pull_request` workflow with the same admission and nothing else: `permissions: {}` at both levels, no checkout, no `uses`, no secret, and the same two echo lines. Under its own workflow name and detective job name.

## As a control
It is not a control (it judges nothing), so it is a `notControls` row of the delivery map with that reason, as `dependency-review.yml` is. No entry script.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1576: the source `05-src/wiring/workflows/change-isolation-admission-plain.yml` exists, is plain `pull_request`, has the workflow name `Change Isolation admission on pull_request`, unique, and the detective job name `Change Isolation (review, plain pull_request)`, holds no permission, no checkout and no secret. Red until the DO.

## DO
Add the source. The DO renames the parked Cases unchanged. Each Case is green with the package suite.

## After it
ACT, PROMOTION, then a detective WIRE of the file, which needs the Owner's go and evidence before any enforcement swap (release/C153).

## Left open (with a recommendation)
- Whether `merge-group-review.yml` (the judging side of the required context) is a control row of the delivery map. It is not in the map today, so verify Adapter would list it as unadapted. Recommendation: its own Change after this one, since it is not `pull_request_target` and not part of the 2 December replacement.

## Not in this Change
No WIRE, ruleset change, required check or flag. The old workflow stays until its swap.

## Design: split and overlap
Split: none. The check has no verdict of its own; the pull request side only admits, and the judgment sits on the merge group side (`merge-group-review.yml`). One job, one control: admit.
Covered by controls on main: nothing of the judgment. The merge queue itself is CTL32 (queue Promotion), which this admission does not duplicate: CTL32 lands promotions, this reports a required name on `pull_request`.
Dropped: nothing. Left to decide in DO: whether the admission needs a control at all or is a `notControls` row, since it runs no script (UNKNOWN until the delivery map is read in DO).
