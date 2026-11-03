# Graph 0.0.1: Testing

The planned tests live in `packages/skills/kaal-graph/test/plan/release.test.mjs`. DO and CHECK do not change them. `graph/C5` turns graph/T8–graph/T12 and graph/T15 GREEN, and `graph/C6` turns graph/T13 GREEN. graph/T13 needs the checkout to pack, so it stays a publisher test.

| Test | Checks | Loop |
| --- | --- | --- |
| graph/T8: the package carries the six documents, linked from the README. They link only shipped files, name no plan or Engineering path, and define every identifier the delivered cases cite | graph/F5 | Requirements |
| graph/T9: `npm test` is `node test/verify.mjs` and builds nothing. `test:publisher` runs `test/publisher/` and the same verify, and never runs an embedded case a second time | graph/F6, graph/F7, graph/A5 | Architecture |
| graph/T10: `files` ships `docs`, `payload`, `skills`, `test/embedded`, `test/verify.mjs` and `test/verify.json`, and not `plan`, `test/plan` or `test/publisher` | graph/F7, graph/A5 | Architecture |
| graph/T11: the name is `@kaihacksai/kaal-graph`, and every KAAL runtime dependency is `@kaihacksai/kaal-*` | graph/F8 | Requirements |
| graph/T12: in a copy of the package, verify is verified (0). A changed shipped file is failed (1), naming it. An empty case inventory is unknown (2) | graph/F6 | Requirements |
| graph/T14: `form.mjs`, `node.mjs` and their declarations import only `yaml`, `node:` built-ins and each other. Blocked until `node.d.ts` exists (`graph/C7`) | graph/N7 | Architecture |
| graph/T15: every existing case is placed exactly once: each one that verifies shipped behaviour is embedded, each Engineering-side one stays out of the package, and no test file is left unplaced | graph/F7 | Requirements |
| graph/T13: the packed tarball and its packed runtime dependencies install into a clean directory. There, the installed files match `docs/operations.md`, `npm test` is verified, and `kaal-graph check` passes on the shipped payload (publisher) | graph/F9, graph/I4 | Intent |

graph/N5 is checked by graph/T1–graph/T7 and the existing tests staying GREEN.

## Placement of today's cases (graph/F7)

graph/T15 holds this inventory exactly, by title.

| Today | Cases | Verifies | Placement |
| --- | --- | --- | --- |
| `test/graph.test.mjs`: the Form, reading frontmatter, Edges, constructing a Node, the graph | 35 (the refused-Edge case runs once per input) | shipped behaviour of `.` and `./form` | Embedded, `test/embedded/graph.test.mjs` |
| `test/graph.test.mjs`: "delivers KNIFE in Form", "checks and navigates Nodes on disk" | 2 | the shipped payload and the CLI. The CLI case runs the installed `bin` | Embedded |
| `test/graph.test.mjs`: "has an Agent Skill that conforms" | 1 | conformance to the Engineer Skill, a repository tool | Engineering, `test/publisher/` |
| `test/structure.test.mjs` | 3 | graph/N3 on shipped results | Embedded |
| `test/plan/cycles.test.mjs`, graph/T1–graph/T7 | 7 | graph/F1–graph/F4, graph/N1–graph/N3 | Embedded, moved unchanged |
| `test/ownership.test.mjs` | 1 | Graph's ownership claim, repository data that does not ship | Engineering, `test/publisher/` |
| `test/acceptance/graph.test.mjs` | 3 | the packed package's dependencies and its integration with Core | Engineering, `test/acceptance/` | graph/N6 is checked by the repository's Acceptance jobs on three platforms.

## RED evidence

The tests run with `node --test packages/skills/kaal-graph/test/plan/release.test.mjs`, outside `npm test`.
- **Discriminating:** graph/T8 (no `docs/`), graph/T9 (`npm test` runs the source tests and `pretest` builds Hosting), graph/T10 (`files` is `payload`, `skills`), graph/T11 (the name is `kaal-graph`) and graph/T15 (no case is embedded yet). I checked graph/T15 both ways locally: with the placement above it is GREEN, and a case copied into `test/publisher/` as well turns it RED.
- **Blocked:** graph/T12 and graph/T13 fail first on `blocked:`, because `test/verify.mjs` does not exist. graph/T14 fails first on `blocked:` until `graph/C7` (#651) puts `node.d.ts` on the base; with it, graph/T14 is GREEN, and adding an import of another Graph file to `node.mjs` turns it RED.
