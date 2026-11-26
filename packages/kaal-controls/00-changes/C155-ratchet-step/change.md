# C155 change

## PLAN

1. Add the intent I27, the gap G114, the Requirement F213, the architecture A210 and the Case T1554 (plain `.test.mjs`, never renamed). The Case is RED on the collector, because `scripts/judge-ratchet.mjs` is absent, and was run GREEN against a throwaway implementation that is not committed.
2. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector, and with the collector synced with main:

1. `scripts/judge-ratchet.mjs` with `judgeRatchetStep`, pure, importing the three judges from `scripts/ratchet.mjs`.
2. One sentence in `references/modes.md` that a wiring passes the files and the carried Changes to this judge and does not choose a step itself (the Skill structure is the restructure's).
3. Case T1554 GREEN; the package suite GREEN, with the new Case counted. Mutation patches as in C25 and C147 for each weakening of the choice of the step and of the order of judgement.

## DO record

`scripts/judge-ratchet.mjs` is added with `judgeRatchetStep`, pure, and `references/modes.md` has one sentence on it; `scripts/ratchet.mjs` and every other script are unchanged. T1554 is GREEN and the package suite (115 tests, with T1554 counted) is GREEN. `mutations/` keeps eight weakenings as exact patches with a runner, as in C25 and C147: the shortcut before validation (M1), adoption only from an absent baseline so that adoption with shrink reads as progress (M2), the carried count unchecked (M3), retirement not routed (M4), duplicate names read (M5), the shape of a history line unchecked (M6) and an unchanged that ignores the history (M7) and a window whose contents are not read as times (M8). `mutations/run-at-do-head.txt` is the run on the DO: the baseline is GREEN on T1554 and each weakening, loaded alone, is RED. The record cannot name its own revision; re-run `sh mutations/run.sh <repo root>` at the DO's head and compare with it.

## ACT

A retro entry in the collector.

## Linked work (release's, separate PLAN)

Release owns the wiring: reading the baseline and history files at the base and the head as Git data, taking the carried Changes from the changed paths, the window from the times of the two revisions, the delivery map, the station, the flag `KAAL_CONTROLS_<CONTROL>` of each ratchet, the runner and the report, detective and advisory first (release/C134 names the verification Change that follows its adoption). That PLAN links to controls/F213 by id. It runs the judge through the control adapter (controls/F203, F206) and its own recognition (controls/F212), so it waits for the verify Adapter work, and then for the Owner's separate go on the WIRE. No workflow, flag, required check or ruleset is part of this Change, and this PLAN authorizes no WIRE.

## Decided here (for the CPO review)

- Controls owns the step semantics; the adopter locates and reads the files and hands over their text.
- The judge takes file texts, not parsed data, so that an unreadable file is UNKNOWN in one place and not in every wiring.
- Validation precedes every shortcut (F213 item 2): identical malformed or unreadable evidence on both sides is UNKNOWN, never an unchanged PASS. T1554 holds six such cases.
- Absent is `null` and is established by the adopter from the base revision's own tree; a file that could not be read is never `null`.
- Adoption and shrink are separate steps (F213 item 4). The Case holds the combined step, an adoption line plus a shrink line over a base that has a baseline and no history, and it is classified as an adoption and rejected with `line-mismatch`, never read as progress.
- The carried Change is a list the adopter fills from paths. The judge never reads a title, a body or a convention.
- The library is not changed, so `judgeAdoption` (controls/F211) stays the only judge of a first line.

## Left open (for the CPO, with a recommendation)

- A single adoption line over an existing baseline whose head baseline is a subset of it is accepted by controls/F211 item 3 (adopted as a subset of itself), already decided in C147. It is one step with one line, so it is not the combined case. Recommendation: keep F211, and reject only a head with a further line.
- Whether the history file is found by convention beside the baseline or declared in the control record. Recommendation: the adopter finds both and passes the texts; the judge does not look for them.
- Ids C155, I27, G114, F213, A210 and T1554 are taken by hand; on a clash the newer change renumbers.

## Corrected at the CPO review of the DO

The first DO checked only that a window was present, so identical valid files with an empty or malformed window returned an unchanged PASS. F213 item 2 already requires validation before any shortcut, so no PLAN amendment: T1554 was extended first (RED on that DO, for the window `{}`, a missing or non-time `from` or `to`, a string, a number and a list, on the identical files, on the files with no baseline, and on a shrink), then the validation was fixed (GREEN), and M8 was added.
