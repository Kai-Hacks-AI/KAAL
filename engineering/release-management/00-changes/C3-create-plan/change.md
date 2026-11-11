# C3 change

## PLAN

1. Add I2, F2, F3, A14 and A15 with their Cases, and C3 with its own Cases T48 to T51, one per gap.
2. The expected RED is observed against `main` (`evidence.md`).
3. The body of a PLAN pull request names the Change by id and name and says in a phrase each where the plan goes from, where it goes to and why. Everything else is in the files, so the body is written once and not repeated.
4. The PLAN is limited to creating a PLAN. It cites no document that is not on `main`, and it moves nothing.

## DO

1. Deliver the PLAN pull request template `.github/PULL_REQUEST_TEMPLATE/plan.md` as its own `.github` change, with the four chapters of F3.
2. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green.

## ACT

1. Record what the first PLAN produced from the template shows, and adjust F2 or F3 through a new Change.

## Dependencies

The common metamodel owns the relationship vocabulary, Testing owns Case design, identity, placement and expected-RED execution, and the common control contract owns verdict semantics. create Plan consumes them. This Change does not define them, does not move them and does not duplicate them.
