# Graph: Architecture (where)

Each element names, in brackets, the Requirements it answers ([Requirements](requirements.md)). graph/A4 and graph/A7 record how the publisher made its Changes, and are not repeated here.

- **graph/A1** [graph/F1–graph/F4, graph/N3]: The layout of the code, all under `skills/kaal-graph/scripts/`:
  - `form.mjs` reads frontmatter and the Form, and is offered alone as `@kaihacksai/kaal-graph/form`.
  - `node.mjs` gives a Node its identity.
  - `edges.mjs` reads Edges and holds `Graph`. It is the package's API, `@kaihacksai/kaal-graph`, and re-exports the rest.
  - `structure.mjs` holds `cycles`, `reach` and `reverse`, and imports nothing, not even another Graph module.
  - `graph.mjs` is the `kaal-graph` command.
  - `form.d.ts`, `node.d.ts` and `edges.d.ts` declare their types.
- **graph/A2** [graph/F1, graph/N1, graph/N2]: `cycles` is Tarjan's strongly connected components algorithm, written iteratively with an explicit stack. Identities and successors are first sorted by comparison (UTF-16 code unit order), so the result does not depend on input order. That sort is the O(V log V + E log E) term of graph/N2, and the walk itself is linear. `reach` and `reverse` sort the same way.
- **graph/A3** [graph/F4]: There is no name-only reference kind. A caller whose identities are names, such as `testing/F2`, gives them as `successors` keyed by those names, and resolving the names stays the caller's.
- **graph/A5** [graph/F5–graph/F7]: The package ships `docs/`, `payload/`, `skills/`, `test/embedded/`, `test/verify.mjs` and `test/verify.json`, with `package.json`, the README and the license. Its `npm test` is `node test/verify.mjs`.
- **graph/A6** [graph/F6]: `test/verify.mjs` imports nothing from `skills/`, so a broken runtime cannot mask itself. It clears `NODE_TEST_CONTEXT`, and accounts for each declared case by its name, because `node --test` reports a file with no tests as one passing test.
- **graph/A8** [graph/F8]: The `kaal-graph` command reads files through Hosting. Nothing above Hosting knows the operating system, so Graph never reads the host itself.
- **graph/A9** [graph/F4, graph/I7]: Structural normalization reads an iterable with `entries()` through that method, including Graph's own read-only relations. It reads a plain object through `Object.entries`. The module imports nothing, and the algorithms and cost bound stay as stated above.
