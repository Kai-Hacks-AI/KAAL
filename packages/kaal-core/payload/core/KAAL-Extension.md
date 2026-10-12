---
name: KAAL Extension
type:
  name: KAAL Definition
  id: 46fbaf19ec03f357002b029c99171ed0ea456e502f641c22c8338cbf51566fce
---

# KAAL Extension

A KAAL Extension is a Node through which a capability joins KAAL without becoming Core, as a KAAL Skill does, but as an Extension: Skills and Extensions are registered separately, and the one does not stand in for the other.

A Node is a KAAL Extension exactly when its type refers, by name and id, to this Node. An Extension is registered with an Engine by being such a Node and being admitted there, so KAAL's Extensions are found by type alone and no other registry is kept.

This definition states what makes a Node an Extension and nothing of what an Extension does or of any host or environment it relates to.
