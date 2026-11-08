# Portfolio PLAN: a shared Portfolio capability for Product and Project (provisional number 26/11/08/01)

Markdown only. PLAN only: no Node, Definition, claim, package, workflow, policy or implementation is created or changed, and nothing here is started.

## 1. Intent

The CPO currently coordinates KAAL's release program by hand: sequencing releases across capabilities, tracking blockers across threads, keeping readiness, promotion and publication apart, and keeping Owner decisions that touch several products traceable. KAAL has the product-governance concepts for this (Product's Owner View and Decision Preparation, Project's Project Plan) but nothing that lets an Agent help with the cross-product part.

Owner direction (Kai, 8 Nov 2026): **Portfolio, Project and Product are three capabilities with clean boundaries**, and **each must work on its own; having several of them enriches the experience** (1 + 1 > 2). Portfolio is the shared base Product and Project can use. It is never required by either.

The CPO accepted the scope of this PLAN in principle (8 Nov). Evidence and sequencing are in the CTO assessment of 8 Nov; this PLAN relies only on what is stated here.

## 2. Boundaries

| Capability | Responsibility |
|---|---|
| **Portfolio** | Membership, cross-subject priorities, contention and blockers; it identifies shared dependencies |
| **Roadmap** | Milestones, dependencies (the one planning meaning of `depends-on`), sequence and checks; usable for any subject, Portfolio included |
| **Product** | Individual product direction, acceptance and readiness |
| **Project** | Coordinated delivery toward an objective |
| **Engineering / Review** | Technical evidence, controls and approval mechanisms |
| **Testing / Change** | Test Case identity, change evidence and traceability |

Portfolio **consumes existing evidence and creates no second source of truth.** It adds no verifier, no trace model, no Test Case identity, no approval mechanism and no store of its own for what another capability owns. Where Portfolio states a fact (for example a release order), it states the portfolio-level decision or reading; the facts underneath stay with their owners.

Edges kept clean:

- Roadmap keeps the single planning interpretation of `depends-on`, sequencing and milestones. Portfolio may reference Roadmap relationships and identify shared dependencies; it does not redefine them. Roadmap requires none of Product, Project or Portfolio.
- Product keeps one product's direction, acceptance and readiness. Portfolio does not decide what one product should become; it reads several products' states to order, relate and unblock them.
- Project keeps governance of related Changes toward one Outcome. Portfolio does not govern Changes. Project's own Program and Portfolio scope text is not changed by this PLAN; how Project's wording relates to Portfolio is a question for the Project thread when it exists (section 8).
- Engineering and Review keep promotion, publication and approval mechanics. Portfolio may name readiness, promotion and publication as distinct portfolio states with distinct deciders, and cites the owner's evidence for each.
- Testing and Change keep Test Case identity (one T-number, RED is a role), change evidence and traceability. Portfolio reads them.

## 3. Independence: each works alone, together they enrich

- Portfolio works alone: its text is useful to a reader who has neither Product nor Project.
- Product works alone and Project works alone. Neither declares Portfolio as a required dependency, and neither's tests or acceptance require it.
- Together, a Product's readiness can be read in a portfolio context, and a Project's ordering can be read against other Projects. That is optional enrichment, never a gate.
- A dependency between them, if ever proposed, must be justified in its own Change and decided by the Owner. This PLAN proposes none.

## 4. Requirements

| # | Requirement | Accepted when |
|---|---|---|
| R1 | Every Portfolio concept is traced to an observed release-program workflow. | Each concept names the workflow it serves; a concept without one is removed. |
| R2 | Portfolio reads existing evidence and owns none of it. | No Portfolio text defines a verifier, trace, Test Case identity or approval; each fact cited names its owner. |
| R3 | Readiness, promotion and publication are distinct states, each with its own decider and evidence source. | A reader can tell, for one package, which state it is in, who decided it and what evidence supports it. |
| R4 | Cross-subject priorities and blockers are stated as portfolio-level readings of existing dependencies and states; dependency and sequence semantics are Roadmap's. | Each priority or blocker statement cites the dependency or state it reads and its owner; Portfolio defines no `depends-on` of its own. |
| R5 | Owner decisions that touch several products stay traceable. | A cross-product decision can be found with its Question, chosen Option, Decider and affected products, using Product's Decision Preparation shape. |
| R6 | The Portfolio, Product and Project boundaries are explicit and non-overlapping. | Each responsibility in section 2 appears under exactly one capability. |
| R7 | Portfolio, Product and Project each stand alone, and combine as optional enrichment. | Each is usable and accepted without the others; no required dependency is declared. |
| R8 | Portfolio is usable by an Agent doing CPO preparation work. | An Agent given only the Portfolio text and the evidence sources can produce a sequencing and blocker reading for the current release program, which the CPO can check. |

## 5. Authorization boundary

- **Creating the new capability is Owner-reserved.** The Owner (Kai) authorized the `kaal/portfolio` collector and this PLAN on 8 Nov. This does not authorize implementing Portfolio.
- Approving this PLAN as a review outcome does not authorize implementation, SYNC, promotion, publication or any package.
- Implementation (the Capability Node and Definition) needs its own Change and authorization after this PLAN's contract is accepted.
- Promotion to main and npm publication stay separate Owner decisions. Portfolio is internal-only unless the Owner decides otherwise.

## 6. Sequencing

0. Roadmap is created as an independent capability and its PLAN precedes Portfolio's implementation (Owner decision, 8 Nov). Creating it is a separate Owner act.
1. This PLAN, as amended, reviewed by the CPO and Owner.
2. Once the shared Portfolio contract (sections 2 to 4) is accepted, **Portfolio's implementation and Product's Skill may proceed in parallel**, provided Product does not duplicate Portfolio's responsibilities. Portfolio's complete implementation is not a precondition for Product's Skill.
3. Project's use of Portfolio comes after Project has a thread, main lineage and its own layout and wording work. It changes an existing contract and needs separate approval.

## 7. Out of scope

Implementation of any kind; a Skill, script, store, verifier or trace model; an npm package; SYNC, promotion or publication; changes to Product, Project, Roles, Engineering, Review, Testing or Change contracts; a Project thread (it waits for step 3 of section 6).

## 8. Open questions (proposals, not settled by approving this PLAN)

1. How Project's existing Program and Portfolio scope wording relates to Portfolio: to be settled in the Project thread when it opens.
2. Where Portfolio objects, if any, are persisted: not decided; separate from ownership.
3. Whether Portfolio ever needs an npm package: only if a non-KAAL repository benefits.

## 9. Verified by

Markdown only; required checks on this PR.

## 10. Validated by

CPO review of product meaning and boundaries; Owner review of the new-capability boundary in section 5.

## 11. Amendment (8 Nov 2026): Roadmap ownership

Owner (Kai) and CPO decided that Roadmap is a separate, independently usable capability (see the strategy model PLAN). This amendment narrows Portfolio: the sections above are edited in place to move sequencing, milestones and the planning meaning of `depends-on` to Roadmap. Portfolio keeps membership, cross-subject priorities, contention and blockers, and identifies shared dependencies by citing Roadmap's type. The earlier "shared base" role for Product and Project therefore narrows to membership, relations and contention. No other part of this PLAN changes; no implementation is authorized.
