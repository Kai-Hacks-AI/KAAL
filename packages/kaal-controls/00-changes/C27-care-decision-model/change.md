# C27 change

## PLAN

1. Add the intent I16 (the CARE decision model and the Owner's mnemonic CONTROL DIRT WITH CARE), the gap G104, the Requirement F41, the architecture A21 and the Cases T1124 and T1125 (plain `.test.mjs`, never renamed). Both Cases are RED on the collector.
2. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector:

1. `scripts/care.mjs` with `judgeDecision`, pure.
2. `references/care.md` and one pointer line in `SKILL.md` (it stays at or under 600 words).
3. Cases T1124 and T1125 GREEN; the package suite GREEN.

It needs no code from C24 or C25. It reads the findings C26's `qualify` lists, as plain names.

## ACT

A retro entry in the collector.

## Left open (for the CPO, with a recommendation)

- Where decisions are stored. Recommendation: a plain JSON list beside the control it concerns, written by the Change that decides, so the history of a decision is the history of that file. The check takes the list as input and does not read a place.
- Whether the proposer and the selector must differ. Recommendation: both are required and recorded, and the check does not compare them, because who may select is the Owner's authority and not a property a script can judge.
- Whether an Accept expires. Recommendation: no field here. A date is planning's, and an Accept is reviewed when its owner or reason changes.
- Whether a decision covers a finding by its stable id only. Recommendation: yes, the same id the C26 scan lists, so a renamed finding is undecided again.
- Whether the Skill carries the whole phrase. Recommendation: no, it carries CARE only; CONTROL DIRT WITH CARE stays in the intent, like RATCHETS.
- The wording of CONTROL and WITH is the Owner's and is copied verbatim; refinement of it is not this Change.
- Ids I16, G104, F41, A21, T1124, T1125 are taken by hand; on a clash the newer pull request renumbers.
