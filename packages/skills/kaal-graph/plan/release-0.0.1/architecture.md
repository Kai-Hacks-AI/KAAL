# Graph 0.0.1: Architecture

Each element names, in brackets, the Requirements it answers.

- **graph/A5** [graph/F5–graph/F7]: The delivered layout adds `docs/`, `test/consumer/`, `test/verify.mjs` and `test/verify.json` to `files`, beside `payload` and `skills`.
  - `scripts.test` is `node test/verify.mjs`.
  - `scripts.test:publisher` runs today's test files. Engineering's Workspaces lane runs `test:publisher` where it is declared, which is Engineering's own Change on #622.
- **graph/A6** [graph/F6]: `test/verify.mjs` follows the shape of Core's `core/A33` and Guard's `guard/A18`.
  - It imports nothing from `skills/`, so a broken runtime cannot mask itself.
  - It clears `NODE_TEST_CONTEXT`.
  - It counts declared tests, because `node --test` reports a file with no tests as one passing test.
- **graph/A7** [graph/F8]: The rename lands in `graph/C5`, after Hosting's rename is on `kaal/graph`'s base. Which files that Change edits follows your answer on #622 (core/A36):
  - **Default:** the rename updates every reference to `kaal-graph` across the repository, and nothing else. Those references are in Core, Testing, the Engineer Skill and Engineering, and each of their owners reviews.
  - **Alternative:** one coordinated PR per importer.
- **graph/A8** [graph/F8]: The CLI keeps its dependency on Hosting. Nothing above Hosting knows the OS, so Graph does not read files itself. Graph 0.0.1 therefore cannot publish before `@kaihacksai/kaal-hosting` does.

## Change graph and dependencies

| Change | Owner | Waits on |
| --- | --- | --- |
| `graph/C4` PLAN (this) | Graph | your decision on #621's order |
| `graph/C5` DO: the documents, delivered cases, verify, scripts, `files` and the rename. graph/T8–graph/T12 GREEN | Graph | `graph/C4`; Hosting's rename on the base |
| `graph/C6` release acceptance. graph/T13 GREEN, with evidence | Graph | `graph/C5` |
| Hosting's rename and readiness | Hosting (no active owner thread) | your assignment |
| Engineering: Workspaces runs `test:publisher` | Engineering | — |
| sync, promotion and publication | Owner | each authorized separately |

**Graph's place in Core's release** (core/A36, row 7). Core publishes after Hosting, Graph and Foundation, so `graph/C6` is on Core's path to publication. graph/C3, already in #621, is what Core's C26 needs on `main` now.
