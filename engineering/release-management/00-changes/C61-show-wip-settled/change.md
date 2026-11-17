# C61 change

## PLAN

1. Add the drafts in `interface.md`: the facts per branch, the `state` and `settled` of an inventory entry, the counts of the overview and the `settled` view.
2. Add the Cases T800 to T804, all RED (`evidence.md`).
3. Observe the expected RED, and that each Case can pass with the DO's content.
4. The PLAN changes no script, no reader and no config.

## Ids

Allocated by the coordinator on 17 Nov 2026: Change `release/C61`, Cases T800 to T809 (five used). No gap id is allocated: like release/C39 it closes none.

## DO

On the merged PLAN, into the collector of this Change:

1. In `show-wip.mjs`: the `state` and `settled` of each entry, the counts, the markers and the `settled` view (`interface.md`).
2. In `read.mjs` and `run.mjs`: read `head`, `ahead` and `settled` of each branch from the host (the branch's tip, its comparison with main, and its newest closed or merged piece). What the host did not answer stays absent.
3. In `README.md`: the new view.
4. Rename T800 to T804 from `.red.mjs` to `.test.mjs` when green.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Advisory only

C61 adds no way to delete, close or move a branch and takes no action on what it shows. Deleting a settled branch stays with someone who has delete rights, by decision.

## Left open

- A branch protected by a ruleset or still checked out somewhere: the report cannot tell, and says nothing about it.
- Whether a discarded branch was dropped on purpose or indicated by mistake: both are cleanup, and the report does not tell them apart.
