# C155 change

## PLAN

1. Add the intent I27, the gap G114, the Requirement F213, the architecture A210 and the Case T1554 (plain `.test.mjs`, never renamed). The Case is RED on the collector, because `scripts/judge-ratchet.mjs` is absent, and was run GREEN against a throwaway implementation that is not committed.
2. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector, and with the collector synced with main:

1. `scripts/judge-ratchet.mjs` with `judgeRatchetStep`, pure, importing the three judges from `scripts/ratchet.mjs`.
2. One sentence in `references/modes.md` that a wiring passes the files and the carried Changes to this judge and does not choose a step itself (the Skill structure is the restructure's).
3. Case T1554 GREEN; the package suite GREEN, with the new Case counted. Mutation patches as in C25 and C147 for each weakening of the choice of the step.

## ACT

A retro entry in the collector.

## Linked work (release's, separate PLAN)

Release owns the wiring: reading the baseline and history files at the base and the head as Git data, taking the carried Changes from the changed paths, the window from the times of the two revisions, the delivery map, the station, the flag `KAAL_CONTROLS_<CONTROL>` of each ratchet, the runner and the report, detective and advisory first (release/C134 names the verification Change that follows its adoption). That PLAN links to controls/F213 by id. It runs the judge through the control adapter (controls/F203, F206) and its own recognition (controls/F212), so it waits for the verify Adapter work, and then for the Owner's separate go on the WIRE. No workflow, flag, required check or ruleset is part of this Change.

## Decided here (for the CPO review)

- The judge takes file texts, not parsed data, so that an unreadable file is UNKNOWN in one place and not in every wiring.
- Absent is `null` and is established by the adopter from the base revision's own tree; a file that could not be read is never `null`.
- The carried Change is a list the adopter fills from paths. The judge never reads a title, a body or a convention.
- The library is not changed, so `judgeAdoption` (controls/F211) stays the only judge of a first line.

## Left open (for the CPO, with a recommendation)

- A step that adopts and shrinks at once (a first line over an existing baseline that already differs from its history) is judged as an adoption and fails if the line does not match. Recommendation: that is correct, one step is one line.
- Whether the history file is found by convention beside the baseline or declared in the control record. Recommendation: the adopter finds both and passes the texts; the judge does not look for them.
- Ids C155, I27, G114, F213, A210 and T1554 are taken by hand; on a clash the newer change renumbers.
