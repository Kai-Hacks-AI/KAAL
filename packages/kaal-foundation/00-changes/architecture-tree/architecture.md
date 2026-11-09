# Architecture tree: Architecture

Each element names, in brackets, the Requirements it answers.

- **foundation/A22** [foundation/F38, foundation/F39, foundation/N23]: **The tree lives in one file.** `03-architecture/architecture.md` holds `## Solution`, `## Delivery` and `## Cross-cutting`, in that order. The first two hold the leaves; the third lists the Intents and Requirements that leaves in both branches answer. Existing elements are placed by the rule in `testing.md` ("Proposed placement"): A1, A7 (the shipped rows), A9, A15, A16 and A19 to A21 under Solution; the build, the manifest generator, the pack and publication path and the ownership claim under Delivery. No element is renamed; only its place changes.
- **foundation/A23** [foundation/F40, foundation/F42]: **One collector, by pointer and by branch.** The collector (temporary, Testing's rule) answers "who points at this?" from the Cases' YAML (foundation/F43) and derives each Case's branch from the element it points at. Until the pointers are YAML it keeps reading the title and the folder: Solution Cases are the `*.test.mjs` beside the Nodes outside any `delivery/` folder; Delivery Cases are those in `delivery/` folders. `verify.mjs` pulls the first set, `test:publisher` pulls the second. The engineering side may carry its own copy of the discovery rule only until Testing's mechanism lands.
- **foundation/A24** [foundation/F41]: **A visible rule in the build.** `build.mjs` copies the folders as it does today and skips any directory named `delivery`. The rule is one line and is visible in the file tree.
- **foundation/A25** [foundation/F44]: **Placed here, belongs elsewhere.** Architecture's job includes spotting a thing that is implemented here but belongs to an outside package. The section lists each such thing with its owner. Today: the generic acceptance Cases T16, T17 (tamper half) and T47 (pack half), owner kaal-packaging, relied on by Foundation's I16 through a suite in Foundation's `04-test/` that collects Packaging's Cases by reference, never through a reference from Packaging back; the temporary collector `collect.mjs`, owner kaal-testing. Engineering holds them until the owner lands.

## Sequence

| Order | Change | Depends on |
| --- | --- | --- |
| 1 | foundation/C21 PLAN, this Change | the Owner's ruling (2026-11-09) |
| 2 | foundation/C21 DO: restructure the Architecture into the tree, move the Delivery Cases into `delivery/` folders beside their Nodes, give the untitled Cases ids, teach the collector and the build, switch `test:publisher` to the collector, T64 to T69 GREEN | 1, and the boundary DO (#1293) merged |
| 3 | the layering Change (Hosting is the bottom): a one-line edit under Solution A1 plus the declaration and its pins | 2 |

Cross-cutting Cases are not placed by the DO. They are listed, with their reason, and the Owner rules on each.
