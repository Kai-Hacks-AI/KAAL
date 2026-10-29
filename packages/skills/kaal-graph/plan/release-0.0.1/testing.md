# Graph 0.0.1: Testing

The planned tests live in `packages/skills/kaal-graph/test/plan/release.test.mjs`. DO and CHECK do not change them. `graph/C5` turns graph/T8–graph/T12 GREEN, and `graph/C6` turns graph/T13 GREEN. graph/T13 needs the checkout to pack, so it stays a publisher test.

| Test | Checks | Loop |
| --- | --- | --- |
| graph/T8: the package carries the six documents, linked from the README. They link only shipped files, name no plan or Engineering path, and define every identifier the delivered cases cite | graph/F5 | Requirements |
| graph/T9: `npm test` is `node test/verify.mjs` and builds nothing. `test:publisher` names today's test files | graph/F6, graph/F7, graph/A5 | Architecture |
| graph/T10: `files` ships `docs`, `payload`, `skills`, `test/consumer`, `test/verify.mjs` and `test/verify.json`, and not `plan` or `test/plan` | graph/F7, graph/A5 | Architecture |
| graph/T11: the name is `@kaihacksai/kaal-graph`, and every KAAL runtime dependency is `@kaihacksai/kaal-*` | graph/F8 | Requirements |
| graph/T12: in a copy of the package, verify is verified (0). A changed shipped file is failed (1), naming it. An empty case inventory is unknown (2) | graph/F6 | Requirements |
| graph/T13: the packed tarball and its packed runtime dependencies install into a clean directory. There, the installed files match `docs/operations.md`, `npm test` is verified, and `kaal-graph check` passes on the shipped payload (publisher) | graph/F9, graph/I4 | Intent |

graph/N5 is checked by graph/T1–graph/T7 and the existing tests staying GREEN. graph/N6 is checked by the repository's Acceptance jobs on three platforms.

## RED evidence

The tests run with `node --test packages/skills/kaal-graph/test/plan/release.test.mjs`, outside `npm test`.
- **Discriminating:** graph/T8 (no `docs/`), graph/T9 (`npm test` runs the source tests and `pretest` builds Hosting), graph/T10 (`files` is `payload`, `skills`) and graph/T11 (the name is `kaal-graph`).
- **Blocked:** graph/T12 and graph/T13 fail first on `blocked:`, because `test/verify.mjs` does not exist.
