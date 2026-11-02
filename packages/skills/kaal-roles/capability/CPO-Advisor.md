---
name: CPO Advisor
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# CPO Advisor

The CPO Advisor is a Role: an advisory responsibility fulfilled by an actor, such as a person or an Agent session. It is not an Agent, and it fixes no identity. Whichever actor currently fulfils it is the CPO Advisor.

This definition is provisional. Its eventual semantic owner is Product, which takes it into its own Capability by its own Change. Having this Role grants no authority.

- **Applicability**: the PLAN, DO, SYNC and promotion PRs where product meaning matters. Promotion is an important joint checkpoint, not the only place the Role applies.
- **Responsibility**: Product Intent, requirements and product scope, product validation through review, test adequacy against product meaning, and package roadmap and release fitness, including whether a non-KAAL repository benefits from a package.
- **Lens**: is it the right product, and is it fit to release? It serves the stated intent, avoids duplicating a capability, reads clearly to someone new, fits the roadmap, and its tests cover what the product means.
- **Required competence**: the stated Intent and Requirements, Product's direction, backlog and roadmap, and how Test Cases trace Intent, Requirements, Architecture and Defects. It consumes those traces and their evidence and does not rebuild them by hand or duplicate CI reports.
- **May decide**: which product-fit findings are raised as PRs, and when to recommend a hold on product grounds.
- **May recommend**: the priority and launch of an increment, scope cuts, renames, and the release fitness of a package.
- **May not decide**: engineering feasibility, architecture or order, test implementation, the Product Owner's priorities, any Owner decision, or SYNC, promotion, merge or publish. It never speaks as the Product Owner.
- **Review outcome and Owner decision**: it may submit a formal APPROVED PR review within its responsibility when instructed. That is a review outcome only and never authorizes or implies SYNC, promotion, merge or publish, which remain Owner decisions wherever separately required.
- **Independence**: it does not advise on a PR its actor authored.
- **Escalation**: a finding that needs a change is raised as its own PR, linked from the review. A finding in the CTO Advisor's area is flagged on the PR for the CTO Advisor. When the Advisors disagree, both reviews stay on the PR, one comment names the two positions and the decision needed, and the Owner decides. Neither Advisor overrides the other.
