# Change across PDCA cycles and integration transitions (PLAN)

A PLAN note. It ships no code and creates no capability, package, Definition or Change state. It records how Change's existing Definitions and PLANs relate to the multi-level PDCA model the Owner clarified on 3 Nov, and what that leaves open.

## Intent

Two things are kept apart: PDCA cycles, and the integration transitions between the places where work lives.

- **PDCA cycles.** Four things have a cycle of their own:
  - **An individual PR**: one bounded Change with its own PLAN, DO/CHECK and ACT. It needs no separate PLAN PR. A hotfix PR is such a PR, with the same cycle.
  - **A `kaal/*` collector**: a capability-oriented cycle, for which distinct PLAN PRs make sense.
  - **The `main` repository product**: a larger cycle. Emergency correction through `hotfix/*` is part of this cycle.
  - **An npm package product**: its own cycle, including consumer feedback and evolution.

  Collector, repository and package cycles can span many PRs and planning horizons. A larger cycle never replaces a PR's cycle, and a PR's cycle never stands in for a larger one.
- **Integration transitions.** These move work between those places. They are not cycles. Each has its own acceptance criteria and its own learning opportunity, which is an input to the next PLAN of the cycle it serves.

`hotfix/*` is therefore not a level beside the four. It is an expedited route into `main`. Likewise `main → npm` is publication within a package's wider cycle, not a cycle.

## Transitions and what Change already says of them

| Transition | Change's existing text | Realization |
| --- | --- | --- |
| Change PR → `kaal/*` | Accepted (Change Lifecycle) | Engineering's Branching: squash |
| `kaal/*` → `main` | Promoted (Change Lifecycle) | Branching: squash; Owner decision |
| `main` → `kaal/*` | a synchronization claims no record number (Change Record) | Branching: merge commit |
| `hotfix/*` → `main` | the Emergency class (Change Classification) | Engineering's route; Owner and Engineering to settle |
| `main` → npm | none, by design: Change's Lifecycle has no publication state and this note adds none | Release PLAN (`plan/release`); Owner decision |

Change owns the semantics of a Change. The owners of everything else stay as they are: the generic process metamodel and the reusable PDCA template (Process); product direction and product planning (Product); portfolio decisions (the two Portfolio Management concepts); technical integration and delivery assurance (Engineering). Change references their plans and decisions and does not repeat them.

## Findings against the current plans

1. **Covered.** Lifecycle, Classification and Record already carry Change's semantics for the PR, promotion, synchronization and emergency transitions. `plan/far` is an integration-gate concern and needs no change.
2. **Gap A.** No Change text says that a PR's PDCA is distinct from the collector, repository and package cycles, or that each of those can have its own PLANs. This note states it. Whether a Definition carries it, or Process's template, is Process's call (question 1).
3. **Gap B.** Publication is outside Change's Lifecycle by design. `plan/release` covers `@kaihacksai/kaal-change` 0.0.1 only. What a package cycle's acceptance for publication looks like is Product's and Release's to say (question 2).
4. **Gap C.** The `hotfix/*` route has no stated acceptance criteria in Change's text. Change can reference them once Engineering's route is settled (question 3).
5. **No conflict found** with the CPO/CTO split or the ownership boundaries in the 3 Nov handover.

## Open owner interfaces

1. **Process:** whether the cycle/transition distinction becomes part of the reusable PDCA template (Process #932). If so, Change references it rather than restating it.
2. **Product / Release:** acceptance criteria for publication within a package cycle, and the consumer-feedback loop. No Change state is proposed for it.
3. **Engineering:** the `hotfix/*` → `main` route and its acceptance criteria.
4. **Portfolio concepts:** whether either Portfolio Management concept already has ownership or Definitions is a question for the Portfolio inventory thread. Change proposes nothing there.

## Out of scope

No new capability, package, Definition, state, implementation, promotion or publication. Any Definition amendment follows from the answers above through its own PR.
