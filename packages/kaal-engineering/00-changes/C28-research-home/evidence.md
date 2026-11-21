# C28 evidence

The PLAN of C28 observes its RED against the collector `kaal/engineering/research-home`, cut at `main` f61a2ca2, which holds C26, C27 and the retro RT1. It cites nothing that is not on that collector.

## Provenance

- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 21 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T1330 | F59 | RED: research and retros are not the only children of `02-learnings` |
| T1331 | F59 | RED: a package with its notes in `02-learnings/research` is not PASS (a stray `14-operations/research` is already refused) |

2 RED-observed, 0 error, 0 green. Each Case fails on its own assertion.

## Can each Case pass

In a throwaway root outside the repository, holding this tree with `draft/` copied over `skills/kaal-engineering/`: T1330 and T1331 are GREEN.

## Can a Case fail for the right reason

In that copy, adding `research` to the children of `14-operations` turned T1331 RED ("research inside operations is not refused").

## The amended Case

With the draft template, every Case of this package that reads the template stays as on the collector except T1245, which fails "retros is not the only child". The DO amends it to the two children. The other failures seen in the copy (T1176, T1178, T1228, T1239, T1240, T1244, T1171, T1172) are artefacts of copying only the package: they pass or fail on the collector as before.

## What this shows and does not show

The Cases show that the template gives research its place, that the check follows it and that Operations is not a second place. They do not show that `02-learnings` is the right home (the Owner's judgement), nor that kaal-research, which does not exist, will fit it.
