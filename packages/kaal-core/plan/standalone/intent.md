# Core Standalone: Intent

This is `core/C32`, a PLAN Change. It ships no code. It authorizes no DO, synchronization, promotion, rename, version change or publication: those remain the Owner's.

## The Owner's direction

The Owner set the direction in two steps:
- **In project chat (2026-10-29 18:13 and 18:14):** Core should not need Graph. Capabilities complement each other (1+1 > 2), and only technical packages such as Foundation and Hosting may stay mandatory.
- **On #640 (comment 6508502305), the architectural decision:** no new Form package, and Form does not move into Foundation.

The decision on #640 rests on BASS, which applies to every capability:
- Nodes and Edges are valid, readable bare content whether or not `kaal-graph` is installed.
- Without Graph, an agent works with that content itself. With Graph, it gains deterministic construction, navigation and analysis.
- Graph does not confer validity, and it does not own a consuming capability's relationship semantics.

The decision also separates three things:
1. **Engineering and build-time use.** The build may use `kaal-graph` to build and verify the Node support delivered within `kaal-core`.
2. **Consumer runtime dependency.** kaal-core and its delivered Node support work without a separately installed Graph package.
3. **Capability installation and admission.** Only Graph-specific operational support is absent when Graph is not installed.

## What Core takes from Graph today

Today kaal-core depends on `kaal-graph` at runtime, for three things:
- **Node Form and identity.** `readFrontmatter`, `isName`, `isId` and `FormError` (Graph's `form.mjs`), and `identify`, `identifyRoot`, `claimsForm` and `sha256` (Graph's `node.mjs`). Every Node Core reads goes through them: the Kernel, `CASE`, `LOVE`, the Installation Contract, and every admitted Node.
- **The `Graph` class, as a lookup by name and id.** Core uses `named`, `node` and `resolve`. It never walks an Edge.
- **Planned: `graph/C2`'s `reach`, `reverse` and `cycles`.** `core/C26` uses them for registration's reach, incoming views and cycles (`core/A27`).

## The route without Graph's `node.d.ts` (`core/C38`)

`core/C32` planned four copies of Graph's files. The fourth, `node.d.ts`, is Graph's split of `node.mjs`'s declarations out of `edges.d.ts` (#651), and it exists only on `kaal/graph`. On #675 (2026-10-31) the Owner ruled that Graph-owned `node.d.ts` must not be copied into `kaal/core` to bypass lineage and promotion discipline (#670, #621). Either Core shows a bounded route that avoids a hard Graph dependency, for separate review, or Graph → `main` → Core stands.

`core/C38` is that route. It is bounded to what Graph has already delivered to Core's base through `main`:
- Graph's own declarations for `node.mjs` are in its `edges.d.ts` there. Core's build selects from that file only the statements that declare what `node.mjs` exports when it runs, and the types those use. Each statement is kept as Graph wrote it. An import or re-export keeps only the names it needs;
- when Graph's `node.d.ts` reaches `kaal/core` through `main`, the same build delivers it instead, with no Core Change;
- nothing of Graph's travels outside `main`, and Core authors no declaration of Graph's API.

On #689 the Owner asked for proof that the shipped TypeScript declarations can be consumed on their own and describe the embedded modules accurately. The proof must come from a real compiler, run in a clean, packed-and-installed consumer with no Graph. That is core/T95. It is why the route selects from `edges.d.ts` rather than delivering it whole: the whole file also declares Graph's `Graph` class and Edge API, which the embedded modules do not provide.

## The Intent

- **core/I24.** kaal-core installs and works without Graph.
  - Its Node support is Graph's contract, delivered inside kaal-core. One authoritative source exists, and it is Graph's.
  - Core's own admission and registration mechanics are Core's.
  - Graph's traversal and analysis machinery stays with Graph. Core uses it as an optional complement when Graph is present, and reports honestly when it is not.
