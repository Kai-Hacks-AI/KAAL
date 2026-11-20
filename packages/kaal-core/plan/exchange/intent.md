# Exchange: Intent

This is `core/C51`, a PLAN Change. It ships no code. A DO turns its planned tests GREEN.

The Owner (Kai) renamed the E of CASE. CASE was Capabilities, Agents, Skills and Extensions. It now reads Capability, Agent, Skill, Exchange. This is a change to Core's Definitions, its Kernel and its registration, not only a name in a folder.

- **core/I25.** CASE names four parallel kinds: Capability, Agent, Skill and Exchange. An Exchange is the element that lies across Capabilities: the handovers between them, who hands what to whom, in the way a SIPOC chain states it. An Exchange replaces the Extension. The Extension (a Node that crosses the boundary to an external system) is no kind of KAAL any more.
- **core/I26.** Core defines the kind and registers and discovers it, as for the other three. Core reads nothing of an Exchange's content: which Capabilities it joins, what is handed over, and what verifies each handover are the content of the Exchange, owned by whoever holds it. Engineering applies the kind for cross-capability work, in `engineering/03-exchanges/`. Core does not.

Not in this Change: the Exchanges themselves (Engineering's PLAN), retyping the one Node typed by `KAAL Extension` today (Hosting's), and the CASE kind names Testing's attribution accepts (Testing's). `core/C51` lists them in its change graph and does none of them.
