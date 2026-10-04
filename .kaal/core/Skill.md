---
name: Skill
type:
  name: KAAL Definition
  id: 17bf407006223729ebcfa04476cb1ef9f0012a9f352d6a14ad37c43fde73f53a
---

# Skill

A KAAL Skill is a Node through which a capability joins KAAL without becoming Core. It is the Skill step of BASS in Agent a091987f548f479b884c5188285dd08d1be1846ec400c06ff28bb7db9b361eb5: it specifies the desired behaviour for one capability, so that an agent acts on that capability as KAAL intends.

A Node is a KAAL Skill exactly when its type refers, by name and ID, to this Node. KAAL's Skills are therefore found by Node type alone, as KAAL Definitions are, and a Skill belongs to KAAL by being such a Node. This is the registration that the Skills dimension of CASE 6cffa01b750f77878b45ffc568824518711a1da10a579e8650b6847f357ebf60 provides.

KAAL Skills conform to the Agent Skills standard. KAAL does not define a competing Skill format: the Node carries what the capability means to KAAL, and the Agent Skill, as that standard defines it, is the agent-facing form that realizes the capability.
