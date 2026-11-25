# C147 change

## PLAN

1. Add the intent I25, the gap G113, the Requirement F211, the architecture A208 and the Case T1523 (plain `.test.mjs`, never renamed). The Case is RED on the collector.
2. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector, and with the collector synced with main:

1. `judgeAdoption` in `scripts/ratchet.mjs`, pure.
2. One sentence in `references/modes.md` that the adoption line is judged too (the Skill structure is the restructure's).
3. Case T1523 GREEN; the package suite GREEN. Mutation patches as in C25 for each weakening.

## ACT

A retro entry in the collector.

## Left open (for the CPO, with a recommendation)

- Two functions or one. Recommendation: two. `judgeProgress` judges a shrink and `judgeAdoption` the first line, each with one property. A caller that does not know which applies reads the base's history: empty means adoption.
- Whether an adoption may start from a baseline that already exists in the base without history (release's case) or only from none. Recommendation: both, with the head's baseline not exceeding the base's when one exists.
- Whether a `to: 0` adoption (a ratchet adopted at zero) is accepted. Recommendation: yes; it is the same line, and the ratchet ends at once.
- Ids C147, I25, G113, F211, A208 and T1523 are taken by hand; release holds T1522. On a clash the newer pull request renumbers.
