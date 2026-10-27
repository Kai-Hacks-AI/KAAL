# Change Nodes and Their Dependencies: Intent

This is `change/C1`, a PLAN Change. It ships no code. A later DO Change turns the planned tests GREEN.

The Owner's direction in #kaal (thread "PR dependency map", 2026-10-27) set the invariants: KAAL owns the content, one authoritative owner and no duplicates, KAAL is navigable at any time without an extension, extensions are optional, and priority is not dependency. Engineering's re-evaluation against them found one genuine gap. A Change is not a typed Node, so the dependencies between Changes live in prose and tables, such as the "Depends on" column of `engineering/guard/change.md`. Graph cannot walk or reverse them, and "what does this Change block" means reading text.

The Owner's review of #280 already placed the identity: Change owns its Change objects, which have a canonical identity and relationships independent of record placement, and a Change Record is an address that links to them.

This is `kaal-change`'s first Change with a FANATIC identity. The Changes before it are known by their pull requests and records.

- **change/I1.** A Change can be a typed KAAL Node under its canonical identity `<capability>/C<n>`, owned by Change. It is independent of where its records are kept and of any Git or GitHub realization.
- **change/I2.** A Change states the Changes it depends on, and only those. The statement is a typed Graph Edge going out from the dependent Change. What a Change blocks is derived, never stated, and the whole graph is walkable without Git or GitHub.
- **change/I3.** Priority is not dependency. Dependency constrains readiness, and priority is Product's. A Change Node holds no priority, order or rank, and no Lifecycle state, which stays read from facts.
- **change/I4.** Change Nodes are additive and optional. A repository that keeps none behaves as today. Change Records, the Change Lifecycle and Engineering's Branching gate are unchanged. Base branches and a GitHub Project stay optional projections, never a second source.
