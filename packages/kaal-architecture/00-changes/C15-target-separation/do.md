# C15 DO

## Implement

- `test/lib.mjs`, the Target's own helper. It reads a file of the package and nothing of a trial, the key or `00-changes`.
- The Target Cases T14 (F2, was T2), T15 (N1, was T4), T16 (A2, was T6), T17 (A1 shell, from T5) and the new static T18 (F1), T19 (F3), T20 (F4), T21 (separation) and T22 (identifiers), `.red.mjs` renamed `.test.mjs`. 
- The key moved to `00-changes/C1-classification/trial/key/scenarios.json`. T1, T7, T8 and T9 run from C1, T10 and T11 from C2, each importing its Change's `lib.mjs`.
- F5 moved to C2 as F12 (`T10` and `T11` test F12). F4 keeps its first sentence; the trial design it carried is in `00-changes/C1-classification/next-move-trial.md`.
- The original T3 is kept as `00-changes/C1-classification/trial/historical-T3.mjs` with its RED output in `historical-T3.red-output.txt`. Its one change is its import path. It is not run by the package. Run 3 is untouched.
- README: the identifiers of this package are new; the trial material lives with its Change.

## Refactor

A1 no longer names the key. Nothing in the Skill, the key's contents or any recorded trial is changed.

## Result

`node --test test/cases.test.mjs` in the package: 15 of 15 green (T1, T7 to T11 experimental under their Changes; T14 to T22 Target). The Target Cases are static contract and structure checks: they do not show that an agent's architectural judgment is valid.
