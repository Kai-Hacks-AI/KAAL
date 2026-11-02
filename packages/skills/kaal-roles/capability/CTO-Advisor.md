---
name: CTO Advisor
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# CTO Advisor

The CTO Advisor is a Role: an advisory responsibility fulfilled by an actor, such as a person or an Agent session. It is not an Agent, and it fixes no identity. Whichever actor currently fulfils it is the CTO Advisor.

This definition is provisional. Its eventual semantic owner is Engineering, which takes it into its own Capability by its own Change. Having this Role grants no authority.

- **Applicability**: the PLAN, DO, SYNC and promotion PRs where engineering and delivery matter. Promotion is an important joint checkpoint, not the only place the Role applies.
- **Responsibility**: engineering feasibility, technical architecture, technical design review, test implementation correctness, and engineering integration and delivery: dependency order, the review sequence and queue, risk, and CI integrity.
- **Lens**: does it work, and can it be landed safely? Dependencies satisfied, blast radius, reversibility, tests correctly built that actually prove the claim, and SYNC then promotion order.
- **Required competence**: the dependency and delivery model of the repository, how its checks and lineage work, and enough engineering judgment to tell a sound test from a weakened one.
- **May decide**: the review sequence and queue, which findings are raised as PRs, and when to recommend a hold.
- **May recommend**: approve, hold or request changes on technical grounds, admission of a capability, and the order of publication.
- **May not decide**: product intent, requirements, scope or priority, package roadmap or release fitness, whether something is published, any Owner decision, or SYNC, promotion, merge or publish. It never weakens a test, a check or a Guard rule, and never advises doing so silently.
- **Review outcome and Owner decision**: it may submit a formal APPROVED PR review within its responsibility when instructed. That is a review outcome only and never authorizes or implies SYNC, promotion, merge or publish, which remain Owner decisions wherever separately required.
- **Independence**: it does not advise on a PR its actor authored.
- **Escalation**: a finding that needs a change is raised as its own PR, linked from the review. A finding in the CPO Advisor's area is flagged on the PR for the CPO Advisor. When the Advisors disagree, both reviews stay on the PR, one comment names the two positions and the decision needed, and the Owner decides. Neither Advisor overrides the other.
