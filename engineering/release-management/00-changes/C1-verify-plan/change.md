# C1 change

## PLAN

1. Add the layout, I1, F1, A1 to A13 and D1 with their Cases. Add C1 with its own Cases T1 to T5, one per gap.
2. Add the interim expected-RED runner `run-red.mjs` and the baseline stand-in `baseline-judge.mjs` under `00-changes/C1-verify-plan/`. The runner executes the F1 Cases against the baseline, where every plan is accepted, and records the observed results as current evaluation evidence: `node engineering/release-management/00-changes/C1-verify-plan/run-red.mjs`. It is wired into no lane.
3. The PLAN enters the collector with expected RED. The PLAN judgment passes when at least one meaningful RED condition is observed. An unconditional failure and a missing import are not that condition, so the expected failing outer-loop execution yields green CI.
4. Review each file by hand for language: migration wording under `00-changes/`, standing target state elsewhere.

## DO

The Change is the whole lot. It reaches `main` in two promotions, because Change Isolation keeps `.github` and engineering apart, and it closes only when everything is on `main` and wired.

1. Implement the judgment so that the F1 Cases pass, and the A7 to A11 Cases pass beside their elements (#1384).
2. Add the readers and the check body, and let the interim runner write the evidence rows: A7, A9 and the A6 body (#1386). The runner attributes a failure to a target only where the Case names it.
3. Make the check cover every PLAN pull request: the adapter finds the capability folder from the Change named in the title, skips merge commits when it checks the `Driven-by` trailers, and the runner takes a `--root`.
4. Add `.github/PULL_REQUEST_TEMPLATE/plan.md` (A4) and the `verify Plan` workflow (A5) in a `.github`-only pull request on its own collector, `kaal/release/wire-verify-plan`. The workflow takes the judge and the runner from the target branch and the plan from the pull request.
5. Promote the engineering collector `kaal/release/verify-plan` to `main`, then the `.github` collector. The engineering code must be on `main` first, because the workflow runs it. With the Owner's go for each.
6. On `main`, rename T18 and T19 from `.red.mjs` to `.test.mjs` and wire them, in an engineering pull request on a new collector.
7. Require the check named `verify Plan` in the `integration` ruleset (A13) and rename T26 and T27 when they are green. The ruleset change needs the Owner's go.
8. Rename each passing Case from `T<n>.red.mjs` to `T<n>.test.mjs` and wire it into its lane. A promotion carries red markers only for Cases whose target lies outside the promoted paths, and the pull request names each of them. Remove the runner and the baseline stand-in when Testing provides expected-RED execution on main.

## ACT

1. Record what the first enforced PLAN shows, and adjust F1 through a new Change.
2. Close C1 and its Gaps once every step of DO is on `main` and wired.

## Dependencies

Testing owns expected-RED execution, Case design, identity and placement, and the In, Stock and Out model. The common metamodel owns the relationship vocabulary, and the common control contract owns verdict semantics. verify Plan consumes them. This Change does not define them and does not bring Guard or gate ownership into scope.

## Later

The language review of PLAN step 4 can become a Case for verify Plan.
