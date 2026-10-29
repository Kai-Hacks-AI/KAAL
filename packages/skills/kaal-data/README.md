# kaal-data

KAAL Data: the capability for Data Management, managing data so that it warrants the trust placed in it. It covers generic data organization, stewardship, quality, provenance and lifecycle. It is not part of Core. Core provides the `KAAL Capability` type and admission, and this capability joins through them.

```
capability/Data.md      the Capability Node, typed by Core's KAAL Capability
capability/ORDER.md     the ORDER Definition, typed by KAAL Definition: Data's guiding principle of warranted trust
ownership.kaal.json     Data's own ownership claim (repository data, not delivered)
```

## Responsibilities

Data says how data is managed, never what a capability's data means: each consuming capability keeps its own data's meaning and decisions. Data repeats no neighbour's mechanism. Graph keeps Nodes, Edges, identity and traversal, Learning keeps knowledge formation and retrievability in context, Sealing keeps cryptographic integrity, Testing keeps evidence, Controls keeps assurance and Hosting keeps storage. Data keeps no store, registry or catalog.

ORDER, Organised Ratified Data Enhances Reliability, is Data's guiding principle: what KAAL handles merits trust to the degree that it is organised and ratified, and reliability is warranted trust within a context, never infallibility. It applies wherever KAAL holds data without making Data that data's owner, and it adds no store, procedure or gate. The Owner coined it as the counterpart of Change's CHAOS: order to chaos.

## Register the Nodes

```sh
npx kaal register capability data node_modules/kaal-data/capability    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
