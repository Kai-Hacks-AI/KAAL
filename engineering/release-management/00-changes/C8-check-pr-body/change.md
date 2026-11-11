# C8 change

## PLAN

1. Add I7, F13 and the Cases T105 to T107, amend A16, and add C8 with its Case T108.
2. T106, T107 and T108 are RED on `main`.

## DO

1. Make the checker reject a metadata comment and a comment before the first chapter, and add `05-src/plan-body/verify.mjs`.
2. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green.

Not in this Change: DO or ACT bodies, hooks, CI, merge blocking, a validation framework, a new verdict.
