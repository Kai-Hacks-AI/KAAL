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
- **core/F80** [core/I24]: **Registration: Core's admission, and Graph's optional analysis.** This revises `core/C24`'s registration.
  - **Core has no universal acyclicity requirement.** Following the Owner's decision on #640 (comment 6509030788), Core holds no `acyclic` declaration and makes no cycle judgment. A consuming capability may declare an acyclicity constraint under its own semantics and acceptance policy, and it is accountable for the evidence, which may come from Graph or from an agent's or a person's assessment.
  - **Core's admission mechanics need no Graph:**
    - scopes and kinds, and their owners (`core/F50`);
    - outgoing rules (`core/F51`);
    - each trace's permission and target resolution (`core/F52`);
    - refusing a stated incoming trace (`core/F54`);
    - nothing implicit (`core/F55`).
  - **Graph's analysis is an optional complement.** It covers `reach`, the derived incoming views (`core/F54`) and observed cycles (`core/F53`). When Graph is present, Core reports them as Graph gives them. They are observations, never Core's findings.
  - **Without Graph:**
    - those views are reported as unavailable, never as empty, and never as a cycle-free graph;
    - Core never claims a consumer's cycle constraint was verified;
    - Core never rejects or fails an otherwise admissible registration, Node or `kaal verify` because Graph is absent.
  - **No duplicated algorithms.** Core implements none of Graph's generic algorithms.

## Graph as a complement

- **core/N20** [core/I24]: When Graph is present, Core may use what only Graph gives:
  - navigation over Edges of admitted Nodes;
  - registration analysis: `reach`, incoming views and observed cycles (`core/F80`), which a consumer may use as evidence for its own constraints;
  - Node-backed registration instances, whose relationships are Graph Edges (#600, comment 6503759803, still the Owner's core/F47 decision).

  When Graph is absent, each of these is unavailable and says so: never a false GREEN, and never a reason to reject or fail what Core would otherwise admit. The absent-complement PLAN, aligned on #600, says how Core detects Graph and reports its absence. This Change only keeps Core usable without Graph.

## Not in this Change

- **The `node.d.ts` split.** Graph declares `node.mjs`'s exports in a file of their own. It is Graph's Change, if it has none yet.
- **The absent-complement PLAN, and Node-backed instances.** They are later Core Changes.
- **Graph's own 0.0.1 contract** (graph/C4, #627).
