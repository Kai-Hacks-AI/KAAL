# Core Standalone: Architecture

Each element names, in brackets, the Requirements it answers.

## What Core takes from Graph, and what Graph's capability is

The `kaal-graph` package is two things in one:
- **A technical base.** Node Form (`form.mjs`), Node identity (the identity part of `node.mjs`), and `graph/C2`'s structural functions `reach`, `reverse` and `cycles` over any string identities. It needs only `yaml` and SHA-256. It touches neither Hosting nor Edges. The Graph thread confirmed this for Form and identity on #622 (comment 6504871864). The structural functions take plain string identities by `graph/C2`'s own contract.
- **A capability.** Edges between Nodes, navigation over them, the `kaal-graph` CLI (`bin`), the Graph Skill and its payload. It runs through Hosting.

Core uses all of the base and none of the capability. Making Graph optional means separating the two, not having Core write its own copy of either.

## The options compared

| | A. Graph-owned base package | B. Form into Foundation | C. Graph stays a dependency |
| --- | --- | --- | --- |
| What Core installs | Foundation, Hosting, Graph's base | Foundation (with `yaml`), Hosting, plus a home for the structural functions | Foundation, Hosting, all of Graph: its CLI, Skill and payload |
| Graph optional for Core | yes | yes | no |
| Duplication | none: Graph's capability imports its base | none for Form | none |
| New package | one, owned by Graph | none | none |
| Cost | Graph's split Change, and one more rename and publication | breaks foundation/N2, and Foundation takes a parser | none now. Core's 0.0.1 is bound to Graph's whole 0.0.1 contract (graph/C4, #627) |

- **Against C.** C is cheaper today, and it is honest: Core needs Graph's base. But a consumer who installs Core also gets Graph's CLI, Skill and payload, which Core never uses. Every change to Graph's capability is also a change to Core's release.
- **Against B.** Foundation is the one KAAL package with no dependencies. Form needs a YAML parser. Moving Form there makes everything beneath the parser depend on it.
- **For A.** A keeps exactly what Core needs mandatory, and makes optional exactly what Core does not need. That is the line the Owner drew: technical packages mandatory, capabilities complementary.

## Why the base stays Graph-owned

Becoming mandatory changes how the base is packaged. It does not change who defines it.
- **The base defines Graph's own model.** Node Form and identity define what a Node is. The structural functions are how Graph reasons over relationships. Graph's capability is built directly on both, and `core/A27`'s ownership table already gives Graph "representing and traversing the assembled relationships, and detecting and reporting their cycles".
- **Core-owned would invert the dependency.** Graph would then depend on Core to read a Node, so Graph could no longer stand alone.
- **Foundation-owned is option B,** with its cost.
- **One owner per contract.** Graph's PLANs and tests for Form and for `graph/C2` stay where they are. Only the package boundary moves.

The cost is that a mandatory package stays tied to the Graph thread's cadence. Core's release waits on the base package only, not on Graph's capability.

## Reverse and cycles: no second implementation

Core does not implement `reverse` or `cycles`. An earlier draft of this PLAN had Core build registration's incoming views and cycle findings itself. That would have duplicated Graph's structural responsibility, and contradicted `core/A27`, which says Core keeps no cycle detection and builds no substitute.

Under A, `core/A27` holds unchanged. Only its import moves from `kaal-graph` to Graph's base package.

Under C, `core/C26` keeps waiting for `graph/C3` in `kaal-graph` itself.

## Elements

- **core/A37** [core/F76, core/F77, core/F78]: The dependency position becomes:

  ```
  kaal-foundation  ←  Graph's base package      (technical, mandatory; Graph-owned)
                          ↑            ↑
  kaal-hosting  ←  kaal-core     kaal-graph     (Graph's capability: optional for Core)
       ↑                               │
       └───────────────────────────────┘
  ```

  This replaces the earlier ruling "kaal-hosting ← kaal-graph ← kaal-core, no shims". There are still no shims: Core imports the base directly, and nothing re-exports Graph for Core.
  - `src/node.ts`, `frontmatter.ts`, `installation.ts` and `engine.ts` import the base instead of `kaal-graph` and `kaal-graph/form`.
  - `engine.ts`, `bootstrap.ts`, `register.ts` and `cli.ts` replace `new Graph(…)` with a map, keyed by name and id, of the Nodes Core has admitted. This is a lookup, not a graph: Core never walks an Edge.
  - `core/C26` imports `reach`, `reverse` and `cycles` from the base.

## Release and clean-installation consequences

| | A | B | C |
| --- | --- | --- | --- |
| Packages published before Core 0.0.1 | Foundation, Hosting, Graph's base | Foundation (with `yaml`), Hosting, and a home for the structural functions | Foundation, Hosting, Graph |
| Core blocked by | the base split, renamed and published, with `graph/C3` | the move into Foundation, ahead of Foundation 0.0.1 | Graph's 0.0.1 contract (#627) and `graph/C3`, renamed and published |
| Graph's capability release | independent of Core, so it can follow Core | independent of Core | before Core |
| Clean installation of Core (core/T83) | has no `kaal-graph` package and no `kaal-graph` bin | has no Graph | holds Graph. T81–T83 are withdrawn |

## Change graph and the 0.0.1 release map (A)

| Order | Change | Owner | Depends on |
| --- | --- | --- | --- |
| 1 | `core/C32` PLAN, this Change | Core | the Owner's choice of A, B or C |
| 2 | The base split: Graph's base package with Form, identity and `graph/C2`'s functions, and `kaal-graph` depending on it | Graph | 1 |
| 3 | `core/C33` DO: core/T81–T83 GREEN, Core's imports and lookups | Core | 2 |
| 4 | `core/C26` DO, importing the structural functions from the base | Core | 3 |

For `core/C28`'s release map (#622), this changes two things:
- **The sync carrying graph/C3 into `kaal/core` (rows 3–4) now carries the base package.**
- **Graph's rename and publication (rows 7 and 12) is no longer ahead of Core.** It is replaced there by the base package's rename and publication, which sit beside Foundation and Hosting.

`core/C29` revises C28's map and T79's dependency walk when it runs.
