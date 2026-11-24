# C29 change

## PLAN

1. Add the intent I17, the gap G105, the Requirement F200, the architecture A200 and the Cases T1500 to T1504 (plain `.test.mjs`, never renamed). All are RED on the collector.
2. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector:

1. `scripts/accept.mjs` with `judgeAcceptance`, pure.
2. `references/acceptance.md` and one pointer line in `SKILL.md` (it stays at or under 600 words).
3. Cases T1500 to T1504 GREEN; the package suite GREEN.

## ACT

A retro entry in the collector.

## Left open (for the CPO, with a recommendation)

- Where the acceptance list is stored. Recommendation: a plain JSON list beside the control it concerns, written by the Change that accepts, so its history is the file's history. The check takes the list as input and reads no place.
- Whether an acceptance needs a Defect. Recommendation: yes, a non-empty Defect reference, because an acceptance is only meaningful for a failure that is known and tracked. Whether it is the right Defect is Review's judgement.
- What identifies the failure an acceptance covers. Recommendation: the control id plus the failing Test Case id. A failure with no cited Test Case cannot be accepted.
- Whether a control that fails several Test Cases is accepted in part. Recommendation: no. It is flagged ACCEPTED only when all of them are covered, and `uncovered` lists the rest.
- The acceptance lifecycle (accepted by the CPO as a rule). Fixing the Defect voids its acceptance, a later failure of the same Test Case is a regression that needs a new decision, and a voided acceptance may stay visible for cleanup but never regains validity. The pure judge carries one optional `voided` flag per entry and reads no Defect state. Who marks an entry voided and when is the adopter's. There is no date field; a date is planning's.
- Who may add an acceptance and how CI reads the verdict (a required check, a ruleset). Recommendation: release's, after this PLAN, and the Owner's go; the check is a pure function and activates nothing.
- The relation to a ratchet: a ratchet is a preventive strategy over a baseline (C23 to C25), not an acceptance, and C29 does not change it.
- Ids I17, G105, F200, A200, T1500 to T1504 are taken by hand; on a clash the newer pull request renumbers.
