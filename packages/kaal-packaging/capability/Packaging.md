---
name: Packaging
type:
  name: KAAL Capability
  id: 56fe97bfa390114264f234bc3198103cb46da306736200af7bc47c0484bcf02e
---

# Packaging

Packaging is the capability for how KAAL's deliverables become packages and what those packages are, in any ecosystem: npm today, others such as NuGet when they arrive. It may comprise several independently consumable packages, with semantics in common where warranted and an ecosystem-specific realization where needed. Each package it delivers states its own interface and boundaries.

Packaging measures and describes packages. It decides nothing about them: each product owns its size constraints and optimization decisions, and Engineering owns when a measurement runs and whether any result gates anything. Producing and assembling packages stays Engineering's until a later Change, authorized on its own, moves it here.

Testing measures test evidence; Packaging measures delivered bytes. Neither imports the other.
