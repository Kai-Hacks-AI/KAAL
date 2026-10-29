# Project map: Architecture

- **project/A1.** `kaal-project/map` exports `map` and `render`, the only realization of this PLAN, as pure functions over plain data. Reading Project Plans from the repository, and choosing which to map, are a later Script-level Change (BASS: Script for what must repeat exactly, Skill guidance for what to include or emphasize). That Change does not change the contract.
- **project/A2.** Each capability owns the contract and the meaning of the map it delivers. Project owns Project's map contract (project/F2), Change owns Change's, and Product owns Product's. Matching shapes or terms transfer no ownership. Graph owns Graph's own semantics, its Nodes, Edges, traversal, reverse views and cycles. It may serve as a mechanism, but it is not the semantic authority for any map. Any shared interoperability contract would need explicit agreement and a separately justified owner, and this PLAN proposes none.
- **project/A3.** Composition is by the consumer or an agent, through explicitly agreed interfaces. For Change, that interface is the complement `{ has, dependsOn }` of project/F3, matching change/F5 (#530). It is to be aligned with Change before either DO relies on it. Composition keeps each relation's qualified identity, provenance and owning authority. A Graph-provided generic combine is neither authorized nor required. A same-term or cross-capability conflict of meaning is surfaced for negotiation under PREACH, never resolved automatically.

| Who | Owns |
| --- | --- |
| Change | Change identities, the Depends On relationship and its facts (#530), and Change's own map contract |
| Project | Projects, governance, grouping, project-level sequencing, and Project's map contract |
| Program | cross-Project coordination, when realized (no map before it is) |
| Product | priority, desired direction, product-level sequencing, and Product's map contract |
| Graph | Graph semantics: Nodes, Edges, traversal, reverse views and cycles, usable as a mechanism and never as another capability's semantic authority |
| Engineering | which maps run where, for example in the review queue |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `project/C2` PLAN, this Change | Project | #279 (merged) |
| DO: `kaal-project/map`, with project/T1–project/T7 GREEN | Project | `project/C2` |
| `change/C1`, Change Nodes and Depends On (#530) | Change | — |
| Product map PLAN and DO, with the negative case that priority is never dependency | Product | Product's own contract only |
| A Script that reads Project Plans from the repository | Project | the DO Change |

Project's PLAN does not wait on #530. project/T2 passes a Change complement as plain data. Before Project's DO relies on `{ has, dependsOn }`, that interface is aligned with Change. The composed scenario across real repositories waits on both DOs.

## Owner alignment (on #605, 2026-10-29)

- **D1:** each capability owns its map's contract and meaning. There is no universal Graph-owned output contract.
- **D2:** composition is done by the consumer or an agent, through agreed interfaces, preserving qualified identity, provenance and authority. There is no Graph combine.
- **D3:** Change defines and owns Depends On (#530), and Project consumes its declared facts.
- **D4:** Change and Project plan independently, with Product in parallel. Any shared interface is aligned before a DO depends on it.

There is no open decision on shared contract ownership: this PLAN proposes no shared contract.
