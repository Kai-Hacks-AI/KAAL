# DevOps as a Process KAAL serves

Evidence date 2 Nov 2026. Inspected: main, kaal/engineering at `8b1e081`, the kaal/* collector branches, open PRs, and the npm registry. Statements of readiness are the author's reading, with the evidence named so a reviewer can disagree.

## 1. What DevOps is here

The repository never mentions DevOps. This document proposes how to read it.

DevOps is a **Process**: a repeatable way of working that KAAL Capabilities are delivered into. It is an *instance* of the Process capability (`kaal-process`), the underlying framework for describing processes, and not a Capability of its own. It has no thread, collector, package or version.

- **Framework and instance.** `kaal-process` owns the metamodel (Process, Activity, Role, State, Transition, Ordering, Entry and Exit conditions) and PDCA as its generic cycle. A given process is designed on that metamodel and uses other capabilities as bricks. DevOps would be one such process, PDCA another. Process keeps no registry, and describing a process makes nothing mandatory.
- **Bricks.** Each DevOps Activity (a stage) is served by one or more existing capabilities, and a capability can serve several stages. Section 3 lists them. Changing which capability serves a stage changes the process description, not the capability.
- **Owner of the description.** The framework belongs to the Process capability. The DevOps description, if recorded, belongs where the delivery engine lives: Engineering (verification lanes, Change isolation, release engine). Process does not own what a consumer describes with its concepts.
- **Not a new count.** The "8" is eight stages of the loop, not eight capabilities.

## 2. How it relates to PDCA and GLUE

- **PDCA** is the generic, recursive learning cycle: Plan, Do, Check, Act. Inner cycles feed the enclosing Check and never replace it. Act preserves knowledge and changes nothing by itself.
- **KAAL's Change cycle** (PLAN, DO, CHECK) is PDCA realized for one Change. A PR carries it and owns nothing of it.
- **DevOps** is a delivery loop over PDCA cycles: each stage is a place where a Change's PDCA touches the machinery of delivery. Proposed correspondence:

| DevOps stages | PDCA phase | Change step |
|---|---|---|
| Plan | Plan | PLAN |
| Code, Build, Test | Do | DO (Test also feeds Check) |
| Release, Deploy | Do (outer) | integration, SYNC, promotion, publish |
| Operate, Monitor | Check, then Act | CHECK, then learning feeds the next Plan |

- **GLUE** (Detect Defects, Describe Intent, Define Requirements, Design Architecture, Develop Code, Do IT) names the disciplines, which are *what* is done. DevOps names the *delivery route* the result takes. Operate and Monitor in DevOps correspond to GLUE's "Do IT" and "Detect Defects" and close the loop back to Intent.

## 3. Prerequisites and status of this document

- **Conceptual preparation** (this document) may proceed now: the eight Activities, the serving Capabilities, gaps, the PDCA and GLUE relationships and dependencies.
- **The authoritative DevOps process design is not created** until `kaal-process` has landed on main with its accepted metamodel (#560 and its follow-ups). Nothing here is that design.
- **DevOps is not claimed realized or operational** until each Capability it needs is a usable, verified package under its intended consumption contract. Section 5 lists the readiness to establish per serving package.
- **One-way ownership.** Engineering's DevOps design references the serving Capabilities. No Capability is required to document DevOps stages, and none is changed by this document.

## 4. Stage by stage

Three questions are kept separate for every stage, because one rating would hide which of them is the gap:
- **Concept**: does a Capability's defined meaning cover the stage's work?
- **Implementation**: is that Capability implemented and verified (on main, with tests and CI), or only on a collector branch or in a PLAN?
- **Distribution**: is it usable in the intended consumption contract, repository-local or published package? Which contract a Capability needs is for its owner to state. This document does not assume npm delivery for any of them.

Serving lines are prose. If Process later adopts a Serving relation (the process design points at capabilities, never the reverse), they can be restated in that form.

| Stage | Serving Capabilities | Concept | Implementation | Distribution |
|---|---|---|---|---|
| Plan | Change (PLAN records, scope), Intent, Requirements, Architecture (RATS!), Product, Process (PDCA), Project, Data | Covered | Change on main (#662 open); the others on collector branches only | Not assessed per package; Foundation 0.0.1 and Guard 0.0.1–0.0.4 are the only packages on the npm registry (checked 2 Nov) |
| Code | Engineer Skill (#845), Hosting (#835), Foundation, Core, Agents | Partly covered: GLUE's `kaal-coding` does not exist; conventions sit in Engineering documents (BACCHUS, #844) | Hosting, Foundation, Core on main; Engineer Skill on main, with a PLAN open; Agents on a collector branch | Not assessed |
| Build | Packaging (#686 pending), Engineering (`engineering/delivery/pack.mjs`, Release workflow, #834), Foundation (digests), Core (manifest and delivery scripts) | Covered | Packaging contract not on main; trusted migration admission (#834 follow-up) still unproved | Packaging has no package of its own (#850 recommends it stay private) |
| Test | Testing (#693, #667), Guard (#663), Engineering (lanes, `KAAL Main`, `KAAL Lineage`, coverage), Graph | Covered; coverage meaning still being settled (#667, #745) | On main, with open items such as Windows applicability (#577) | Not assessed |
| Release | Engineering (Release workflow, promotion, Lineage), Packaging, Sealing, Change (delivery, succession), Guard release lineage | Covered | Engineering and Guard on main; Packaging and Sealing not on main | Not assessed; a consumer-delivery decision is per package |
| Deploy | Core (Installation Contract, `kaal register`, `kaal verify`), Hosting, Engineering (SYNC, promotion) | Covered for deployment into a consumer repository's Engine | On main | Not assessed. Rollout, rollback and environments are not covered by any Capability, and whether KAAL needs them is not decided here |
| Monitor | Review, Learning, Controls, Graph (traces), Guard run records, Engineering (report, inventory, timing) | Covers monitoring of KAAL's own delivery; no Capability covers behaviour of delivered Capabilities in use | Mixed: Guard and Engineering on main; Review, Learning, Controls on collector branches | Not assessed |
| Operate | None identified. Service (Agreement, composes, covers, underpins) is the nearest, on a collector branch | **Unresolved product-scope decision** (below) | n/a | n/a |

**Operate** is an open Owner decision, not proof of a missing Capability. Whether KAAL has an operating stage at all, what it means for a Capability that runs inside a consumer repository, and whether it needs an owner (GLUE names `kaal-operations`, which does not exist) are questions for the Owner. The DevOps design may declare the stage with no serving Capability, or leave it out, once that is decided.

## 5. Readiness to establish before realization

For each serving package, its owning Capability states, and this document does not decide:
1. whether it is verified and usable under its intended consumption contract (repository-local, or published package);
2. if it needs published package delivery to reach its consumers, whether that has happened (today: Foundation 0.0.1, Guard 0.0.1–0.0.4 only);
3. any open Change that blocks it (examples above).

The Capabilities named in section 4 are the candidates. Which of them DevOps actually requires is part of the design, which waits for `kaal-process`.

## 6. Proposal only: describing DevOps as a Process

Not created by this PLAN:
1. After `kaal-process` has landed with its accepted metamodel, Engineering describes DevOps as an instance of it, coordinated with the Process capability: Activities are the eight stages (Operate per the decision above); Roles are Owner and Worker (a CASE Agent is an actor that may fulfil Worker, and CI is an authorized participant, neither is a Role); States derive from observable facts (PR state, check results, registry state); Transitions are SYNC, promotion and publish, each needing explicit authorization (as today).
2. The design lives in Engineering's own documentation, like PDCA lives with Process. It references the serving Capabilities. No Capability documents it.
3. Realization is claimed only when section 5 holds for the packages the design requires.
