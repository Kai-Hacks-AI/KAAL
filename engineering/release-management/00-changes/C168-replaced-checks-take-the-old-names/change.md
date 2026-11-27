# release/C168: the replaced checks of Change Isolation and its admission take the names the rulesets require

## Reason
Release/C153 replaces `pull_request_target` checks. Checks 2 and 4 are required by new job names (the Owner changes the two rulesets). Checks 1 and 3 are not: their old contexts, `Change Isolation` (check 1) and `Change Isolation (review)` (check 3), are named in the rulesets and are also reported by the merge group (`Change Isolation (review)`). The plain jobs carry other names today (`Change Isolation: .github alone (plain pull_request)`, `Change Isolation: delivery (plain pull_request)`, `Change Isolation (review, plain pull_request)`). Nothing says how those two contexts pass from the old workflow to the new one without a gap and without two checks answering the same name.

## The contract
- **One context, one reporter per event.** At any moment, for the event of a pull request, exactly one job reports the context a ruleset requires. A context with two reporters is a defect: the ruleset would accept either result.
- **Check 3.** The plain admission job takes the name `Change Isolation (review)`. The old admission job (`merge-group-admission.yml`, `pull_request_target`) is renamed in the same change to its own name, and keeps running unrequired as the detective comparison. The merge group's `merge-group-review.yml` keeps reporting `Change Isolation (review)` on `merge_group`; the admission does not run on that event, so the name is reported by one workflow per event.
- **Check 1.** Check 1 has two entries (CTL42, CTL23) and so two jobs, but the ruleset names one context. A third job, named `Change Isolation`, depends on both entries and passes only when both entries' jobs passed: it has no permission, no checkout, no secret and a single step that fails unless every needed job succeeded. The old job named `Change Isolation` (`KAAL`, `pull_request_target`) is renamed in the same change and keeps running unrequired.
- **The rename is the swap for these two.** Because the ruleset already names the old contexts, the change that moves the name is the moment the new check becomes the required one; no ruleset edit is made by Release or needed for these two. So the order is fixed: the flag of the check is `on` (preventing) first, because a detective check ends green and would leave nothing enforced; then the rename on the Owner's go as a WIRE. The Owner's go for the WIRE is the Owner's go for that check's enforcement swap.
- **Release declares, controls judge.** The renamed jobs run the entries of C167 unchanged. The names are workflow facts and carry no mode and no flag.
- **No change of judgment, permission or trigger.** The renamed jobs keep their triggers, their `permissions`, and the entry they run.

## Acceptance expectations
- After the change, for a pull request, each of `Change Isolation` and `Change Isolation (review)` is reported by exactly one job, from the plain workflows; the old jobs carry other names and still run, unrequired.
- On `merge_group`, `Change Isolation (review)` is reported only by `merge-group-review.yml`.
- The aggregator job `Change Isolation` is red when either entry's job failed or was skipped, and green only when both succeeded.
- The renamed jobs have the permissions, triggers and steps they had before.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1640: for a pull request event, the job names in the workflow files give exactly one reporter for `Change Isolation` and exactly one for `Change Isolation (review)`.
- T1641: the old jobs carry names of their own, no required context, and are not removed.
- T1642: on `merge_group`, `Change Isolation (review)` has one reporter, `merge-group-review.yml`, and the admission job has no `merge_group` trigger.
- T1643: the aggregator `Change Isolation` fails when a needed job failed, was skipped or was cancelled, and passes only when every needed job succeeded; it holds no permission, no checkout and no secret.
- T1644: the renamed jobs have the `permissions`, triggers and entry commands they had before the change (a diff ratchet on the rename).
All red until the DO.

## DO
Rename the jobs and add the aggregator, in the workflow files only, as a WIRE source change; the WIRE itself (the byte-equal copy on main) is the Owner's separate go, taken after the check's flag is `on`.

## After it
ACT, PROMOTION. Per check, on the Owner's go: the flag (C167), then this WIRE. Check 2 and 4 need no rename: their new job names go into the rulesets (the Owner).

## Left open (with a recommendation)
- Whether the aggregator should be a job of the plain workflow or a workflow of its own. Recommendation: the same workflow, one file per check.
- A rename leaves the old check running with its new name unrequired; it is retired on the Owner's go by 2 December (release/C153).

## Not in this Change
No WIRE, ruleset change, flag entry or flip. No change to any judgment.

## Design: split and overlap
Split: none. This Change only moves names; it does not touch C167 (what an entry passes) or controls (what the flag means).
