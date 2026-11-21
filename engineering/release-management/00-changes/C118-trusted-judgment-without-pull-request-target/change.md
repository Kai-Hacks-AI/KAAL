# C118 change

## PLAN

1. Add the drafts in `interface.md`: Intent release/I64, Requirement release/F89 and Architecture element release/A100.
2. Compare the ways a gate keeps its judgment trusted without `pull_request_target` (below), recommend one and scope the first DO to D13.
3. The PLAN adds no Case, no source and nothing under `.github`.

## The trust problem

Under `pull_request` (and `pull_request_review`, `merge_group`) the workflow file comes from the pull request's own commit. A gate that is such a workflow can be edited by the pull request it judges, so it must be trusted for nothing: it may hand over data, never a verdict a branch ruleset relies on, unless editing it cannot help the author.

## Options

| | A. Ruleset-required workflow | B. `workflow_run` relay | C. Plain `pull_request`, judge read from the base |
| --- | --- | --- | --- |
| How | A repository rule requires a workflow to pass, taken from a named ref of the base repository, not from the pull request | A `pull_request` workflow only records the pull request number; a `workflow_run` workflow runs from the default branch, reacquires the facts and reports the check | The workflow checks out the base commit and runs the base's judge (as verify-triggers does) |
| A pull request editing the gate | cannot: the definition is the base's | can edit the relay, so it only changes the number it hands over; the verdict is judged by the default branch's copy, for the pull request the number names | can: it can remove or rewrite the job; safe only where the missing or rewritten job gains it nothing |
| Fork pull request | read-only token, no secrets, same as today's judgment which never needed a fork token | the relay holds no token; the `workflow_run` side has the base's token and reads the fork's commits as Git data only | read-only token |
| Merge-group counterpart | a merge group run still uses the group's commit; this option does not change that | same | same |
| Cost | the Owner configures a ruleset; I believe this needs an organisation ruleset, which the Owner has to confirm for this organisation | two runs per event and the `workflow_run` delay; the check must be set and completed by the handler (the proven shape in change-isolation-review.yml) | none |
| Fails closed | a missing run blocks the merge | a relay that does not run reports no check, and a missing required check blocks the merge | the same for a missing job; a rewritten job can pass |

## Recommendation

1. **D13 (merge-group-admission): option C, plain `pull_request`, with no relay.** The workflow judges nothing and attests nothing: it echoes, so that the pull request can enter the merge queue, and the merge group's own run judges at merge time. A pull request that edits or deletes it can only lose the context (and not enter the queue) or keep an echo. Nothing the trigger protected is left to protect. Keep `permissions: {}`, no checkout, no secret.
2. **D14 to D17 (the judging gates): option B**, the pattern already proven on `main` by change-isolation-review: the untrusted `pull_request` relay records the number, the handler on `workflow_run` runs from the default branch, reacquires every fact, sets the check in progress first and completes it from the judgment, failing closed. Keep the per-pull-request concurrency, never cancelled mid-run, so the last run to finish never reports older state. (The hotfix on Branching cancels in-progress runs of its job, which is right while the job itself is the check; a relay handler must not cancel mid-run.)
3. **Option A as a later hardening**, if the Owner's organisation allows required workflows: it removes the relay and its delay for the gates, and does not change the order of this Change.

Order of the DOs: D13 first; then promotion-source (D14), sync-review (D15), change-isolation (D16), Branching (D17) last, after the rework of its source that release has in hand. Each DO changes the engineering source and its Case first (a plain `.test.mjs`, never RED on a collector), then a WIRE installs the workflow under `.github/workflows/` (`.github` travels alone). The Case of each judges the criterion, not the text: the workflow does not name `pull_request_target`, and the gate's verdict is judged by the default branch's copy.

## Questions for Kai (recommendation first)

1. Accept option B as the standard for the judging gates and option C for D13 alone? Recommended: yes.
2. Does the organisation allow required workflows in a ruleset (option A)? If yes, it is a later hardening of B; if not, B stays. The Owner knows the plan.
3. The check name a branch ruleset requires: the handler reports the same context the pull request workflow reports today (Branching, Change Isolation, Promotion Source, verify Sync), so the ruleset needs no change. Keep that? Recommended: yes.

## Ids

Change `release/C118`, Intent `release/I64`, Requirement `release/F89`, Architecture `release/A100`. No Case and no control id. Taken by hand; release confirms.
