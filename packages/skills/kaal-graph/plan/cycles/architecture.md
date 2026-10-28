# Structural Reach and Cycles: Architecture

Each element names, in brackets, the Requirements it answers.

- **graph/A1** [graph/F1–graph/F4, graph/N3]: A new module, `skills/kaal-graph/scripts/structure.mjs`, holds `cycles`, `reach` and `reverse`, with their types. The package root `kaal-graph` re-exports them from `edges.mjs`, beside `Graph`. The module imports nothing, not even another Graph module.
- **graph/A2** [graph/F1, graph/N1, graph/N2]: `cycles` is Tarjan's strongly connected components algorithm, written iteratively with an explicit stack. Identities and successors are sorted first, so the result does not depend on input order.
- **graph/A3** [graph/I2]: **Stop 1.** Graph adds no name-only reference kind, which matches Graph's position on #352. Core gives its registered artifacts as `successors` keyed by their names, such as `testing/F2`. Then `reach` serves `core/A26`'s `reach`, `reverse` serves `incoming`, and `cycles` serves `cycles`. The `Graph` class keeps holding Nodes, so `core/A27`'s use of `in()`, `traverse` and `check()` for artifacts becomes these functions. Resolving names stays Core's (`core/F52`).
- **graph/A4** [graph/N4]: `Graph#traverse`, `check` and the rest of `edges.mjs` are untouched. A `Graph#cycles` over Node Edges is not part of this Change.

## Change graph

| Change | Owner | Waits on |
| --- | --- | --- |
| `graph/C2` PLAN (this) | Graph | `core/C24` (#518) for the Stops it answers |
| `graph/C3` DO: `structure.mjs`, the exports, graph/T1–graph/T7 GREEN | Graph | `graph/C2` |
| `core/C26` DO | Core | `core/C24`, `graph/C3` on `main` |
