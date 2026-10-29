# kaal-project

KAAL Project: the capability for Project, Program and Portfolio Management, adding governance over one or more Normal Changes toward a shared Outcome where that governance is warranted. It is not part of Core. Core provides the `KAAL Capability` and `KAAL Definition` types and admission, and this capability joins through them.

```
capability/Project.md        the Capability Node, typed by Core's KAAL Capability
capability/Project-Plan.md   the Project Plan Definition, typed by KAAL Definition: Outcome, warrant, Changes, ordering, grouping, risks and exit condition
ownership.kaal.json          Project's own ownership claim (repository data, not delivered)
```

## Responsibilities

Project adds governance over one or more Normal Changes where it is warranted, by complexity, risk, dependencies, coordination or delivery commitments, not by the number of Changes alone; one Normal Change is the minimum. It owns none of the work it governs: it neither decomposes a Change by default nor takes over a Change's authorization, lifecycle, work or evidence. What a Normal Change is, how Changes are classified, and which Change depends on which are Change's; Project consumes declared dependencies and decides only project-level sequencing and grouping. Project is realized first; Program and Portfolio are in scope and not yet realized. The Outcome is Intent's, evidence is Testing's and judgments are Review's, what is wanted is prepared by Product and decided by the Product Owner, and how Changes land is Engineering's Branching. Project owns its Project Plans as registered KAAL content; persistence is separate from ownership.

## Register the Nodes

```sh
npx kaal register capability project node_modules/kaal-project/capability    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
