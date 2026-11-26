# C2 evidence

The PLAN of C2 observes its RED against the collector `kaal/research/challenge-protocol`, cut at `main`. Observed 25 Nov 2026, Node on Linux, by running the package runner (`node --test test/cases.test.mjs`) in the tree of this PLAN.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T1383 to T1387 | F1 to F4, N1 | GREEN (the earlier Cases still pass with the extended fixture) |
| T1426 | F5 | RED: a record with no `harness` is not refused (`Design:harness: not refused`) |
| T1427 | F6 | RED: a challenge with a malformed id is not refused (`front:challenges: not refused`) |
| T1428 | F7 | RED: a record with no technique is not refused (`front:technique: not refused`) |

5 GREEN, 3 RED-observed, 0 error.

## Can each Case pass

In a throwaway root outside the repository holding this tree with the `draft/` scripts copied over the Skill's, and the example record given a technique, a harness and a protocol (the DO does the same): T1383 to T1387 and T1426 to T1428 are GREEN (8 GREEN, 0 RED). With the example left as it is on main, T1383 is RED (the example has no protocol), which is the ratchet the DO must satisfy.

## Can a Case fail for the right reason

In that copy, thirteen mutants of the draft scripts, each applied alone, each killed (each leaves exactly one Case RED): `harness` optional, `Protocol` optional, the prompt not required in the materials, materials not checked against the evidence, only one protocol line checked, a record allowed to challenge itself, any `outcome` accepted, `differs-in` optional, a stray `outcome` on a non-challenge accepted, a technique version of 0 accepted, `technique` optional, a finder that does not list the technique and one that does not list what a record challenges.
