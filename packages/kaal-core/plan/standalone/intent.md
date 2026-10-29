# Core Standalone: Intent

This is `core/C32`, a PLAN Change. It ships no code. It authorizes no DO, synchronization, promotion, rename, version change or publication: those remain the Owner's.

The Owner set the direction in the project chat (2026-10-29 18:13 and 18:14): Core should not need Graph. Each capability is useful on its own, and complementary capabilities add value when present (1+1 > 2, as on #530 and in `core/C30`'s absent-complement decision). More technical packages, such as Foundation and Hosting, may stay mandatory.

Today kaal-core depends on `kaal-graph` at runtime. It uses three things from it, and two of them are Graph's technical contracts rather than its capability:
- **Node Form and identity.** These are `readFrontmatter`, `isName`, `isId` and `FormError` from `kaal-graph/form`, and `identify`, `identifyRoot`, `claimsForm` and `sha256`. Every Node Core reads goes through them: the Kernel, `CASE`, `LOVE`, the Installation Contract, and every admitted Node.
- **Structure over string identities.** `core/C26` uses `graph/C2`'s `reach`, `reverse` and `cycles` for registration's reach, incoming views and cycles. `core/A27` (approved in `core/C24`) says Core keeps no edge index and no cycle detection of its own, and builds no substitute.
- **The `Graph` class, as a lookup by name and id** (`named`, `node`, `resolve`). Core never walks an Edge.

- **core/I24.** kaal-core installs and works without Graph's capability. Its mandatory runtime dependencies are technical packages only. Graph is an optional complement that Core uses when it is present and reports honestly when it is not.

## The decision for the Owner

This PLAN leaves the architectural choice to the Owner. Core's DO (`core/C33`) does not start before it is made. The Architecture compares the options, says why Graph keeps ownership of what moves, and spells out the release and clean-installation consequences of each.

- **A. Graph's technical base as its own Graph-owned package (recommended).** Node Form, identity and `graph/C2`'s structural functions move into a mandatory technical package. Graph still owns that package and builds its capability on it: Edges of Nodes, navigation, the CLI and its installation.
- **B. Form into Foundation.** Foundation would need `yaml` as a dependency, which breaks foundation/N2 (no dependencies), the property that lets Foundation sit beneath everything.
- **C. Graph stays a dependency.** This is today's state, and nothing new is built. Core installs all of Graph and uses only its technical base.

The Requirements and Tests are written for A. Under B, only the package that supplies Form changes. Under C, core/F76–F78 and core/T81–T83 are withdrawn, and core/N20 remains as the rule for Graph's capability features.
