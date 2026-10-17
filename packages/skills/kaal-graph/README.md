# kaal-graph

KAAL Graph: the capability for relating Nodes to one another and navigating those relationships. It is not part of Core. Core reads a Node's frontmatter and identifies its exact bytes; Graph interprets the `edges` in that frontmatter.

```
payload/Graph.md                         the Skill Node, typed by Core's KAAL Skill
skills/kaal-graph/                       the Agent Skill: SKILL.md, references/edges.md,
                                         scripts/edges.mjs (the API) and scripts/graph.mjs
```

## Edges

An Edge is embedded in the Node it goes out from, in the `edges` key of its frontmatter. Edges are grouped by type: each group has exactly one `type`, a reference to the Node defining the relationship, and a nonempty `targets` sequence of references, with no target twice. Each target is one Edge. A Node has at most one group per type. There are no separate Edge Nodes. See [references/edges.md](skills/kaal-graph/references/edges.md).

## API

`scripts/edges.mjs` is the package's API. It works on Node identities as Core's `identify(bytes)` returns them, and touches no host.

- `edgesOf(node)` gives a Node's outgoing Edges, sorted, or the problems that make them unusable.
- `new Graph(nodes)` builds derived indexes. `add(node)` adds a Node, `node(id)` looks it up by id, `resolve(ref)` by reference (the Node with that id, if it has that name), `named(name)` lists the Nodes with a name as `{ name, id }`, `out(id)` and `in(id)` list Edges in either direction, `typed(ref)` lists the Nodes whose Core type is exactly that reference, `edges(ref)` lists the Edges of exactly that type as `{ source, target, type }` (both matched by id and name, both sorted), `check()` reports malformed and unresolved Edges, and `traverse(id, { direction, type })` walks breadth-first.

Every query answers with Edges as declared in their source Nodes. A declared reference may resolve to no Node present, or to a Node of another name; `check()` reports both, and nothing else verifies them, so run `check()` first when you need resolved Edges. `traverse` follows an Edge by its target's id and skips a target that is not present. Each query returns a fresh array of frozen records: changing what it returns never changes the graph.

With V Nodes and E Edges, adding a Node with k Edges is O(k log k) to sort them, plus O(1) average per Edge. Lookup by id or reference is O(1) average, and outgoing and incoming Edges are O(k), with incoming lists sorted lazily once after a change. `check()` and a traversal are O(V + E). Graph gives no relationship a meaning, and it applies no cardinality or other constraint beyond the structure above.

## Command

```
kaal-graph check <dir>...
kaal-graph out <id> <dir>...
kaal-graph in <id> <dir>...
kaal-graph named <name> <dir>...
kaal-graph resolve <name> <id> <dir>...
```

Files are read through kaal-hosting. `check` exits 0 when there is nothing to report and 1 when there is. `named` and `resolve` print each Node found as its id, name and type, over any Node in Form under the directories; Core's `kaal resolve` remains the lookup over an Engine's admitted Nodes. Misuse, and a lookup that finds nothing, exit 2.

## Register the Node

```sh
npx kaal register skill kaal-graph node_modules/kaal-graph/payload    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
