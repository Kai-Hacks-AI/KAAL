# KAAL portfolio: CTO response to the CPO handover (2 Nov 2026)

Evidence date 2 Nov 2026. Inspected: `origin/main` at `d8bdf9b`, every `origin/kaal/*` collector, the open and recently closed PRs, package manifests and READMEs on each collector, and the npm state recorded in project memory (Foundation 0.0.1, Guard 0.0.1–0.0.4; nothing else). I read manifests, docs and PR titles. I did not run any test suite, so "verified" below means a capability's own documents or a merged DO claim verification, not that I re-ran it. Statements of coverage are my reading, with the evidence named so the CPO can disagree.

## 0. Vocabulary

| Term | Meaning here |
| --- | --- |
| Planned | A PLAN or Requirement exists; no code or Node delivers it. |
| In progress | A DO is open, draft, or merged only on a collector and not yet on main. |
| Delivered | On `main`. A merged PR into a collector is **not** delivered. |
| Verified | Delivered and its own conformance, acceptance or installed-package evidence exists. Not re-run for this document. |
| Distributed | Installable by a consumer from npm. Today only Foundation 0.0.1 and Guard 0.0.1–0.0.4. |

Two facts shape everything below. First, `main` carries `kaal-hosting`, `kaal-core`, `kaal-graph`, `kaal-testing`, `kaal-engineer-skill` and `@kaihacksai/kaal-change` under their **pre-rename unscoped names**, while `kaal/hosting` already carries the scoped `@kaihacksai/kaal-hosting`. The Hosting 0.0.1 migration is therefore the gate for most of the portfolio. Second, many capabilities exist only as Nodes and an Agent Skill on a collector that is 47–50 commits behind main.

## A. Work-in-flight inventory

### A1. Capabilities with an owning thread (14)

| Capability | Product objective | Existing work | Implementation | Dependencies | Coverage | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| **Hosting** | One OS boundary: files and commands behave the same on Linux, Windows, macOS | #835 DO, #832 PLAN merged to kaal/hosting; #765 SYNC (draft), #766 prep (draft), #855 step 1 merged; #869, #883 step-2 PRs closed; #885 Testing prep, #884 Change prep open; #751 (C24), #694 (C20) open | Delivered on collector as scoped `@kaihacksai/kaal-hosting` 0.0.1; on main only the unscoped form. Not on npm | Preparation Changes #884, #885 before SYNC steps 2–4; Branching decision (#766) | Covered | **Continue** (critical path; not disturbed) |
| **Foundation** | One SHA-256 and reviewed shared primitives | 0.0.1 published; #848 (C17), #846 merged; #749 (C12), #747 (C13) open; #838 draft | 0.0.1 verified and distributed. 0.0.2 in progress: pin transition planned, DO drafts open | Core pin (#868 draft), Hosting first in publish order | Covered at 0.0.1; 0.0.2 partial | **Continue** |
| **Core** | The smallest working KAAL: Kernel, Node identity, registration, `init`, `verify` | #849 (C46), #843, #856, #865 merged to kaal/core; #868 draft; #827 (C42 navigation) draft | Delivered on main as unscoped 0.0.1; scoped candidate on collector. Docs state fuller mandatory-infrastructure initialization and Engine-entry navigation are **undelivered** | Foundation 0.0.2 pin, Hosting scoped rename, Graph's `form.mjs`/`node.mjs` copied byte for byte | Partly covered | **Continue**; navigation (#827) is the discovery-relevant piece |
| **Guard** | Local `pre-push` and CI gates with one meaning per check | #663 (C129), #665, #753 merged; #577 (C118), #714 (trial), #872 (bridge retire) open | Delivered on main and **distributed** (0.0.4, Trusted Publishing). Publisher suites live under `engineering/guard/` | Engineering owns the hosted impl; Guard owns both | Covered | **Continue** |
| **Packaging** | What KAAL packages are, and boundary assurance | #839, #850, #873 merged to kaal/packaging; #881 (C13), #746 (C10) open; **#686 promotion** to main open | Private 0.0.1; installed verifier checks manifest integrity and Case accounting (#873). Its own F7 remains failed until registry install is possible | Hosting and Foundation on a registry | Partly covered | **Continue**; stays private |
| **Engineering** | Delivery machinery: lanes, Change Isolation, release, SYNC and promotion | Ledger on main (#880, via #875, #862); #866, #851, #844 merged; #854, #857, #859 open; #610 (C5), #787, #810 open; #737 superseded by #878 (merged to collector, promotion follows) | Delivered and verified on main for lanes, release, pack, Change Isolation, Guard impl. C51 adoption, standards register and artifact-API download are in progress | Guard, Packaging, Testing, Hosting | Covered for KAAL's own delivery | **Continue**; coordinate admission routes |
| **Testing** | Case design, execution, evidence and reporting | #693, #718, #847, #863 merged to kaal/testing; #858, #745, #667, open PLANs | Delivered on main (unscoped). On the collector, `/observe`, `/red`, coverage accounting (C33), trace derivation (C48) and composed-Plan execution are **explicitly deferred** from 0.0.1 (#863). Not on npm | Hosting scoped rename (#885) | Partly covered | **Continue** |
| **Process** | The Process metamodel and PDCA | #852 PLAN merged; **#560 promotion** open; #620 PLAN open | Nodes and Definitions on the collector; not on main | Nothing; DevOps design waits on it | Covered in concept; not delivered | **Continue**; #560 is oldest-but-one in the FIFO queue |
| **DevOps** | Delivery loop over PDCA | #851 conceptual PLAN merged to kaal/engineering (`engineering/devops/README.md`) | Concept only, by design. No Capability exists or should | Process landing (#560) | Concept covered; Operate unresolved | **Hold** until Process lands |
| **Review** | Humans and Agents reviewing work | #861, #874, #877 merged to kaal/review; **#882 promotion** open, CPO-approved | Self-contained public Skill, 4 Nodes. Not on main or npm; README follow-up pending | Queue position behind older promotions | Covered | **Continue** |
| **Product** | Supporting the Owner's product direction | #860 PLAN open (Owner-view); `kaal-product` on collector (2 commits, Nodes only) | Planned. Nodes exist, no process or tooling | Process | Partly covered | **Coordinate** with CPO on #860 |
| **Roles** | Provisional CTO and CPO Advisor definitions | #867, #876 merged to kaal/roles | Private `kaal-roles`, not on main or npm; incubation only | Process (Role concept), later owners Engineering and Product | Partly covered (provisional) | **Continue**; SYNC and promotion need Kai's go |
| **Change** | What a Change is, its lifecycle and delivery | Skill and supplied-model isolation on main (#809, #815); #662 (C8) open; #884 open for scoped Hosting | Delivered on main (public `@kaihacksai/kaal-change` 0.0.1). Change Nodes, succession and delivery (#662) not delivered | Hosting scoped rename | Partly covered | **Unblock** via #884 |
| **Graph** | Nodes, Edges, derived indexes, traversal | #879 PLAN merged; #659 (C5, draft), #643-adjacent, **#621 promotion (HELD)**, #823, #825 drafts | Delivered on main (unscoped); consumer contract and installed verification (C5, C6) in progress | Hosting first, then governed SYNC | Partly covered | **Wait** (Route 2, Hosting-first) |

Engineer Skill (`kaal-engineer-skill`): on main, with #845, #853 merged and #864 (npm release readiness) open. It has no thread of its own; its PRs came through the Engineering thread, so I count it as Engineering-held.

### A2. Capabilities and collectors **without** an owning thread

Kai flagged that threads may be missing. This is the full list. "Behind" is commits behind `main`; none of these is on `main`.

| Capability | Collector, state | Contents | Open PRs | Recommendation |
| --- | --- | --- | --- | --- |
| **Agents** | `kaal/agents`, 5 ahead / 47 behind, last 29 Oct | `kaal-agents` 0.0.1: NEW (orientation with little or no prompting), PREACH (Program → Agent → Human escalation), `kaal-agents orient` and `preach check` CLI, Skill, `plan/release-0.0.1` | **#643** (agents/C6 DO: product docs, consumer cases, consumer verification) | **Thread needed now.** It owns the lifecycle's Discover and Escalate responsibilities and has an open DO with no owner |
| **Intent** | `kaal/intent`, 45 ahead / 47 behind | `kaal-intent`: Intent, IDEA, I WON Definitions, Skill; #748 merged | none | **Thread when traceability is prioritized** (see C2) |
| **Requirements** | `kaal/requirements`, 6 ahead | `kaal-requirements`: Requirement Definition, Capability Node; #741 plan (Serves Edges to Intent) merged to collector | none | Same as Intent |
| **Architecture** | `kaal/architecture`, 10 ahead | `kaal-architecture`: Architecture Node, URBAN, Skill, Installation Contract | none | Same as Intent |
| **Project** | `kaal/project`, 1 ahead | `kaal-project`: Project Plan Definition; Nodes only | **#605** (project map PLAN) | No thread yet; Owner confirms scope after Product |
| **Service** | `kaal/service`, 3 ahead | `kaal-service`: Service, Agreement, provides/consumes/composes/covers/underpins | none | No thread; the nearest answer to DevOps' Operate question, so tie to that decision |
| **Learning** | `kaal/learning`, 5 ahead | `kaal-learning`: BRAIN, CICERO, WORK, Skills `kaal-learning`, `kaal-retro` | none | No thread; candidate to pair with Review under one thread if the CPO wants Recover/Learn work |
| **Data** | `kaal/data`, 2 ahead | `kaal-data`: Data Node, ORDER | none | No thread; Nodes only |
| **Controls** | `kaal/controls`, 45 ahead; **separate lineage, no merge base with main** | `kaal-controls`: Control, Realized-by, VARISC, HAPTIC, CATCH ME IF YOU CAN | **#619** (C6: a Control has its Intents) | **Thread needed when #619 is pursued**; HAPTIC is the counterpart to PREACH |
| **Sealing** | `kaal/sealing`, 42 ahead; separate lineage | `kaal-sealing`: Sealing Node, scripts, acceptance tests (depends on `kaal-core`, `kaal-hosting`) | **#271** (SEAL Definition, old) | Needs a decision: Foundation owns SHA-256 and Packaging/Release use digests, so Sealing's place is unclear. Coordinate before any thread |
| **Communication** | `kaal/communication`, 60 ahead; separate lineage, last 19 Oct | `kaal-communication`: Channel, CCCC, Skill | none | No thread; dormant |
| **Security** | `kaal/security`, 32 ahead; separate lineage | Repository-level files (workflows, hooks), no `packages/` capability | none | Not a capability package; no thread |
| **Skills / Genesis** | `kaal/skills`, `kaal/genesis`, last Oct 13–14 | Bootstrap-era collectors | none | Candidates for retirement; no thread |
| **Acceptance, Branching, CI-gates, Dependencies, Bacchus** | `kaal/acceptance`, `kaal/branching`, `kaal/ci-gates`, `kaal/dependencies`, `kaal/bacchus` | Engineering-owned delivery collectors | #810 (ci-gates P2) | Covered by the Engineering thread; no new thread |

The collectors that fork from a separate lineage (Controls, Sealing, Communication, Security, Skills, Genesis, Dependencies, Acceptance, Bacchus) have no merge base with `main`. Each would need a lineage decision before it can be synchronized or promoted. That is an engineering finding, not a product one.

## B. Product coverage assessment

### B1. The five dimensions

| Dimension | Reading | Evidence |
| --- | --- | --- |
| Product vision | **Partly covered.** Intent (CPO view) is recorded in each package's `docs/intent.md`; Product (#860) is a PLAN | Product collector holds Nodes only |
| Agent experience | **Partly covered.** Orientation and escalation exist as a design and CLI on the unthreaded Agents collector; Core has `init`/`verify`; Engine-entry navigation undelivered | `kaal-agents` README; Core README; #827 draft |
| Traceability | **Planned.** Edges exist (Graph on main); Change Isolation by reverse traceability on main (#880); Intent → Requirements → Architecture → Code → Tests → Evidence is **not** connected end to end | #741 (Serves Edges, collector only); #739, #745, #746 open |
| Capability coherence | **Partly covered.** One ownership model (ownership claims, Hosting as sole OS boundary, Foundation SHA-256); but 9 collectors sit outside main's lineage and four main packages are still under the pre-rename name | manifests above |
| Distribution | **Missing for most of the portfolio.** 2 of ~20 packages are on npm; Core, Hosting, Review, Graph, Testing, Change, Engineer Skill are waiting on the Hosting-first publish order | npm state in memory |

### B2. Agent lifecycle

| Stage | Owning capability | Implemented | Planned or assumed | Integration gap |
| --- | --- | --- | --- | --- |
| **Discover** (capabilities, composition) | Core (registration, catalog, `init`/`verify`); Agents (`orient` using Core's catalog); Graph (navigation) | Core `init`/`verify` delivered on main; Graph traversal on main | Core Engine-entry navigation (#827 draft); Agents orientation is collector-only | No installed path from a fresh external repo to "what capabilities exist and how compose" end to end |
| **Understand** (Intent, Requirements, responsibilities, authority) | Intent, Requirements, Architecture (collectors); Roles, Process (Role concept); Product | Definitions exist as Nodes and Skills | Roles incubation; Process landing (#560) | Capabilities define Nodes but nothing reads Intent → Requirement as a chain; **three unowned capabilities** |
| **Plan** | Change (lifecycle, PLAN records); Product; Project | Change Skill on main; PLAN records are the repository convention | Change Nodes/succession (#662); Project/Product plans | Planning is a repository convention, not an Agent-invokable workflow |
| **Execute** (engineering workflows) | Engineer Skill; Hosting; Engineering (BACCHUS, BASS, GLUE) | Engineer Skill and Hosting on main; Engineering conventions documented | `kaal-coding` named in GLUE does not exist (#851) | No Agent-facing "how to build in KAAL" Skill beyond Skill authoring |
| **Verify** (multi-loop testing, product verification) | Testing; Guard; Packaging; Engineering lanes | Embedded/Engineering/External test placement (lanes README); consumer verification vs conformance distinction (verification README); Guard published | Testing `/observe`, `/red`, coverage deferred; external-context tests "none defined"; consumer verification conformance planned (C7) | Product-level verification (does the whole portfolio work in an external repo?) is not owned. Per-package verification is |
| **Recover** | Controls (HAPTIC), Learning (BRAIN, retro), Guard (fail-closed run records) | Guard fail-closed behaviour on main | Learning/Controls on collectors | No capability owns **failure recovery** as a workflow; Guard reports, nothing restores |
| **Escalate** | Agents (PREACH) | PREACH defined; `preach check` CLI on collector | #643 DO | Delivered nowhere; Guard and Core report "cannot judge" but do not link to PREACH |
| **Evidence & traceability** | Testing, Graph, Change, Engineering report/inventory | Test evidence, Change Isolation ledger on main | Trace derivation (testing/C48, deferred), packaging/C10 | Evidence is produced per package; no traced chain from Intent |
| **External-repo install and operation** | Core, Packaging, Hosting, Engineering acceptance lane | Foundation and Guard installable from npm; Core installable from tarballs; Acceptance lane embeds KAAL | Scoped publish order | Core/Hosting/Graph not yet installable by name; no external-repo consumer test of the **portfolio** |

## C. Genuine gaps

None of these is opened as an initiative.

| # | Gap | Evidence | Recommendation |
| --- | --- | --- | --- |
| C1 | **Agent entry and escalation have no thread.** Agents' DO (#643) is open with no owner; PREACH is defined but nothing in delivered packages routes to it | A2, B2 | **Extend**: give Agents a thread (the capability exists; no new capability) and have Core, Guard and Packaging cite PREACH in their "cannot judge" outputs through their own owners |
| C2 | **Intent → Requirements → Architecture → Code → Tests → Evidence is not one traceable chain.** Three owning capabilities have no thread; Serves Edges are planned only on a collector | #741, #745, #746, #739; Graph delivered | **Coordinate** Intent, Requirements, Architecture, Graph, Testing and Packaging. Give the three unthreaded capabilities owners first |
| C3 | **No portfolio-level product verification.** Each package is verified; nothing exercises the whole set in an external repo from installed artifacts | lanes and verification READMEs; Testing "External tests: none defined" | **Coordinate** Engineering (acceptance lane), Testing, Packaging, Core. Natural trigger: once Hosting and Core are published |
| C4 | **Failure recovery has no owner.** Guard and Testing detect; Controls/HAPTIC and Learning describe; no capability owns restoring a failed state | B2 | **Propose** after the CPO decides whether recovery is a capability or a Process (as with DevOps). Do not start |
| C5 | **Lineage split.** Nine collectors have no merge base with main, so none can be synchronized or promoted as is | `git merge-base` | **Coordinate**, owned by Engineering, with Kai's decision per collector (retire, re-base or leave) |
| C6 | **Operate stage undecided** (engineering/devops §4); Service is the nearest candidate | #851 | **Owner decision**, not a build item |
| C7 | **Distribution is serial behind Hosting.** The scoped rename touches Core, Graph, Testing, Change, Engineer Skill, Packaging | #884, #885, #765 | Already in flight; **continue**, do not parallelise |
| C8 | **Core navigation and initialization** documented as undelivered | Core README, #827 draft | **Extend** Core (already owner); sequence after Foundation 0.0.2 pin |

## D. Notes on method and limits

- Every status comes from the git tree and PR titles listed; I did not read each PR body, check CI, or run tests. Where an item says "claimed", it is the package's own doc.
- Package counts: ~20 `kaal-*` packages exist across collectors; main holds 8.
- Nothing here changes a capability's work. The CPO decides which gaps enter the roadmap.
