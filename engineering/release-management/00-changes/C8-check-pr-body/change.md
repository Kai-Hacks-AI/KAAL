# C8 change

## PLAN

1. Add I7, F13, A33 (under verify Plan, in its check job) and the Cases T105 to T107, and add C8 with its Case T108.
2. T106, T107 and T108 are RED on `main`.

## DO

1. Add `05-src/plan-body/verify.mjs`: it applies A16 and adds the contamination rules, as a module and by hand. A16 is not changed.
2. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green.

Not in this Change: DO or ACT bodies, hooks, CI, merge blocking, a validation framework, a new verdict.
