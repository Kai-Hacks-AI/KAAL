# Project map: Architecture

- **project/A1.** `kaal-project/map` exports `map` and `render`, the only realization of this PLAN, as pure functions over plain data. Reading Project Plans from the repository, and choosing which to map, are a later Script-level Change (BASS: Script for what must repeat exactly, Skill guidance for what to include or emphasize). That Change does not change the contract.
- **project/A2.** The output contract (project/F2) is the shape any capability's map can share: typed nodes and typed, owned, sourced relations. Who finally owns that shape is an open Owner decision (D1). Until it is decided, Project uses the shape as stated here and owns no other capability's kinds.
- **project/A3.** Composition is by data, not by import. A consumer, or an agent with Skill guidance, passes Change's map output to Project's `map` (project/F3) or concatenates contracts. Whether Graph provides a generic combine is an open Owner decision (D2).

| Who | Owns |
| --- | --- |
| Change | Change identities, Depends On declarations and lifecycle facts, and the Change map that states them |
| Project | Projects, governance, grouping, project-level sequencing, and this map |
| Program | cross-Project coordination, when realized (no map before it is) |
| Product | priority, desired direction and product-level sequencing, and the Product map |
| Graph | generic traversal and derived views, with no domain meaning |
| Engineering | which maps run where, for example in the review queue |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `project/C2` PLAN, this Change | Project | #279 (merged) |
| DO: `kaal-project/map`, with project/T1–project/T7 GREEN | Project | `project/C2` |
| Change map PLAN and DO, including where Depends On is declared (D3) | Change | Change's Record and Lifecycle |
| Product map PLAN and DO, with the negative case that priority is never dependency | Product | the output contract |
| A Script that reads Project Plans from the repository | Project | the DO Change |

Project's DO does not wait on Change's map: project/T2 gives Change's output as data. The composed scenario across real repositories waits on both.

## Open Owner decisions

- **D1:** who owns the output contract. Graph, as typed Nodes and Edges (recommended), or each capability.
- **D2:** composition by a consumer or agent with Skill guidance (recommended to start), or a Graph-provided generic combine.
- **D3:** where a Change declares Depends On. This is Change's to propose.
- **D4:** the order. Change's and Project's maps first, Product's in parallel (recommended).
