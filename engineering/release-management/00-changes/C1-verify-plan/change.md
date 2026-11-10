# C1 change

## PLAN

1. Add the layout, I1, F1, A1 to A13 and D1 with their Cases. Add C1 with its own Cases T1 to T5, one per gap.
2. The PLAN enters the collector with expected RED. The PLAN judgment passes when at least one meaningful RED condition is observed, so the expected failing outer-loop execution yields green CI.
3. Review each file by hand for language: migration wording under `00-changes/`, standing target state elsewhere.

## DO

1. Implement the judgment so that the F1 Cases pass, and the A7 to A11 Cases pass beside their elements.
2. Add an interim expected-RED runner under `00-changes/C1-verify-plan/` that executes the outer-loop Cases and records the observed results as current evaluation evidence. It is temporary and is removed when Testing provides expected-RED execution on main.
3. Rename each passing Case from `T<n>.red.mjs` to `T<n>.test.mjs` and wire it into its lane. Promotion out of the collector carries no outstanding RED for the promoted scope.
4. Add `.github/PULL_REQUEST_TEMPLATE/plan.md` in its own pull request (A4).

## ACT

1. Require the check named `verify Plan` in the `integration` ruleset (A13). The ruleset change needs the Owner's go.
2. Record what the first enforced PLAN shows, and adjust F1 through a new Change.

## Dependencies

Testing owns expected-RED execution, Case design, identity and placement, and the In, Stock and Out model. The common metamodel owns the relationship vocabulary, and the common control contract owns verdict semantics. verify Plan consumes them. This Change does not define them and does not bring Guard or gate ownership into scope.

## Later

The language review of PLAN step 3 can become a Case for verify Plan.
