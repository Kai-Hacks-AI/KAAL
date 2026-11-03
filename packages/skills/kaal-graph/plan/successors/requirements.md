# Nodes as a structure: Requirements

Each Requirement names, in brackets, the Intents it serves.

- **graph/F14** [graph/I11]: `graph.successors({ type })` returns the relation from each held Node's id to the ids of the Nodes its Edges point to, as a read-only relation with Map's reading interface, the same kind `reverse` returns, so it composes with `reach`, `reverse`, `cycles` and `path` without conversion (graph/F4, graph/A9).
  - Every held Node is a key, including a Node with no Edges, whose value is empty.
  - `type` is an optional Edge type id, with the meaning it has in `traverse`: only Edges of exactly that type count. Without it, every Edge counts.
  - A target that is not held in the graph is left out, as `traverse` leaves it out. Reporting unresolved references stays `check()`'s job.
  - Each Node's targets are sorted and without repeats. The relation is the same whatever order Nodes were added in (graph/N1).
  - Direction is not an option. The incoming relation is `reverse(graph.successors(...))`, derived and never stored (graph/F3).
- **graph/F15** [graph/I11]: Consistency with `traverse`. For every held Node `x` and any `type`, the set `reach(graph.successors({ type }), x.id)` equals the ids `graph.traverse(x.id, { type })` yields.
- **graph/N10** [graph/I11]: Purity and cost. The input graph is unchanged and the result is frozen. Cost is O((V + E) log(V + E)), as for the structural functions (graph/N2, graph/N3). Additive (graph/N4): no existing export, Node id or CLI behaviour changes.
- **graph/Q2** (open): Which consumer will call `successors` in its first DO (Core's cycle check, Intent or Requirements traceability, Engineering's impact)? If none confirms on this PR, `graph/C15` is not started and this PLAN stays a recorded option.
