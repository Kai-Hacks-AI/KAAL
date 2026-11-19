# C100 evidence

Observed on Node 22, on `main` 4479d00 plus this PLAN.

## Expected RED (the PLAN's tree)

Each of the eight Cases was run alone and fails for the reason the PLAN states:

| Case | Result |
| --- | --- |
| T1173 | `release/CTL22 is not listed` |
| T1174, T1175, T1176 | the element file (`I54.md`, `F77.md`, `A68.md`) is absent |
| T1177 | `05-src/history/verify-history.mjs` cannot be found |
| T1178 | the command line cannot run, so the fast-forward does not pass |
| T1179 | the workflow source is absent |
| T1180 | `CTL22.md` is absent |

The `.red.mjs` files are ignored by the finders and the runner, so the tree is as green as `main`.

## Each Case can pass (throwaway copy)

In a throwaway copy of the tree with the DO's files taken from the drafts in `interface.md` and the eight Cases run as written:

- T1173 to T1180 all pass (8 of 8).
- T1178 uses real scratch Git repositories: a fast-forward passes; `main` reset to the first commit and given a different second commit is FAIL (exit 1); a deleted `main` is FAIL; an unreadable commit on either side is UNKNOWN (exit 2).
- The controls checker lists release/CTL22 as valid with the `evidence` declaration.
- The command line against the real tree: `node 05-src/history/verify-history.mjs --before HEAD --after HEAD` prints `PASS`, exit 0.

## What the DO must handle

- The Cases for `rewritten` and `deleted` as evidence kinds need a base run on a `main` without the mechanism to count as caught; the controls report collects them. The DO produces the first records; the control does not claim `tested` here.
