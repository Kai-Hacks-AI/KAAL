---
name: Change
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Change

A Change is one bounded alteration proposed to what KAAL holds. It is not the technology that carries it: a pull request is one realization of a Change, and its merge is one realization of a lifecycle step.

A Change stands on its own. Its intent, design, constraints, evidence and validation are in the Change, and it does not reference the conversation, transcript or handover it came from.

A Change is in exactly one of these states:

- **Defined**: it is bounded and self-contained, and has not yet been offered for integration.
- **Proposed**: it is offered for integration into a target, and its verification and review are pending.
- **Approved**: its verification has passed and someone with the authority to decide has accepted it. A review informs that decision; having reviewed grants no authority.
- **Integrated**: it is combined with the other Changes of its target. Integration does not prove that the Intent it realizes achieved its Outcome.
- **Withdrawn**: it ended without being integrated.

A Defined Change becomes Proposed when it is offered, and a Proposed Change becomes Approved when it is accepted. An Approved Change becomes Integrated, and any Change that is not yet Integrated may become Withdrawn. A Change altered after it was Approved is Proposed again: the approval was of what it was before. Integrated and Withdrawn are final; correcting either takes a new Change.
