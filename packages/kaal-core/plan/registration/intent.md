# Capability Registration and One-Way Traceability: Intent

This is `core/C24`, a PLAN Change. It ships no code. A later DO Change turns the planned tests GREEN.

The Owner's direction in #kaal (2026-10-24) asked Core for the generic machinery by which every Capability registers three things:

- its unique identity and id prefix;
- the artifact identities it owns;
- its permitted outgoing trace relationships.

This applies across Intent, Requirements, Architecture, Testing, Code, Operate, Review, Defect, Change and every other Capability. Each Capability owns its local semantics and integrity checks. Core resolves namespaces and references, validates the assembled recursive graph, and derives reverse views rather than duplicating links.

The Owner approved these bounds (2026-10-27) with three clarifications this PLAN keeps:

1. **Core owns registration and its contracts.** It represents and traverses the registered relationships with Graph, and never reimplements Graph.
2. **An artifact's kind is not its business ownership.** An artifact belongs to the Capability it describes, not to a Capability named for its class. `testing/F2` is a Functional Requirement of Testing. It is never rewritten as `requirements/F2` because it is an F. The owning namespace and the artifact kind are distinct.
3. **Explicit is better than implicit.** That assumptions and decisions may be implicit does not forbid making them explicit. KAAL favors explicit, traceable and verifiable representations.

`core/C9` gave Types first-stage ownership: the prefix matches the owning Capability's name. It deferred exclusive namespace claims, collision detection and global graph integrity to this machinery. `core/C9`'s Type states are unchanged here.

- **core/I15.** A Capability claims its namespace explicitly, and one namespace has one owner in an Engine. A competing claim is detected and never resolved silently.
- **core/I16.** Trace rules and trace instances are distinct, explicit and one-way:
  - A rule says which kinds an artifact of a kind may trace to. A trace instance says that one artifact traces to another.
  - A trace is stated only by the artifact it goes out from.
  - Nothing is traced in reverse, and reverse views are derived.
  - A trace that is not stated is not there, and it is never inferred.
- **core/I17.** Local and global validation complement each other:
  - Each Capability judges what its artifacts mean.
  - Core judges only the assembled graph: who owns what, whether each reference resolves, whether each trace is permitted, and the graph's recursive structure.
  - Neither verdict stands in for the other.
- **core/I18.** Registration is additive and opt-in:
  - An Engine with no registrations behaves exactly as today.
  - No existing check, Guard's included, depends on registration.
