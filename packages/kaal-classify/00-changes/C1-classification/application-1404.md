# C1 application to #1404

The rules of `proposal.md` applied to release/C4, Change Isolation, as it stands in #1404 at `b00a563`. Nothing of #1404 is edited, and nothing here weakens its protection. Its inventory, MERIT analysis and equivalence evidence stay as they are. They are Change-oriented, and `00-changes/` is where they belong.

## 1. Statement by statement

| Element | Concern and semantics | Finding |
| --- | --- | --- |
| I3 | Solution, target-state | clean |
| F4, verdicts and rules | Solution, target-state | One rule names a platform path: "`.github` travels alone". The Solution's own term is the class of paths (delivery wiring), and `.github` is how the GitHub target spells it. Ambiguous term. Same rule, so rewording is not a weakening, but it is the CPO's call. |
| F4, "the rules exist once, in the judge" and "how a platform derives the paths is the adapter's concern" | Solution constraint, and a pointer to Delivery | Already carried by A18 and A19. Stated twice. |
| F4, the carried ledger entry | Solution, target-state | **Missing.** A promotion's ledger entry is admitted only with an attestation (`inventory.md`). F4 does not say so, and only A19 does ("derived by this target ... outside the judge"). A Solution rule exists only inside a Delivery element, which is how a Delivery Change could later redefine it. F4 should hold the rule, with the attestation as an input to the judge, and A19 only that the target supplies it. |
| F5 | Delivery, target-state | Sits among the Requirements beside F4 with no marker of concern. Its table restates "preventive when `guard Integration` makes the verdict a condition", which `C4`'s Dependencies already assign to `guard Integration`. It should refer, not restate. |
| F6, the record | Solution, target-state | clean |
| F6, the claim rule ("a ruleset is evidence of neither") | owned by Controls | A rule about what a claim may say is `kaal-controls`'. Cite, do not restate. |
| A17 | Solution node with Delivery children | The judge (A18) and the deployment targets (A19, A22) are siblings under the feature. The tree convention of this project is deployment target, then feature, then component. The CPO to say which reading is intended. |
| A18 | Solution, target-state | clean |
| A19, A20, A21, A22, A23 | Delivery, target-state | clean, except the attestation sentence of A19 above |
| C4.md, "without reducing the protection it gives today" | Change, change-oriented | clean. It is the invariant of this Change and should be said as such. |
| G15 to G20 | Change, change-oriented | One Change closes Solution Gaps (G15, G16, G18), Delivery Gaps (G17) and two mixed ones: G19 (A17 and A18 with A19 and A22) and G20 (the replay covers the judge, E1, E2, E4, and the adapters, E3). |
| change.md step 1 | Change | Adds Solution and Delivery targets in one step. |
| S1 | Solution Change | |
| S2 | Change evidence | The replay E1, E2 and E4 belong to the Solution, E3 to the Delivery. |
| S3, S5, S6 | Delivery Change | S6 also terminates, which is change-oriented. |
| S4 | Delivery evidence | |

## 2. Terms

- **Boundary or place.** F5, F6 and `--place <boundary>` use both words for Development, Integration, Promotion and Publishing. Choose one. The place vocabulary is the standing one.
- **Placement.** F5 and G17 use it for where the control is applied. In Architecture, Placement is the relationship from a Requirement to an element. The two collide.
- **Change Isolation** names the control, the judge, the check context and the workflow job. `merit.md` already keeps control and realization apart, and the requirements could say which they mean.

## 3. Different functional ownership

| Element | Owner today | Proposed owner |
| --- | --- | --- |
| F4, F6, A18 and the attestation rule | release management | release management (Solution) |
| The preventive requirement, rulesets and the queue | restated in F5 | `guard Integration` |
| The declared check reaching the hook, CI and the queue | A17 prose | Guard, which owns that concept |
| A19 to A23, the workflows, the hook | release management | the Delivery side of release management, as its own Change |
| Claim wording about evidence | F6 | Controls |
| The `lineage.ts` verdict that the adapter asks first (H7) | inside A19 | Branching, as an explicit dependency |

## 4. Smallest decomposition

Keep #1404's evidence whole and cut its Changes, not its content.

| Change | Concern | Holds | Closes | Waits for |
| --- | --- | --- | --- | --- |
| C4, the parent | Change | inventory, MERIT, the equivalence plan, ACT | nothing itself; done when its children are done | |
| C4 Solution, on `kaal/release/change-isolation` | Solution | I3, F4 with the attestation rule, F6, A17, A18; DO S1; replay E1, E2, E4 | G15, G16, G18, the Solution part of G19 and of G20 | |
| C4 Delivery, on a wiring collector `kaal/release/wire-change-isolation` | Delivery | F5, A19 to A23; DO S3, S5, S6; E3; the S4 evidence | G17, and the Delivery part of G19 and of G20 | the Solution Change, done |

G19 and G20 each become two Gaps so that each has exactly one closing Change. Their ids are for the Change Isolation Change to claim, so none is claimed here. The Delivery Change must leave T55, T56, T58, T59 and T60 unchanged: that is the invariant, checked by the same Cases that the Solution Change turned green. A `.github` Change is needed only if one is found to be, as `transition.md` already says. The `check.mjs` file, the ledger, the workflows and the rulesets are retained as MERIT decides, and no step weakens the protection of today.
