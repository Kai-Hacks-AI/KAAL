# Engineering: Cases for the queued pull request's cleared auto-merge field (B1 F4)

Capability: Engineering. Target: kaal/engineering-b1-f4cases. Record number is provisional until integration (05 holds the F3 Cases, 06 the T115 and T124 correction).

## Intent

The second queue window stopped at the control: once a pull request is in the queue GitHub clears its auto-merge field, and the merge group's `Branching` job read the method from it ("Auto-merge is disabled"). F4 is a `.github` only Change (bind-group.sh), so it travels without Cases. This Change gives it its Cases, so that the properties the CPO approved are held by a test: a cleared field gives Branching a method to judge, the queue rule's own method still decides, a queue whose method differs from the flow still fails, unreadable or contradictory rules stay unjudgeable, a method GitHub does report is kept, and the review job exports exactly what it did.

## Content

`engineering/github/bind-group.red.mjs`, hand-run (no suite or lane names it), four new Cases beside T143 to T153:

- T154: a queued pull request with the field cleared exports `KAAL_AUTO_MERGE=merge`; `effectiveMethod` then returns the squash queue's `squash` and the merge queue's `merge`.
- T155: a reported method is kept (`squash` stays `squash`); the review job exports exactly `PR_NUMBER`, `PR_HEAD`, `BASE_REF`.
- T156: with the cleared field, a SQUASH queue passes a squash flow (`autoMerge`), a MERGE queue fails it and says so; the fallback label never overrides the queue rule.
- T157: rules that are not a list, queues that disagree, and an unknown method all throw; the group job still reads `rules/branches/<base>` and fails with exit 2 when it cannot.

No ledger entry is carried.

## Check

`node --test engineering/github/bind-group.red.mjs`: 26 of 26 GREEN with F4's script. Against `main`'s script T154 and T156 are RED (2 of 26). Mutation: the fallback reverted to empty turns T154 and T156 RED; the fallback changed to `squash` turns T154 RED.

These Cases do not show GitHub's queue behaviour. Whether the control then reaches merge, Case 6 and CodeQL on a group stay unproven until a new window.

## Act

Hand-run until the trial. No queue, ruleset, promotion or publication.
