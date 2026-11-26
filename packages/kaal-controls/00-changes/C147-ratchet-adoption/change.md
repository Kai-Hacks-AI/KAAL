# C147 change

## PLAN

1. Add the intent I25, the gap G113, the Requirement F211, the architecture A208 and the Case T1530 (plain `.test.mjs`, never renamed). The Case is RED on the collector.
2. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector, and with the collector synced with main:

1. `judgeAdoption` in `scripts/ratchet.mjs`, pure.
2. One sentence in `references/modes.md` that the adoption line is judged too (the Skill structure is the restructure's).
3. Case T1530 GREEN; the package suite GREEN. Mutation patches as in C25 for each weakening.

## DO record

`judgeAdoption` is in `scripts/ratchet.mjs`; `judgeProgress`, `judgeRetirement` and the Skill's SKILL.md are unchanged, and `references/modes.md` has one sentence on the adoption line. `mutations/` keeps thirteen weakenings of `judgeAdoption` (A1 to A13) as exact patches with a runner, as in C25, including the existing empty baseline taken as absent (A7) and an unstated baseline taken as absent (A12). `mutations/run-at-do-head.txt` is the run on the DO: the baseline is GREEN on T1530 and each weakening, loaded alone, is RED. A12 is RED because the weakened function throws, not by a reason; that is still caught. The record cannot name its own revision; re-run `sh mutations/run.sh <repo root>` at the DO's head and compare with it.

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
