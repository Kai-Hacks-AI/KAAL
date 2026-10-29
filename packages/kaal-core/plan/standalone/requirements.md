# Core Standalone: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **core/F76** [core/I24]: kaal-core has no runtime dependency on Graph's package (`kaal-graph`, or `@kaihacksai/kaal-graph` after its rename).
  - `dependencies`, `optionalDependencies` and `bundleDependencies` never name it.
  - `peerDependencies` names it only if `peerDependenciesMeta` marks it optional.
  - `devDependencies` may name it, for the build.
- **core/F77** [core/I24]: No file in kaal-core's `src/` imports Graph's package. Node support comes from the delivered copy (`core/F79`). Core's lookups by name and id are its own index of the Nodes it admitted. That is admission, not navigation.
- **core/F78** [core/I24]: kaal-core is packed with its runtime dependencies, none of them Graph, and installed into a clean directory that holds no Graph package. There it imports, and `evaluate(payload())` admits Core's own payload Nodes with no rejection.
- **core/F79** [core/I24]: **Delivered Node support.** kaal-core ships Graph's Node Form and identity as built, byte-identical copies of Graph's source files, with a provenance manifest.
  - **What is copied:** `form.mjs`, `form.d.ts`, `node.mjs` and `node.d.ts`, from `kaal-graph`'s `skills/kaal-graph/scripts/`, and nothing else.
  - **The manifest** names, for each copied file, its source path, Graph's version and the file's SHA-256.
  - **Never edited.** The copies are build output, never committed, and never changed by hand. Graph's source is the only authoritative implementation. A change to Form or identity is a Graph Change, and Core picks it up by rebuilding.
  - **Checked at build.** The source build fails when a copy differs from Graph's source, or when the manifest's Graph version differs from kaal-core's `devDependencies` entry.
  - **Checked when installed.** The installed package verifies that each shipped copy matches the manifest's SHA-256.
- **core/F80** [core/I24]: **Registration: admission, and optional analysis.** `core/C24`'s registration is split along Core and Graph.
  - **Core's admission mechanics need no Graph:**
    - kinds and their owners (`core/F50`);
    - outgoing rules (`core/F51`);
    - each trace's permission and target resolution (`core/F52`);
    - refusing stated incoming traces (`core/F54`);
    - nothing implicit (`core/F55`).
  - **Graph's analysis is an optional complement:**
    - `reach`;
    - the derived incoming views (`core/F54`);
    - cycle observation and the `acyclic` judgment (`core/F53`).
  - **With Graph present,** Core gives Graph the resolved traces, as `core/A27` says.
  - **Without Graph,** those results are reported as unknown ("cannot verify"), never as passed, and never as a cycle-free graph. Core implements none of Graph's generic algorithms.

## Graph as a complement

- **core/N20** [core/I24]: When Graph is present, Core may use what only Graph gives:
  - navigation over Edges of admitted Nodes;
  - registration analysis (`core/F80`);
  - Node-backed registration instances, whose relationships are Graph Edges (#600, comment 6503759803, still the Owner's core/F47 decision).

  When Graph is absent, each of these reports an honest unknown, never a false GREEN. The absent-complement PLAN, aligned on #600, says how Core detects Graph and reports its absence. This Change only keeps Core usable without Graph.

## Not in this Change

- **The `node.d.ts` split.** Graph declares `node.mjs`'s exports in a file of their own. It is Graph's Change, if it has none yet.
- **The absent-complement PLAN, and Node-backed instances.** They are later Core Changes.
- **Graph's own 0.0.1 contract** (graph/C4, #627).
