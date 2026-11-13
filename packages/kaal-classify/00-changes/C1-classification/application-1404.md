# C1 application to #1404

The rules of `proposal.md` applied to release/C4 as in #1404 at `b00a563`. Nothing of #1404 is edited and nothing here weakens its protection. Its inventory, MERIT analysis and equivalence evidence stay whole: they are Change-oriented and belong in `00-changes/`.

## 1. Statement by statement

| Element | Classification | Finding |
| --- | --- | --- |
| I3, F6 record, A18 | Solution, target-state | clean |
| F4 rules | Solution, target-state | "`.github` travels alone" names a platform path in a Solution rule. The Solution term is the class of paths, `.github` is how GitHub spells it. Same rule, so rewording is no weakening. |
| F4, carried ledger entry | Solution, target-state | **Missing.** A promotion's entry is admitted only with an attestation (`inventory.md`). F4 does not say so. Only A19 does. A Solution rule held only by a Delivery element is how a Delivery Change could redefine it. F4 should hold the rule with the attestation as an input of the judge, and A19 only that the target supplies it. |
| F5 | Delivery, target-state | Stands among the Requirements with no marker of concern, and restates the preventive rule that C4's Dependencies already give to `guard Integration`. Refer, do not restate. |
| F6, claim rule | owned by Controls | Cite `kaal-controls`, do not restate. |
| A17 | Solution feature with Delivery children | See section 2. |
| A19 to A23 | Delivery, target-state | clean, except the attestation sentence |
| C4.md, "without reducing the protection" | Change | clean; it is this Change's invariant |
| G15 to G20 | Change | One Change closes Solution Gaps (G15, G16, G18), a Delivery Gap (G17) and two mixed ones: G19 (A17 and A18 with A19 and A22) and G20 (the replay covers the judge, E1, E2, E4, and the adapters, E3). |
| S1 / S3, S5, S6 | Solution Change / Delivery Change | S2 and S4 are evidence, split the same way (E3 and S4 are Delivery). |

## 2. A17 and the hierarchy

The established hierarchy is deployment target, then feature, then component, and this proposal introduces no other. #1404 hangs A19 and A22, which are deployment targets, under the feature A17, beside the judge A18. Read against the hierarchy, A17 is not a node of its own: the feature belongs under each target that applies it, and the judge, which knows no platform, is the component the targets share. The Change Isolation Change re-cuts its tree to that hierarchy. This Change does not.

## 3. Terms

- **Boundary or place:** F5, F6 and `--place <boundary>` use both words. Choose one; the place vocabulary is the standing one.
- **Placement:** F5 and G17 use it for where the control applies. In Architecture it is the relationship from a Requirement to an element.
- **Change Isolation** names the control, the judge, the check and the job. Requirements can say which they mean.

## 4. Ownership

| Element | Proposed owner |
| --- | --- |
| F4, F6, A18, the attestation rule | release management, Solution |
| The preventive requirement, rulesets, the queue | `guard Integration` |
| The declared check reaching hook, CI and queue | Guard |
| A19 to A23, workflows, hook | release management, Delivery, its own Change |
| Claim wording | Controls |
| The `lineage.ts` verdict the adapter asks first (H7) | Branching, as an explicit dependency |

## 5. Smallest decomposition

| Change | Holds | Closes | Waits for |
| --- | --- | --- | --- |
| C4, parent (Change) | inventory, MERIT, equivalence plan, ACT | nothing itself; done when its children are | |
| C4 Solution, `kaal/release/change-isolation` | I3, F4 with the attestation rule, F6, A18; DO S1; replay E1, E2, E4 | G15, G16, G18, the Solution part of G19 and G20 | |
| C4 Delivery, wiring collector `kaal/release/wire-change-isolation` | F5, A19 to A23; DO S3, S5, S6; E3; S4 evidence | G17, the Delivery part of G19 and G20 | the Solution Change, done |

G19 and G20 each split in two so that each Gap has one closing Change. The Change Isolation Change claims those ids. The Delivery Change leaves T55, T56, T58, T59 and T60 unchanged: that is the invariant. A `.github` Change is needed only if one is found to be.
