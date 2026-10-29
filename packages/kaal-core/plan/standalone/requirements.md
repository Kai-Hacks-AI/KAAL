# Core Standalone: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **core/F76** [core/I24]: kaal-core declares no dependency of any kind on Graph's package (`kaal-graph`, or `@kaihacksai/kaal-graph` after its rename). Its KAAL runtime dependencies are Foundation, Hosting and the Form package (A), each a technical package.
- **core/F77** [core/I24]: No file in kaal-core's `src/` imports Graph's package. Node Form and identity come from the Form package. Core's lookups by name and id are its own. Registration's incoming views and cycle findings (`core/C26`) are Core's own assembly over registration traces, which are not Graph Edges.
- **core/F78** [core/I24]: Packed with its runtime dependencies and installed into a clean directory with no Graph package, kaal-core imports, and `evaluate(payload())` admits Core's own payload Nodes with no rejection.

## Graph as a complement

- **core/N20** [core/I24]: When Graph is present, Core may use it for what only Graph gives:
  - navigation over Edges of admitted Nodes;
  - Node-backed registration instances, whose relationships are Graph Edges (#600, comment 6503759803, still the Owner's core/F47 decision).

  When Graph is absent, those report an honest unresolved finding, never a false GREEN. This is the absent-complement decision the Owner aligned on #600, and it gets its own Core PLAN. This Change only keeps Core usable without Graph.

## Not in this Change

- The Form split itself. It is Graph's Change, owned by Graph.
- Node-backed instances, and the absent-complement PLAN. They are later Core Changes.
- Anything about Graph's own 0.0.1 contract (graph/C4, #627).
