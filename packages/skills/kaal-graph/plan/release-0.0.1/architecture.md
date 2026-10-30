# Graph 0.0.1: Architecture

Each element names, in brackets, the Requirements it answers.

- **graph/A5** [graph/F5–graph/F7]: The delivered layout adds `docs/`, `test/consumer/`, `test/verify.mjs` and `test/verify.json` to `files`, beside `payload` and `skills`.
  - `scripts.test` is `node test/verify.mjs`.
  - `scripts.test:publisher` runs today's test files. Engineering's Workspaces lane runs `test:publisher` where it is declared, which is Engineering's own Change on #622.
- **graph/A6** [graph/F6]: `test/verify.mjs` follows the shape of Core's `core/A33` and Guard's `guard/A18`.
  - It imports nothing from `skills/`, so a broken runtime cannot mask itself.
  - It clears `NODE_TEST_CONTEXT`.
  - It counts declared tests, because `node --test` reports a file with no tests as one passing test.
- **graph/A7** [graph/F8]: The rename lands in `graph/C5`, after Hosting's rename is on `kaal/graph`'s base. As you aligned on #622, one rename PR updates every reference to `kaal-graph` across the repository, and nothing else. Those references are in Core (its devDependency and the source of its core/C32 copy), Testing, the Engineer Skill and Engineering, and each of their owners reviews.
- **graph/A8** [graph/F8]: The CLI keeps its dependency on Hosting. Nothing above Hosting knows the OS, so Graph does not read files itself. Graph 0.0.1 therefore cannot publish before `@kaihacksai/kaal-hosting` does.

## Change graph and dependencies

| Change | Owner | Waits on |
| --- | --- | --- |
| `graph/C7` (#651): `node.d.ts`, the declarations core/C32 copies | Graph | — |
| `graph/C4` PLAN (this) | Graph | — |
| `graph/C5` DO: the documents, delivered cases, verify, scripts, `files` and the rename. graph/T8–graph/T12 GREEN | Graph | `graph/C4`; Hosting's rename on the base |
| `graph/C6` release acceptance. graph/T13 GREEN, with evidence | Graph | `graph/C5` |
| Hosting's rename and readiness (hosting/C10, #629) | Hosting | your review |
| Engineering: Workspaces runs `test:publisher` (engineering/C6, #625) | Engineering | your review |
| sync, then promotion of the accepted release candidate (#621 held until then), then publication | Owner | `graph/C6`; each authorized separately |

**Graph's place in Core's release.** Core no longer depends on Graph at runtime (core/C32). Graph's release is its own, and Core's build reads Graph's Form and identity files only from Graph's checkout as a devDependency. `graph/C7` is core/C33's prerequisite.
