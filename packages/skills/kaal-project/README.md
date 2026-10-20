# kaal-project

KAAL Project: the capability for Project, Program and Portfolio Management, coordinating related Changes toward a shared Outcome where their sequencing, dependencies, grouping or integration risks require it. It is not part of Core. Core provides the `KAAL Capability` and `KAAL Definition` types and admission, and this capability joins through them.

```
capability/Project.md        the Capability Node, typed by Core's KAAL Capability
capability/Project-Plan.md   the Project Plan Definition, typed by KAAL Definition: Outcome, Changes, ordering, grouping, risks and exit condition
ownership.kaal.json          Project's own ownership claim (repository data, not delivered)
```

## Responsibilities

Project coordinates and owns none of the work it coordinates. Project is realized first; Program and Portfolio are in scope and not yet realized. Each Change keeps its lifecycle (Change), the Outcome is Intent's, evidence is Testing's and judgments are Review's, what is wanted is prepared by Product and decided by the Product Owner, and how Changes land is Engineering's Branching. A Plan is kept in the context of the work it coordinates.

## Register the Nodes

```sh
npx kaal register capability project node_modules/kaal-project/capability    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
