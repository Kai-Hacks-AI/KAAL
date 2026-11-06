---
name: Process
type:
  name: KAAL Capability
  id: 56fe97bfa390114264f234bc3198103cb46da306736200af7bc47c0484bcf02e
---

# Process

Process is the responsibility for the shared Process metamodel, the generic concepts through which any capability describes a repeatable way of working and what those concepts mean, and for the management of processes through it. Its scope is that alone: each specific process, and each instance of it, remains owned by the capability whose process it is.

Its responsibility starts where a capability describes a way of working that repeats, and ends at the concepts used to describe it. Each capability defines its own processes through this metamodel and keeps their purpose, their specific activities and rules, where they apply, and the decisions taken in them. Describing a process through the metamodel transfers none of that to Process.

Process may also deliver Process Templates. A Process Template is a reusable process described through the metamodel, with generic phases and expectations, for any capability to adopt. It is not an instantiated process of any capability and not a universal mandatory workflow, and it dictates none of the semantics of Testing, Change, Review, Learning or Engineering. A capability that adopts a template owns its particular process: its adaptations, applicability, conditions, decisions and realization.

It provides the Process Definition and the PDCA Definition, which defines PDCA as a Process Template. For admission it requires Core's KAAL Capability and KAAL Definition, and nothing else.

Which states a process has and which transitions it allows belong to the capability whose process it is; a Change's lifecycle remains Change's. Evidence and findings are Testing's, review judgments are Review's, and decisions belong to whoever is accountable for them. Process keeps no registry of processes: a process stays in the context of the capability that defines it.
