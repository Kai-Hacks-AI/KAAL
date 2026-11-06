# Witness paths: Requirements

Each Requirement names, in brackets, the Intents it serves.

- **graph/F13** [graph/I10]: `path(successors, from, to)` returns the shortest route from `from` to `to` as a frozen array of identities that starts with `from` and ends with `to`.
  - Among equal-length routes, it returns the one a breadth-first walk along sorted successors discovers first, so the answer is the same in any order of keys or successors (graph/N1).
  - `path(s, x, x)` is `[x]`, whether or not `x` is a key or lies on a cycle.
  - If `to` is not reachable from `from`, it returns `undefined`. An identity that is not a key is an identity with no successors (graph/F4), so `path(s, "x", "y")` is `undefined` for two unknown identities, and `["x"]` if they are the same.
  - It accepts a `Map`, a read-only relation such as the one `reverse` returns, or a plain object (graph/F4, graph/A9). `path(reverse(s), a, b)` therefore reads the route against the edges.
- **graph/N9** [graph/I10]: Termination, cost and purity as for `reach` (graph/N2, graph/N3). No recursion, O((V + E) log(V + E)), the input never changed, the result frozen. Additive (graph/N4): no existing export or Node id changes.
- **graph/Q1** (open): Which consumer will call `path` in its first DO? If none confirms on this PR, `graph/C13` is not started and this PLAN stays as a recorded option.
