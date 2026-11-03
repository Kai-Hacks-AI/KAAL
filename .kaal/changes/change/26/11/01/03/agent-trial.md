# Read-only skill usage trial

Validation artifact from one fresh-context agent, before committing the anchor.
Task: use the delivered skill to assess the proposed main delivery from the
source artifacts, read-only, in an External operator context. No expected verdict
or suspected defect was supplied. The response below is retained unedited.

---

1. **Proposal and versions.** Deliver the focused `@kaihacksai/kaal-change/isolation` product and proposed Change Practice skill to main. Selected owners are **Change and Engineering**: Change’s package tree; Engineering’s workspace, test-lane and derived lockfile integration. Evidence inspected:
   - bridge/HEAD: `85e7a582a7169fadf0c634b673fbc812e26e1190`;
   - main: `9a9e89699aed7969281dcd1017882fd0bc4e3edc`;
   - common base: `be3a2d09a386967bd5a1cd4a850f389951bc0796`;
   - uncommitted skill-anchor overlay, verified against manifest SHA-256 `5c3dc90c1291a27d63c3409a1e4c043732fbffba3252bdbdee7604d1c22d437d`.

   The committed DO describes `0.0.1-isolation.0`; the overlay proposes `0.0.1`. The overlay is not a committed promotion candidate.

2. **Traces.** Documents link I19–I21 → F38–F45/N9–N11 → A18–A21 → T41–T50. The skill adds I22 → F46–F48/N12 → A22 → T51–T54. These cover proposal validation, trace-based impact, both boundary directions, testing obligations, explicit unknowns, purity and delivered verification. Relevant real Defects and their owner-approved regression traces were not supplied; the executable Defect examples are controlled fixtures. No pinned owner inventories or Graph model describe this promotion itself, so a repository isolation assessment cannot be established.

3. **Scope and surroundings.** Proposed work is the focused Change package, its planning/Change records and declared Engineering integration. Lifecycle, delivery satisfaction, succession, classification, CHAOS, FAR, repository conversion, selective CI and publication remain excluded. Foundation, Graph, Hosting, Testing, Core and Engineer Skill are surrounding dependencies. Main has three commits absent from the bridge; the bridge has two absent from main. Main’s Branching, Testing duplicates and execution-adoption changes require integration review. Two-tip differences are divergence evidence, not proof a normal merge would delete those additions.

4. **Interfaces.**

   | Direction | Boundary and ownership |
   |---|---|
   | Incoming | Caller → Change’s public `isolate(proposal, model)`; supplied proposal and pinned inventories |
   | Outgoing | Change → Graph `resolve/check/out/traverse`; Foundation SHA-256 |
   | Verification | Tooling → Hosting, Graph and Testing; Core admission/registration and Engineer Skill checking |
   | External operation | Host-selected discovery and authorized target access; no target installation required |

   Public transport declarations exist. Owner-backed endpoint and contract references for the actual promotion are missing. Controlled shop/web/provider interfaces cannot substitute for them.

5. **Testing evidence.** Observed read-only in this trial:
   - documented example exited 0: complete model `isolated`, omitted interface `unknown`, new dependent `isolated` with `audit/A1` affected outside;
   - delivered verification passed all nine Cases, T41–T47, T49 and T51;
   - architecture Case T48 passed, including prohibited/undecidable challenges.

   All example authority remains `unestablished`; emitted obligations remain `not-assessed`. The DO records historical RED/GREEN, 20 killed mutations, Engineering 231/231, Acceptance 33/33 and lock derivation. Those claims were read, not independently reproduced. Current-overlay RED evidence, T52–T54, packed acceptance, full repository/three-host checks and current-head CI were not executed here.

6. **Findings and next decisions.** The skill supports a useful manual boundary explanation; it supplies neither promotion approval nor repository completeness. Owners must decide whether the overlay joins this promotion, pin its final version and Change/owner evidence, reconcile advanced main and identifiers, and obtain independent review plus current-candidate assurance. Historical results must be rebound or rerun where inputs changed. No files, branches, installations, PRs or merges were created or modified.
