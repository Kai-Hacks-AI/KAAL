# C43 change

## What changes

The F55 Case `T1239.test.mjs` becomes `T1593.test.mjs`, and its header and `export const id` read `engineering/T1593`. Nothing it asserts changes. `T1240` is unique and stays.

## Decisions

1. **Which one moves.** The acceptance Case lives under `engineering/acceptance`, an older home that other work already reads by id; the F55 Case is Engineering's own and has held its id only since C40. Engineering renames its own.
2. **Why T1593.** It is free in the whole repository (T1590 to T1592 are C42's) and keeps clear of the numbering other Changes use in parallel.
3. **A renamed Case, not changed expectations.** Same assertions, new identity, as the Owner and CPO ruled for repairs. Prose history of C26 and C40 still says T1239; it records what happened and is left.
4. **No DO:** the renamed Case is the whole change, as in C40. The collector goes to PROMOTION with its ACT.
5. **Checked:** every `export const id` across the repository is now unique.
