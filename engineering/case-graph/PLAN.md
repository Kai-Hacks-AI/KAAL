# Engineering: the Case graph computer (PLAN)

Status: PLAN (engineering, collector `kaal/engineering-boundary-engine`). Ids provisional until the collector integrates them. It authorizes no DO beyond this plan's own, and no promotion, version bump, SYNC, ledger entry, release dispatch or npm publication.

## Intent

A capability's Cases sit beside the Node that motivated them (an Intent, a Requirement, an Architecture element, a Defect, or the source). Whether a Case ships, and which suite it belongs to, must not be a folder or a hand-kept list. It is computed from the Case's `tests` edge and the capability's Architecture. Engineering owns the computer, because Engineering owns the one YAML parser; a capability stays dependency-free and its shipped verification reads only JSON that Engineering wrote (Owner rulings of 2026-11-09: computed, not folder-based; the parser is an acceptable Engineering dependency).

## Requirements (provisional ids)

- **R1. The computer.** `engineering/case-graph/compute.mjs --package <dir> [--write|--check]` reads a capability package and prints, or writes to `<dir>/04-test/engineering-check/cases.json`, or checks, the computed Case graph. It only reads the package (no import of a Case, no run, no network).
- **R2. The inputs.** (a) The Architecture Node `03-architecture/architecture.md`: the sections `## Solution`, `## Delivery` and `## Cross-cutting`, each element line `- **<cap>/A<n>** [<ids>]: ...` (the bracket lists the Requirements and Intents the element answers). (b) Every Case file: a file named `*.test.mjs` or `*.test.ts` outside `00-changes/`, `node_modules/`, `dist/` and `.git/`. Each starts with a YAML front matter block in a leading block comment, `/*---` ... `---*/`, with `tests` (the list of Node ids it verifies: Intents, Requirements, Defects or Architecture elements) and, optionally, `runs: external` (another runner owns its execution), parsed with `yaml`. Architecture never points at a Case; the graph is read from the Case side only. (c) Each Case title, `<cap>/T<n> [<targets>]: ...` or a fictitious `<cap>/TX-<name>`.
- **R3. The computed graph.** One record per Case: `id`, `file`, `targets`, `branch` and `ships`. The branch is the branch of the Architecture element the Case names; when it names none, it is the single branch that answers its targets (`solution` or `delivery`). `ships` is true exactly when the branch is `solution`; no flag is written by hand. One record per file: `ships`, `runs` (`shipped`, `collector` or `external`) and its Case ids. Order and format are deterministic.
- **R4. Fail closed.** The computer refuses (exit 2, nothing written) on: a Case file with no front matter or invalid front matter; a `tests` edge that is not exactly the union of its Cases' targets; an edge to an id no Node defines; a target answered by no element; a duplicate Case id; a Case whose title has no id and targets; a Case in both branches (a Case that names elements of both, or whose targets are cross-cutting and which names no element); a file whose Cases are not all of one branch (the file ships or does not); and a Case file that cannot be read.
- **R5. Outer checks are Delivery, said in Architecture.** Whether a Case can run in an installed copy is decided by where Architecture places what it verifies, not by a flag. A check of a shipped part from outside the installed package (it imports the repository or packs it) names a Delivery element that places outer checks, so its branch is Delivery and it does not ship. The capability states that element in its own Architecture.
- **R6. Capability side stays parser-free.** The capability's own tooling (build, collector, shipped verification) reads only `cases.json`. It copies a Case file into `dist/` only when `cases.json` says `ships: true`, runs the Cases with `ships: false` itself, and fails closed when a Case file in the tree is not in `cases.json`, when `cases.json` lists a file that is missing, or when a Case would run twice or not at all.
- **R7. Currency.** `--check` fails when the file on disk differs from a fresh computation. Engineering runs it for each capability it builds; the capability cannot run it (it has no parser).
- **R8. One dependency.** The computer imports `yaml` and Node's built-ins only. No package imports it.
- **R9. Fishy.** The computer also reports, as an observation and not as a failure, every Intent that no Requirement serves, every Requirement that no Architecture element answers, every Defect that names no Architecture element, and every Intent, Requirement, Defect or Architecture element that no Case reaches. A Case reaches a Node by pointing at it or at something below it in the chain (Intent <- Requirement <- Architecture, Defect <- Architecture). A disposition for a fishy item is recorded in the repository, as for boundary findings; the computer decides none.

## Architecture

`engineering/case-graph/compute.mjs` (CLI) over `graph.mjs` (the library: `readArchitecture`, `readCases`, `compute`). The computer shares no code with the boundary engine except the `yaml` dependency. Suites (BEST) are a later, separate extension of the same graph: one suite per Case, computed from the edge, never a hand-kept list.

## Testing (RED until the DO)

Engineering Cases on fixtures (no live capability is read): R2 inputs found, R3 each branch computed, R4 each refusal, R5 `ships: true` over a Delivery-only target refused and an outer Solution Case with `ships: false` accepted, R7 `--check` fails on drift, R8 imports. A conformance Case runs the computer on a fixture shaped like Foundation 0.0.2 (the Cases that ship today are exactly the `ships: true` files).

## Order

1. This PLAN, then its DO in Engineering.
2. Foundation's stage 4 (its own Change, on `kaal/foundation`): the front matter, the Cases beside their Nodes, `cases.json` written by the computer, and the build and collector reading it. Its Change records go to the capability's `00-changes/`.
3. The cross-collector proof point checks both together.
