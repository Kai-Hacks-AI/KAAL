# release/C170: an aggregator passes only on evidence of success for every expected entry

## Reason
Release/C168 gave each replaced check an aggregator job that takes the context name the rulesets require (`Change Isolation`, `Branching`, `Promotion Source`). Each aggregator loops over the results of its `needs` and exits 1 when one is not `success`. The CPO's retrospective review of the C168 DO (#2970) found the gap: the loop succeeds vacuously when the list of results is empty, and when the list is partial it does not establish that every expected entry reported. T1643 covers failed, skipped and cancelled, not empty or incomplete evidence. A required context that can go green on no evidence is not a gate. The CPO asks for a correction with negative Cases before any WIRE of the aggregators.

## The contract
- **Expected entries are named.** Each aggregator holds, in its own text, the list of the entries it expects (check 1: `github-alone`, `delivery`; check 2: `freshness`, `synchronization`, `auto-merge`; check 4: `origin`, `head-evidence`), apart from the list of results it receives.
- **The reported set equals the expected set, exactly.** The aggregator fails when the entries that reported are not the expected entries: an absent one, and also an unexpected one, even when every expected entry succeeded. A result of an entry nobody listed is a changed workflow the expected list has not caught up with, so it fails and names the entry.
- **Evidence of success for each.** The aggregator passes only when, for every expected entry, a result is present and equals `success`. An entry whose result is absent, empty, or anything but `success` (failure, skipped, cancelled, an unknown word) fails the aggregator, and the message names the entry.
- **An empty result set fails.** With no result at all the aggregator fails; it never passes because there was nothing to check.
- **The lists agree.** The expected list equals the `needs` list of the same job, so a job added to `needs` and not to the expected list (or the reverse) is seen by a Case, not by an incident.
- **Nothing else changes.** The aggregators keep their names, `if: always()`, no permission, no checkout and no secret; the entries, the triggers and the `merge_group` reporters are untouched.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1660: each aggregator names its expected entries in its own text, and the list equals its `needs`.
- T1661: with no result at all, each aggregator fails.
- T1662: with a partial result set (one expected entry absent), each aggregator fails and names the missing entry.
- T1663: a result other than `success` for any expected entry (failure, skipped, cancelled, an unknown word) fails the aggregator; all expected entries `success` passes it.
- T1664: the reported set equals the expected set exactly. An extra result of an entry that is not expected fails the aggregator both when an expected entry is missing and when every expected entry succeeded (the count of results is not the evidence, and an unexpected entry is not ignored).
All red until the DO. T1643 of C168 stays as it is and stays green.

## DO
Change the three aggregators in the plain workflow sources (`change-isolation-plain.yml`, `branching-plain.yml`, `promotion-source-plain.yml`) to the contract, and add the Cases. The DO is cut on the C168 collector's result once C168 is on main, because the aggregators exist only after it. Workflow sources only.

## After it
ACT, PROMOTION. The WIRE of any aggregator, and with it the swap, needs this Change on main first, and then the Owner's separate go for each check.

## Not in this Change
No WIRE, flag entry, ruleset change or swap. No change to any judgment, entry or trigger.

## Design: split and overlap
Split: none. It corrects the mechanism of the aggregators of release/C168 and nothing else. It overlaps C168 only in the three files it edits, after C168 is on main.
