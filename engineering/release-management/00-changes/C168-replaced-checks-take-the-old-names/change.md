# release/C168: the replaced checks take the names the rulesets already require

## Reason
Release/C153 replaces four `pull_request_target` checks. The two rulesets that name them (`old integration` for pull requests into `kaal/**`, `old promotion` for pull requests into the default branch) require four contexts: `Change Isolation`, `Branching`, `Promotion Source` and `Change Isolation (review)`. The plain jobs carry other names today. The merge queue is governed by the same `old promotion` ruleset, and its required names are checked on the merge group: `merge-group.yml` reports `Change Isolation`, `Branching` and `Promotion Source` there, and `merge-group-review.yml` reports `Change Isolation (review)`. The plain workflows run on `pull_request` only. So a ruleset that required the plain jobs' own names would wait in the queue for names that nothing reports on `merge_group`.

The way through is that the new check takes over the name the rulesets already require, on `pull_request`, and the merge group keeps its own reporters untouched. The owner decided this (27 Nov, Option A of `ruleset-changes.md`): no ruleset edit for any of the four checks, and the rename is the swap.

## The contract
- **One context, one reporter per event.** At any moment, for the event of a pull request, exactly one job reports each of the four required contexts, and on `merge_group` exactly one workflow does. A context with two reporters would let the ruleset accept either result, so it is a defect.
- **Check 3** (`Change Isolation (review)`). The plain admission job takes the name. The old admission job (`merge-group-admission.yml`, `pull_request_target`) is renamed in the same change and keeps running unrequired. `merge-group-review.yml` keeps reporting the name on `merge_group`; the admission does not run on that event.
- **Check 1** (`Change Isolation`). It has two entries (CTL42, CTL23) and so two jobs, but the ruleset names one context. An aggregator job named `Change Isolation` needs both entries and passes only when both succeeded: it has no permission, no checkout, no secret and one step that fails unless every needed job succeeded. The old job named `Change Isolation` is renamed in the same change and keeps running unrequired. `merge-group.yml` keeps reporting the name on `merge_group`.
- **Check 2** (`Branching`). The same: an aggregator job named `Branching` needs the three entries (freshness, synchronization, auto-merge). The old `Branching` job is renamed and kept; `merge-group.yml` keeps reporting the name on `merge_group`.
- **Check 4** (`Promotion Source`). The same: an aggregator job named `Promotion Source` needs the two entries (origin, head evidence). The old job is renamed and kept; `merge-group.yml` keeps reporting the name on `merge_group`.
- **The rename is the swap, for all four.** The change that moves the name is the moment the new check becomes the required one, for the pull requests into `kaal/**` and into the default branch at once. So the order is fixed: the flag of the check is `on` (preventing) first, because a detective check ends green and would leave nothing enforced; then the rename WIRE, each on the Owner's separate go. The Owner's go for the WIRE is the Owner's go for that check's enforcement swap.
- **Legacy never enters the rulesets.** A renamed old job carries the marker `(legacy` in its name (for example `Change Isolation (legacy pull_request_target)`), so it can be told from a required name. No ruleset requires a context carrying the marker, in `old integration`, `old promotion` or any ruleset of the new family (`20` to `30`), and no required-context list held in the repository names one. The legacy checks run only as the detective comparison, and retire on the Owner's go by 2 December (release/C153).
- **Release declares, controls judge.** The renamed and the aggregating jobs run the entries of C167 unchanged. The names are workflow facts and carry no mode and no flag.
- **No change of judgment, permission or trigger.** The renamed jobs keep their triggers, their `permissions` and the entry they run.

## Target shape: one mandatory control check
The Owner's ideal is one mandatory control check that pulls in all the others, so that the rulesets name a single required context. This Change does not build it. It is the target shape: a single aggregator job on `pull_request` and one on `merge_group`, needing every control job of the event, reading the flags through the controls library; the rulesets would then require that one name only.

The aggregators of this Change are the same pattern (a job that needs the entries and passes only when all succeeded), one per old context. The aggregator of check 1 could grow into the single check, but it should not be named `Change Isolation` then: the single check needs its own name, so the rulesets change once, at that time, and the per-check aggregators and the old names go. Until then, per-check aggregators keep the rulesets as they are. The concept of a single mandatory check belongs to the controls library (raised with controls); a Release Change follows when it lands.

## Acceptance expectations
- After the change, for a pull request, each of `Change Isolation`, `Branching`, `Promotion Source` and `Change Isolation (review)` is reported by exactly one job, from the plain workflows; the old jobs carry the `(legacy` marker and still run, unrequired.
- On `merge_group`, each of the four is reported by exactly one workflow, unchanged.
- Every aggregator is red when a needed job failed, was skipped or was cancelled, and green only when all succeeded.
- No required-context list names a name with the legacy marker.
- The renamed jobs have the permissions, triggers and steps they had before.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1640: for a pull request event, the job names in the workflow files give exactly one reporter for each of the four contexts.
- T1641: the old jobs carry the marker `(legacy` in their names, no required context, and are not removed.
- T1642: on `merge_group`, each of the four has one reporter (`merge-group.yml` and `merge-group-review.yml`), and neither the admission nor any plain job has a `merge_group` trigger.
- T1643: each aggregator (`Change Isolation`, `Branching`, `Promotion Source`) fails when a needed job failed, was skipped or was cancelled, and passes only when every needed job succeeded; it holds no permission, no checkout and no secret.
- T1644: the renamed jobs have the `permissions`, triggers and entry commands they had before the change (a diff ratchet on the rename).
- T1645: no context with the `(legacy` marker is required by any ruleset definition held in the repository, and no workflow names a required context other than the four through a legacy job (a ratchet).
- T1646: the names of the four required contexts are the ones in the rulesets of the repository, so a rename of a reporter without the ruleset, or the reverse, is seen (a ratchet over the job names against the required-context lists the repository holds).
All red until the DO.

## Earlier Cases that pin the detective state
Seven Cases of earlier Changes assert that no job of a plain workflow takes a required context "before the swap", and one of them also pins the detective job name of the admission. They describe the state this Change ends, so the DO updates them, and only these assertions. Everything else in them stays.
- release/T1575 (C155), T1577 (C158), T1579 (C159), T1581 (C160), T1597 (C163) and release/T1571 (wiring): "no job takes the required context" becomes "the entry jobs keep their own names, and the one aggregator job takes the context" (check 1 `Change Isolation`, check 2 `Branching`, check 4 `Promotion Source`). Their other assertions (trigger, workflow name, the entry names, no kaal-guard) are unchanged.
- release/T1576 (C157): the job name `Change Isolation (review, plain pull_request)` becomes `Change Isolation (review)`, and "it must not take the required context" is dropped, since taking it is this Change.
The new expectation is the one T1640 and T1643 state; the old one is the contract of the detective phase, which the swap ends. No Case of this Change is weakened.

## DO
Rename the old jobs with the legacy marker and add the three aggregators (and the renamed admission), in the workflow files only, as a WIRE source change; the WIRE itself (the byte-equal copy on main) is the Owner's separate go, taken after the check's flag is `on`.

## After it
ACT, PROMOTION. Per check, on the Owner's go: the flag (C167) `on`, then this WIRE. No ruleset edit is needed or made.

## Left open (with a recommendation)
- Whether the aggregators are jobs of the plain workflows or workflows of their own. Recommendation: the same workflow, one file per check.
- The legacy checks retire on the Owner's go by 2 December (release/C153). Retiring is a separate change.
- The single mandatory check (above) is a controls concept first.

## Not in this Change
No WIRE, ruleset change, flag entry or flip. No change to any judgment.

## Design: split and overlap
Split: none. This Change only moves names; it does not touch C167 (what an entry passes) or controls (what the flag means).
