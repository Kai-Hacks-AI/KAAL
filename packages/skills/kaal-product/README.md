# kaal-product

KAAL Product: the capability for Product Management, supporting the Product Owner's product direction and preparing the decisions the Product Owner makes. It is not part of Core. Core provides the `KAAL Capability` and `KAAL Definition` types and admission, and this capability joins through them.

```
capability/Product.md             the Capability Node, typed by Core's KAAL Capability
capability/Product-Direction.md   the Product Direction Definition, typed by KAAL Definition: wanted increments, backlog, roadmap, priority and decision preparation
ownership.kaal.json               Product's own ownership claim (repository data, not delivered)
```

## Responsibilities

Product keeps product direction legible and current and prepares decisions; the Product Owner decides. Its responsibility ends when an increment is selected and ordered. Intent and Outcome are Intent's, each Change's lifecycle is Change's, and coordinating related Changes is Project's. Product keeps no store: its artifacts stay where the Product Owner reviews them.

## Register the Nodes

```sh
npx kaal register capability product node_modules/kaal-product/capability    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
