# kaal-core 0.0.1 Release and Consumer Readiness: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A33** [core/F69, core/F70, core/N19]: Delivered layout. `package.json` `files` adds `docs`, `test/acceptance`, `test/unit` and `test/verify.mjs`, beside `dist`, `payload` and `installation.kaal.json`.
  - `test/acceptance/` holds one file for each outer loop: `intent`, `requirements` and `architecture`.
  - `test/unit/` holds the Code tests that need no build.
  - The delivered tests are plain `node:test` files that import kaal-core by its package name, so they exercise whichever copy is installed.
- **core/A34** [core/F70, core/F75]: Named suites and one runner.
  - `test:consumer` is the consumer verification, `node test/verify.mjs`. It runs the delivered loops, counts the tests in each, and prints and exits with the result (`verified` 0, `failed` 1, `cannot verify` 2). It builds nothing.
  - `test:publisher` is today's script: it builds with `tsc` and runs the publisher's tests.
  - `npm test` is `node test/run.mjs`, a runner that ships. It runs declared `test:<name>` scripts with `npm run`, in the order `package.json` declares them, and never runs `test` itself. It first decides where it is:
    - **installed,** when the package directory's real path sits directly in a `node_modules` directory (`node_modules/<name>` or `node_modules/@scope/<name>`). A workspace link resolves to its source directory, so it is not installed. Installed, the runner runs `test:consumer` alone and exits with its result;
    - **source,** otherwise, and only when both source markers are present: `src/` and `test/plan/`. Neither ships (`core/F72`). In source, the runner runs every declared `test:<name>` suite, continues past a failing one, and exits non-zero if any failed;
    - **refused, as `cannot verify` with exit 2, before any suite runs:** an installed package that carries a source marker (ambiguous), a source directory missing a marker (damaged), no declared `test:<name>` suite at all (empty), `test:consumer` missing in either place, or `test:publisher` missing in source. The runner names the reason.
  - Other declared suites, such as today's `test:boundary`, run in the source workspace like any other. `core/C29` decides whether a subset suite stays declared.
  - Engineering's lanes need no change. They run the comprehensive `npm test` in the source workspace. engineering/C6 (#625) adds a Consumer lane for the installed verdict, and `core/C29` takes kaal-core off that lane's not-ready list.
- **core/A35** [core/F72, core/F73]: Release acceptance packs and installs:
  - `npm pack` packs kaal-core and each runtime dependency;
  - the tarballs install with `npm install` into a directory under the operating system's temporary directory;
  - the installed `npm test` runs in the installed kaal-core, `node_modules/@kaihacksai/kaal-core` once `core/F74` holds. The tests read the name from `package.json`, so they need no edit when it changes.

  Core's planned test does this itself for 0.0.1. Engineering's consumer harness for Guard (`engineering/guard/consumer/`) may later host it.
- **core/A36** [core/F73, core/F74]: Renames and publication readiness, each in its owner's Change:
  - Hosting renames `kaal-hosting` to `@kaihacksai/kaal-hosting`;
  - Graph renames `kaal-graph` to `@kaihacksai/kaal-graph`;
  - Foundation removes `private` from `@kaihacksai/kaal-foundation` and plans its own publication readiness;
  - Core renames kaal-core to `@kaihacksai/kaal-core` in `core/C29`.

  Each owner verifies its own packed consumer experience. A rename cannot be split from the references to the old name without breaking the workspace. So a rename Change updates every import and dependency entry that names its package, in the same PR. It runs each affected package's own `npm test` before it asks for review, and asks each affected owner to review. It changes nothing else in their files. The renames go one at a time, Hosting first and Core last, because they touch the same importers.

## Ownership

| Who | Owns |
| --- | --- |
| Core | the delivered documents, the delivered tests, `test/verify.mjs`, the package layout, the scope of 0.0.1, and the planned release acceptance |
| Testing | what verification, a result and coverage mean. `docs/testing.md` cites Testing and does not restate it |
| Engineering | the Workspaces and Acceptance lanes, and any shared consumer harness |
| Graph, Hosting, Foundation | the rename, publication readiness and packed consumer verification of their own package, which Core depends on |
| the Owner | the version, synchronization, promotion and publication. The package scope is aligned: `@kaihacksai/kaal-*` (#622) |

## Release dependency map

| Order | Change | Owner | Depends on | State |
| --- | --- | --- | --- | --- |
| 1 | `core/C30` PLAN (#600): scoped kinds, hierarchies, shared terms, candidates | Core | `core/C24` | open, awaiting review |
| 2 | `core/C28` PLAN, this Change | Core | the Owner's 0.0.1 decision on #600 | this PR |
| 3 | `graph/C3` DO on `main`: reach, reverse and cycles | Graph | — | merged into `kaal/graph` (#593), promotion in flight |
| 4 | sync `main` → `kaal/core`, carrying `graph/C3` | Core | 3 | after Graph's promotion, in the promotion queue |
| 5 | `core/C26` DO: Registration Type, `kaal-core/registration`, `verify`, core/T50–T59, T67, T72, T73 GREEN | Core | 1, 4, `core/C11`, `core/C27` (both merged) | — |
| 6 | Hosting PLAN and DO: rename to `@kaihacksai/kaal-hosting` | Hosting | — | to be raised by Hosting |
| 7 | Graph PLAN and DO: rename to `@kaihacksai/kaal-graph` | Graph | 6 | to be raised by Graph |
| 8 | Foundation PLAN and DO: publishable, independently installable `@kaihacksai/kaal-foundation` | Foundation | — | to be raised by Foundation |
| 9 | `engineering/C6`: the Consumer lane, which runs each installed package's `npm test` | Engineering | — | #625, open |
| 10 | `core/C29` DO: rename to `@kaihacksai/kaal-core`, delivered documents and tests, `test/verify.mjs`, core/T74–T80 GREEN | Core | 2, 5, 7, 8, and release blocker 3 | — |
| 11 | promotions of Hosting, Graph and Foundation, and of `kaal/core` → `main` | each owner | 6–10 | Owner's go |
| 12 | publication of `@kaihacksai/kaal-hosting`, `@kaihacksai/kaal-graph` and `@kaihacksai/kaal-foundation` 0.0.1 | their owners | 11 | Owner's go |
| 13 | publication of `@kaihacksai/kaal-core` 0.0.1 | Owner | 11, 12 | Owner's hand |

`core/C29` writes the documents after `core/C26`, so they describe the registration that ships.

## Release blockers

Each of these blocks the release until the party named resolves it. None is resolved by convenience inside a Core Change, and `core/C29` does not work around any of them.

1. **A private dependency.** kaal-core depends on `@kaihacksai/kaal-foundation` 0.0.1, which is marked `private`, so a consumer cannot install it. core/T78 is RED on this. The Owner decided on #622: Foundation becomes a separately installable, published package. Foundation's owner plans and verifies its own readiness (map row 8), and the version and publication stay the Owner's. The blocker holds until that lands.
2. **Package scope and names.** kaal-core, `kaal-graph` and `kaal-hosting` are unscoped today. core/T79 is RED on this. The Owner decided on #622: all four use the `@kaihacksai/kaal-*` namespace, consistent with Guard. Each owner renames its own package (map rows 6, 7 and 10, `core/A36`), and Core never renames another capability's package. The blocker holds until every rename lands.
3. **The result vocabulary.** `test/verify.mjs` reports `verified`, `failed` and `cannot verify`. Their definitions are cited from Testing (testing/C9). Core does not import Guard's semantic authority over them, even though Guard uses the same words (guard/F31–guard/F36). If Testing does not define them, that is Testing's decision to make.
4. **The test entry.** Resolved by the Owner's convention on #625: source `npm test` stays comprehensive, and the installed `npm test` runs consumer verification only (`core/F75`, `core/A34`). Engineering's source lanes need no change, and `core/C29` does not wait on Engineering.
