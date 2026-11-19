# C93 do

The DO adds, from the drafts in `interface.md`: `I52.md`, `F70.md`, `A65.md`, `05-src/promotion-raise/final-step.mjs` (`decideFinal`, `stepOf`, `wireTarget`), the `final` command in `dispatch.mjs`, the workflow source `05-src/wiring/workflows/dispatcher-raise.yml`, and in `raise.mjs` the head pattern (a collector, `hotfix/<name>` or `wire/<name>`) and `draft: true` on the creation. The `dispatcher.yml` source loses its schedule and keeps its manual start. T1149 to T1158 are renamed from `.red.mjs` to `.test.mjs` and pass.

## Cases amended

Two Cases of release/C73 fixed the old shape and are amended in place, none skipped or disabled:

- `release/T944`: the body of the creation now carries `draft: true`; the refused head `hotfix/route` is replaced by `claude/route`, because a hotfix branch is now a valid head (T1158 holds the new contract).
- `release/T946`: the trigger block is the manual start alone; it asserts that there is no schedule.

## Verified

`node --test engineering/cases/cases.test.mjs`: 276 tests, 264 pass, the same 12 pre-existing C15 failures (T268 to T279) as `main`. `dispatch.mjs final` was run by hand on a WIRE event (one decision to raise on the output) and on a merge into `main` (an empty list).

## Not done here

Nothing is installed. The two workflow sources reach `.github/workflows` by a WIRE, each with its PROMOTION and CPO review; `KAAL_DISPATCH_RAISE` stays unset. Whether `pull_request` closed starts for a merge by auto-merge is observed in the dry run once the workflow is installed; until then no run exists.
