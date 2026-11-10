# C1 change

## PLAN

1. Add the layout, I1, F1, A1 to A13 and D1 with their Cases. Add C1 with its own Cases T1 to T5, one per gap.
2. Add the interim expected-RED runner `run-red.mjs` and the baseline stand-in `baseline-judge.mjs` under `00-changes/C1-verify-plan/`. The runner executes the F1 Cases against the baseline, where every plan is accepted, and records the observed results as current evaluation evidence: `node engineering/release-management/00-changes/C1-verify-plan/run-red.mjs`. It is wired into no lane.
3. The PLAN enters the collector with expected RED. The PLAN judgment passes when at least one meaningful RED condition is observed. An unconditional failure and a missing import are not that condition, so the expected failing outer-loop execution yields green CI.
4. Review each file by hand for language: migration wording under `00-changes/`, standing target state elsewhere.

## DO

1. Implement the judgment so that the F1 Cases pass, and the A7 to A11 Cases pass beside their elements.
2. Run the runner with `--judge` set to the implemented judgment. Remove the runner and the baseline stand-in when Testing provides expected-RED execution on main.
3. Rename each passing Case from `T<n>.red.mjs` to `T<n>.test.mjs` and wire it into its lane. Promotion out of the collector carries no outstanding RED for the promoted scope.
4. Add `.github/PULL_REQUEST_TEMPLATE/plan.md` in its own pull request (A4).

## ACT

1. Require the check named `verify Plan` in the `integration` ruleset (A13). The ruleset change needs the Owner's go.
2. Record what the first enforced PLAN shows, and adjust F1 through a new Change.

## Dependencies

Testing owns expected-RED execution, Case design, identity and placement, and the In, Stock and Out model. The common metamodel owns the relationship vocabulary, and the common control contract owns verdict semantics. verify Plan consumes them. This Change does not define them and does not bring Guard or gate ownership into scope.

## Later

The language review of PLAN step 4 can become a Case for verify Plan.
