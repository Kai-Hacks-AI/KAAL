# C1 change

## PLAN

1. Add the layout, I1, F1, A1 to A13 and D1 with every Case red and unwired. Add C1 with its own Cases T1 to T5, one per gap row.
2. Review each file by hand for language: migration wording under `00-changes/`, standing target state elsewhere.

## DO

1. Implement the check so that F1/T1 to F1/T8 pass, and A7 to A11 pass beside their components.
2. Rename each passing Case from `T<n>.red.mjs` to `T<n>.test.mjs` and wire it into its lane.
3. Add `.github/PULL_REQUEST_TEMPLATE/plan.md` in its own pull request (A4).

## ACT

1. Require the check named `verify Plan` in the `integration` ruleset (A13). The ruleset change needs the Owner's go.
2. Record what the first enforced PLAN shows, and adjust F1 through a new Change.

## Later

The language review of step 2 in PLAN can become a Case for verify Plan.
