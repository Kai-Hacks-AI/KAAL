# Structural Reach and Cycles: Intent

This is `graph/C2`, a PLAN Change. It ships no code. `graph/C3` is the DO Change that turns the planned tests GREEN.

`core/C24` (#518) plans Capability registration with one-way traces. It assigns Graph to represent, traverse, and detect and report cycles (`core/A27`), and Core compares each reported cycle with its owners' `acyclic` declarations. Its DO Change, `core/C26`, waits on Graph for two Stops:
- **Stop 1:** artifact identities such as `testing/F2` are names without a content id, and Graph's references are `{ name, id }`;
- **Stop 2:** Graph has no API that reports cycles.

This PLAN answers both in one Graph Change.

- **graph/I1.** Graph detects and reports the cycles of a directed structure. It is deterministic, terminates on any structure, and names each cycle's members. It judges nothing: whether a cycle is permitted is for whoever owns the meaning.
- **graph/I2.** These structural mechanics work on any identities a caller gives, names included. A name-only identity needs no new reference kind, and a Node's `{ name, id }` references and Edges stay exactly as they are.
- **graph/I3.** Nothing that exists changes: identify, Form, Edges, `Graph`, `traverse`, `check`, and every Node id stay as they are.
