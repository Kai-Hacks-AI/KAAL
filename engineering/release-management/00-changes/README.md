# Changes (A to B)

The Change documentation of Release management. Solution and Delivery (the root documents) describe the target B; this folder describes the transformation from the present to it (A to B) and owns what B must not carry: the present state, the gaps, the sequence, the interim states, the temporary requirements with their ends, and the evidence that B is reached. It references the target by id (a requirement, a component, a Case) and never restates or redefines it. B is the persistent intent; each Change here serves a target id and ends when that target's Case is green.

| File | Holds |
| --- | --- |
| `current-state.md` | the present state (A), each entry against the target it differs from |
| `gaps.md` | the differences between A and B (G1 to G12), each with its target and its closing condition: a Case, or, for an open decision, the Owner's decision (and the Case it may lead to) |
| `transformation.md` | the route: the per-control Changes, the controls, the landed Changes, the path to `main`, the conditions, the retirement sequence, the build order |
| `interim-states.md` | mechanisms that stand in for a target element until it exists, each with its end |
| `change-requirements.md` | temporary requirements of the migration (F20), each with its end |
| `cases.md` | the Cases of the migration (T12 to T14, T16 to T21) |
| `id-capture.json`, `id-moves.json` | the ids and decisions captured before the documentation Change, and where each one is now |
| `documentation-architecture-plan.md` | the PLAN of the documentation Change that created this structure |
| `shim-removal-plan.md` | the PLAN that removes the release shims one by one, as their last caller is rewired |
| `ci-cleanup-plan.md` | the PLAN for cleaning the CI setup stepwise: ordered steps, one Change each, nothing removed before its replacement is live |

An entry of `current-state.md`, `gaps.md`, `transformation.md` and `interim-states.md` is a list item with the members **Target** (the ids it differs from or serves), **Current** or **Difference**, and, where it ends, **Ends when** (a condition a Case judges). The migration is a Delivery architecture element with a beginning and an end; its last step is **terminate** (step 8 of the path in `transformation.md`).
