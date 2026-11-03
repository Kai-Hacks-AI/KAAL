# Change across levels and boundaries (PLAN)

A PLAN note. It ships no code and creates no capability, package or publication. It records how Change's existing Definitions and PLANs relate to the multi-level PDCA model the Owner clarified on 3 Nov, and what that leaves open.

## Intent

- **Two kinds of cycle, kept apart.** Every individual PR is one bounded Change with its own PLAN, DO/CHECK and ACT. That cycle needs no separate PLAN PR. Collector (`kaal/*`), repository (`main`) and package (npm) cycles are larger, can span many PRs and planning horizons, and may have their own PLANs. A larger cycle never replaces a PR's own cycle, and a PR's cycle never stands in for a larger one.
- **Five levels.** Individual PR, `kaal/*` collector, `main` repository product, npm package product, `hotfix/*` emergency path. The repository and each npm package are products in their own right. Publication is not the whole package cycle: consumer feedback and evolution belong to it.

## What Change owns, and what it does not

Change owns the semantics of a Change at each integration boundary. Each boundary has its own acceptance criteria and its own learning opportunity (the ACT input to the next PLAN).

| Boundary | Change semantics (existing Definition) | Realization |
| --- | --- | --- |
| Change PR → `kaal/*` | Accepted (Change Lifecycle) | Engineering's Branching: squash |
| `kaal/*` → `main` | Promoted (Change Lifecycle) | Branching: squash; Owner decision |
| `main` → `kaal/*` | a synchronization claims no record number (Change Record, Lifecycle) | Branching: merge commit |
| `hotfix/*` → `main` | Emergency class (Change Classification) | Branching, expedited |
| `main` → npm | not a Change state | Release PLAN (`plan/release`); Owner decision |

Not Change's: the generic process metamodel and the reusable PDCA template (Process); product direction and product planning (Product); portfolio decisions (the two Portfolio Management concepts); technical integration and delivery assurance (Engineering). Change references their plans and decisions and does not repeat them.

## Findings against the current plans

1. **Covered.** Lifecycle (Accepted, Promoted, Withdrawn), Classification (Emergency) and Record (synchronizations claim no number) already state the semantics for four of the five boundaries. `plan/far` is a PR-level and integration-gate concern and needs no change.
2. **Gap A.** No Change text says that a PR's PDCA and the larger cycles are distinct, or that `kaal/*`, `main` and a package each have their own PLANs. This note states it; whether a Definition should carry it, or Process's template, is Process's call (open question 1).
3. **Gap B.** `main → npm` is outside the Lifecycle's four states by design. `plan/release` covers `@kaihacksai/kaal-change` 0.0.1 only. Whether Change should name publication as a boundary of its own, or leave it wholly to Release and Product, is open (question 2).
4. **Gap C.** `hotfix/*` has a class (Emergency) but no stated PDCA shape for the expedited PR-level cycle. Change can state it once Engineering's hotfix route is settled (question 3).
5. **No conflict found.** Nothing here contradicts the CPO/CTO split or the ownership boundaries in the 3 Nov handover.

## Open questions, routed

1. **Process:** does the multi-level model become part of the reusable PDCA template (Process #932 instances PLAN)? If so, Change references it rather than restating it.
2. **Product / Release:** is publication a Change boundary, or Product's and Release's alone?
3. **Engineering:** the `hotfix/*` → `main` route and its acceptance criteria.
4. **Portfolio concepts:** whether either already has ownership or Definitions is a question for the Portfolio inventory thread. Change proposes nothing there.

## Out of scope

No new capability, package, Definition, implementation, promotion or publication. Any Definition amendment follows from the answers above through its own PR.
