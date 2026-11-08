# Graph release candidate: Requirements

Each Requirement names, in brackets, the Intents it serves.

- **graph/F10** [graph/I8]: The candidate is complete when all of these hold on one commit of `kaal/graph`, and the evidence names that commit and the tarball digest:
  1. `graph/C5` is merged: six documents, 59 embedded cases (graph/T16 once), installed `npm test`, the `@kaihacksai/kaal-graph` name, importers migrated.
  2. graph/T8–graph/T15 are GREEN.
  3. `graph/C6` evidence is recorded (graph/F11).
  4. `kaal/graph` contains `main`'s tip at that time (freshness), or the Owner has decided otherwise.
  5. The promotion diff contains only Graph's own files and the importer references graph/A7 allows.
- **graph/F11** [graph/I8, graph/I9]: `graph/C6` records, for the exact packed candidate:
  - graph/T13 GREEN: the Graph tarball and its packed runtime dependencies (the scoped `@kaihacksai/kaal-hosting` tarball and `yaml`) install into a clean directory outside the checkout, the installed files match `docs/operations.md`, `npm test` is verified, and `kaal-graph check` passes on the shipped payload;
  - the negative cases: changed, missing and added installed bytes, a missing runtime dependency and a failing embedded case give `cannot verify` (2) or `failed` (1) as Testing/F50 requires;
  - Packaging's generic conformance and Graph's specific conformance, each run against the same tarball, with independent results;
  - Linux, macOS and Windows results on Node 24, where Hosting owns the portability challenge and Graph owns its behaviour;
  - the dependency boundary: no Core, Testing, Engineering or unscoped `kaal-*` package in the installed tree.
- **graph/F12** [graph/I8]: Graph's publisher cases (`test:publisher`) run in the root comprehensive lane with separately identifiable evidence, so an Embedded-only GREEN is never read as the whole. Engineering owns the orchestration (#655), and Graph owns the cases.
- **graph/N8** [graph/I9]: No Change in this route weakens a check, adds an alias for the unscoped name, merges Hosting's collector, or bypasses Change Isolation.
