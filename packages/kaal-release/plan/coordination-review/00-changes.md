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

## ACT: retrospective (4L)

Written by the agent that carried the Change.

### Liked

- Reusing v1 kept the Change small: the same Script, reader and command, a `review` config key, and Cases T40 to T44. Nothing on the board changed.
- Every Case was shown RED in the PLAN before the DO, and the DO moved them to GREEN (33 of 33 in the suite).
- "Unknown, never clean" was settled in the PLAN. A piece whose head is not observed cannot be called clean by accident.
- The sequence shows the exact head to seven characters, so a later move of the head is visible.

### Learned

- Clean means suitable for review at one observed point in time. It does not authorize a merge or a promotion, and the report says so by being a reading order only.
- Cleanness depends on pieces other than the one being read: a pending sync into the same collector makes a promotion not clean. The rule needs the whole list of open pieces, not one piece.
- Adding the head to the reader changed an existing exact-equality Case (T37). New facts can break old expectations, so update them in the same DO.

### Lacked

- A real run of the new section. GraphQL is blocked in this cloud session, so the review sequence has been run on fixtures only. A temporary read-only CI trial needs its own go.
- A TYPE on most older open pieces, so they rank last as `unknown`.

### Longed For

- Running the command where the CPO and Kai see it, so the review sequence is read at the moment of review and not reconstructed by hand.
- The next-move vocabulary Kai asked for, derived from observed flow, in its own Change.
- A single declaration of stations and collectors that Show WIP and Pull Promotion both read.
