# C42 change

## PLAN

1. Add C42 with the gaps G69 to G71 and the Cases T580 to T583, RED on `main`.
2. State what the control needs per stage, in `ruleset-needs.json`, and the sequence in `transition.md`.
3. The PLAN moves nothing and touches no `.github` path, no live ruleset and no declaration.

## DO

Not authorized by this PLAN. Each step is its own reviewed Change or DO, in this order:

1. Engineering source, in the collector: the workflow source `05-src/wiring/workflows/analyze-vulnerabilities.yml` (jobs `analyze Vulnerabilities (Integrating)` and `(Promoting)`, on `pull_request` and `merge_group`), the control's row in `controls.md`, and its context in `integrating.json` and `promoting.json` (sources only). Closes G69 (T580, T581) and the source half of G70 (T582).
2. PROMOTION of that collector, then a WIRE (`wire/analyze-vulnerabilities`) that installs the workflow into `.github/workflows/`. `.github` travels alone.
3. Record one real merge-queue run: the run URL and the two check-run names as GitHub reports them, with the integration ID, in `acceptance.md` (A4). Text alone is not proof. Closes G71 (T583).
4. The CTL item `release/CTL<n>` (id, title, description, `has: [I4]`, control test beside it pointing back), declared once controls/C9 and controls/C10 are on `main`. Its gap and Case are added in that step, once the CTL format is on `main`; this PLAN names no gap for it because it has no Case that can run RED yet.
5. Retire `dependency-review.yml` only once the equivalence evidence of `transition.md` step 2 is recorded (every target route, a finding and a clean case, and the merge-queue behavior); one clean run is not enough. Requiring the contexts in a live ruleset is enforcement, a separate preventive control with its own explicit Owner decision, and is not part of this Change. Nothing here installs a ruleset.

## ACT

A 4L retrospective in `act.md`, before the promotion.

## Not in this Change

Activating or changing any live ruleset, retiring `dependency-review.yml`, the interpreter and adapter (release/C5, unchanged), and any other control. The old release/C18 collectors are not reused as branches; their branch moves are for the Owner's local support.

## Dependencies

release/C5 (on `main`), release/C35 and release/C37 (set 1 and the stages), controls/C9 and controls/C10 for the CTL item.
