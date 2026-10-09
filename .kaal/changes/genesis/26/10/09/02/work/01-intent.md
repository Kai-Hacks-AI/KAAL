# Intent — Persist the Conceptual Architecture Overview

Establish the agreed KAAL conceptual architecture overview as a persistent, version-controlled and discoverable artifact in the KAAL repository.

The supplied diagram is the visual reference. Preserve its three-column layout, content, hierarchy and restrained color scheme.

The overview describes KAAL's target architecture, not an inventory of implemented capabilities.

## Proposed location

```
KAAL/
├── README.md
├── architecture/
│   ├── README.md
│   ├── overview.svg
│   └── overview.md
```

Treat this as a proposal, subject to checking existing repository conventions and avoiding duplicate architectural authorities.

## Requirements

1. Canonical visual: Maintain the diagram as an SVG, preserving the supplied layout and colors. Prefer a maintainable source representation over an embedded raster image.
2. Agent discoverability: Make the overview reachable from the root README and existing repository entry points where appropriate.
3. Architectural explanation: Document the meaning of the diagram in `overview.md`, including the distinction between target architecture and implemented capabilities.
4. Three-column structure:
   * Agent: Thinks and acts across KAAL.
   * KAAL: BRAIN, Core, Skills, Extensions, Processes, and Engineer / Embed / External operating modes.
   * Six Ds: Describe Intent, Define Requirements, Design Architecture, Develop Code, Do IT, Detect Defects, framed by Destination, Discovery and Defence.
5. Responsibility boundaries:
   * KAAL is an Agent's persistent body of knowledge and capabilities; the Agent remains the actor.
   * Core owns Node/Edge semantics, identity, type and deterministic operations, including admission.
   * Sealing is an independent Skill.
   * Processes are specialized Skills that compose capabilities and establish governed agency.
   * Deterministic Process grants, denials and escalation are an emerging requirement, not an implemented guarantee.
   * BRAIN supports persistent learning and bounded knowledge navigation.
6. No implementation claims: Do not suggest that every depicted capability already exists or is complete.
7. No competing authority: The overview is an architectural projection, not a replacement for established Nodes or their definitions.

## Governance

Investigate existing repository conventions and the current `kaal/genesis` development lineage before selecting the final location.

Use KAAL's established Change process. Do not directly modify `main`, bypass governance or alter sealed Nodes.

The diagram itself need not become a sealed Node unless existing KAAL rules establish that requirement.

## Scope

This Change concerns architectural documentation and discoverability only.

Do not implement missing capabilities, introduce new Core semantics or redesign the agreed architecture.

## Acceptance criteria

A fresh Agent entering the KAAL repository can:

* Find the canonical overview without Owner guidance.
* Understand the relationship between Agent, KAAL and the six Ds.
* Distinguish architectural intent from implemented functionality.
* Navigate to authoritative definitions rather than treating the diagram as a second source of truth.

The visual must remain readable, scalable and consistent with the supplied reference.

Expected outcome: One maintained architectural overview, accessible to humans and Agents, without duplicating KAAL's established architectural authority.
