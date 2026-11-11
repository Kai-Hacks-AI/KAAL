# C3 change

## PLAN

1. Add I2, F2, F3, A14, A15 and A16 with their Cases, and C3 with its own Cases T48 to T51 and T54, one per gap.
2. The expected RED is observed against `main` (`evidence.md`).
3. The body of a PLAN pull request has exactly four chapters, Change, From, To and Because, as F3 states. Everything else is in the files or in comments, so the body is not a second copy of the PLAN.
4. The PLAN is limited to creating a PLAN. It cites no document that is not on `main`, and it moves nothing.

## DO

1. Deliver the PLAN pull request template `.github/PULL_REQUEST_TEMPLATE/plan.md` as its own `.github` change, with the four chapters of F3.
2. Deliver the body checker `05-src/plan-body/check.mjs` (A16) as its own engineering change, so that Cases T52, T53 and T54 turn green.
3. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green.

## ACT

1. Record what the first PLAN produced from the template shows, and adjust F2 or F3 through a new Change.

## Dependencies

The common metamodel owns the relationship vocabulary, Testing owns Case design, identity, placement and expected-RED execution, and the common control contract owns verdict semantics. create Plan consumes them. This Change does not define them, does not move them and does not duplicate them.
