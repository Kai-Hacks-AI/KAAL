# kaal-roles: CTO Advisor and CPO Advisor (PLAN)

Capability: Roles (proposed). Collector: kaal/roles (proposed, created from
`main`). Record number is provisional until integration.

Kai's idea: a `kaal-roles` capability that, for the moment, scopes two advisor
roles, a CTO Advisor and a CPO Advisor.

**Status: interim baseline.** Kai expects this to change. Its purpose is a
provisional, referenceable definition the CTO (the coordinator) and the CPO (the
other session) can be pointed at now. Concise and usable beats final.

This PLAN defines the two roles, says where they live, relates them to Process,
Engineering and Product, and answers the npm question. Markdown only. No Node,
Definition, claim, package, workflow or policy is created or changed. Nothing
here starts DO.

## 1. What exists today

A survey of `main` and the `kaal/*` collectors found no roles content: no
Definition, Node, package or Guard check names a CTO, a CPO or an advisor.
What exists is the practice, run informally:

- The project coordinator acts as CTO / Head of Delivery. It sets the review
  sequence from dependencies and reviews PRs from an engineering and
  dependency viewpoint.
- A separate session acts as CPO and reviews PRs from the product and Owner
  viewpoint.
- Kai is the Owner and gives the Owner decisions (authorizing SYNC, promotion,
  merge and publish where separately required). Advisor findings become their
  own PRs.

Related capabilities:

- **Process** (kaal/process, #852): the metamodel. A Role is a Process concept,
  fulfilled by an actor, and is not an Agent. Process keeps no registry and
  authorizes nothing.
- **Engineering**: owns the delivery route and its evidence (checks, audits,
  release). It supports the CTO viewpoint.
- **Product** (kaal/product, #860): owns direction, backlog and roadmap, where
  the Product Owner keeps authority. It is meant to support the Owner viewpoint.

## 2. Role definitions

Both roles are **advisory**. An Advisor is a Process Role, so it is fulfilled by
an actor (a person, a CASE Agent session) and is not itself an Agent. The
definitions fix no identity: whichever actor currently fulfils the role is the
Advisor.

### Division of responsibility

Baseline taken from the CPO review of 2 November 2026 (CPO session). Each
Advisor owns the left or right column of its own row.

| CPO Advisor | CTO Advisor |
|---|---|
| Product Intent | Engineering feasibility |
| Requirements and product scope | Technical architecture |
| Product validation through review | Technical design review |
| Test adequacy against product meaning | Test implementation correctness |
| Package roadmap and release fitness | Engineering integration and delivery |

The CPO validates whether the package delivers the right product. The CTO
validates whether it is built and landed soundly. Both consume the structural
traces KAAL already keeps (Test Cases trace Intent, Requirements, Architecture
and Defects through the multi-loop model) and their evidence. Neither rebuilds
those traces by hand or duplicates CI reports. Third-party validation is a
separate discussion and is not part of either role here.

### Common rules

- An Advisor reviews and recommends. The Owner decides.
- Advisors review the PLAN, DO, SYNC and promotion PRs that are relevant to
  their own lens. Promotion (kaal/X to main) is an important joint checkpoint,
  not the definition or the exclusive location of the advisory role. A finding
  that needs a change becomes its own PR, never a silent edit to the reviewed PR.
- Review outcome and Owner decision are distinct. An Advisor may submit a formal
  APPROVED PR review within its responsibility when instructed, and that
  approval is a review outcome. It never authorizes SYNC, promotion, merge or
  publish. Those remain Owner decisions wherever separately required, and an
  Advisor never makes them or implies it has.
- An Advisor never weakens a test, a check or a Guard rule, and never advises
  doing so silently.
- Independence: an actor does not advise on a PR it authored.
- Disagreement between the Advisors is recorded on the PR as two reviews. Neither
  overrides the other. The Owner decides.
- Ownership of a capability stays with it. An Advisor may accept a direction
  (for example Hosting keeps product ownership across an atomic multi-capability
  transaction) but never takes over a capability's ownership.

### CTO Advisor

| | |
|---|---|
| Scope | Engineering feasibility, technical architecture and design review, test implementation correctness, engineering integration and delivery: dependency order, review sequence and queue, release and change plan, architecture admission, risk, CI integrity. |
| Review lens | Does it work, and can it be landed safely? Dependencies satisfied, blast radius, reversibility, tests that are correctly built and actually prove the claim, SYNC then promotion order. |
| May decide | The review sequence and the queue; which findings are raised as PRs; when to recommend a hold. |
| May recommend | Approve, hold or request changes on technical grounds; admission of a capability; the order of publication. |
| May not decide | Product intent, requirements, scope or priority; package roadmap or release fitness; whether something is published; any Owner decision; npm publication (an Owner 2FA act). |

### CPO Advisor

| | |
|---|---|
| Scope | Product Intent, requirements and product scope, product validation through review, test adequacy against product meaning, package roadmap and release fitness (including the npm rule: does a non-KAAL repo benefit). |
| Review lens | Is it the right product, and is it fit to release? Does it serve the stated intent, avoid duplicating a capability, read clearly to someone new, fit the roadmap, and do its tests cover what the product means. |
| May decide | Which product-fit findings are raised as PRs; when to recommend a hold on product grounds. |
| May recommend | Priority and launch of an increment (Product's Prioritize and Launch), scope cuts, renames, release fitness of a package. |
| May not decide | Engineering feasibility, architecture or order; test implementation; the Product Owner's priorities (the Owner's authority); any Owner decision, nor SYNC, promotion, merge or publish. |

### Interim exchange between the Advisors

Kai's direction: the exchange of information between CTO and CPO has to be
aligned through the Roles and Process work over time. For now it stays simple
and runs through the PR, which is already the shared, auditable record.

- **Where each review is recorded.** Each Advisor records its review on the PR
  it reviews (PLAN, DO, SYNC or promotion, according to its lens) as a PR
  review, stating its outcome and the lens it applied. Each reads the other's review there. No side channel carries
  a decision.
- **How findings become PRs.** A finding that needs a change is raised as its
  own PR, linked from the review that raised it. The finding's owner is the
  capability concerned, and the reviewed PR is not edited silently. A finding
  that touches the other Advisor's area is flagged on the PR for that Advisor,
  not decided by the one who found it.
- **How disagreements reach the Owner.** Both reviews stay on the PR. The
  Advisor who sees the disagreement says so in one comment naming the two
  positions and the decision needed. The Owner decides on the PR, and that
  decision is the record. Neither Advisor overrides the other.
- **Longer term.** A designed exchange (who must read what, when a review is
  due, what a hand-off carries) is a Process-level design to follow, and this
  section is replaced when it lands. The Process thread answered that it fits as
  a process design (a Definition on Process's metamodel), not as Serving, which
  only says which Capability is accountable for an Activity. Its Activities would
  be hand-off, review due and read-before, with the Advisors as Roles, entry and
  exit conditions for when a review is due, and States read from facts (PR
  reviews recorded, findings as PRs). It lives with the accountable owner, so not
  in Process and not in Roles. Suggested owner for now: Engineering, since the
  interim exchange runs through the PR. Process and Roles need not know
  each other; only the design refers to both, one way. It is not designed here.
  Proposed timing: its own PLAN after #560 reaches `main` and the Process
  amendment lands, if Kai wants it.

## 3. Where roles live

### Principle (long term)

Each Capability defines and owns the Roles it needs to perform its
responsibilities. Agents must be able to discover those Roles and understand
what they can, should and may not perform: applicability, required competence,
authority limits and escalation. Process defines the Role concept and keeps no
central registry of every capability's Roles. Discoverability reuses KAAL's
existing Capability and Skill mechanisms and creates no parallel registry. A
Role's availability grants no authority.

### Provisional home: incubation in `kaal-roles`

To avoid blocking a useful baseline, the first two Advisor definitions are
produced now in a small `kaal-roles` home. This is an incubation arrangement,
not a precedent that future Roles are centrally owned.

- **Eventual semantic owners.** Engineering for the CTO Advisor, Product for
  the CPO Advisor. Until migration, `kaal-roles` holds the text and each owner is
  consulted on its own definition.
- **Provisional status is explicit.** Each definition states in its own text
  that it is provisional and names its eventual owner.
- **Owner-led migration later.** Engineering and Product each take their
  definition into their own capability when they choose to, as their own Change.
  `kaal-roles` is then removed or left empty. No premature redistribution and
  no broader Roles framework is part of this PLAN or its DO.

| Option | Assessment |
|---|---|
| A. Provisional `kaal-roles`, migrating to the owners | Gives the baseline now, keeps ownership honest, and removes itself later. **Recommended.** |
| B. Permanent central `kaal-roles` | Contradicts the principle: a capability would not own the Roles it needs. Rejected as an end state. |
| C. Inside Process | Process owns meaning only (Role as a concept) and would carry content it says it should not. Rejected. |
| D. CTO in Engineering and CPO in Product now | Matches the end state, but forces both capabilities through collector work before a baseline exists. Deferred to the migration. |

Proposed shape, mirroring `kaal-process` and `kaal-product`:

- Collector `kaal/roles`, created from `main` (no collector exists yet).
- Package `packages/skills/kaal-roles/` holding a Capability Node `Roles`, two
  Definitions (`CTO Advisor`, `CPO Advisor`), `README.md`, `ownership.kaal.json`
  and one test. Definitions only, no runtime code. Each definition states
  applicability, required competence, authority limits and escalation, so an Agent
  reading it can tell what the Role may and may not do.
- A DO would be its own Change on `kaal/roles`, then SYNC and promotion with
  Kai's explicit authorization, like every other collector.

## 4. Relations

Dependencies point one way only.

```
Process (kaal-process)     metamodel: Role, Activity, Serving ...
        ^ concepts used (prose, no declared dependency)
Roles (kaal-roles)         CTO Advisor, CPO Advisor (provisional; migrate to owners)
        ^ referred to
Process designs            e.g. DevOps (Engineering): Review and Release name the Advisors
```

- **Process.** Roles uses Process's concept of Role. Roles declares no
  dependency on Process, and Process does not know Roles. A process design (DevOps,
  owned by Engineering) may name an Advisor as a Role of an Activity, and may
  name Roles under Serving as accountable. That is the same one-way relation
  Process already has with capabilities.
- **Engineering.** Supports the CTO Advisor by supplying the evidence the
  Advisor reads (checks, audits, lineage, release state). Engineering keeps
  ownership of that evidence and of the delivery route, and is the eventual
  semantic owner of the CTO Advisor definition.
- **Product.** Supports the CPO Advisor the same way, with direction, backlog and
  roadmap, and is the eventual semantic owner of the CPO Advisor definition. The
  Product Owner (Kai) keeps authority, so the CPO Advisor never speaks as the
  Product Owner.
- **Guard.** Not involved. No Guard check is proposed: an Advisor review is a
  recommendation, and nothing here would block a merge.

## 5. npm

The rule: package only if a non-KAAL repo benefits for non-KAAL work. Applied:

- The Advisors govern review of KAAL's own PRs. That is KAAL-internal
  orchestration, which the rule says does not justify a package.
- **Recommendation: no npm publication.** The package stays unpublished and
  private to the repo.
- Revisit only if a reusable piece emerges, for example a general "review a
  change as a CTO / as a CPO" Agent Skill that helps outside KAAL. That would be
  a separate PLAN, decided on evidence.

## 6. Decisions for Kai

1. **Provisional `kaal-roles` home** for the two definitions, with eventual
   semantic ownership by Engineering (CTO) and Product (CPO) and an owner-led
   migration later, rather than a permanent central Roles capability.
   Recommended yes.
2. **Advisory only**, as in section 2, with the Owner deciding on every
   disagreement. Recommended yes.
3. **Create `kaal/roles` from `main`** as the collector. Recommended yes; this PLAN
   PR is its first change.
4. **No npm package** now. Recommended yes.
5. **Timing.** The CPO asks that this PLAN lead directly to a DO producing the
   provisional definitions. DO still waits for your explicit go. It does not
   depend on #560 or #852, because Roles declares no dependency on Process.

## Scope and authorization

This record only. Ordinary PLAN Change: independent review and required checks
precede integration. No synchronization, promotion or publication is authorized.
