# kaal-change 0.0.1 Release: Architecture

Each element names, in brackets, the Requirements it answers.

- **change/A11** [change/F18, change/N6]: **The package.** `packages/skills/kaal-change/package.json` is renamed to `@kaihacksai/kaal-change`.
  - `files` lists `capability`, `lib`, `docs`, `test/consumer`, `test/verify.mjs` and `test/verify.json`.
  - Graph is declared in `peerDependencies` under its published name `@kaihacksai/kaal-graph` (the Owner's package names, #622), and marked optional in `peerDependenciesMeta`. There are no `dependencies`.
  - Repository references to `kaal-change`, its workspace name and its README's import paths move with the rename in the same DO Change.
- **change/A12** [change/F19, change/F29]: **Loading the optional peer.** `lib/delivery.mjs` imports Graph dynamically, inside `assess`. A module-not-found for Graph alone becomes the `cannot-assess` result, with the peer and the next steps of change/F29 as constants of `lib/delivery.mjs`. Any other failure propagates.
- **change/A13** [change/F20, change/F21]: **Shipped documentation.** `docs/` is written for the consumer. It consolidates the contracts of `change/C1` and of the Change Definitions already shipped, under their own identifiers, and cites no plan. Operations moves from the README into `docs/operations.md`, and the README links it. `plan/` stays in the repository as the publisher's design record.
- **change/A14** [change/F22–change/F24, change/F31, change/F32, change/N7]: **Consumer verification.** `test/verify.mjs` is the `test` script, and uses only Node's built-ins.
  - **Inputs.** It reads `test/verify.json`: the declared cases, each with when it applies (`always`, `graph` or `no-graph`); the SHA-256 of every other shipped file; and `requirements`, mapping each Requirement to the case names that decide it or to `{ "allocated": "<where>" }` (change/F32). It detects Graph by resolving it from the consumer, never from a source path.
  - **What it runs.** It runs `test/consumer/` against the installed copy, which imports only the package's public entry points.
  - **Its output.** It judges the result, prints the evidence and the coverage, and ends with the result line of change/F22.
  - **How it runs cases.** It starts them with `process.execPath`, never through a shell (change/F31).
  - **Its semantics.** It realizes Testing's consumer-verification semantics (`testing/C9`) in Change's own code, and imports nothing from `lib/`, so a broken runtime cannot mask itself.
- **change/A15** [change/F24, change/F30]: **The declared source Test Plan** (packaging/F14, packaging/A11).
  - **`test:embedded`.** It is `node test/verify.mjs`, the Embedded verification, which runs the same in the source workspace before packing and in the installed package.
  - **`test:publisher`.** The repository's own tests stay in `test/` outside `files`, and run as this script. They include the Change Record and numbering tests against KAAL's `.kaal/changes/`, tests importing `kaal-core`, and `test/plan/`.
  - **`test`.** It runs `test:embedded`, the consumer-entry form of a source plan that packaging/A11 keeps legitimate. The repository root's `npm test` stays Engineering's comprehensive orchestration (engineering/C6).
- **change/A16** [change/F25, change/F26]: **Change's specific acceptance, on the same artifact as the generic one.** `test/acceptance/` is the publisher's acceptance harness, and is not shipped.
  - **What it does.** It runs `npm pack` on Change and on Graph into a temporary directory. It installs the artifacts into fresh consumers through `npm install <tarball>`, with no workspace, and runs `npm test` there in each scenario of change/F25. It then uninstalls the package, and compares the consumer's files before and after.
  - **Dual conformance.** Engineering runs Packaging's generic conformance suite (packaging/A7) and this specific acceptance on one packed-and-installed candidate, identified by its SHA-256 (packaging/A9), and reports the two results apart (engineering/F17–F19). Change states no generic case, and runs no Packaging case itself.

## Ownership

| Who | Owns |
| --- | --- |
| Change | the package, its documentation, its consumer verification and the manifest, its release notes, and its acceptance |
| Packaging | the generic KAAL Package contract (packaging/F7–F14, packaging/N7–N10) and its conformance suite, which Change conforms to and does not restate |
| Testing | consumer-verification semantics (`testing/C9`), the verifier contract (testing/C29) and what coverage and applicability mean, which Change realizes and does not redefine |
| Hosting | what host compatibility means (hosting/N1) |
| Graph | its own package and its publication. Change's release needs a published Graph only for the delivery scope. |
| Engineering | the `test:publisher` lane, the CI that runs publisher and acceptance evidence, and the dual generic and specific conformance on one candidate |
| The Owner | synchronization, promotion and publication, the npm scope, and each release's go |

## Change graph

| Change | Owner | Succeeds |
| --- | --- | --- |
| `change/C1` PLAN, Change Nodes, succession and delivery | Change | nothing (merged, #530) |
| `change/C4` PLAN, this Change | Change | `change/C1` |
| DO of `change/C1`: `./delivery`, with the optional-peer loading of change/A12 | Change | `change/C1`, `change/C4` |
| DO of `change/C4`: the rename, `docs/` with `docs/operations.md`, consumer verification with coverage, the declared source Test Plan, change/T24–change/T27, change/T34 and change/T35 GREEN | Change | the DO of `change/C1` |
| `change/C6`: acceptance on the packed artifacts, change/T28, change/T29 and change/T33 GREEN | Change | the DO of `change/C4` |
| Dual conformance on the candidate | Engineering | `change/C6`, Packaging's conformance suite (`packaging/C5`), and engineering/C5's release-readiness DO |
| Synchronization of `kaal/change` with main, promotion, and publication of `@kaihacksai/kaal-change` 0.0.1 | the Owner | the dual conformance, and for the delivery scope, a published Graph |

`change/C5` is retired, because Delivers folded into `change/C1`. `change/C2` DO, `change/C3`, the Change map and registration with Core are not part of 0.0.1.
