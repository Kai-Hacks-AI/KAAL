# C101 evidence

Observed on Node 24, on `main` 45c78b8 plus this PLAN.

## Expected RED (the PLAN's tree)

Each of the six Cases was run alone and fails for the reason the PLAN states:

| Case | Result |
| --- | --- |
| T1181 | `release/CTL23 is not listed` |
| T1182, T1183, T1186 | the element file (`F78.md`, `A69.md`, `CTL23.md`) is absent |
| T1184 | the wrapper, run as the CI job runs it on a scratch repository, prints `detective (not gating): cannot check: ... the delivery reader is not reachable from the checker` and does not report the mix |
| T1185 | the lone copy of the checker prints the same `cannot check` for the same change |

T1184 and T1185 are the RED Cases for the `cannot check` seen in the real runs. The `.red.mjs` files are ignored by the finders and the runner, so the tree is as green as `main`.

## Each Case can pass (throwaway copy)

In a throwaway copy of the tree with the three element files taken from the drafts in `interface.md`, the three edits of `interface.md` applied (the checker's reader lookup, the copy lines in `change-isolation.sh` and in `push-check.sh`), and T1181 to T1186 renamed `.test.mjs`:

- T1181 to T1186 all pass (6 of 6). T1184 runs the real wrapper against a scratch bare origin with a base commit holding the checker, the reader and the declaration and a topic branch mixing `.githooks/pre-push` with `src/y.txt`; it reports the mix, exit 0, no `cannot check`. T1185 runs the checker as a lone copy beside the two files and checks the same mix, and without them says `cannot check`, exit 0, and reports nothing as checked.
- `node --test engineering/change-isolation/check.test.mjs`: 26 of 26 pass, before and after the edits.
- `node --test engineering/cases/cases.test.mjs`: 306 tests, 290 pass, 16 fail; the 16 are the same names that fail on `main` (the collector-capability Cases and the Engineering Cases), compared by name and not by count.
- The controls checker lists release/CTL23 as `designed valid`.

## Notes

- The log of the fourth run read (target `wire/wire-pr-template`) printed no detective line because that branch's own `check.mjs` predates the rule; it is not evidence that the reader was reachable. The three runs that target `main` printed `cannot check`.
- In the scratch setup, `git push` to the bare origin prints a `push negotiation failed; proceeding anyway` warning on this machine's Git; the push still succeeds and the Case does not depend on the message.
- Not proven here: a `real` run on CI. That is the DO's first record, and CTL23 claims `designed` until it exists.
