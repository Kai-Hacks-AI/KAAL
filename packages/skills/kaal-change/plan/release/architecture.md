# kaal-change 0.0.1 Release: Architecture

Each element names, in brackets, the Requirements it answers.

- **change/A11** [change/F18, change/N6]: **The package.** `packages/skills/kaal-change/package.json` is renamed to `@kaihacksai/kaal-change`.
  - `files` lists `capability`, `lib`, `docs`, `test/consumer`, `test/verify.mjs` and `test/verify.json`.
  - Graph is declared in `peerDependencies` under its published name `@kaihacksai/kaal-graph` (the Owner's package names, #622), and marked optional in `peerDependenciesMeta`. There are no `dependencies`.
  - Repository references to `kaal-change`, its workspace name and its README's import paths move with the rename in the same DO Change.
- **change/A12** [change/F19]: **Loading the optional peer.** `lib/delivery.mjs` imports Graph dynamically, inside `assess`. A module-not-found for Graph alone becomes the `cannot-assess` result. Any other failure propagates.
- **change/A13** [change/F20, change/F21]: **Shipped documentation.** `docs/` is written for the consumer. It consolidates the contracts of `change/C1` and of the Change Definitions already shipped, under their own identifiers, and cites no plan. `plan/` stays in the repository as the publisher's design record.
- **change/A14** [change/F22–change/F24, change/N7]: **Consumer verification.** `test/verify.mjs` is the `test` script, and uses only Node's built-ins.
  - **Inputs.** It reads `test/verify.json`, the manifest of declared cases and the SHA-256 of every other shipped file.
  - **What it runs.** It runs `test/consumer/` against the installed copy, which imports only the package's public entry points.
  - **Its output.** It judges the result, and prints the evidence.
  - **Its exit statuses.** verified is 0, failed is 1 and unknown is 2.
  - **Its semantics.** It realizes Testing's consumer-verification semantics (`testing/C9`) in Change's own code, and imports nothing from `lib/`, so a broken runtime cannot mask itself.
- **change/A15** [change/F24]: **The publisher's tests.** The repository's own tests stay in `test/` outside `files`, and run as the publisher's `test:publisher` script. They include the Change Record and numbering tests against KAAL's `.kaal/changes/`, tests importing `kaal-core`, and `test/plan/`.
- **change/A16** [change/F25, change/F26]: **Acceptance.** `test/acceptance/` is the publisher's acceptance harness, and is not shipped. It runs `npm pack` on Change and on Graph into a temporary directory. It installs each artifact into a fresh consumer through `npm install <tarball>`, with no workspace, and runs `npm test` there under each scope. It then uninstalls the package, and compares the consumer's files before and after.

## Ownership

| Who | Owns |
| --- | --- |
| Change | the package, its documentation, its consumer verification and the manifest, its release notes, and its acceptance |
| Testing | consumer-verification semantics (`testing/C9`), which Change realizes and does not redefine |
| Graph | its own package and its publication. Change's release needs a published Graph only for the delivery scope. |
| Engineering | the `test:publisher` lane, and the CI that runs publisher and acceptance evidence |
| The Owner | synchronization, promotion and publication, the npm scope, and each release's go |

## Change graph

| Change | Owner | Succeeds |
| --- | --- | --- |
| `change/C1` PLAN, Change Nodes, succession and delivery | Change | nothing (merged, #530) |
| `change/C4` PLAN, this Change | Change | `change/C1` |
| DO of `change/C1`: `./delivery`, with the optional-peer loading of change/A12 | Change | `change/C1`, `change/C4` |
| DO of `change/C4`: the rename, `docs/`, consumer verification, the publisher split, change/T24–change/T27 GREEN | Change | the DO of `change/C1` |
| `change/C6`: acceptance on the packed artifacts, change/T28 and change/T29 GREEN | Change | the DO of `change/C4` |
| Synchronization of `kaal/change` with main, promotion, and publication of `@kaihacksai/kaal-change` 0.0.1 | the Owner | `change/C6`, and for the delivery scope, a published Graph |

`change/C5` is retired, because Delivers folded into `change/C1`. `change/C2` DO, `change/C3`, the Change map and registration with Core are not part of 0.0.1.
