# DevOps as a Process KAAL serves

Evidence date 2 Nov 2026. Inspected: main, kaal/engineering at `8b1e081`, the kaal/* collector branches, open PRs, and the npm registry. Ratings are the author's judgment, with the evidence named so a reviewer can disagree.

## 1. What DevOps is here

The repository never mentions DevOps. This document proposes how to read it.

DevOps is a **Process**, like PDCA: a repeatable way of working in which KAAL Capabilities are delivered. It is not a Capability, so it has no thread, collector, package or version of its own. A Capability is delivered *into* it and *by* it.

- **Owner of the description.** If described in KAAL, the description belongs where the delivery engine lives: Engineering (verification lanes, Change isolation, release engine). The metamodel (Process, Activity, Role, State, Transition, Entry and Exit conditions) belongs to the Process capability. Process keeps no registry, and describing a process as a Process makes nothing mandatory.
- **Registry state** was read from registry.npmjs.org on the evidence date and goes stale; re-check before relying on it.
- **Not a new count.** The "8" is eight stages of the loop. The capabilities serving them are many-to-many with stages.

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

## 3. Stage by stage: what serves it, how well, gaps

Ratings: **Strong** means on main with tests and CI; **Partial** means present but on a collector branch only, or a piece is missing; **Gap** means nothing serves it.

### Plan
- **Serves:** Change (PLAN records, C numbering, scope), Intent, Requirements, Architecture (RATS! alignment), Product (PLAN Definition), Process (PDCA), Project (map), Data (ORDER).
- **Rating:** Partial. Change is on main (0.0.1, #662 open). The others are 0.0.1 packages on collector branches only, unpublished.
- **Gap:** no execution of RATS! alignment as a check; Testing's RED-before-code step is a procedure, not a gate.

### Code
- **Serves:** Engineer Skill (authoring guidance, #845), Hosting (all OS access, writer footprint, #835), Foundation (the one SHA-256), Core (Nodes, admission), Agents (kaal/agents).
- **Rating:** Partial. **Gap:** GLUE's `kaal-coding` does not exist; code-level conventions live in Engineering docs (BACCHUS, scripts assessment #844) rather than a capability.

### Build
- **Serves:** Packaging (the generic KAAL Package contract, #686 promotion pending), Engineering (`engineering/delivery/pack.mjs`, Release workflow building Hosting by directory, #834), Foundation (digests), Core (manifest and delivery scripts).
- **Rating:** Partial. **Gap:** trusted migration admission (#834 follow-up) is still unproved, so build identity depends on Engineering's route (#833). Packaging has no package (#850 recommends private).

### Test
- **Serves:** Testing (lanes, verifiers, coverage and applicability, #693, #667), Guard (declared suites, fail-closed run records, #663), Engineering (lanes, `KAAL Main`/`KAAL Lineage` gates, coverage, mutation evidence), Graph (reach and cycle checks).
- **Rating:** Strong on main. Open: coverage meaning (#667, #745), Windows applicability (#577).

### Release
- **Serves:** Engineering (Release workflow, promotion, Lineage), Packaging, Sealing (identity of files and directories), Change (delivery and succession), Guard release lineage.
- **Rating:** Partial. **Evidence:** the registry shows `@kaihacksai/kaal-foundation` 0.0.1 (31 Oct, manual publish, no provenance) and `@kaihacksai/kaal-guard` 0.0.1 to 0.0.4 (0.0.2 onward via GitHub Actions Trusted Publishing with provenance). Hosting, Core, Graph, Change, Testing and Engineer Skill are not on the registry (404). Hosting registry publish is the blocker for most of them.

### Deploy
- **Serves:** Core (Installation Contract, `kaal register`, `kaal verify`), Hosting (installs and writes), Engineering (SYNC and promotion between branches).
- **Rating:** Partial. KAAL deploys into a consumer repository's Engine, not into a runtime environment.
- **Gap:** no rollout, rollback or environment concept. Whether KAAL needs one is a product question, not assumed here.

### Operate
- **Serves:** nothing. Service (Agreement, composes, covers, underpins) is the nearest, and is a collector branch only. Hosting covers local execution, not operation.
- **Rating:** Gap. GLUE names `kaal-operations`, which does not exist.

### Monitor
- **Serves:** Review (HOW ARE WE DOING feedback loop), Learning (BRAIN), Controls, Graph (traces), Guard run records, Engineering (report, inventory, timing).
- **Rating:** Partial: it monitors the *delivery of KAAL* well, not the *behavior of delivered Capabilities in use*. **Gap:** no telemetry or defect-intake route from consumers back to Intent.

## 4. Where it leaves KAAL

- KAAL serves **Test** well, **Plan, Build, Release, Monitor, Deploy and Code** partly, and **Operate** not at all.
- The largest structural gap is that most serving capabilities are on collector branches and unpublished, so DevOps for them stops at Release.
- The shortest path to fewer gaps is delivery order (Engineering #834, Foundation 0.0.2, Hosting 0.0.1, then Graph, Core, Change, Testing, Guard, Packaging, Engineer Skill), not new capabilities.

## 5. Proposal only: describing DevOps as a Process

If Kai wants it recorded in KAAL:
1. After the Process capability reaches main (#560), Engineering describes DevOps as a Process: Activities are the eight stages; Roles are Owner, Worker, CI and Agent; States derive from observable facts (PR state, check results, registry state); Transitions are SYNC, promotion and publish, each needing explicit authorization (as today).
2. The description lives in Engineering's own documentation, like PDCA lives with Process. No new Capability, package or collector.
3. Each Capability then states in its own docs which stage(s) it serves. Nothing is mandatory.
4. Open Owner decisions: whether Operate needs an owner at all, and whether `kaal-coding` and `kaal-operations` should exist.

None of this is created by this PLAN.
