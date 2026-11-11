# C5 inventory

Observed on 11 Nov 2026 against `main` 8720c40 and the live repository.

| Id | Observation |
| --- | --- |
| O1 | One workflow, `dependency-review.yml`, job `Dependency Review`, action `actions/dependency-review-action` pinned by SHA (v5.0.0), permissions `contents: read`, trigger `pull_request` into `main` and `kaal/**`. The header says it is detective and that binding it is a ruleset decision. |
| O2 | The repository is public, so the dependency graph the action reads is available. The last 30 runs are all `pull_request` and all success. |
| O3 | The ruleset `integration` (24952357, `kaal/**`) requires 14 contexts, none of them Dependency Review. The ruleset `promotion` (24951062, default branch, merge queue, squash) requires 12, none of them Dependency Review. `publishing` (26921478) is about tags and is not involved. Both rulesets use integration_id 15368 (GitHub Actions) for the contexts. |
| O4 | `promotion` has a merge queue. A context it requires must also be reported on the merge group commit. `dependency-review.yml` has no `merge_group` trigger, so binding the current job at Promotion IN would hold every promotion in the queue. This is the one wiring fact that decides the order of the DO. |
| O5 | `integration` has `strict_required_status_checks_policy`, so the new context must be reported for every pull request into a collector, with no path filter and no skip. The existing workflow has neither. |
| O6 | No Guard declaration names the check, no hook runs it, and no Case covers it. `engineering/controls/README.md` and `engineering/guard/architecture.md` both leave it outside. |
| O7 | Dependabot version updates reach `kaal/ci` and `kaal/dependencies` as pull requests, so those are the pull requests the check will judge most. A security update that removes an advisory passes, because only the added version is judged. |
| O9 | Ruleset contexts are matched by check name, which is the job name, so a job name that two workflows share is ambiguous. That is why only an aggregate, with a unique name, is bound. To be observed in S3. |
| O8 | No ruleset named `legacy-integration` is in the live list. The rulesets are `integration`, `promotion` and `publishing`. |
