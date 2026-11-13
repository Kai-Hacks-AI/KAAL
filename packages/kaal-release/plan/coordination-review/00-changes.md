# Show WIP v2: review sequence and clean for review (A to B)

This is `coordination/C2`, a PLAN Change. It ships no code. It adds to Show WIP v1 ([../coordination/requirements.md](../coordination/requirements.md), on the collector) what the Owner asked for on 13 Nov 2026: "On review list: we need review sequence. And given time delay between sync and promotion for example it needs to be very clear what is clean for review."

## A: the present

Show WIP v1 lists every open piece with WORK, REVIEW, WAIT or UNKNOWN. The pieces that wait for a reviewer are all REVIEW, in reference order. Nothing says which to review first. Nothing says whether a REVIEW piece can be reviewed now: a promotion may wait on a pending sync into its collector, and an approval given at one head is lost when the head moves.

## B: the target

The report gains a **review sequence**: the REVIEW pieces in a declared order (station first, then type, then reference), each marked **clean** or **not clean** for review at this moment, with the reason, and the exact head the facts were read at. A piece whose cleanness cannot be told from observed facts is marked **unknown**, never clean. The board, the dispositions and the facts of v1 are unchanged. Show WIP stays read-only and authorizes nothing; the sequence is a reading order, not a gate.

## Order and constraints

Reuses v1 as it is: the same Script, reader and command, extended by this Change's DO. Its own PLAN, DO and ACT in its own collector. No hook, CI, ruleset or Guard change; no new host access (the reader already reads the head).

## Not in this Change

A prediction that a head will not move (a point-in-time view cannot know it; the exact head is shown so a later move is visible). Pieces that are not REVIEW yet but will be (WAIT, WORK). A queue or limit. Roles. Policy about when a sync must precede a promotion. The next-move vocabulary beyond v1.
