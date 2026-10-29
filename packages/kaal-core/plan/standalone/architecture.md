# Core Standalone: Architecture

Each element names, in brackets, the Requirements it answers.

## Ownership

| Concern | Owner | Where it runs |
| --- | --- | --- |
| Node Form and identity: the contract, its source (`form.mjs`, `node.mjs`, their declarations) and its tests | Graph | in `kaal-graph`, and as delivered copies inside `kaal-core` |
| Building, verifying and shipping the delivered copies and their manifest | Core, with the build run by Engineering's lanes | `kaal-core`'s build and its tests |
| Admission, the Kernel, `CASE`, `LOVE`, the Installation Contract, registration's admission mechanics (`core/F80`), and the index of admitted Nodes by name and id | Core | `kaal-core` |
| Traversal and analysis: Edges, navigation, `reach`, `reverse` and `cycles`, the CLI and the Skill | Graph | `kaal-graph` only, used by Core when present |

## Elements

- **core/A37** [core/F76, core/F77, core/F78]: The dependency position becomes:

  ```
  build time:   kaal-graph (devDependency) ──copies Form and identity──▶ kaal-core/dist/node/
  run time:     kaal-foundation, kaal-hosting, yaml  ◀──  kaal-core   (no Graph)
  optional:     kaal-graph, beside kaal-core, for navigation and analysis
  ```

  This replaces the earlier ruling "kaal-hosting ← kaal-graph ← kaal-core, no shims". There are still no shims: nothing re-exports Graph's package for Core.
  - kaal-core declares `yaml`, which the copied `form.mjs` and `node.mjs` import.
  - `src/node.ts`, `frontmatter.ts`, `installation.ts` and `engine.ts` import the delivered copies instead of `kaal-graph` and `kaal-graph/form`.
  - `engine.ts`, `bootstrap.ts`, `register.ts` and `cli.ts` replace `new Graph(…)` with a map, keyed by name and id, of the Nodes Core has admitted.
- **core/A38** [core/F79]: **How the copies are made and kept in step.**
  - **The build** copies the four files byte for byte from the workspace's `kaal-graph` into `dist/node/`, before TypeScript compiles against them. It then writes `dist/node/provenance.json`, holding Graph's package name and version and, for each file, `{ "from": <path in kaal-graph>, "sha256": <digest> }`. Nothing under `dist/node/` is committed.
  - **Synchronization** is a rebuild. A Graph Change to Form or identity reaches Core when kaal-core is next built. If kaal-core's `devDependencies` pins a different Graph version from the one the copies came from, the source tests fail (`core/T85`). Two authoritative copies cannot arise: the only edited copy is Graph's.
  - **A consumer** verifies the shipped copies against the manifest (`core/T84`). That check becomes part of kaal-core's installed `npm test` in `core/C29`.
- **core/A39** [core/F80, core/N20]: **Registration.** `core/A27` holds when Graph is present: Core hands Graph the resolved traces and compares its cycles with the owners' `acyclic` declarations. Without Graph, `assemble` still returns the claims, the findings of `core/F50`–`core/F52`, `core/F54`'s refusals and `core/F55`. `reach`, `incoming` and `cycles` are marked unknown. `kaal verify` reports an `acyclic` declaration it could not judge as "cannot verify", never as passed.

## The one question left for the Owner

`core/F80` treats `acyclic` judgment as Graph analysis, following the direction to keep Graph's generic algorithms with Graph.
- **The consequence.** Without Graph, a repository that registers an `acyclic` kind cannot get a verified result.
- **The alternative.** `acyclic` could be counted as admission. Graph's `cycles` would then be delivered inside kaal-core the same way as Form, as built copies with provenance. That is still one authoritative implementation, but it carries Graph's analysis into Core.

This PLAN keeps analysis with Graph unless the Owner says otherwise.

## Change graph

| Order | Change | Owner | Depends on |
| --- | --- | --- | --- |
| 1 | `core/C32` PLAN, this Change | Core | — |
| 2 | `node.d.ts`: declarations for `node.mjs` in a file of their own, re-exported by `edges.d.ts` | Graph | — |
| 3 | `core/C33` DO: the build copy, the manifest, Core's imports and index; core/T81–T85 GREEN | Core | 1, 2 |
| 4 | `core/C26` DO: registration with core/F80's split; Graph's analysis used when present | Core | 3; `graph/C3` only for the Graph-present path |

## Release and clean-installation consequences

- **Core 0.0.1 no longer needs Graph published.** Graph is a build-time `devDependency`, which a consumer never installs. In `core/C28`'s release map (#622), Graph's rename and publication (rows 7 and 12, for Graph) leave Core's path. So does the sync carrying `graph/C3` into `kaal/core` (rows 3–4), except for C26's Graph-present path. `core/C29` revises the map and T79's dependency walk.
- **A fresh consumer** installs kaal-core, Foundation, Hosting and `yaml`, and nothing from Graph. `core/T83` proves that it imports and admits the payload. `core/T84` proves that no shipped file names Graph's package and that every delivered copy matches its manifest.
- **The installed package's tests and documentation** stay at Guard's bar under `core/C29`. The shipped documents state:
  - that Node Form and identity are Graph's contract, delivered within kaal-core;
  - which Graph version they came from;
  - what is unknown without Graph.
