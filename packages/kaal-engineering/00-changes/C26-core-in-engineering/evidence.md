# C26 evidence

The PLAN of C26 observes its RED against the collector `kaal/engineering/setup` at `e3a096d4`, cut from `main`.

## Provenance

- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 20 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T1239 | F55 | RED: `engineering/core/AGENTS.md` is absent |
| T1240 | F55 | RED: the root `AGENTS.md` does not name `engineering/core` |

2 RED-observed, 0 error, 0 green. Both fail on their own assertion.

## Can each Case pass

In a throwaway copy outside the repository, with the eleven files moved to `engineering/core/` and the Engine line of the root `AGENTS.md` pointing there, both Cases are GREEN.

## Can a Case fail for the right reason

In that copy: naming a different entry point in the root `AGENTS.md` turned T1240 RED; putting the Kernel back in `.kaal/` turned T1239 RED.

## What this does not show

The amended Acceptance scenario needs the packed packages and was not run here. It is amended in the DO and checked by the Acceptance lane. No Case checks that the moved files are byte for byte the same as before; the move is a rename, and review of the diff is the check.
