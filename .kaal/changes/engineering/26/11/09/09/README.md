# Engineering: ARTIST, the Case graph computer (DO)

Capability: Engineering. Target: `kaal/engineering-boundary-engine`. Record number provisional until integration. DO of the approved PLAN `engineering/case-graph/PLAN.md` (#1305, CPO approved at 59c2743).

- `engineering/case-graph/graph.mjs` and `compute.mjs --package <dir> [--write | --check]`: reads a capability's Architecture, Nodes and Case files (YAML front matter `tests`, optional `runs: external`), computes each Case's branch and whether it ships, and writes `04-test/engineering-check/cases.json`. `--check` recomputes the whole content and fails on any drift. Exit 0 ok, 1 stale, 2 refused (nothing written). The traceability coverage gaps (untraced, uncovered) go to stderr and never change the exit code.
- Discovery is complete or refused: every `test(` or `it(` call (also `.skip`, `.only`, multiline) must be a recognized Case, an aliased `test` is refused, and a method such as `re.test(` is ignored.
- `engineering/case-graph/artist.test.mjs` holds nine Cases on fixtures, including a Foundation-shaped conformance fixture, the refusals, and stale-edge and wrong-branch `--check` failures. It is in `test:engineering`.
- Consistency with the ruling "no `ships` flag": the Boundary Engine no longer requires a `ships` key in a definition and refuses one; its adapter descriptor drops `ships`. Its PLAN text and tests follow.
- The rule is stricter than the throwaway script that wrote Foundation's `cases.json`: when a Case names an element, every target must be answered by an element of that branch. Run on the Foundation tree of #1306 it refuses 27 target pairs (outer Cases of shipped Requirements that A28 does not answer) and five shipped Cases whose target becomes cross-cutting. Foundation's follow-up on #1306 fixes its data (A28's bracket, the shipped Cases name A1/A7), then regenerates `cases.json` with this computer.

No promotion, version bump, SYNC, ledger entry, release dispatch or npm publication.
