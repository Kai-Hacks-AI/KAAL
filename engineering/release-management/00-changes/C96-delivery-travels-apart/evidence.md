# C96 evidence

Observed on Node 24, on `main` e221e990 plus this PLAN.

## Expected RED (the PLAN's tree)

Each of the five Cases was run alone and fails for the reason the PLAN states:

| Case | Result |
| --- | --- |
| T1165, T1166 | the checker has no `deliveryMixed` |
| T1167 | `pull-promotion/delivery-evidence.mjs` is absent |
| T1168 | `evidence.do` of Pull Promotion's declaration still spells delivery roots |
| T1169 | the declaration names three roots and no files |

`node --test engineering/cases/cases.test.mjs` on this tree: 284 tests, 272 pass, the same 12 C15 failures (T268 to T279) as `main`. The `.red.mjs` files are ignored by the finders and the runner.

## Each Case can pass (throwaway copy)

In a throwaway copy of the repository with the DO's files taken from the drafts in `interface.md` and T1165 to T1169 renamed `.test.mjs`, all five pass. In that copy `node --test engineering/cases/cases.test.mjs` shows the 12 failures of `main` and nothing else of this Change. Four more Cases show a file mode failure (775 instead of 755 on the `.githooks` tree) that comes from the copy and not from the Change: `git archive` was extracted under a different umask. `node --test engineering/change-isolation/*.test.mjs` fails the same 11 tests as on `main`, and none other: its CLI tests, which compare the exact stderr, stay green because the detective line is printed after the verdict, on stdout, and only for a change that passed.

One finding of the throwaway run, now in the drafts: the first version of the rule printed on stderr and for a Core change, and broke two CLI tests of the checker (a Core change that carries the root lockfile, and an exact stderr). The drafts print after `ok:` on stdout. A first version also skipped a change that touches Core; the CPO asked to remove that exception (each control reports what it sees, none is silenced by another), and T1165 now asserts that a change holding Core, another solution path and delivery is reported as mixed. With the exception removed the checker's own tests fail the same 11 tests as `main` and none other.

## What is not proven

That the rule should ever gate: it is detective here by design, and a change in `main` that mixes delivery and solution is reported, not stopped. That a WIRE of a root file is needed or how it should be judged (a later slice). That a repository with no root lockfile can omit `files`: the reader accepts a declaration without it (T1169), it was not tried on another repository.
