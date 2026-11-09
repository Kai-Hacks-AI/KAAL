# KAAL mnemonic inventory (read-only, 9 Nov 2026)

Scope: main (251e814), all 66 `kaal/*` collectors (shallow fetch), and `/mnt/project-files` md. Method: file names, "X (expansion)" patterns, uppercase-token frequency, then reading each definition. Not exhaustive for prose-only mnemonics that carry no acronym pattern; 7P is NOT in the repo at all (only in project memory).

## How mnemonics are represented today
- **Definition Node (best case):** a `.md` with YAML `name:` + `type: {name: KAAL Definition, id: a07df32b…}`, a `# NAME` heading and the expansion as first line. Examples: BASS, BRAIN, CICERO, WORK, KNIFE, ROWING, VARISC, HAPTIC, IDEA, I WON, CCCC, CATCH ME IF YOU CAN, URBAN, ORDER, RATS!, PROSE, GLUE, FANATIC, BACCHUS, CASE, LOVE.
- **Capability-folder prose with Definition-style heading:** PLAN, PDCA, PREACH, NEW, CHAOS (in `capability/` dirs). Same shape, different folder.
- **Prose only, no Node:** HITMAN, CLAUSE (engineering/MOVE.md, guard/README.md), FAR (testing/change plans), REAL (review plan intents), TAKE CORE (strategy/kaal/Product.md on kaal/roadmap).
- **Capability YAML never lists mnemonics.** Capability Nodes have only `name` + `type` (e.g. Change.md). References are prose names/links only. There is no membership/guided-by field today.
- Multi-part mnemonics keep sub-expansions as bullets inside one Node (TOGETHER WE CAN GO FAR, HOW ARE WE DOING?).
- Location is by owner's package (`payload/`), but several live in `engineering/` on main because they are cross-capability.

## Inventory
| Mnemonic | Expands to | Owner | Defined at | Referenced elsewhere |
|---|---|---|---|---|
| BASS | Bare < Agent < Skill < Script | Engineer Skill | packages/skills/kaal-engineer-skill/payload/BASS.md@main | 13 main files, 36 collectors; Kai ruling in package-vs-engineering-dependencies.md |
| BRAIN | Be Right And Improve Network | Learning | packages/skills/kaal-learning/payload/BRAIN.md@kaal/learning | only learning + a few collectors; not on main |
| CICERO | Content In Context Enables Retrievable Overview | Learning | …/kaal-learning/payload/CICERO.md@kaal/learning | 2 branches. Relevant to this design: it already states "overview refers, never relocates or duplicates" |
| WORK | Worker, Owner, Reviewer, Knowledge | Learning | …/kaal-learning/payload/WORK.md@kaal/learning | the word also appears as ordinary "work", so counts are noisy |
| KNIFE | Kernel, Node, Identity, Form, Edge | Graph | packages/skills/kaal-graph/payload/KNIFE.md@main | 3 main files, 33 collectors |
| ROWING | Review Observed Work Intelligent Not Generalized | Review | …/kaal-review/payload/ROWING.md@main | 4 main files |
| HOW ARE WE DOING? | Human Observes Work / Agents Review Each-other / With Experience / Durable Observations Inform Next Goals | Review (hosts; spans Learning, Product, Intent) | …/kaal-review/payload/HOW-ARE-WE-DOING.md@main | 6 main files |
| TOGETHER WE CAN GO FAR | The Owner Gets Enhanced Through Holistic Experience Reviews / Worked Evidence / Changes Adaption Now (earlier Change Adapts Now) / Getting Optimized / Features Accepted Regression (also Feature Acceptance Regression) | Review (hosts; spans Testing, Learning, Change, Intent) | …/kaal-review/payload/TOGETHER-WE-CAN-GO-FAR.md@main | 3 main files |
| VARISC | Verify, Accountable, Responsible, Informed, Sign-off, Consulted | Controls | …/kaal-controls/payload/VARISC.md@kaal/controls | not on main |
| HAPTIC | Human < Agent < Program To Improve Controls | Controls | …/kaal-controls/payload/HAPTIC.md@kaal/controls | main: engineering/controls/README.md, core registration intent |
| CATCH ME IF YOU CAN | Control Agents Through Continuous Hunting Misbehaving Elements, Implementing Fierce Yet Objective Unbiased Checks Against Noncompliance | Controls | …/kaal-controls/payload/CATCH-ME-IF-YOU-CAN.md@kaal/controls | not on main |
| IDEA | Initialize Development Experienced Agents | Intent | …/kaal-intent/payload/IDEA.md@kaal/intent | 2 branches |
| I WON | Intent Worked, Outcome Noticed | Intent | …/kaal-intent/payload/I-WON.md@kaal/intent | 2 branches |
| LOVE | Lifecycle, Ownership, Verification, Encapsulation | Core | packages/kaal-core/payload/core/LOVE.md@main | 20 main files |
| CASE | Capability, Agent, Skill, Extension | Core | packages/kaal-core/payload/core/CASE.md and .kaal/core/CASE.md@main | 35 main files |
| PREACH | Program Reports Errors, Agent Consults Human | Agents | packages/skills/kaal-agents/capability/PREACH.md@kaal/agents | 5 main files (controls, boundaries, core plans) though its Node is not on main |
| NEW | Next Experience Works | Agents | …/kaal-agents/capability/NEW.md@kaal/agents | 2 branches |
| PDCA | Plan, Do, Check, Act | Process | packages/skills/kaal-process/capability/PDCA.md@kaal/process | widely used |
| PLAN | Prioritize, Launch, Adaption, Now | Product | packages/skills/kaal-product/capability/PLAN.md@kaal/product | see conflicts |
| CHAOS | Changes Help Agents Organize Systematically (first form: Changes Helping Agent Orders Systematically) | Change | packages/kaal-change/capability/CHAOS.md@kaal/product; on main referenced in kaal-change Change.md | 6 main files |
| FAR | Features Accept(ed) Regression | Change owns meaning; Testing consumes | prose in kaal-testing plans@kaal/testing; also TOGETHER-WE-CAN-GO-FAR | 35 files |
| URBAN | Use, Rent, Buy, Adapt, New | Architecture | …/kaal-architecture/payload/URBAN.md@kaal/architecture | 2 branches |
| ORDER | Organised Ratified Data Enhances Reliability | Data | …/kaal-data/capability/ORDER.md@kaal/data | 3 branches |
| CCCC | Communicate Content in Context through Channels | Communication | …/kaal-communication/payload/CCCC.md@kaal/communication | 3 branches |
| REAL | Review Enhances Agent Leverage | Review | prose in kaal-review plan intents@kaal/review (two plans) | 1 branch |
| HITMAN | Hooks Integrating Tests, Making Agents Nervous | Guard realizes; "KAAL-wide" | prose: engineering/MOVE.md, guard/README.md@main | 3 main files, 37 collectors |
| CLAUSE | CI Lets Agents Update Service Errors | Guard realizes; "KAAL-wide" | same as HITMAN | same |
| FANATIC | Functional And Nonfunctional Architecture Tests Intended Change | Engineering (names a trace; owns none of its parts) | engineering/FANATIC.md@main | 3 main files |
| RATS! | Requirements, Architecture & Testing Steers | Engineering | engineering/RATS.md@main | 2 main files |
| PROSE | Product, Requirements, Order, Service, Engineering | Engineering | engineering/PROSE.md@main | 2 main files |
| GLUE | General Loose Unified Engineering | Engineering | engineering/GLUE.md@main | 2 main files |
| BACCHUS | Born As Current; Compatibility Has Understood Scope | Engineering | engineering/BACCHUS.md@main | 1 main file; mentioned on 58 branches |
| TAKE CORE | Directions: TAKE (external KAAL), EMBED, CORE | Roadmap/Product (KAAL's own strategy) | strategy/kaal/Product.md@kaal/roadmap; project files portfolio/take-core-*.md | Consumer-defined, not generic. Letters read T-A-K-E / C-O-R-E |
| ESSA | Eliminate, Standardize, Simplify, Automate | Process (for now, Kai 3 Nov) | project files only (package-vs-engineering-dependencies.md, brain-ownership notes); no Node | candidate method, not part of PDCA |
| 7P | Power, Processes, Products, Project, Portfolio, Pull, People | management group | NOT in repo or project files; project memory only | Kai: guide, not capability names |

## Flags
**Conflicts / near-duplicates**
- `WE` is expanded two ways: "Worked Evidence" (TOGETHER WE CAN GO FAR) and "With Experience" (HOW ARE WE DOING?).
- `FAR`: "Features Accepted Regression" (Review) vs "Features Accept Regression" (Testing/Change plans), plus alt "Feature Acceptance Regression". `CAN` likewise has an earlier wording "Change Adapts Now".
- `PLAN` is both Product's mnemonic (Prioritize, Launch, Adaption, Now) and the universal word PLAN for a Change phase / PDCA's Plan. A name lookup for PLAN cannot distinguish them. Its "Now" also overlaps CAN's "Now" and URBAN's "New".
- `NEW` (Agents) vs URBAN's N="New", `ORDER` (Data) vs the word "Order" inside PROSE and CHAOS ("Order versus Chaos"): name collisions with ordinary words/other mnemonics.
- `CASE`, `PLAN`, `GREEN`, `RED`, `CHECK`, `WORK` collide with common words, which makes plain-text retrieval noisy; only a Node/ID resolves them.
- `ACT` (PDCA) vs the ACT/BRAIN decision: separate mnemonics, no conflict, but ESSA is explicitly "not ACT".
- Owner ambiguity: ROWING/HOW ARE WE DOING?/TOGETHER WE CAN GO FAR are hosted by Review but belong to loops across Learning, Testing, Change, Product. HITMAN/CLAUSE are "KAAL-wide" yet owned in prose by no capability (Guard "realizes and owns neither"). Engineering's five (RATS!, PROSE, GLUE, FANATIC, BACCHUS) sit in `engineering/` not in a capability package.
- Naming-form inconsistency: `RATS!` (name has "!"), `I WON` vs file `I-WON`, `HOW ARE WE DOING?` with "?", `name:` fields do not match file stems.

**Unpromoted:** BRAIN, CICERO, WORK (Learning), VARISC, HAPTIC, CATCH ME IF YOU CAN (Controls), IDEA, I WON (Intent), URBAN, ORDER, CCCC, PLAN, PDCA, PREACH, NEW, CHAOS Node live only on collectors; main references some of them (HAPTIC, PREACH, CHAOS) before their Definition exists on main.

**Capabilities with no mnemonic found:** Hosting, Foundation, Testing (FAR only, borrowed), Guard (HITMAN/CLAUSE only as realizer), Graph has KNIFE only, Roles, Security, Service, Requirements, Dependencies, Genesis, Skills, Sealing, Lineage Synchronization, Project, Portfolio, Packaging, Branching, Roadmap (only TAKE CORE as consumer content). Many of these are collector branches with no capability payload yet, so "none" may just mean not built.

**Gaps in my search:** I matched uppercase tokens and "(expansion)" patterns; mnemonics written only as lowercase prose or in issues/PR text were not searched. Project-file md was grep-searched for mnemonic/acronym/ESSA/TAKE CORE/FAR only.
