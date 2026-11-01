# kaal-core 0.0.1 Release and Consumer Readiness: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A33** [core/F69, core/F70, core/F85, core/N19] (revised by `core/C36` and `core/C39`): Delivered layout. `package.json` `files` adds `docs`, `test/embed`, `test/run.mjs`, `test/verify.mjs` and the manifest `test/verify.json`, beside `dist`, `payload` and `installation.kaal.json`.
  - `test/embed/` holds kaal-core's own shipped cases, one file for each loop: `intent`, `requirements`, `architecture` and `code`. The Code cases need no build.
  - The location says the cases' purpose and owner, not their kind (`testing/C43`, the Owner's review on #702): kaal-core's own `npm test` runs them against the installed copy, and Engineering's lane never discovers them. Each case's loop is its trace in the model, through the `core/…` subjects its name brackets, not its directory.
  - The delivered tests are plain `node:test` files that import kaal-core by its package name, so they exercise whichever copy is installed.
- **core/A34** [core/F70, core/F75]: Named suites and one runner.
  - `test:consumer` is the consumer verification, `node test/verify.mjs`. It checks the installation against `test/verify.json`, runs the delivered loops, compares the cases that ran with the declared cases (`core/A43`), and prints and exits with the result (`verified` 0, `failed` 1, `cannot verify` 2). It builds nothing. (Revised by `core/C36`: it no longer decides on counts.)
  - `test:publisher` is today's script: it builds with `tsc` and runs the publisher's tests.
  - `npm test` is `node test/run.mjs`, a runner that ships. It runs declared `test:<name>` scripts with `npm run`, in the order `package.json` declares them, and never runs `test` itself. It first decides where it is:
    - **installed,** when the package directory's real path sits directly in a `node_modules` directory (`node_modules/<name>` or `node_modules/@scope/<name>`). A workspace link resolves to its source directory, so it is not installed. Installed, the runner runs `test:consumer` alone and exits with its result;
    - **source,** otherwise, and only when both source markers are present: `src/` and `test/plan/`. Neither ships (`core/F72`). In source, the runner runs every declared `test:<name>` suite, continues past a failing one, and exits non-zero if any failed;
    - **refused, as `cannot verify` with exit 2, before any suite runs:** an installed package that carries a source marker (ambiguous), a source directory missing a marker (damaged), no declared `test:<name>` suite at all (empty), `test:consumer` missing in either place, or `test:publisher` missing in source. The runner names the reason.
  - Other declared suites, such as today's `test:boundary`, run in the source workspace like any other. `core/C29` decides whether a subset suite stays declared.
  - Engineering's lanes need no change. They run the comprehensive `npm test` in the source workspace. (Revised by `core/C36`: the earlier reference to an engineering/C6 Consumer lane was stale.)
    - Verification of the packed artifact is engineering/C7 (#641).
    - Release readiness is engineering/C5 (engineering/F17–F19, #610). It runs Packaging's conformance suite (packaging/A7) beside kaal-core's own verification on one packed-and-installed candidate.
    - Under packaging/A11, kaal-core's comprehensive source `npm test` is a legitimate declared Test Plan (packaging/F14).
  - (Revised by `core/C37`.) The runner runs each suite through kaal-hosting's `execute`, which names the command and lets Hosting realize it on the host. It passes on what the suite wrote. It finds the source markers with Hosting's `kind` and reads `package.json` with Hosting's `readFile`. Node resolves the entry module's links, so the runner's own location is the package directory's real path, with no further host call.
- **core/A43** [core/F70, core/F85, core/F87, core/N23] (added by `core/C36`): The manifest and the verifier.
  - **The manifest's form.** `test/verify.json` holds:
    - `files`, mapping each delivered path to its SHA-256. The paths are POSIX paths relative to the package directory. Neither the manifest itself nor a `node_modules` directory nested in the package is listed, since npm may place dependencies there in a consumer's installation;
    - `cases`, a list of `{ file, name, tests }`. `name` joins a case's suite names and its own title with ` > `. `tests` lists the `core/…` identifiers that the case's title cites, as the delivered tests already name what they check.
  - **How the manifest is made.** The build writes it from the packed file list, before `npm pack`. It finds the cases by running the delivered loops once with Node's TAP reporter, and records each one that runs.
  - **What the verifier does.** `test/verify.mjs` first checks consistency, which establishes the candidate and is not the meaning of `verified` (`core/F70`). It hashes the package's files, outside any nested `node_modules`, and compares them with `files`. A missing or changed file is `cannot verify`, and it names the first path that differs. An added file is `cannot verify` only in an installation, which the verifier tells apart by `core/A34`'s rule: the package directory's real path sits directly in a `node_modules` directory. A source workspace legitimately holds files that do not ship, such as `src/` and `test/plan/`. There, the verifier checks the shipped files the manifest lists and ignores the rest, and core/T92 keeps the manifest equal to what `npm pack` ships. The manifest is written by the build, which `test:publisher` runs before `test:consumer` in the source `npm test`. A source workspace that has not been built has no manifest, and that is `cannot verify`. Only when the files match does it run the delivered loops, with `--test-reporter=tap` and with `NODE_TEST_CONTEXT` cleared, in a scratch working directory under the operating system's temporary directory, which it removes. It reads each case's result from TAP and compares the cases that ran with `cases`:
    - a declared case that is missing, skipped or todo is `cannot verify`, and so is an undeclared case that ran;
    - a declared case that failed is `failed`;
    - otherwise every required case executed successfully, and the result is `verified`.
  - **The execution record** (`core/F87`) is one line, `kaal-core-execution: ` followed by JSON: `{ "candidate": { "name", "version", "manifest" }, "cases": [{ "file", "name", "outcome" }] }`. `manifest` is the SHA-256 of `test/verify.json`, and `outcome` is one of `passed`, `failed`, `skipped`, `todo` or `not run`. When consistency fails, the record names the candidate and marks every case `not run`.
  - **Host operations** (revised by `core/C37`). The verifier reads files with Hosting's `readFile`, reads an installation whole with Hosting's `read`, hashes with Foundation's `sha256`, and runs each delivered loop with Hosting's `execute`. It runs each delivered loop file on its own, so an outcome is known by its file and full name. A run that cannot start or is ended by a signal is `cannot verify`, and so is a non-zero exit that reports no failing case. A failing point outside the declared cases, such as a suite's hook, is `failed`. The scratch directory is the one exception (`core/F88`).
  - **The result line** is `kaal-core: <result>: <name>@<version>: <declared> declared, <executed> executed[: <cause>]`, and it is the last line of standard output.
- **core/A44** [core/F88] (added by `core/C37`): **Hosting challenges the shipped scripts.**
  - kaal-core's shipped `test/run.mjs` and `test/verify.mjs` import only `kaal-hosting`, `@kaihacksai/kaal-foundation/sha256`, `node:path` and `node:url`. The verifier also imports `node:fs` and `node:os`, for the scratch directory alone. Both packages are kaal-core runtime dependencies, so the scripts resolve in an installation.
  - core/T93 runs Hosting's conformance inspection, `kaal-hosting/conformance`'s `inspect`, over the two shipped scripts with that expectation. It asserts no violation and no finding left for validation. It also checks that neither script reads the platform.
  - Hosting's platform-coupling suite, hosting/C14 and hosting/C17, is on `kaal/hosting`. When it reaches `kaal/core` through `main`, a later Core Change runs it over the shipped scripts in place of core/T93's own platform text check.
  - The planned tests' fixtures for the runner and the verifier (core/T80, core/T91) are made where Node resolves kaal-hosting and Foundation as an installation would: under the workspace's `node_modules`, not in an isolated temporary directory.
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
| 2a | `core/C36` PLAN: alignment with the KAAL Package contract (`core/F85`, `core/F86`, `core/N23`, `core/A43`), added by `core/C36` | Core | 2, packaging/C4 (#658) | this revision |
| 2b | `core/C37` PLAN: no operating-system decision outside Hosting (`core/F88`, `core/A44`), added by `core/C37` | Core | 2a | this revision |
| 3 | `graph/C3` DO on `main`: reach, reverse and cycles | Graph | — | merged into `kaal/graph` (#593), promotion in flight |
| 4 | sync `main` → `kaal/core`, carrying `graph/C3` | Core | 3 | after Graph's promotion, in the promotion queue |
| 5 | `core/C26` DO: Registration Type, `kaal-core/registration`, `verify`, core/T50–T59, T67, T72, T73 GREEN | Core | 1, 4, `core/C11`, `core/C27` (both merged) | — |
| 6 | Hosting PLAN and DO: rename to `@kaihacksai/kaal-hosting` | Hosting | — | to be raised by Hosting |
| 7 | Graph PLAN and DO: rename to `@kaihacksai/kaal-graph` | Graph | 6 | to be raised by Graph |
| 8 | Foundation PLAN and DO: publishable, independently installable `@kaihacksai/kaal-foundation` | Foundation | — | to be raised by Foundation |
| 9 | `engineering/C6`: the Consumer lane, which runs each installed package's `npm test` | Engineering | — | #625, open |
| 10 | `core/C29` DO: rename to `@kaihacksai/kaal-core`, delivered documents and tests, `test/verify.mjs` and `test/verify.json`, core/T74–T80, T91 and T92 GREEN | Core | 2, 2a, 5, 7, 8, and release blocker 3 | — |
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
