# C147 change

## PLAN

1. Add the intent I25, the gap G113, the Requirement F211, the architecture A208 and the Case T1530 (plain `.test.mjs`, never renamed). The Case is RED on the collector.
2. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector, and with the collector synced with main:

1. `judgeAdoption` in `scripts/ratchet.mjs`, pure.
2. One sentence in `references/modes.md` that the adoption line is judged too (the Skill structure is the restructure's).
3. Case T1530 GREEN; the package suite GREEN. Mutation patches as in C25 for each weakening.

## ACT

A retro entry in the collector.

## Decided by the CPO review (kept here as the record)

- Two functions: `judgeProgress` for a shrink and `judgeAdoption` for the first line.
- Adoption over an existing baseline is accepted only as a subset of it.
- An adoption at zero is accepted and is eligible for retirement.
- Absent is not empty: `null` is an authoritatively absent baseline, a list is a present one (an empty list is present, at zero), and anything else is unknown. Only absent permits an initial allowance; an existing empty baseline cannot grow. Cases T1530 now has a positive absent, a positive present zero, and a negative existing-empty growth.

## Left open (for the CPO, with a recommendation)

- Who establishes `null` for the base: the adopter, from the base's files, never from the pull request under review. Recommendation: say so in the DO's reference sentence and leave the discovery to release.
- Ids C147, I25, G113, F211, A208 and T1530 are taken by hand; release holds T1522. On a clash the newer pull request renumbers.
