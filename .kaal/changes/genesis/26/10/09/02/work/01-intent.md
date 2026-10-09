KAAL — Briefing: TALL
Intent
Explore TALL — Thinking, Acting, Learning, Living as an organizing architectural model for KAAL.
KAAL is an Agent's persistent body of knowledge and capabilities. The Agent remains the actor.
TALL describes four complementary dimensions of what KAAL enables, not four sequential stages or necessarily four Skills.
The four dimensions
T — Thinking
Enable an Agent to discover, retrieve and navigate relevant knowledge within bounded context.
Candidate specialized Skill: `kaal-thinking`.
Reuse the read-side architecture established in PR #72, particularly `find`, `near` and `show`.
Thinking must not imply that KAAL itself is the reasoning actor.
A — Acting
Enable an Agent to perform governed Work using KAAL's established capabilities.
Acting encompasses Skills, Extensions and Processes rather than requiring a single `kaal-acting` Skill.
Processes compose capabilities and establish authority boundaries through deterministic grants, denials and escalation.
L — Learning
Enable an Agent to establish reusable knowledge from experience and sealed evidence.
Candidate specialized Skill: `kaal-learning`.
Learnings are ordinary Nodes, established through governed Changes and retained in a BRAIN.
Explore CEIL — Cue, Evidence, Insight, Learning — during realization without reopening the architecture agreed in PR #72.
L — Living
Enable an Agent to participate in its wider ecosystem.
This includes interactions with humans, other Agents, external systems, services and sources of information.
Investigate how KAAL's Engineer, Embed and External operating modes, capability acquisition, communication and trust boundaries support this dimension.
Living does not imply that KAAL is an autonomous living entity.
Architectural relationships
TALL must remain consistent with the established KAAL conceptual architecture:

* Core: Node, Edge, identity, type and deterministic operations.
* Sealing: Independent Skill protecting artifact integrity.
* BRAIN: Persistent learning and bounded knowledge navigation.
* Skills and Extensions: Independently meaningful capabilities.
* Processes: Specialized Skills composing capabilities and governing agency.
* Six Ds: Describe Intent, Define Requirements, Design Architecture, Develop Code, Do IT and Detect Defects, framed by Destination, Discovery and Defence.

TALL and the six Ds describe different architectural concerns. Neither replaces the other.
Investigation
Examine:

1. Whether TALL provides a coherent and useful organization of existing KAAL capabilities.
2. Whether Thinking and Learning warrant separate specialized Skills.
3. How Acting differs from Living without creating artificial execution boundaries.
4. How the four dimensions relate to BRAIN, Processes and the three operating modes.
5. Which responsibilities are already established and which remain architectural targets.
6. Whether TALL improves a fresh Agent's ability to discover and use KAAL without Owner explanation.

Scope
This is an architectural investigation, not authorization to establish four new Skills or change Core.
Preserve existing Nodes and previously converged architectural decisions.
Do not introduce new ontology, registries or mandatory mechanisms merely to accommodate the acronym.
For KAAL 0.0.1, prioritize architectural clarity and minimum viable behavior over exhaustive realization.
Acceptance criteria
The investigation demonstrates whether TALL helps explain KAAL coherently, without duplicating existing responsibilities or introducing conflicting authority.
It should identify the smallest useful next realization, particularly for `kaal-thinking` and `kaal-learning`.
Expected result: A recommendation on adopting TALL as KAAL's organizing architectural model, with explicit boundaries, dependencies and consequences for the existing conceptual overview.
TALL remains proposed vocabulary until established through KAAL's governed Change process.
