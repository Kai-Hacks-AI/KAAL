# Changes (A to B)

The Change documentation of Release management. Solution and Delivery (the root documents) describe the target B; this folder describes the transformation from the present to it (A to B) and owns what B must not carry: the present state, the gaps, the sequence, the interim states, the temporary requirements with their ends, and the evidence that B is reached. It references the target by id (a requirement, a component, a Case) and never restates or redefines it. B is the persistent intent; each Change here serves a target id and ends when that target's Case is green.

| File | Holds |
| --- | --- |
| `current-state.md` | the present state (A), each entry against the target it differs from |
| `gaps.md` | the differences between A and B (G1 to G12, G16 and G17), each with its target and its closing condition: a Case, or, for an open decision, the Owner's decision (and the Case it may lead to) |
| `transformation.md` | the route: the per-control Changes, the controls, the landed Changes, the path to `main`, the conditions, the retirement sequence, the build order |
| `interim-states.md` | mechanisms that stand in for a target element until it exists, each with its end |
| `change-requirements.md` | temporary requirements of the migration (F20), each with its end |
| `cases.md` | the Cases of the migration (T12 to T14, T16 to T24) |
| `id-capture.json`, `id-moves.json` | the ids and decisions captured before the documentation Change, and where each one is now |
| `documentation-architecture-plan.md` | the PLAN of the documentation Change that created this structure |
| `shim-removal-plan.md` | the PLAN that removes the release shims one by one, as their last caller is rewired |
| `control-ownership-plan.md` | the PLAN assigning every control to one authoritative capability, with the CI disposition per workflow and job and the proof required before any retirement |
| `control-chain-assessment.md` | the control-by-control assessment of owners, implementations, Cases, contexts, duplicates and the revised critical path |
| `lifecycle-flow-assessment.md` | the CTO assessment for the CPO's lifecycle handovers: `kaal/* -> main -> tag -> draft GitHub Release -> npmjs`, tag before or after publication, the 15 controls per transition, the 21 current checks reconciled to the target, retirement and open decisions |
| `bind-merge-held-plan.md` | the PLAN that gives every failing or held release verdict a reachable recovery path, and makes a merge method not yet knowable a held verdict read as not passed by the gates, inside the Branching split |
| `development-hooks-plan.md` | the PLAN for the common Git hooks as thin Development entries, each argued from Intent, with the ones that have no argument named |
| `version-package-plan.md` | the PLAN that closes G1 to G3 of version Package: greater than the published, a tag at the released commit, a version set by a recorded Change |
| `change-register.md` | the numbered Changes of this area, `release-management/C<n>`, with the pull requests of each |
| `freeze-collector-plan.md` | the PLAN for freeze Collector: while a promotion is open its collector is frozen; the promotion waits for pull requests and pull requests into it fail, with exactly two executable recoveries and the hotfix as the fast path |
| `verify-envelope-plan.md` | the PLAN for verify Envelope: the pull request body and title are the Change's stable envelope, checked by parsing, with fall forward |
| `testing-controls-plan.md` | the PLAN for test Integration and test Candidate, with each present lane argued from intent |
| `far-authorization-plan.md` | the PLAN for the authorization and lifecycle of Accepts and PLAN/DO integrity, before the FAR gates activate |
| `control-overview-plan.md` | the PLAN for the control overview, the domain language and the verb set per control class, with the existing controls classified |
| `delivery-and-retirement-plan.md` | the PLAN to deliver the controls to `main` and retire the existing setup: inventory, retirement list with coverage and evidence, trust root, promotion and retirement order, pending Owner actions |
| `fragments-and-case-identity-plan.md` | the PLAN for one fragment per Change (the register, README rows, Cases list and Change-id pattern become computed views) and for the identity of a Case, `<X-ID>/T<n>` under one owner with a `tests:` list; hosted by release management, intended owner Engineering; its failing Cases (`C14/T1` to `C14/T9`) are in `04-test/fragments.red.mjs` |
| `station-control-chain-map.md` | the inventory of the station and control chain: each station's IN, STOCK and OUT, the carriers (PLAN, DO, ACT, SYNC, Promotion, Hotfix, npm publication), and for each position the control, owner, implementation, context, evidence and decision; where C14 fits (it adds no station or control) |

An entry of `current-state.md`, `gaps.md`, `transformation.md` and `interim-states.md` is a list item with the members **Target** (the ids it differs from or serves), **Current** or **Difference**, and, where it ends, **Ends when** (a condition a Case judges). The migration is a Delivery architecture element with a beginning and an end; its last step is **terminate** (step 8 of the path in `transformation.md`).
