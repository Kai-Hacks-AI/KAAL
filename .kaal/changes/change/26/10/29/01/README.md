# change/C7 PLAN: delivery counts only evaluated, clean evidence

Capability: `kaal-change`. Collector: `kaal/change`.

## Why

The Owner's review 5703577468 on #630 (testing/C15) found that Testing's `results(model, run)` can show a Case as `passed` beside findings. Those are raw observations of one Run, never a verdict. The Owner asked that Change's delivery criterion cannot mistake them for trustworthy GREEN, and that Testing's result authority stay distinct from Change's criterion.

`change/C1` (#530) took Case Results as bare `{ case, result }`, so it could not tell the two apart.

## How

This is a PLAN Change. It ships no code, and revises `change/C1`'s plan before its DO.

- **`change/F16`.** `evidence` is now a list of Testing's evaluations, as `evaluate` gives them (`testing/F28`).
- **`change/F27`.** An evaluation counts only when it has a `result` and no findings.
  - Raw `results` never count.
  - A clean evaluation still counts for its Cases when another Case is unknown.
  - An allowed Case stays `failed`, and so unmet.
  - A required Case held only by evaluations that do not count is unmet as `unevaluated`.
- **`change/A10`.** Trust is Testing's, stated as an evaluation's findings. Change reads only that statement.
- **Tests.** change/T30 is new. The fixtures of change/T19 and change/T21–change/T23 now give evaluations.

## Verified by

- All eighteen tests in `packages/skills/kaal-change/test/plan/delivery.test.mjs` are RED and blocked before behavioural assertion.
- All eighteen ran GREEN against a throwaway implementation, which is not committed.
- change/T30 fails when every given evaluation counts.

## Owner review 5705662282

An empty `findings` list is not authentication, freshness or applicability. `change/F28` therefore gives the caller's evidence-selection contract:
- **The selector is accountable.** Evidence is `{ by, evaluations }`, and `by` names the selector, who answers for which Runs and definition versions are current and applicable.
- **No history.** The selection holds one evaluation per Plan. Two evaluations of one Plan are a conflict Change never resolves, so an older clean `passed` never stands beside a newer `unknown` or `failed`, and the Case is unmet as `conflicting`.
- **No selector, no evidence.** Evidence without `by` counts nothing.
- **A cited basis.** Every delivery result names `by` and the runs it counted, as `basis`.

change/T31 and change/T32 are the discriminating tests. change/T32 fails for a newer-wins implementation.

## What did not change

Succession, Delivers, the exchange's form, presence versus registration, and Testing's semantics.
