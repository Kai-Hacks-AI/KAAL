# Core Standalone: Intent

This is `core/C32`, a PLAN Change. It ships no code. It authorizes no DO, synchronization, promotion, rename, version change or publication: those remain the Owner's.

The Owner set the direction in the project chat (2026-10-29 18:13 and 18:14): Core should not need Graph. Each capability is useful on its own, and complementary capabilities add value when present (1+1 > 2, as on #530 and in `core/C30`'s absent-complement decision). More technical packages, such as Foundation and Hosting, may stay mandatory.

Today kaal-core depends on `kaal-graph` at runtime. It takes two things from it:
- **Node Form and identity.** These are `readFrontmatter`, `isName`, `isId` and `FormError` from `kaal-graph/form`, and `identify`, `identifyRoot`, `claimsForm` and `sha256`. Every Node Core reads goes through them: the Kernel, `CASE`, `LOVE`, the Installation Contract, and every admitted Node.
- **The `Graph` class, as a lookup by name and id** (`named`, `node`, `resolve`). Core never walks an Edge. `core/C26` planned to use graph/C3's `reach`, `reverse` and `cycles` for registration's incoming views and cycle findings.

- **core/I24.** kaal-core installs and works without Graph. Its mandatory runtime dependencies are technical packages only, and Graph is an optional complement that Core uses when it is present and reports honestly when it is not.

## The decision for the Owner: where Node Form and identity live

Core cannot read a Node without Node Form. So a standalone Core needs Form in a mandatory technical package that is not Graph:

- **A. A Form package split out of Graph, still owned by Graph (recommended).** For example `@kaihacksai/kaal-form`, holding `form.mjs` and the identity part of `node.mjs`, and depending on `yaml` and Foundation's `sha256`.
  - It is technical and mandatory, like Foundation and Hosting.
  - Graph keeps the Form contract and builds Edges, navigation and the CLI on it.
  - The Graph thread confirmed on #622 (comment 6504871864) that the split is clean: `form.mjs` and `node.mjs` import only `yaml`, `node:crypto` and each other, and touch neither Hosting nor Edges.
- **B. Form into Foundation.** Foundation would have to take `yaml` as a dependency. That breaks foundation/N2 (no dependencies), which is what lets Foundation sit beneath everything.
- **C. Graph stays mandatory, for Form only.** That is today's state, so it does not deliver the direction.

This PLAN is written for A. Under B, only the name of the Form package changes.
