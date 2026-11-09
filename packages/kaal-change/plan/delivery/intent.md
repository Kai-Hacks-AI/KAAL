# Change Nodes, Succession and Delivery: Intent

This is `change/C1`, a PLAN Change. It ships no code. A later DO Change turns the planned tests GREEN.

The Owner's direction in #kaal (thread "PR dependency map", 2026-10-27) set the invariants:
- KAAL owns the content.
- Each thing has one authoritative owner and no duplicates.
- KAAL is navigable at any time without an extension, and extensions are optional.
- Priority is not dependency.

Engineering's re-evaluation against them found one genuine gap. A Change is not a typed Node, so the relationships between Changes live in prose and tables, such as the "Depends on" column of `engineering/guard/change.md`. Graph cannot walk or reverse them, and "what does this Change hold up" means reading text.

The Owner's review of #280 already placed the identity. Change owns its Change objects, which have a canonical identity and relationships independent of record placement, and a Change Record is an address that links to them.

The Owner's semantic alignment on #530 (comment 6503873746) names the relationships and the delivery criterion. It supersedes this PLAN's earlier "Depends On" wording.

This is `kaal-change`'s first Change with a FANATIC identity. The Changes before it are known by their pull requests and records.

- **change/I1.** A Change can be a typed KAAL Node under its canonical identity `<capability>/C<n>`, owned by Change. It is independent of where its records are kept and of any Git or GitHub realization.
- **change/I2.** **Change B —succeeds→ Change A** is a temporal delivery prerequisite: A must be delivered before B may be considered delivered.
  - B states it, as a typed Graph Edge going out from B, and states only its own predecessors.
  - The incoming view, what succeeds A, is derived, never stated.
  - The whole graph is walkable without Git or GitHub.
  - Succeeds is not a technical package dependency (`Package —depends on→ Package`, Packaging's), and not Project's own sequencing (`before`, Project's).
- **change/I3.** Priority is not succession. Succession constrains delivery, and priority is Product's. A Change Node holds no priority, order or rank. It holds no Lifecycle state and no delivery state, which are read from facts and evidence.
- **change/I4.** Change Nodes are additive and optional. A repository that keeps none behaves as today. Change Records, the Change Lifecycle and Engineering's Branching gate are unchanged. Base branches and a GitHub Project stay optional projections, never a second source.
- **change/I9.** **Change —delivers→ Intent** is the Change's outgoing relationship to the Intent it delivers, owned by Change and stated by the Change alone.
- **change/I10.** **A Change is delivered** when all its applicable required Tests are GREEN, and every Change it succeeds is delivered.
  - **Evidence is Testing's.** Testing owns Test Case, Run and result semantics, and Change never redefines them. GREEN is Testing's `passed`. A Case that was not run, was blocked or skipped, or is not applicable is never counted GREEN.
  - **The scope is explicit.** A Change states which Tests are its required ones. A Change that requires none is never delivered, because having no evidence is never GREEN.
  - **Own tests and delivery differ.** A Change whose own required Tests are GREEN while a Change it succeeds is not yet delivered has satisfied its own tests and is not delivered.
  - **No universal gate.** Being on main, or merged on GitHub, is part of a Change's delivery only when that Change requires a Case for it.
