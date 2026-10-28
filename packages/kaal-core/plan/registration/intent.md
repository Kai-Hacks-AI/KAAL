# Capability Registration and One-Way Traceability: Intent

This is `core/C24`, a PLAN Change. It ships no code. A later DO Change turns the planned tests GREEN.

The Owner's direction in #kaal (2026-10-24) asked Core for the generic machinery by which content is registered with:

- who holds it;
- the identities it holds;
- its permitted outgoing trace relationships.

This applies across Intent, Requirements, Architecture, Testing, Code, Operate, Review, Defect, Change and every other Capability. Each Capability owns its local semantics and integrity checks. Core resolves references, validates the assembled recursive graph, and derives reverse views rather than duplicating links.

The Owner approved these bounds (2026-10-27) with three clarifications this PLAN keeps:

1. **Core owns registration and its contracts.** It represents and traverses the registered relationships with Graph, and never reimplements Graph.
2. **An artifact's kind is not its business ownership.** An artifact belongs to whoever holds it, not to the Capability that defines its class. `testing/F2` is a Functional Requirement held by Testing. It is never rewritten as `requirements/F2` because it is an F.
3. **Explicit is better than implicit.** That assumptions and decisions may be implicit does not forbid making them explicit. KAAL favors explicit, traceable and verifiable representations.

The Owner's review on #518 (2026-10-28) corrected two commitments of the first draft, and this PLAN is revised to them:

4. **Identity belongs to the defining Capability.** What an artifact of a kind is, and how it is identified, is defined by the kind's owner. `kaal-requirements` defines what a Functional Requirement is and how one is identified, and the repository that uses it supplies the actual requirements. Core requires only what assembly needs, that each identity is unique and resolvable. It prescribes no grammar, and it does not assume that content lives in its kind owner's repository.
5. **No universal trace matrix.** Each kind's owner defines which outgoing traces its kind permits, and may leave the targets open. Testing's rule does not have to enumerate other Capabilities' kinds. A target never defines its incoming traces. Core validates the registered rules and the stated instances, and holds no matrix of its own.

So three things stay apart:

- **the kind definition**, registered by the kind's owner: its name, its outgoing rule, and any `acyclic` declaration;
- **the content instance**, registered by whoever holds the content, a Capability or a consuming repository: its identity, its kind, and its outgoing traces;
- **the generic assembly identity**, which Core forms to tell instances apart: the scope the holder claims, and the identity within that scope, both read as opaque text.

`core/C9` gave Types first-stage ownership: the prefix matches the owning Capability's name. It deferred exclusive claims, collision detection and global graph integrity to this machinery. `core/C9`'s Type states are unchanged here.

- **core/I15.** A holder claims its scope explicitly, and one scope has one holder in an Engine. A competing claim is detected and never resolved silently.
- **core/I16.** Trace rules and trace instances are distinct, explicit and one-way:
  - A rule, registered only by a kind's owner, says which kinds an instance of that kind may trace to, or that it may trace to any registered kind. A trace instance says that one instance traces to another.
  - A trace is stated only by the instance it goes out from.
  - Nothing is traced in reverse, and reverse views are derived.
  - A trace that is not stated is not there, and it is never inferred.
- **core/I17.** Local and global validation complement each other:
  - Each Capability judges what its kinds mean and what its identities look like, and each holder judges its content.
  - Core judges only the assembled graph: who holds what, whether each reference resolves, whether each trace is permitted by its registered rule, and the graph's recursive structure.
  - Neither verdict stands in for the other.
- **core/I18.** Registration is additive and opt-in:
  - An Engine with no registrations behaves exactly as today.
  - No existing check, Guard's included, depends on registration.
