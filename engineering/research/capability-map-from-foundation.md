# Candidate KAAL capability map, read from Foundation 0.0.2

**Status: PROVISIONAL. A discussion document, not a decision.** It creates no package, moves nothing, adds no refactoring backlog and is not on the Foundation 0.0.2 release path. Every owner below is a *candidate*. Where this document says "recommend", it is one option put to Kai and the CTO, not a ruling. Engineering holds this file under "Engineering can own anything temporarily until its owner is found"; it moves when a semantic owner is chosen.

Responds to the CTO handover "What Foundation Is Teaching Us About KAAL Capabilities", section 5 steps 1 to 4, and the ten questions in its section 4.

## 0. How it was read

- **Foundation 0.0.2** was read at `origin/kaal/foundation` tip `f5bf568` (the collector; 0.0.2 is not on `main` yet). Read, not run.
- **`main`** was read at `251e814` (nine packages: change, core, engineer-skill, foundation 0.0.1, graph, guard, hosting, review, testing). Package dependencies come from each `package.json` there.
- **Collector branches** (`kaal/intent`, `requirements`, `architecture`, `agents`, `learning`, `process`, `roles`, `sealing`, `data`, `packaging`) were read by README only. Several are stale against `main`. A capability that exists only on a collector is marked *collector*, and nothing is claimed beyond its first paragraph.
- The Foundation layout map, the carry-forward inventory and the package-vs-engineering dependency note (project files) supplied context. Where they disagree with the repository, the repository wins and the difference is flagged.
- Terms follow industry usage where one exists (section 8). KAAL's "answered by" is read as "traced to".

Two kinds of owner are kept apart throughout:

- **Semantic owner (candidate):** whose meaning this is, wherever it happens to be written.
- **Implementation owner (today):** whose folder and code hold it now.

## 1. Inventory of Foundation 0.0.2

### 1.1 Node kinds

| Id | Node kind | Where in Foundation 0.0.2 | Candidate semantic owner | Implementation owner today | State of the semantic owner |
| --- | --- | --- | --- | --- | --- |
| **K1** | Capability declaration | `kaal/Foundation.md`, typed `KAAL Capability` | Core (type, admission); the capability (content) | Foundation (bytes); Core (registration) | Exists on `main` |
| **K2** | Intent (`I<n>`) | `01-intent/intent.md` | kaal-intent | Foundation | Collector only |
| **K3** | Requirement, functional `F<n>` and non-functional `N<n>` | `02-requirements/` | kaal-requirements | Foundation | Collector only |
| **K4** | Architecture element `A<n>`, Solution and Delivery trees plus Cross-cutting | `03-architecture/architecture.md` | kaal-architecture | Foundation | Collector only |
| **K5** | Case `T<n>` | `*.test.mjs` beside its Node, titled `foundation/T<n> [<targets>]: ...` | kaal-testing | Foundation (files); Engineering (collector, graph) | Exists on `main`; trace derivation deferred |
| **K6** | Source (realization) | `05-src/skills/kaal-foundation/scripts/` | The capability itself; no "kaal-source" candidate has code or a collector | Foundation | None |
| **K7** | Defect | `06-defects/` (empty, not shipped in 0.0.2) | kaal-testing "for now" (Kai) | Foundation | Deliberately deferred |
| **K8** | Change, each with Intent, Requirements, Architecture, Testing | `00-changes/<change>/` (18 folders at `f5bf568`) | kaal-change | Foundation (folder); Change (semantics) | Exists on `main` |
| **K9** | Boundary Test definition (typed data) | `04-test/boundary-check/boundary-check.md` | What to detect: the capability. Boundary semantics: no owner (M5) | Foundation (what); Engineering (engine) | Open |
| **K10** | Test Plan (Package Check) | `04-test/package-check/testing.md` | kaal-testing | Foundation | Exists on `main` |
| **K11** | Manifest (path to SHA-256, delivered Cases) | `verify.json` | kaal-packaging (C26 shape) | Foundation (writer); Engineering (generator) | Collector |
| **K12** | Ownership claim | `ownership.kaal.json` | Core or Hosting (O2) | Foundation (data) | Ambiguous |
| **K13** | Skill and references | `05-src/skills/kaal-foundation/` | kaal-engineer-skill | Foundation | Exists on `main` |
| **K14** | Agent instructions | `05-src/AGENTS.md`, root `AGENTS.md` | kaal-agents | Foundation; Engineering (root) | Collector |
| **K15** | Computed Case graph | `04-test/engineering-check/cases.json` (generated) | ARTIST, likely kaal-graph (project memory) | Engineering | In Engineering |
| **K16** | Held items ("Held for kaal-packaging/testing/agents") | Sections in K2, K3, K4, indexed by A25 | The target named on each | Foundation, temporarily | Provisional by design |
| **K17** | Evidence record | `00-changes/declaration/evidence.md`, `lexical-evidence`, `structural-evidence` | Open (M2) | Foundation; Engineering (ledger) | Open |
| **K18** | Definitions and types | Core's `KAAL Definition`, `KAAL Skill`, `KAAL Capability` | Core | Core | Exists on `main` |

### 1.2 Edges and traces

| Id | Edge | Direction and form | Evidence | Candidate semantic owner | Implementation today |
| --- | --- | --- | --- | --- | --- |
| **E1** | Case tests Node | Case to the Node it verifies, only that way; `tests` front matter plus title brackets | A23, F40, F42, F43, `cases.json` | kaal-testing (Case); each Node's owner (target) | Engineering computes |
| **E2** | Architecture traces to Requirements and Intents | Bracket list per element | every `A<n>` | kaal-architecture | Text convention, not machine-resolved |
| **E3** | Requirement traces to Intent | Bracket list per requirement | every `F<n>`, `N<n>` | kaal-requirements (planned `Serves` edge, requirements/C10, no DO) | Text convention |
| **E4** | Ownership claim | Path to owner | A27, F21, N11, N12 | Core or Hosting (O2) | Repository data |
| **E5** | Change points to Intent | Change to the Intent it delivers; `Succeeds`, `Delivers` Definitions | Change folders; Change capability | kaal-change | Change on `main` |
| **E6** | Placement: ours/not ours, Delivery/Solution | Property of a leaf, by tree | A22, A25 | None (M1) | Foundation convention |
| **E7** | `moved:` tombstone | One-line pointer; ids never reused | A25, TOMBSTONES (#1298) | Engineering, temporarily (M7) | Engineering |
| **E8** | Content binding | Path to SHA-256, not a Node edge | `verify.json`, declaration content id | Foundation (digest); Packaging (manifest shape) | Foundation, Engineering |
| **E9** | Core registration traces | Instance to instance; each kind's outgoing rule registered by its owner; no incoming field | `core/Registration` | Core | Core |
| **E10** | Held-for | Leaf to its future owner | A25 index | Each target capability | Foundation, temporarily |
| **E11** | Finding to decision | Finding `id` and `digest` to a recorded decision | A20, F36 | Open (M3) | Engineering holds findings; the repository records decisions |

Standing one-way rules: **Cases point to Nodes only; Nodes never point at Cases; Packaging never points at consumers; shipping is computed from Solution placement, not flagged.**

### 1.3 Conventions

| Id | Convention | Source | Candidate owner |
| --- | --- | --- | --- |
| **V1** | Scoped ids `<capability>/<kind><n>`, never reused | all Nodes | Open (M1); Graph for Node identity |
| **V2** | Folder anatomy `00-changes` to `06-defects` | A7 | Open (M1); Packaging C24 requires the test folders |
| **V3** | Cases sit next to what motivated them | A7, C20 | kaal-testing |
| **V4** | `dist/` is the only thing shipped | A6, A26 | kaal-packaging |
| **V5** | Placement: ours/not ours, then Delivery/Solution; held index | A22, A25 | Open (M1) |
| **V6** | Computed, not declared (no `ships`) | A23, A24 | kaal-graph (derivation); Architecture (placement) |
| **V7** | A finding is an observation; "none found" is not compliance | I14, F34 to F37 | kaal-review or kaal-testing (M3) |
| **V8** | Data not code in a definition; no hard-coded target or role | N20 to N22 | The definition's capability; the engine is Engineering's |
| **V9** | Born local, go live, refactor to the correct home, with placement homework | A25 | Open (M9) |
| **V10** | Dependency-free runtime, Node built-ins, no OS knowledge | N2, N6, N7 | Foundation (own bar); Hosting (OS boundary) |
| **V11** | Real parsers, never hand-built interpretation | Boundary Engine, ARTIST | Engineering (standing rule: use before build) |

### 1.4 Execution mechanisms

| Id | Mechanism | Candidate semantic owner | Implementation owner today |
| --- | --- | --- | --- |
| **X1** | SHA-256 library and `kaal-foundation` command | Foundation (permanent, Q3) | Foundation |
| **X2** | Installed verification (`verify.mjs`, independent host SHA-256) | kaal-packaging (C26) | Foundation |
| **X3** | Temporary Case collector (`collect.mjs`) | kaal-testing | Foundation, deleted when Testing's mechanism lands |
| **X4** | Build of `dist/` (`build.mjs`) | kaal-packaging | Engineering |
| **X5** | Case graph computer, ARTIST | Graph, with kind rules handed in | Engineering |
| **X6** | Boundary Engine: parser, detectors `file-identity`, `token-sequence`, `call-with-literal`, scope rules (PLAN #1310) | Open (M5) | Engineering |
| **X7** | Pack, clean install, tamper, publication and release Cases | kaal-packaging (generic); Foundation (own) | Foundation, Engineering |
| **X8** | Pin-behind ratchet, pin transition | kaal-packaging (interim Engineering) | Engineering |
| **X9** | Guard hooks and CI wrappers | The existing kaal-guard (wires checks only) | Engineering, Guard |
| **X10** | Release and promotion | Engineering (the CTO's own lean) | Engineering |
| **X11** | Registration of a declaration | Core | Core |
| **X12** | Filesystem and process access | Hosting | Hosting; Foundation's `verify.mjs` reads files directly today (layout map M7a) |

### 1.5 Lifecycle activities

| Id | Activity | Candidate semantic owner |
| --- | --- | --- |
| **L1** | PLAN, RED, DO (RATS: Requirements, Architecture, Testing aligned before DO) | kaal-change |
| **L2** | Change record: `00-changes/`, `.kaal/changes/`, Change's `Change-Record.md` (three forms, O9) | kaal-change |
| **L3** | Exact-head review and disposition | kaal-review |
| **L4** | Promotion collector to `main`; collector termination and re-cut | Engineering today |
| **L5** | Release and publication (npm, provenance, registry check) | Engineering; Packaging for the package contract |
| **L6** | Pin transition across packages | Packaging (interim Engineering) |
| **L7** | Ownership move with tombstone | Open (M7) |
| **L8** | Finding, then decision | Open (M3) |
| **L9** | Creation, evolution, deprecation, retirement of a capability | Open (M9); not present in Foundation |
| **L10** | Observed gap to reusable improvement | kaal-learning (collector) |

## 2. Candidate capability map

Lean: **Independent** (own package), **Embedded** (an aspect of a named capability), **Shared** (one meaning, several implementers), **Provisional** (stays visibly in Engineering).

### A. Describing a capability

| Candidate | Meaning and Nodes governed | Exists today | Implemented today | Lean |
| --- | --- | --- | --- | --- |
| **kaal-foundation** (handover: structure and conventions) | See M1. **Conflicts with what Foundation is** (O1) | Foundation is the SHA-256 primitives package, "not a utilities bucket" | Foundation | See Q3 |
| **kaal-intent** | K2, target of E3 | Collector only | Foundation (content); Engineering (rule) | Independent or Embedded (Q2) |
| **kaal-requirements** | K3, E3 | Collector only | same | same |
| **kaal-architecture** | K4, E2, E6 | Collector; its README is about architectural decisions, not Foundation's forest model | same | Independent |
| **kaal-contracts** | No Node kind in Foundation | None; "contract" has five meanings (O10) | Hosting, Testing, Packaging, Core, Change | Embedded: glossary first |
| **kaal-source** | K6 | None | each capability | Embedded |
| **kaal-defects** | K7 | None | Testing "for now" | Embedded in Testing; see C5 |
| **kaal-identity** | V1, E8 | Fragments: Foundation (digest), Graph (Node id), Sealing (collector), Core (content id) | four owners | Shared; no new package (Q4) |
| **kaal-ownership** | K12, E4, E7, E10 | Core (claims), Engineering (tombstones) | Core, Hosting, Engineering | Embedded in Core; tombstones provisional |

### B. Engineering and verifying a capability

| Candidate | Meaning and Nodes governed | Exists today | Lean |
| --- | --- | --- | --- |
| **kaal-change** | K8, E5, L1, L2 | `main` | Independent (already) |
| **kaal-testing** | K5, K10, E1, V3 | `main`; C48 trace derivation and C33 coverage accounting deferred | Independent (already) |
| **kaal-guard** (handover: boundary assertions) | K9, X6 | **Name taken** (O3): the existing Guard wires checks to pre-push and CI and "never interprets what a check tests" | Do not reuse the name |
| **kaal-graph** | E1, E9, K15 | `main` | Independent; ARTIST question is Q5 |
| **ARTIST** | K15, V6; requirements traceability and traceability coverage gaps | Built in Engineering | Provisional; likely kaal-graph (project memory) |
| **kaal-engineering** | X3 to X10 | `engineering/` tree, not a package | Provisional by design |
| **kaal-evidence** | K17 | None; four holders (M2) | Embedded in Testing, plus a glossary entry |
| **kaal-review** | L3, L8 | `main`, two Nodes and a Skill, "grants no authority" | Independent (already) |

### C. Delivering and operating a capability

| Candidate | Meaning and Nodes governed | Exists today | Lean |
| --- | --- | --- | --- |
| **kaal-hosting** | X12, the one OS boundary, conformance suite for OS coupling | `main` | Independent (already); the bottom |
| **kaal-packaging** | V4, K11, X2, X4, X8; "measures and describes, decides nothing" | Collector `kaal/packaging` | Independent; owner of most Foundation held items |
| **kaal-release** | L4, L5, X10 | `engineering/release` | Embedded in Engineering |
| **kaal-portability** | N7, BACCHUS, Hosting conformance | Hosting plus BACCHUS | Quality, not a capability (Q6) |
| **kaal-lifecycle** | L9, V9 | Core Lifecycle (install/upgrade/remove) and Change Lifecycle cover different things | Open (M9); name the meanings first |
| **kaal-consumption** | K13, K14, X2 | Pieces in Engineer Skill (BASS), Agents (collector), Packaging, Core Installation Contract | Embedded across those |

### D. Learning and improving KAAL

| Candidate | Exists today | Lean |
| --- | --- | --- |
| **kaal-learning** | Collector; its README already covers retained knowledge | Independent, Knowledge folded in |
| **kaal-knowledge** | Covered by `kaal/learning`; `kaal/roles` is a provisional home for advisor definitions | Embedded in Learning |
| **kaal-process** | Collector: shared Process metamodel (PDCA) | Independent if used; check overlap with Change Lifecycle (O8) |
| **kaal-mnemonics** | Held by four owners: Engineering (BACCHUS, FANATIC, GLUE, MOVE, PROSE, RATS!), Review (HOW ARE WE DOING?, ROWING, TOGETHER WE CAN GO FAR), Engineer Skill (BASS), Change (CHAOS) | Do not decide here; PLAN #1291 is reworking it |

### E. In the repository but not in the handover list

kaal-engineer-skill (BASS, Skill conformance; `main`), kaal-sealing (identity of an artifact from its bytes; collector), kaal-agents (collector; holds F16's target), kaal-roles (collector), plus data, controls, service, product, project, portfolio, communication, slack, branching, security (out of scope here, listed so none is invisible).

## 3. Comparison with what exists

### 3.1 Overlaps (O)

- **O1 Foundation means two things.** The handover's `kaal-foundation` is common structure and conventions. The repository's Foundation is the shared, pure, deterministic primitives; its AGENTS section says a new shared helper belongs to the capability whose meaning it carries. The anatomy is currently a *use* of Foundation as a worked example.
- **O2 Ownership claim.** The layout map names Core for the declaration and claim rows and Hosting for the claim's format. One owner, or a stated split, is needed.
- **O3 "Guard" is taken.** `@kaihacksai/kaal-guard` 0.0.4 wires checks to pre-push and CI. Reusing the name for boundary detection would change an existing package's meaning.
- **O4 Identity has four implementers** (Foundation, Graph, Sealing, Core). They agree only because all use SHA-256.
- **O5 Three kinds of finding:** Testing's `findings.md`, Review's findings and dispositions, and the Boundary Engine's audit findings.
- **O6 Several measurers:** `engineering/{coverage,inventory,report,contracts}`, Testing's `lib/coverage.mjs` and `lib/inventory.mjs`, Packaging's byte measurement. Seams are stated in prose, not in one place.
- **O7 Boundary has three neighbours:** Hosting's conformance suite, Testing's architecture-conformance loop, Engineering's engine. A21 already says a Foundation Boundary Test can become a Boundary Case of BEST.
- **O8 Lifecycle in three places:** Core Lifecycle, Change Lifecycle and Record, and the Process metamodel.
- **O9 Three Change record forms:** Foundation's `00-changes/`, Engineering's `.kaal/changes/`, Change's `Change-Record.md`.
- **O10 "Contract" has five meanings** (Hosting, Testing, Packaging, Core, Change).
- **O11 Learning, Knowledge, Process and mnemonics** overlap (section 2D).

### 3.2 Missing owners (M)

- **M1 The capability anatomy** (folder order, scoped ids, placement, held-items index, Cases beside Nodes). Pieces sit in Packaging C24, Testing C20, Engineering's build and Foundation's tree; nobody owns the whole.
- **M2 Evidence:** four holders, no definition of completeness or relation to a claim.
- **M3 Findings and decisions:** who owns V7, E11 and L8.
- **M4 Applicability:** the parse-scope policy (PLAN #1310) is Engineering's, but its meaning generalises.
- **M5 Boundary as a concept:** definition is data, engine is Engineering's, the meaning has no owner. Recommend Testing, as a Boundary suite of BEST.
- **M6 Kind definitions for Intent, Requirement, Architecture, Defect:** only collectors exist; Foundation's text is the only worked example.
- **M7 Ownership movement:** TOMBSTONES is merged under Engineering; no semantic owner named.
- **M8 Source and Defects as kinds:** no candidate package.
- **M9 Capability lifecycle beyond install:** creation, deprecation, retirement.

### 3.3 Possible dependency cycles (C)

Package facts read from `package.json` on `main` at `251e814`.

- **C1 Runtime graph is acyclic today.** Hosting and Foundation have no dependencies; Core and Change depend on Foundation and Hosting; Graph, Guard, Testing, Engineer Skill on Hosting; Review on none.
- **C2 Dev-time cycles exist on `main`.** Core dev-depends on Graph; Graph on Testing and Engineer Skill; Testing on Core, Graph and Engineer Skill; Engineer Skill on Core and Graph. They never ship. Observation, not a defect.
- **C3 Foundation and the Intent/Requirements/Architecture owners.** Foundation's Nodes must *conform to* those owners' definitions without *depending* on them, since their code needs Foundation's SHA-256. Dev-time conformance checks from Engineering fit; a runtime dependency would be a cycle.
- **C4 Layering text.** Foundation's A1, Intent and declaration still say Foundation and Hosting are siblings; Kai's direction is Hosting is the bottom. No code violates it. Already known (layout map M7).
- **C5 Defect and Architecture edges.** If Architecture answers a Defect and the Defect also names the elements it deviates from, both written as Node edges form a cycle between the same Nodes. Recommend resolution is traced through a Change or a Case (Testing already lets a Case test a Defect, F74), never a back edge.
- **C6 ARTIST and kind owners.** If Graph reads each owner's rules from their packages, Graph depends on all of them while they depend on Graph. Core's Registration already lets each owner register its kinds and outgoing rules with Core reading them as opaque text, so the rules can be handed in.
- **C7 Graph and Core's Kernel.** Graph implements the Node Form that Core's payload states; Core dev-depends on Graph. Worth stating, not changing.
- **C8 Hosting's own SHA-256.** Hosting's `src/index.ts` uses `node:crypto` by decision (hosting/A4). Foundation's `crypto` Boundary Test would find it. A tension with I1, not a cycle, as long as Hosting never imports Foundation.
- **C9 Engineering as hub.** Not a package; dev edges toward it exist in the repository only. The risk is permanence by default.

## 4. Lessons Foundation has demonstrated

| Lesson | Evidence |
| --- | --- |
| Anatomy is more than directory names | A7, A22, N23 |
| One-way relationships | A23, F43 |
| Computed, not duplicated | A23, A24 (`ships` removed) |
| Ownership moves, traceability stays | A25, TOMBSTONES, Held-for sections |
| Use before build | A19, A23 (parser and engine are Engineering's) |
| Observations and decisions are separate | I14, A20 |
| Repository is not consumer | N2, N6, A6, F12 |
| Hosting is the bottom | layout map M7, M7a |
| Evolution through evidence | 18 Change folders, each with its four documents |

## 5. Draft answers to the ten CTO questions

### Q1 What qualifies as a KAAL capability?

- **A.** A separately owned semantic concern.
- **B.** An independently deployable package.
- **C.** A ladder: *concern* (named, owned, has Nodes), then *capability* (admitted by Core), then *package* (released). A concern may stay embedded for ever.

**Recommend C.** It avoids equating capability with npm package, and kaal-review (two Nodes and a Skill) already fits it.

### Q2 Which Node kinds deserve independent semantic owners?

- **A.** Every kind.
- **B.** One capability for the chain (Intent, Requirements, Architecture), with Testing and Change separate.
- **C.** Owners where a collector or `main` presence exists: Intent, Requirements, Architecture, Testing, Change. Source and Defects stay embedded.

**Recommend C**, and revisit B when the three collectors reach `main`: if each stays small, one package is cheaper than three.

### Q3 What should Foundation own permanently?

- **A.** Only the primitives (byte-level SHA-256 and its verification).
- **B.** The primitives plus the anatomy conventions.
- **C.** The primitives; the anatomy is named separately and Foundation remains its reference example.

**Recommend A with C's naming.** Foundation's own I3 says "not a utilities bucket", and the anatomy changes for reasons unrelated to SHA-256. Foundation 0.0.2 stays the worked example without owning the template, which resolves O1 with no rename.

### Q4 Where do Identity, Ownership and Contracts belong?

- **Identity:** Embedded. Digest in Foundation, Node id in Graph, Seal in Sealing; state the seams. No `kaal-identity` package.
- **Ownership:** Embedded in Core (claims); tombstones stay in Engineering. Settle O2 first.
- **Contracts:** glossary first (O10). A capability only if one meaning is chosen to own.

### Q5 Where should ARTIST live?

- **A.** kaal-graph. **B.** kaal-testing. **C.** Engineering indefinitely.

**Recommend A, on one condition:** Graph computes from kind rules the semantic owners hand in (Registration already has the shape, C6) and never defines Intent, Requirements or Architecture meaning. Until then it stays in Engineering, marked provisional. The report is an observation, not a gate.

### Q6 Capabilities versus cross-cutting qualities?

| Item | Recommend |
| --- | --- |
| Portability | Quality, through Hosting and Testing (BACCHUS states the rule) |
| Evidence | Quality of Testing and Review; glossary entry |
| Applicability | Property of the Boundary suite (M4, M5) |
| Lifecycle | Name the three meanings first (O8) |
| Boundary | A suite of BEST under Testing; not "Guard" (O3) |

A concern with no Nodes of its own and no distinct owner decisions is a quality.

### Q7 How do capabilities compose without cycles?

Keep three classes apart: **hard dependency** (in `dependencies`, ships, acyclic), **optional enrichment** (`peerDependencies`; Change's peer on Graph), and **handed in by the caller** (Change's `isolate(proposal, { owners, sources, graph })`; ARTIST's kind rules). **Recommend** stating these in the template, checking them from Engineering, and recording dev-time cycles (C2) as observations only until it is decided they matter.

### Q8 Migration strategy?

- **A.** Move and re-id. **B.** Move, keep ids, leave a tombstone. **C.** Do not move; reference.

**Recommend B** for Nodes and Cases that have an owner (what A25 and TOMBSTONES already do), **C** for content that is the capability's own. Foundation's held items (I4 to I6, F4 to F9, F11, F13, F17, F19, A5) are the proving ground. A Case's `tests` edge is rewritten when it moves, so Packaging never points at Foundation. No migration is proposed here.

### Q9 What belongs in the common template?

In: folder order (V2), scoped ids (V1), placement (V5, V6), Cases beside Nodes (V3), the Change folder shape, the held-for convention. Out: any capability's Nodes, any engine, any role names (N22). Adoption is progressive, each rule satisfiable one at a time, with "not applicable, reason X" a valid answer (the PLAN #1310 pattern). **Recommend** drafting it from Foundation's layout map after 0.0.2 ships, not before.

### Q10 What should remain provisional?

| Provisional item | Held by | Until |
| --- | --- | --- |
| Boundary Engine, scope rules | Engineering | Boundary semantics owner chosen (M5) |
| ARTIST | Engineering | Graph, per Q5 |
| Case collector `collect.mjs` | Foundation, then Engineering | Testing's mechanism lands |
| Pin-behind ratchet | Engineering | Packaging lands |
| Tombstones | Engineering | An ownership owner is chosen |
| Finding and decision records | Engineering | M3 |
| Foundation's held items | Foundation | Packaging, Testing, Agents land |
| Release and promotion | Engineering | Undecided; may stay |

**Recommend** keeping one such table current, updated by the Change that adds or removes an item, so ownership never becomes permanent by accident.

## 6. What this document does not do

- Choose any owner. Every owner here is a candidate.
- Create a package, repository, Change or backlog. Step 6 of the handover is left to the discussion.
- Touch Foundation 0.0.2, its PLAN or its release path.
- Claim external consumer validation. Statements are scoped to the KAAL repository and what a package ships.
- Assess collector content beyond its README.

## 7. Questions for discussion

1. Does Q1's ladder match what Kai and the CTO mean?
2. Should the anatomy (M1) get its own name and owner now, or after Foundation 0.0.2 ships? (Recommended: after.)
3. Which name resolves O3 for the boundary concern? (Recommended: not "Guard".)
4. Are dev-time cycles (C2) recorded as observations only? (Recommended: yes.)
5. Of the 27 candidates, only those that already exist or have a collector look independent today: Change, Testing, Graph, Review, Hosting, Packaging, and the three description kinds in Q2.

## 8. Industry terms used

| KAAL term | Industry term |
| --- | --- |
| answered by | traced to; requirements traceability |
| ARTIST report | traceability coverage gaps; untraced and orphaned elements |
| Case | test case (verification) |
| finding | observation |
| Delivery / Solution | delivery (way of working) / solution architecture |
| Held for | allocated to a future owner |
| tombstone | redirect record |
| collector | integration branch |
