# Graph: Intent (why)

`kaal-graph` gives KAAL Nodes their general mechanics: a Node's Form and identity, construction and lookup, the Edges embedded in Nodes that relate them, and structural navigation over them. It gives no relationship a meaning. What an Edge means is stated by the Node its `type` references, and which Nodes an Engine admits is Core's decision. What each Intent obliges is in [Requirements](requirements.md).

- **graph/I1. Structure, never judgement.** Graph detects and reports the cycles of a directed structure, and walks it, deterministically. It terminates on any structure and names each cycle's members. Whether a cycle is permitted is for whoever owns the meaning.
- **graph/I2. Any identity.** The structural functions work on any string identities a caller gives, names included. A Node's `{ name, id }` references and its Edges stay exactly as they are.
- **graph/I3. Additive.** What Graph already offers keeps its meaning as Graph grows: identify, the Form, Edges, `Graph`, `traverse`, `check`, and every Node id.
- **graph/I4. Self-sufficient for its consumer.** Without a KAAL source checkout, a consumer can install the package, understand it, use it, and verify it, with an honest result: verified, failed or cannot verify. Zero cases is never verified.
- **graph/I5. One namespace.** Graph publishes beside Guard, Core, Hosting and Foundation under one `@kaihacksai/kaal-*` namespace, and renames only itself.
- **graph/I6. Nothing that exists changes meaning.** A release adds documentation, embedded cases, packaging and the name. Every algorithm, export, Node id and command behaves as before.
