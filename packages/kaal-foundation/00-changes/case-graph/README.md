# Foundation: tree DO stage 4, the Cases sit beside their Nodes and their branch is computed (C21)

Capability: Foundation. Target: `kaal/foundation`. Record number provisional until integration. Stage 4 of the landed tree PLAN (#1294), amended by the Owner's rulings of 2026-11-09 (the branch is computed from Architecture, not a `delivery/` folder; no `ships` flag; a Case points at a Node and no Node points at a Case; the YAML parser is Engineering's). Stages 1 to 3 are #1302, #1303, #1304.

## What changes
- **Requirements amended:** F38 to F44, N23 and N24 are now defined in the Nodes (carried from the PLAN) and reworded for the computed rule. F39: a Case names what it verifies; an Architecture element it names decides its branch; a Case on a cross-cutting target names the element; a Solution Case ships and a Delivery Case does not. F41 and F42: the build and the collector read `cases.json`. F43: the graph is computed by Engineering from the `tests` edges; the package reads only JSON.
- **Architecture:** new Delivery element A28 (the publisher's outer checks of the shipped parts, run from the repository and never installed). A23 and A24 describe the computed graph. A25 and the A25 index no longer name any Case: Architecture does not point at Cases. The Cross-cutting section gains I1, I2, I7 and I14 (A28 answers them beside Solution).
- **Cases:** every Case file starts with a `/*---` front matter block holding its `tests` edge (the union of its titles' targets). Cases that verify a shipped part from outside, and the generic acceptance Cases, now also name A28, A26 or A27; the shipped Cases name A1, A7 or A15 where a target was cross-cutting. T9 names A6. Case files move beside their Nodes: the eleven publisher files and the tree plan test go from `04-test/engineering-check/publisher/` and `plan/` to `02-requirements/functional/` and `03-architecture/`. `declaration.test.mjs` of the publisher becomes `declaration-distribution.test.mjs` (the Node folder already has `declaration.test.mjs`). `04-test` holds no Case.
- **Computed graph:** `04-test/engineering-check/cases.json` (Engineering's Case graph computer writes it; this Change commits its first output; the computer itself is Engineering's PLAN, #1305) lists each Case file, its Cases, whether it ships and who runs it. `build.mjs` copies a Case file only when the graph marks it shipping, and refuses a graph that is not exactly the Case files on disk. `collect.mjs` runs every other listed Case file once and refuses the same mismatch. New `cases.mjs` reads the graph (JSON only). The 11 Cases that ship today are exactly the computed Solution Cases.
- **Tests:** T65 is amended to the element rule, T67 to the computed build (shipping file ships, others do not, an unlisted file stops the build), T68 to the computed collector (an unlisted file stops it, a listed Case runs once). T64, T66, T69 and T70 are unchanged and GREEN.
- **Change records:** this thread's earlier Foundation records move here from `.kaal/changes/foundation/26/11/09/05` to `09`, into `00-changes/` (the capability's own history, never in `dist/`). Records 01 to 04 under `.kaal/changes/foundation/` were not written in this thread and stay.
- `verify.json` regenerated.

## Not done here
The computer itself and its report of what is unanswered (Engineering PLAN #1305, then its DO); BEST suites; the layering Change.

**Merge gate (CPO, 9 Nov), met.** `cases.json` is now written by Engineering's ARTIST (merged in #1307) and `compute.mjs --package . --check` passes on this package: 59 Cases, 11 ship. ARTIST is stricter than the throwaway script that first wrote the file, and it found T9, which that script had missed because its title is on its own line. This Change repaired Foundation's data to satisfy it: A28 answers the Requirements whose outer checks it places (so they are cross-cutting), and the shipped Cases that target such a Requirement name their Solution element (T23 to T26 and T28 name A7, T63 names A19). No Case or definition carries a `ships` flag; it is computed output only (A23).

## Verified
`npm run test:publisher` 47 of 47, `npm test` verified, T64 to T70 GREEN.

## Not authorized
No promotion, version bump on main, SYNC, ledger entry, release dispatch or npm publication.
