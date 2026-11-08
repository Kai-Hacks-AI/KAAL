# Strategy model PLAN: persist TAKE CORE as consumer Nodes, extract Roadmap first (provisional number 26/11/08/01)

Capability: Roadmap (`kaal-roadmap`, not yet created). Delivery collector: `kaal/roadmap` (not yet created; its creation is Owner-reserved). Destination: collector, then main by its own promotion. Provisional number; recheck at landing.

Status: proposed for CPO review. Markdown only. Nothing here starts implementation, a package, a script, a gate, promotion or publication.
Authority: CPO accepted the architecture and authorized a bounded PLAN with TAKE CORE as first consumer (8 Nov 22:04). Owner (Kai, 22:05) decided option A: `strategy/kaal/` is the location, and `kaal-roadmap` is created as an independent capability with its PLAN before the Portfolio DO.

## 1. Intent
Persist KAAL's own product strategy and roadmap in Git, usable before any of the four capabilities exists, and develop the reusable capabilities backwards from that real use.

## 2. Decided
1. Location: `strategy/kaal/` at the repo root is KAAL's authoritative product strategy. `.kaal/` is the installation/consumption environment and holds no strategy.
2. Order: Roadmap first, as an independent capability, then Product, Portfolio, Project alignment. Portfolio PLAN #1211 stays approved; it needs the ownership amendment in section 4. Creating the `kaal-roadmap` collector and thread is a separate Owner/Engineering act, not done by this PLAN.
3. Packaging undecided until contracts have been exercised. Four capabilities do not imply four npm packages.
4. Moving the location later: a governed Change moves the files; Node identity is title + location, so links are re-parsed and `kaal-graph check` must report no unresolved reference afterwards; history is kept through the move (rename, not copy and delete); Decisions are not rewritten, a new Decision records the move. Cost is low while few Nodes exist, which is a reason to exercise early.

## 3. Boundaries
| Capability | Owns | Does not own |
|---|---|---|
| Product | identity, value, outcomes, boundaries | sequencing |
| Project | bounded undertaking, exit condition | generic roadmap semantics |
| Roadmap | milestones, dependencies, sequence, checks | product strategy, project purpose |
| Portfolio | membership, shared dependencies (identified), contention, cross-subject priorities | roadmap sequencing, planning meaning of `depends-on` |
Each works alone. Profiles are optional: using Roadmap never requires Product, Project or Portfolio.

## 4. Ownership amendment to #1211 (to be proposed as its own PLAN edit)
Roadmap owns Sequence, Dependency (one `depends-on`, with its planning semantics) and Milestone. Portfolio identifies shared dependencies by citing Roadmap's type, and keeps cross-subject priority and blockers. Portfolio's "shared base" role narrows to membership, relations and contention. Project's Ordering and Product's roadmap concept cite Roadmap; Project wording change is its own Change in a later step.

## 5. Content rules
- Declared (persisted): outcomes, intended milestones, dependencies, sequence, mechanisms, milestone checks.
- Judgment (persisted with provenance): dated Decisions and Assessments recording who decided, what, and supporting references.
- Derived (computed, never stored): CI, merged status, published versions, ledger, npm.
- A Milestone stores the check, not the result. A historical Assessment may cite a derived result as dated evidence; it must never become a competing live status record.
- Hierarchy is containment by location (Product > Outcome > sub-Outcome). Everything else is an Edge. Sequence is one ordered list in the Roadmap Node (Graph sorts Edge targets). Product Outcome to Intent is traceability by Edge, many to many, not containment.
- An order-versus-dependency check is advisory, never a gate.

## 6. KAAL's consumer model
```
strategy/kaal/
  Product.md                          type Product
  types/Direction.md, Mechanism.md    KAAL-defined extensions, ownership claim names KAAL
  outcomes/take/                      External KAAL (Transfer Agent Knowledge)
  outcomes/embed/into-others.md       Embed 2.1
  outcomes/embed/into-kaal.md         Embed 2.2
  outcomes/core/                      Engineer KAAL
  mechanisms/npmjs.md, main.md        npmjs serves Embed; main serves Engineer
  roadmap/Roadmap.md                  Sequence + Milestones with checks
  decisions/                          dated Decisions with authority
```
Direction (outside to inside), Mechanism and Sequence (release order runs the other way) are separate Node kinds; neither overwrites the other. External and consumer observations stay in their owner's location and are referenced, never copied. An Edge transfers no authority; content becomes KAAL-authoritative only through a KAAL-owned Decision plus a governed Change.

## 7. Exercise and acceptance
Exercise A (KAAL product roadmap) succeeds when we can:
1. record TAKE CORE's current direction and target outcomes;
2. record a genuine product decision with authority and provenance;
3. change the Roadmap Sequence because of that decision;
4. reconstruct why the sequence changed from Git alone;
5. obtain current delivery status without copying GitHub, ledger or npm data into the roadmap;
6. keep consumer-owned content outside KAAL's authoritative boundary.
One real roadmap decision in Git, traceable to its authority, readable without any conversation, is success.
Exercise B (Project roadmap): the Graph rename path bridge (3 steps, bounded target, ordered transitions, evidence, explicit completion condition) is expressed with the same Roadmap and a Project profile, without KAAL's TAKE/CORE vocabulary.
Further acceptance expectations: KAAL's Direction and Mechanism types are recognizable as consumer-defined extensions, not generic Roadmap types; every generic contract must be writable without the words TAKE, CORE, npm or main (extraction criterion); a second-consumer write-up ("Acme Notes": funnel strategy, one mechanism, Product + Roadmap + a terminal project Roadmap + Portfolio) passes that criterion.

## 8. Development sequence
1. This PLAN, CPO alignment, then Owner go to persist (step 2 is a separate Change).
2. Persist TAKE CORE under `strategy/kaal/` as plain Nodes. Needs only Graph, Core and Change on main.
3. Exercise A and B on real decisions.
4. Extract contracts: Roadmap, then Product, Portfolio, Project alignment.
5. Implement each as its own PLAN/DO, Markdown and Skill first. Each needs Owner go and CPO review.
6. Migrate the consumer onto the contracts, preserving names, locations and history.

## 9. Out of scope
Implementation of Product, Portfolio, Project or Roadmap; scripts; packages; npm; gates; promotion; publication; changes to Project, Roles or Engineering contracts; collector creation; any dependency on unfinished capabilities.

## 10. Risks
Conflating Direction, Mechanism and Sequence; derived state going stale in files; duplicate truth with project memory and ledger (Decision Nodes become the Git home, memory keeps pointers); abstraction from one consumer (mitigated by Exercise B and the Acme write-up); name collisions (Capability, `Serves`, Intent vs Outcome); Project has no thread or main lineage; ceremony of Changes per edit.

## 11. Landing (proposal)
PLAN record under `.kaal/changes/<capability>/26/11/<dd>/NN/README.md` in the format of existing records. Collector: the `kaal/roadmap` collector once the Owner creates it; until then the PLAN waits as this file. No PR is opened by this note.

## 12. Verified by / Validated by

Markdown only; required checks on this PR. CPO review of product meaning (approved at contract level 8 Nov); Owner review of the new-capability boundary. Approval does not authorize the persistence Change, implementation, packaging, publication or promotion.
