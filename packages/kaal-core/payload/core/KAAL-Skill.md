---
name: KAAL Skill
type:
  name: KAAL Definition
  id: 46fbaf19ec03f357002b029c99171ed0ea456e502f641c22c8338cbf51566fce
---

# KAAL Skill

A KAAL Skill is a Node through which a capability joins KAAL without becoming Core. It specifies the desired behaviour for one capability, so that an agent acts on that capability as KAAL intends.

A Node is a KAAL Skill exactly when its type refers, by name and id, to this Node. A Skill is registered with an Engine by being such a Node and being admitted there, so KAAL's Skills are found by type alone and no other registry is kept.
