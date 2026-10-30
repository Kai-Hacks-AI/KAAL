# Structural Reach and Cycles: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **graph/F1** [graph/I1, graph/I2]: `cycles(successors)` reports every cycle of a directed structure as the strongly connected components that contain one:
  - A component of two or more members is reported, and so is a single member with an edge to itself.
  - Each reported cycle lists its members once, sorted. The cycles are sorted by their first member.
  - A member that lies on several cycles appears in exactly one component. Paths are never enumerated.
- **graph/F2** [graph/I2]: `reach(successors, start)` yields `start` and every identity reachable from it, each once, breadth-first along sorted successors. It terminates on a cycle.
- **graph/F3** [graph/I2]: `reverse(successors)` derives the predecessors of every identity, sorted. Incoming relationships are always computed and never stored.
- **graph/F4** [graph/I2]: An identity is any string. `successors` maps each identity to the identities it points to, as a `Map` or a plain object. A successor that is not a key is an identity with no successors. Resolving or refusing it is the caller's job.

## Nonfunctional

- **graph/N1** [graph/I1]: Determinism. The same structure gives the same result in any order of keys or of successors.
- **graph/N2** [graph/I1]: Termination and cost. Each function terminates on any structure, cyclic or not, without recursion, so that depth never exhausts the stack. Its cost is O((V + E) log(V + E)): sorting identities and successors for a deterministic order (graph/N1) is O(V log V + E log E), and the walk after it is O(V + E). No bound tighter than that is promised.
- **graph/N3** [graph/I1, graph/I3]: Purity. A call never changes its input. It reads nothing from the host, and returns frozen results of the caller's own.
- **graph/N4** [graph/I3]: Additive. Every existing export and Node id is unchanged, and Graph's existing tests stay GREEN.
