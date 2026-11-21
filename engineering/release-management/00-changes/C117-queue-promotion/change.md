# C117 change

## PLAN

One pull request into the collector, with the Case and the source together, because the Engineering check runs every Case and a RED Case would fail it (the phase judge that would excuse that does not exist yet); as release/C114 was.

1. Intent `release/I63` (a promotion lands on the tip of main, one at a time) and control `release/CTL32` `queue Promotion` (preventive, designed: nothing is claimed in operation before the Owner loads it).
2. `promoting.json` holds the `merge_queue` rule with the parameters of the old promotion ruleset; `stages.json` declares it for Promoting, traced to CTL32; `controls.md` lists it in the promoting row and no longer lists the queue as enforced only by the old rulesets.
3. Case T1321, in `05-src/wiring/rulesets/`: the promoting source holds exactly one queue and it is the queue the live ruleset has; no other ruleset source holds one; the table of controls says so.
4. Accept list: T481 (Promoting's rule types), T482 (the legacy rules: Promoting holds exactly one `merge_queue`), T1132 (compares the required checks of the draft, not the whole file) and the helper of C35 (the declared controls include release/CTL32), so that T483, T511 and T512 judge the new declaration.

Nothing under `.github`, no live ruleset and no other control changes.

## Ids

Change `release/C117`, Intent `release/I63`, control `release/CTL32`, Case T1321.

## Install

The Owner loads `promoting.json` into the live `promoting` ruleset after comparing it with the live queue; the old promotion ruleset keeps its queue until then (both squash, identical, so two rules do not disagree). Removing the queue from the old ruleset is the Owner's step after the new one is live, and then Branching's promotion-freshness verdict can retire in its own Change.

## ACT

A 4L retrospective in the ACT before the promotion; one retro for the collector.
