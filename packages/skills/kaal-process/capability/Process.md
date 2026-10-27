---
name: Process
type:
  name: KAAL Capability
  id: 56fe97bfa390114264f234bc3198103cb46da306736200af7bc47c0484bcf02e
---

# Process

Process is the responsibility for the shared Process metamodel: the generic concepts through which any capability describes a repeatable way of working, and what those concepts mean. Its scope is that alone.

Its responsibility starts where a capability describes a way of working that repeats, and ends at the concepts used to describe it. Each capability defines its own processes through this metamodel and keeps their purpose, their specific activities and rules, where they apply, and the decisions taken in them. Describing a process through the metamodel transfers none of that to Process.

It provides the Process Definition and the PDCA Definition. For admission it requires Core's KAAL Capability and KAAL Definition, and nothing else.

Which states a process has and which transitions it allows belong to the capability whose process it is; a Change's lifecycle remains Change's. Evidence and findings are Testing's, review judgments are Review's, and decisions belong to whoever is accountable for them. Process keeps no registry of processes: a process stays in the context of the capability that defines it.
