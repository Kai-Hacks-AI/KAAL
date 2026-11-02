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
  sequence from dependencies and reviews promotion PRs from an engineering and
  dependency viewpoint.
- A separate session acts as CPO and reviews the same PRs from the product and
  Owner viewpoint.
- Kai is the Owner and gives the formal approvals. Advisor findings become
  their own PRs.

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

### Common rules

- An Advisor reviews and recommends. The Owner decides.
- The review is a PR review on a promotion PR (kaal/X to main). A finding that
  needs a change becomes its own PR, never a silent edit to the reviewed PR.
- An Advisor never approves for the Owner, merges, or authorizes SYNC,
  promotion or publish. Those need the Owner's explicit go.
- An Advisor never weakens a test, a check or a Guard rule, and never advises
  doing so silently.
- Independence: an actor does not advise on a PR it authored.
- Disagreement between the Advisors is recorded on the PR as two reviews. Neither
  overrides the other. The Owner decides.

### CTO Advisor

| | |
|---|---|
| Scope | Engineering and delivery: dependency order, review sequence and queue, release and change plan, architecture admission, feasibility, risk, test and CI integrity, application of the npm rule. |
| Review lens | Does it work, and can it be landed safely? Dependencies satisfied, blast radius, reversibility, tests that actually prove the claim, release readiness, SYNC then promotion order. |
| May decide | The review sequence and the queue; which findings are raised as PRs; when to recommend a hold. |
| May recommend | Approve, hold or request changes on a promotion; admission of a capability; the order of publication. |
| May not decide | Product priority or scope; whether something is published; any Owner approval; npm publication (an Owner 2FA act). |

### CPO Advisor

| | |
|---|---|
| Scope | Product and Owner viewpoint: purpose and intent, value to adopters, fit with Product's backlog and roadmap, scope creep, clarity of names and docs, usefulness beyond KAAL. |
| Review lens | Should it exist, and does it do what the Owner meant? Does it serve the stated intent, avoid duplicating a capability, read clearly to someone new, and fit the roadmap. |
| May decide | Which product-fit findings are raised as PRs; when to recommend a hold on product grounds. |
| May recommend | Priority and launch of an increment (Product's Prioritize and Launch), scope cuts, renames. |
| May not decide | Engineering feasibility or order; the Product Owner's priorities (the Owner's authority); any approval, SYNC, promotion or publish. |

## 3. Where roles live

| Option | Assessment |
|---|---|
| A. Its own capability, `kaal-roles` | Roles are neither the metamodel nor a delivery route nor a product. They are named responsibilities that several processes can refer to. A separate small capability keeps Process pure and keeps Engineering and Product from each owning half of a pair. **Recommended.** |
| B. Inside Process | Process owns meaning only (Role as a concept). Specific roles are an instance, like PDCA, but PDCA is generic and these are about KAAL's own governance. It would also make Process carry content it says it should not. |
| C. Split: CTO in Engineering, CPO in Product | Each Advisor is then owned by the capability it supports, which blurs independence: the capability under review would own its reviewer. Rejected. |

Proposed shape, mirroring `kaal-process` and `kaal-product`:

- Collector `kaal/roles`, created from `main` (no collector exists yet).
- Package `packages/skills/kaal-roles/` holding a Capability Node `Roles`, two
  Definitions (`CTO Advisor`, `CPO Advisor`), `README.md`, `ownership.kaal.json`
  and one test. Definitions only, no runtime code.
- A DO would be its own Change on `kaal/roles`, then SYNC and promotion with
  Kai's explicit authorization, like every other collector.

## 4. Relations

Dependencies point one way only.

```
Process (kaal-process)     metamodel: Role, Activity, Serving ...
        ^ concepts used (prose, no declared dependency)
Roles (kaal-roles)         CTO Advisor, CPO Advisor
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
  ownership of that evidence and of the delivery route. It does not own the role,
  and the role does not own its evidence.
- **Product.** Supports the CPO Advisor the same way, with direction, backlog and
  roadmap. The Product Owner (Kai) keeps authority, so the CPO Advisor never
  speaks as the Product Owner.
- **Guard.** Not involved. No Guard check is proposed: an Advisor review is a
  recommendation, and nothing here would block a merge.

## 5. npm

The rule: package only if a non-KAAL repo benefits for non-KAAL work. Applied:

- The Advisors govern review of KAAL promotion PRs. That is KAAL-internal
  orchestration, which the rule says does not justify a package.
- **Recommendation: no npm publication.** The package stays unpublished and
  private to the repo.
- Revisit only if a reusable piece emerges, for example a general "review a
  change as a CTO / as a CPO" Agent Skill that helps outside KAAL. That would be
  a separate PLAN, decided on evidence.

## 6. Decisions for Kai

1. **Own capability** (`kaal-roles`) rather than inside Process or split across
   Engineering and Product. Recommended: own capability.
2. **Advisory only**, as in section 2, with the Owner deciding on every
   disagreement. Recommended yes.
3. **Create `kaal/roles` from `main`** as the collector. Recommended yes; this PLAN
   PR is its first change.
4. **No npm package** now. Recommended yes.
5. **Timing.** DO waits for your approval. It does not depend on #560 or #852,
   because Roles declares no dependency on Process.

## Scope and authorization

This record only. Ordinary PLAN Change: independent review and required checks
precede integration. No synchronization, promotion or publication is authorized.
