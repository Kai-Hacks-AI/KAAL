# @kaihacksai/kaal-graph

KAAL Graph: the capability for the general mechanics of Nodes, their Form and identity, construction and lookup, and the Edges that relate them, with derived indexes and traversal. It is not part of Core. Graph implements the Node Form and identity that the Kernel in Core's payload states, and interprets the `edges` in a Node's frontmatter. Core owns the initial foundation and the CASE lifecycle, decides which Nodes an Engine admits, while Graph supplies general Node mechanics independently. Graph's only KAAL runtime dependency is Hosting.

## Documentation

- [Intent](docs/intent.md): why Graph exists.
- [Requirements](docs/requirements.md): what it promises.
- [Architecture](docs/architecture.md): where each promise is realized.
- [Operations](docs/operations.md): how to install, use and verify it.
- [Limitations](docs/limitations.md): what it does not establish.
- [Testing](docs/testing.md): the cases your installation runs.

## Layout

```
docs/                                    the documents above
payload/Graph.md                         the Skill Node, typed by Core's KAAL Skill
skills/kaal-graph/                       the Agent Skill: SKILL.md, references/edges.md,
                                         scripts/edges.mjs (the API, typed by edges.d.ts),
                                         scripts/structure.mjs (reach, reverse, cycles),
                                         scripts/form.mjs (reading frontmatter), scripts/node.mjs
                                         (Form and identity, typed by node.d.ts) and scripts/graph.mjs
test/verify.mjs, test/verify.json        the consumer's verification, and its manifest
test/embedded/                           the embedded cases it runs
```

## Edges

An Edge is embedded in the Node it goes out from, in the `edges` key of its frontmatter. Edges are grouped by type: each group has exactly one `type`, a reference to the Node defining the relationship, and a nonempty `targets` sequence of references, with no target twice. Each target is one Edge. A Node has at most one group per type. There are no separate Edge Nodes. See [references/edges.md](skills/kaal-graph/references/edges.md).

## API

Import the API from `@kaihacksai/kaal-graph`. Its entry, `skills/kaal-graph/scripts/edges.mjs`, touches no host.

- `identify(bytes)` reads an ordinary Node's identity from its exact bytes, `{ id, name, type, frontmatter }`, or throws a `FormError` if they are not in Form or declare no type: an ordinary Node always references its type. The id is `sha256(bytes)`, the frontmatter is the complete YAML 1.2 mapping, and only `name` and `type` are interpreted. The identity is frozen throughout, sequences included. `identifyRoot(bytes)` reads a root the same way: the one Node of a foundation that declares no type, such as Core's genesis Node `Node`. It refuses bytes that declare a type, which are an ordinary Node for `identify`. Which Node is a root is the foundation owner's decision, never Graph's. `claimsForm(bytes)` says whether bytes begin like frontmatter and so claim to be a Node; `isName` and `isId` say whether a value is a valid name or id.
- `readFrontmatter(bytes)` reads the frontmatter of any Markdown file in Form, a Node or not, exactly as `identify` reads it: the complete YAML 1.2 mapping, frozen throughout, with nothing interpreted and the body never read. It throws a `FormError` if the bytes are not UTF-8 or not in Form. It is also offered alone as `@kaihacksai/kaal-graph/form`, with `FormError`, `isName` and `isId`, importing no host module, for callers that must stay pure.

- `createNode({ name, type, edges, frontmatter, body })` constructs an ordinary Node's exact bytes and returns `{ bytes, node }`. `type` is required: it constructs no root. The frontmatter is canonical: `name`, `type`, `edges` with groups sorted by type and targets by reference, then the other keys sorted, with every name and id double-quoted so an id of digits stays a string. Identical input gives identical bytes and id. It refuses anything that would not read back as given or whose Edges are malformed. That is all it guarantees: not that a reference resolves to a Node, nor that a relationship is permitted. It writes nothing and gives nothing a meaning: publishing the bytes is the caller's, through Hosting or Core's `register`.
- `edgesOf(node)` gives a Node's outgoing Edges, sorted, or the problems that make them unusable.
- `new Graph(nodes)` builds derived indexes. `add(node)` adds a Node, `node(id)` looks it up by id, `resolve(ref)` by reference (the Node with that id, if it has that name), `named(name)` lists the Nodes with a name as `{ name, id }`, `out(id)` and `in(id)` list Edges in either direction, `typed(ref)` lists the Nodes whose Core type is exactly that reference, `edges(ref)` lists the Edges of exactly that type as `{ source, target, type }` (both matched by id and name, both sorted), `check()` reports malformed and unresolved Edges, and `traverse(id, { direction, type })` walks breadth-first.
- `cycles(successors)`, `reach(successors, start)` and `reverse(successors)` work on any directed structure of opaque string identities, given as a `Map`, a read-only relation with Map's reading interface (including the result of `reverse`), or a plain object from each identity to the identities it points to, Nodes or not. `cycles` reports the strongly connected components that contain a cycle, a self-edge included, members and cycles sorted, without enumerating paths. `reach` yields each reachable identity once, breadth-first. `reverse` derives predecessors as a read-only relation: Map's reading interface, with no way to write. A successor that is not a key has no successors, and resolving it is the caller's. They judge nothing: whether a cycle is permitted is for whoever owns the meaning. Each sorts for determinism, O((V + E) log(V + E)), and never recurses.

Every query answers with Edges as declared in their source Nodes. A declared reference may resolve to no Node present, or to a Node of another name; `check()` reports both, and nothing else verifies them, so run `check()` first when you need resolved Edges. `traverse` follows an Edge by its target's id and skips a target that is not present. Queries expose declared relationships; `check()` is the resolver. Each query returns a fresh array of frozen records: changing what it returns never changes the graph. A Graph takes only frozen Nodes, as `identify()` returns them, and `add` throws a `TypeError` for one that could still change. A Node may carry fields of the caller's own beside its identity, frozen with it; Graph never reads them. So a Node a Graph holds, and every index derived from it, always agree.

With V Nodes and E Edges, adding a Node with k Edges is O(k log k) to sort them, plus O(1) average per Edge. Lookup by id or reference is O(1) average, and outgoing and incoming Edges are O(k), with incoming lists sorted lazily once after a change. `check()` and a traversal are O(V + E). Graph gives no relationship a meaning, and it applies no cardinality or other constraint beyond the structure above.

## Command

```
kaal-graph check <dir>...
kaal-graph out <id> <dir>...
kaal-graph in <id> <dir>...
kaal-graph named <name> <dir>...
kaal-graph resolve <name> <id> <dir>...
```

Files are read through `@kaihacksai/kaal-hosting`. Each Markdown file that begins like frontmatter is read with `identify`, or with `identifyRoot` when it declares no type; one that is neither is reported as refused. `check` exits 0 when there is nothing to report and 1 when there is. `named` and `resolve` print each Node found as its id, name and type, over any Node in Form under the directories, admitted or not. Misuse, and a lookup that finds nothing, exit 2.

## Register the Node

```sh
npx kaal register skill kaal-graph node_modules/@kaihacksai/kaal-graph/payload    # Core decides
```

## Verify

```sh
npm explore @kaihacksai/kaal-graph -- npm test
```

It checks the installed files against the shipped manifest, runs every embedded case against the installed copy, and ends verified (0), failed (1) or cannot verify (2). See [Operations](docs/operations.md).

## License

MIT. See `LICENSE`. The license covers this package's contents only.
