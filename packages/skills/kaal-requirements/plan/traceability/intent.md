# Traceable Requirements: Intent

This is `requirements/C10`, a PLAN Change. It ships no code and no test file. It answers prerequisite P2 of `engineering/C11` (Change Isolation by reverse traceability, `engineering/change-isolation/traceability.md`) for the relationship Requirements owns: **Requirement → Intent**. Engineering follows incoming traces through Graph and adds no relationship of its own, so the relationship must be a Graph Edge in its source Node, or be derived by its owner.

Architecture → Requirement is Architecture's, because its source is Architecture's element. Requirements states only what Architecture may rely on: Requirement Nodes are addressable by name and id (`requirements/A4`).

What exists today:

| | Today | Gap |
| --- | --- | --- |
| The Requirement | The Definition `Requirement` (#553) says a Requirement may name an Intent it traces to, as a reference that transfers no ownership | No relationship Definition, so the trace has no Graph type |
| Its identification | Every capability's `plan/<topic>/requirements.md` writes `**<cap>/F<n>**` and `**<cap>/N<n>**` by convention | Requirements has not stated the rule. The Owner said on 2026-10-28 that Requirements defines identification rules, while the consuming repository owns the instances |
| The trace | Bracket text after each identifier, such as `[hosting/I4]` | It is prose. Graph cannot traverse it, so Engineering cannot compute impact from it |

- **requirements/I7.** A Requirement's trace to the Intent it serves is a Graph Edge that its owner states, so any capability can follow it in either direction, without parsing prose.
- **requirements/I8.** Requirements defines how a Requirement is identified and what the trace means. The consuming capability owns its Requirements and their Edges. Requirements keeps no store, registry or index of them (#276).
- **requirements/I9.** Moving to Edges is incremental and never blocks a capability that has not moved. A trace that is not yet an Edge is not invented, and Engineering's traceability findings (`engineering/F27`) name what is missing.
