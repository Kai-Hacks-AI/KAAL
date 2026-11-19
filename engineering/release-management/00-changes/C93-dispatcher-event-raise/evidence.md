# C93 evidence

Observed on Node 24, on `main` 733d84b9 plus this PLAN.

## Expected RED (the PLAN's tree)

Each of the ten Cases was run alone and fails for the reason the PLAN states:

| Case | Result |
| --- | --- |
| T1149, T1150, T1151 | the element file (`I52.md`, `F70.md`, `A65.md`) is absent |
| T1152, T1153, T1154, T1157 | `final-step.mjs` is absent |
| T1158 | `raise.mjs` refuses `hotfix/the-fix` as head (it accepts only a collector); the same refusal makes T1154 RED for a hotfix and a wire head once `final-step.mjs` exists |
| T1155 | `dispatcher-raise.yml` is absent |
| T1156 | `dispatcher.yml` still has a schedule |

`node --test engineering/cases/cases.test.mjs` on this tree: 266 tests, 254 pass, 12 fail. The 12 are the C15 collector-capability Cases (T268 to T279) that also fail on `main`; this PLAN adds none. The `.red.mjs` files are ignored by the finders and the runner.

## Each Case can pass (throwaway copy)

In a throwaway copy with the DO's files taken from the drafts in `interface.md` (`I52.md`, `F70.md`, `A65.md`, `final-step.mjs`, `dispatcher-raise.yml`, the extended head pattern and the `draft: true` line in `raise.mjs`, the manual-only trigger block in the `dispatcher.yml` source) and T1149 to T1158 renamed `.test.mjs`, all ten pass. The runner on that copy: 276 tests, 262 pass, 14 fail: the same 12 C15 failures and two that the change itself makes stale, named in `change.md`: release/T944 (it fixes the exact body of the creation, which now carries `draft: true`) and release/T946 (it fixes the schedule of the scan). Each amendment is the DO's work. The `final` command of `dispatch.mjs` is not run by a Case in this PLAN; the workflow Case fixes that the workflow calls it, and the DO proves it in the dry run on the Change's own pull request.

## What is not proven

That GitHub starts a `pull_request` closed workflow for a merge by auto-merge or the merge queue, and which definition of the workflow it reads. Both are observed in the DO's dry run, with `KAAL_DISPATCH_RAISE` unset, before anything is raised.
