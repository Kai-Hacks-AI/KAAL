---
name: Agent
type:
  name: KAAL Definition
  id: 17bf407006223729ebcfa04476cb1ef9f0012a9f352d6a14ad37c43fde73f53a
---

# Agent

Agent is the dimension of CASE 6cffa01b750f77878b45ffc568824518711a1da10a579e8650b6847f357ebf60 that defines how agents use KAAL. It connects an agent to KAAL through the instructions the agent receives, so that the agent can act through KAAL's meanings and capabilities. Those instructions point into KAAL rather than reproduce it: what they mean stays in KAAL's own artifacts.

## BASS

Agents play BASS: Bare < Agent < Skill < Script. BASS is an escalation ladder of desired behaviour. Each step specifies more of the desired behaviour and leaves less of it to the agent's discretion. The `<` orders prescription; it is not containment.

- **Bare** is the agent as its provider supplies it, with the least additional prescription.
- **Agent** is the Bare agent steered through instructions.
- **Skill** specifies desired behaviour for a particular capability or kind of work.
- **Script** encodes desired behaviour as an executable procedure, the most prescribed step.

A Skill may use a Script, but a Script need not be inside a Skill.
