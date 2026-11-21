# C118 baseline

The baseline is the collector `kaal/release/no-pull-request-target` after release/C115 (the five Defects).

- The five workflows on `main` that name `pull_request_target`: merge-group-admission (D13), promotion-source (D14), sync-review (D15), change-isolation (D16) and Branching (D17). release/CTL19 stops the number from rising, and release/T1123 is held RED at five.
- Two patterns already on `main` reach a judgment without the trigger. `verify-triggers.yml` (CTL19) runs on `pull_request`, checks out the base commit and runs the base's judge; but a pull request could edit that workflow, so it is a detective control, not a gate a pull request cannot pass by editing. `change-isolation-review-relay.yml` runs on `pull_request_review`, is trusted for nothing and only hands over the pull request number; `change-isolation-review.yml` runs on `workflow_run` from the default branch, reacquires every fact, and sets and completes a check on the head.
- Merge groups: a `merge_group` run uses the definition of the group's commit, which already holds the pull request's changes. The merge group side of the queue (merge-group-review.yml, merge-group.yml) is therefore not trusted by its trigger either; what it relies on is outside this Change.
- Highest ids at the time of writing, read against `main` and the open release and engineering collectors: I62, F88, A99. The ids below, I64, F89, A100 and C118, are taken by hand and confirmed by release.
