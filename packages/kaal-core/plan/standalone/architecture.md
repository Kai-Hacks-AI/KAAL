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
  - kaal-core declares `yaml`, at the version Graph pins, because the copied `form.mjs` and `node.mjs` import it.
  - `src/node.ts`, `frontmatter.ts`, `installation.ts` and `engine.ts` import the delivered copies instead of `kaal-graph` and `kaal-graph/form`.
  - `engine.ts`, `bootstrap.ts`, `register.ts` and `cli.ts` replace `new Graph(…)` with a map, keyed by name and id, of the Nodes Core has admitted.
- **core/A38** [core/F79]: **How the copies are made and kept in step.**
  - **The build** copies the four files byte for byte from the workspace's `kaal-graph` into `dist/node/`, before TypeScript compiles against them. It then writes `dist/node/provenance.json`, holding Graph's package name and version and, for each file, `{ "from": <path in kaal-graph>, "sha256": <digest> }`. Nothing under `dist/node/` is committed.
  - **Synchronization** is a rebuild. A Graph Change to Form or identity reaches Core when kaal-core is next built. If kaal-core's `devDependencies` pins a different Graph version from the one the copies came from, the source tests fail (`core/T85`). Two authoritative copies cannot arise: the only edited copy is Graph's.
  - **A consumer** verifies the shipped copies against the manifest (`core/T84`). That check becomes part of kaal-core's installed `npm test` in `core/C29`.
  - **The declarations of `node.mjs`** (revised by `core/C38`). The build writes `dist/node/node.d.ts` from Graph's `node.d.ts` when `skills/kaal-graph/scripts/` holds one. Otherwise it writes it from Graph's `edges.d.ts`, byte for byte, and records `from` as `skills/kaal-graph/scripts/edges.d.ts`. `edges.d.ts` declares `node.mjs`'s exports itself, and its only import is `./form.js`, which is delivered.
    - Core reaches the copies only through its own subpath imports, `#node/form` and `#node/node`. Those are not among the package's `exports`, so a consumer never sees the wider declarations.
    - core/T94 checks that every name Core imports from them is one the delivered modules export when they run. A declaration-only name, such as Graph's `Graph` class, can never reach Core's code.
    - When `main` brings Graph's `node.d.ts` to `kaal/core`, the next build delivers that file, and core/T85 then requires it. No Core Change is needed, and nothing of Graph's has to travel outside `main`.
- **core/A39** [core/F80, core/N20]: **Registration.**
  - **Admission.** `assemble` returns the claims, the findings of `core/F50`–`core/F52`, `core/F54`'s refusals and `core/F55`, the untraced instances and the shared terms, with or without Graph.
  - **Analysis, with Graph present.** Core hands Graph the resolved traces as successors keyed by assembly identity (`core/A27`). It reports Graph's `reach`, `incoming` and `cycles` as they come, and judges none of them.
  - **Analysis, without Graph.** `cycles` is `null`, and `reach` and `incoming` return `null`: unavailable, not empty.
  - **`kaal verify`** fails only on a collision and on a finding of `core/F50`–`core/F52` or `core/F54`. It never fails on a cycle, nor because Graph is absent.
  - **Revisions to `core/C24`.** This PLAN revises the registration PLAN's `core/F51`, `core/F52`, `core/F53`, `core/F56`, `core/A25`, `core/A26` and `core/A27`, its ownership table, and core/T54, T57 and T67, each marked "revised by `core/C32`".

## Change graph

| Order | Change | Owner | Depends on |
| --- | --- | --- | --- |
| 1 | `core/C32` PLAN, this Change | Core | — |
| 2 | `node.d.ts`: declarations for `node.mjs` in a file of their own, re-exported by `edges.d.ts` | Graph | — |
| 2a | `core/C38` PLAN: the route without Graph's `node.d.ts`, delivering the declarations of `node.mjs` as Graph ships them on Core's base | Core | 1, the Owner's ruling on #675 |
| 3 | `core/C33` DO: the build copy, the manifest, Core's imports and index; core/T81–T85 and T94 GREEN | Core | 1, 2a (revised by `core/C38`: no longer row 2) |
| 4 | `core/C26` DO: registration with core/F80's split, with core/T86 GREEN; Graph's analysis used when present | Core | 3; `graph/C3` only for the Graph-present path |

## Release and clean-installation consequences

- **Core 0.0.1 no longer needs Graph published.** Graph is a build-time `devDependency`, which a consumer never installs. In `core/C28`'s release map (#622), Graph's rename and publication (rows 7 and 12, for Graph) leave Core's path. So does the sync carrying `graph/C3` into `kaal/core` (rows 3–4), except for C26's Graph-present path. `core/C29` revises the map and T79's dependency walk.
- **A fresh consumer** installs kaal-core, Foundation, Hosting and `yaml`, and nothing from Graph. `core/T83` proves that it imports and admits the payload. `core/T84` proves that no shipped file names Graph's package and that every delivered copy matches its manifest.
- **The installed package's tests and documentation** stay at Guard's bar under `core/C29`. The shipped documents state:
  - that Node Form and identity are Graph's contract, delivered within kaal-core;
  - which Graph version they came from;
  - what is unknown without Graph.
