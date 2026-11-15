# Case Ownership: Intent

This is `testing/C61`, a PLAN Change. It ships no Skill text and no code beyond read-only helpers of its own Cases. `testing/C62` (DO, not yet authorized) records a survey on real packages.

**What is missing.** Testing designs Cases, and `testing/C59` and `testing/C60` gave the Skill a rule to reject a brittle one. That framing starts from the wrong authority. A Case is not owned because Testing accepts it. It is owned because a node of the repository, an Intent, a Requirement, an Architecture element or a Defect, needs it to verify its own claim. Nothing in the repository today says, for every Case, which node owns it, whether that link is real, or who judged that the Cases of a node are enough.

- **testing/I39**: Cases are owned positively. Each owning node identifies the Cases that verify its own claims, and a node may need several. Each owning concern judges, by reasoning, whether its Cases adequately test its claims: Intent judges Intent Cases, Requirements judge Requirement Cases, Architecture judges Architecture Cases, a Defect judges its own. Testing provides the shared mechanics for Case structure, execution, traceability and evidence, and checks deterministically that declared links, identities and records are consistent. It never decides whether another concern's Cases are adequate, and it never owns or reassigns their meaning. A Case that no node positively owns is unresolved. It is not rejected, invalid or reassigned: finding out whether a Requirement, an Architecture element, a Defect or a link is missing, or whether an existing node should own it, needs judgment, by the concerns involved.

Principle: the Script verifies declared links, identities and consistency. The owners exercise the judgment. A negative claim about a Case, such as `rejectsCase` in the earlier trial, may remain a local signal for whoever reads it. It is not the ownership model and never triggers a reassignment.

**Out of scope.** No change to the Skill, to `testing/T156` to `T160`, to `plan/testability/` or to any other capability's Cases. No new gate, export, finding kind or capability. No automatic reassignment of a Case.
