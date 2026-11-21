# C28 evidence

The PLAN of C28 observes its RED against the collector `kaal/engineering/research-home`, cut at `main` f61a2ca2, which holds C26, C27 and the retro RT1. It cites nothing that is not on that collector.

## Provenance

- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 21 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T1331 | F59 | RED: retros, research, rehearsals and reviews are not the only children of `02-learnings` |
| T1332 | F59 | RED: a package with its notes in `02-learnings/research` is not PASS (a stray `14-operations/research` is already refused) |
| T1333 | F60 | RED: rehearsals is not a child of `02-learnings` |
| T1334 | F61 | RED: reviews is not a child of `02-learnings` |

4 RED-observed, 0 error, 0 green. Each Case fails on its own assertion.

## Can each Case pass

In a throwaway root outside the repository, holding this tree with `draft/` copied over `skills/kaal-engineering/`: T1331 to T1334 are GREEN.

## Can a Case fail for the right reason

In that copy, adding `rehearsals` to the children of `14-operations` turned T1333 RED ("rehearsals inside operations is not refused"), and the same for `reviews` and T1334.

## The amended Case

With the draft template, every Case of this package that reads the template stays as on the collector except T1245, which fails "retros is not the only child". The DO amends it to the four children.

## What this shows and does not show

The Cases show that the template gives research and rehearsals their places as siblings of `retros`, that the check follows it, and that Operations is not a second place for either. They do not show that `02-learnings` is the right parent (the Owner's judgement), nor that the two capabilities, which do not exist, will fit it.
