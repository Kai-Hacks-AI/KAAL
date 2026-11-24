# C91 evidence

Observed on Node 24, on `main` 8973fc3 plus this PLAN.

## Expected RED (the PLAN's tree)

Each of the six Cases was run alone and fails for the reason the PLAN states:

| Case | Result |
| --- | --- |
| T1129 | `release/CTL20 is not listed` |
| T1130, T1131 | the element file (`F68.md`, `A63.md`) is absent |
| T1132 | `promoting.json differs from the draft` |
| T1133 | `the declaration differs from the draft` (no `verify Triggers` in `stages.json`) |
| T1134 | `the workflow does not run on merge_group` |

`node --test engineering/cases/cases.test.mjs` on this tree: 246 tests, 234 pass, 12 fail. The 12 are the C15 collector-capability Cases (T268 to T279) that also fail on `main`; this PLAN adds none. The `.red.mjs` files are ignored by the finders and the runner.

## Each Case can pass (throwaway copy)

In a throwaway copy with the DO's files taken from the drafts in `interface.md` (CTL20, F68, A63, `promoting.json`, the `verify-triggers.yml` amendment, the declaration appended to the Promoting rule in `stages.json`) and T1129 to T1134 renamed `.test.mjs`:

- T1129, T1130, T1131, T1132, T1133 and T1134 pass. T1133 passes with the real `verify Stages` judge on the real sources, and fails (as intended) on its two hand-made negatives: a promoting source without the check, and a check traced to an undeclared control.
- T1134 runs the workflow's own fetch and judge steps in a scratch clone on a queue branch: a queue entry that adds the trigger gives judge exit 1, an unchanged one 0, a missing queue ref fails the fetch and never reaches the judge, and the pull request path still gives 1 for an added use.
- The runner on that copy: 252 tests, 230 pass, 22 fail: the 12 C15 failures and ten that the change itself makes stale, all named in `change.md`: T481, T482, T483, T485, T511, T512, T513, T516, T733 (the exact list of required checks) and T1124 (equality with the draft of release/C90). Each amendment is the DO's work.
