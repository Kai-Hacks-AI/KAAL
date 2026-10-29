# kaal-data

KAAL Data: the capability for Data Management, managing data so that it warrants the trust placed in it. It covers generic data organization, stewardship, quality, provenance and lifecycle. It is not part of Core. Core provides the `KAAL Capability` type and admission, and this capability joins through them.

```
capability/Data.md      the Capability Node, typed by Core's KAAL Capability
ownership.kaal.json     Data's own ownership claim (repository data, not delivered)
```

## Responsibilities

Data says how data is managed, never what a capability's data means: each consuming capability keeps its own data's meaning and decisions. Data repeats no neighbour's mechanism. Graph keeps Nodes, Edges, identity and traversal, Learning keeps knowledge formation and retrievability in context, Sealing keeps cryptographic integrity, Testing keeps evidence, Controls keeps assurance and Hosting keeps storage. Data keeps no store, registry or catalog.

## Register the Nodes

```sh
npx kaal register capability data node_modules/kaal-data/capability    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
