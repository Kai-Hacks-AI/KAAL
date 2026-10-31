---
name: Succeeds
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Succeeds

**Change B —succeeds→ Change A** is a temporal delivery prerequisite: A must be delivered before B may be considered delivered.

B states it, as an Edge of this Definition going out from B's Change Node, and states only its own predecessors. What succeeds A is derived from those Edges, never stated. The Edge pins A's exact bytes, so an edit to A leaves the Edge pinned to bytes no longer present, and that is reported, never repaired.

Succeeds is not a technical package dependency, which is Packaging's, and not a Project's own sequencing. It carries no priority, which is Product's.
