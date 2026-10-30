# Graph: Requirements (what)

Each Requirement names, in brackets, the Intents it serves ([Intent](intent.md)). Where each is realized is in [Architecture](architecture.md), and how each is verified is in [Testing](testing.md).

## Functional

- **graph/F1** [graph/I1, graph/I2]: `cycles(successors)` reports every cycle of a directed structure as the strongly connected components that contain one.
  - A component of two or more members is reported, and so is a single member with an edge to itself.
  - Each reported cycle lists its members once, sorted. The cycles are sorted by their first member.
  - A member on several cycles appears in exactly one component. Paths are never enumerated.
- **graph/F2** [graph/I2]: `reach(successors, start)` yields `start` and every identity reachable from it, each once, breadth-first along sorted successors. It terminates on a cycle.
- **graph/F3** [graph/I2]: `reverse(successors)` derives the predecessors of every identity, sorted, as a read-only relation. Incoming relationships are always computed, never stored.
- **graph/F4** [graph/I2]: An identity is any string. `successors` maps each identity to the identities it points to, as a `Map` or a plain object. A successor that is not a key is an identity with no successors; resolving or refusing it is the caller's.
- **graph/F5** [graph/I4]: The package carries this documentation, and the [README](../README.md) links each document. It states what `kaal-graph`, `kaal-graph/form` and the `kaal-graph` command promise, including graph/N2's cost bound.
- **graph/F6** [graph/I4]: `npm test` in the installed package is the consumer's entry, and builds nothing. It runs `test/verify.mjs`, which checks the installed files against the shipped manifest, `test/verify.json`, runs every embedded case against the installed copy in a scratch directory it removes afterwards, checks that the consumer's project is unchanged, and ends in exactly one result:
  - **verified (exit 0):** every shipped file matches the manifest, and every declared case ran and passed.
  - **failed (exit 1):** a declared case failed, or the consumer's project changed during the run.
  - **cannot verify (exit 2), Testing's unknown:** a prerequisite or runtime dependency is missing; the manifest is absent, cannot be read or declares no cases; an installed file differs from the manifest, is missing or is not in it, so what would be tested is no longer the shipped package; a declared case was skipped, marked todo or did not run; or a case ran that the manifest does not declare.

  Its last line is the summary: `kaal-graph-verification ` followed by JSON with `result`; when not verified, `cause`, `evidence` and `next { kind, step }`; `package { name, version, location }`; `platform`; `node`; `digest`, the SHA-256 of one line `<path>\0<sha256>\n` per installed file other than the manifest, in path order; and `cases`, each `{ name, outcome }` with outcome `pass`, `fail`, `skipped`, `todo` or `not run`.
- **graph/F7** [graph/I4]: The embedded cases verify shipped behaviour, ship in `test/embedded/`, and import only `node:` built-ins, the package by its own name, and its runtime dependencies. The publisher's tests of its repository, packaging and integration with other packages do not ship. Each case runs from exactly one place.
- **graph/F8** [graph/I5]: The package's runtime dependencies are Hosting's package and `yaml@2.9.1`, all installable from the public registry.

## Nonfunctional

- **graph/N1** [graph/I1]: Determinism. The same structure gives the same result in any order of keys or of successors.
- **graph/N2** [graph/I1]: Termination and cost. `cycles`, `reach` and `reverse` terminate on any structure, cyclic or not, without recursion, so depth never exhausts the stack. Each costs O((V + E) log(V + E)) for V identities and E successor entries: sorting for determinism (graph/N1) is O(V log V + E log E), and the walk after it is O(V + E). No tighter bound is promised.
- **graph/N3** [graph/I1, graph/I3]: Purity. A call never changes its input, reads nothing from the host, and returns frozen results of the caller's own. A Graph's query results are frozen records, so changing one never changes the Graph.
- **graph/N4** [graph/I3]: Additive. Every existing export and Node id is unchanged.
- **graph/N5** [graph/I6]: Every export, Node id and command behaviour is unchanged by packaging the release.
- **graph/N6** [graph/I4]: Platforms. Graph behaves the same on Linux, macOS and Windows, under Node 24 or later.
- **graph/N7** [graph/I6]: Copyable Form. `form.mjs` and `node.mjs`, with `form.d.ts` and `node.d.ts`, import only `yaml`, `node:` built-ins and each other, so a byte-for-byte copy of the four files works on its own.
