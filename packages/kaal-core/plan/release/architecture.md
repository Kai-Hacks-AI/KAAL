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
  - **How the manifest is made (CHECK reconciliation, core/C40).** The publisher explicitly runs `scripts/manifest.mjs` after a clean build, then commits `test/verify.json`. The generator reads the packed file list and literal delivered case declarations. The build and prepack never regenerate it; `test:publisher` runs `--check` and fails if it is missing or stale (core/T97). This records the implementation accepted in #734, not a new runtime change.
  - **What the verifier does.** `test/verify.mjs` first checks consistency, which establishes the candidate and is not the meaning of `verified` (`core/F70`). It hashes the package's files, outside any nested `node_modules`, and compares them with `files`. A missing or changed file is `cannot verify`, and it names the first path that differs. An added file is `cannot verify` only in an installation, which the verifier tells apart by `core/A34`'s rule: the package directory's real path sits directly in a `node_modules` directory. A source workspace legitimately holds files that do not ship, such as `src/` and `test/plan/`. There, the verifier checks the shipped files the manifest lists and ignores the rest, and core/T92 keeps the manifest equal to what `npm pack` ships. The committed manifest is checked, never repaired by the build, before source consumer verification. A missing manifest is `cannot verify`; missing built files are also `cannot verify`. Only when the files match does it run the delivered loops, with `--test-reporter=tap` and with `NODE_TEST_CONTEXT` cleared, in a scratch working directory under the operating system's temporary directory, which it removes. It reads each case's result from TAP and compares the cases that ran with `cases`:
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
  - Graph owns its own scoped rename, but since core/C32/C38 Graph is a build-only input and its publication/rename is not a Core runtime release prerequisite;
  - Foundation is already scoped, publishable and independently registry-accepted at 0.0.1 (Release run 41226966787);
  - Core still needs its scoped rename after the partial core/C29 delivery; C40 records the remaining route.

  Each owner verifies its own packed consumer experience. A rename cannot be split from the references to the old name without breaking the workspace. So a rename Change updates every import and dependency entry that names its package, in the same PR. It runs each affected package's own `npm test` before it asks for review, and asks each affected owner to review. It changes nothing else in their files. The renames go one at a time, Hosting first and Core last, because they touch the same importers.

## Ownership

| Who | Owns |
| --- | --- |
| Core | the delivered documents, the delivered tests, `test/verify.mjs`, the package layout, the scope of 0.0.1, and the planned release acceptance |
| Testing | what verification, a result and coverage mean. `docs/testing.md` cites Testing and does not restate it |
| Engineering | the Workspaces and Acceptance lanes, and any shared consumer harness |
| Graph, Hosting, Foundation | their own package/contract changes and evidence; Graph is build-only for standalone Core, Hosting and Foundation are runtime dependencies |
| the Owner | the version, synchronization, promotion and publication. The package scope is aligned: `@kaihacksai/kaal-*` (#622) |

## Release dependency map — CHECK reconciliation by core/C40

The former C28 map was a planning snapshot. The table below replaces its obsolete active states against main `9a9e89699aed7969281dcd1017882fd0bc4e3edc`; it does not promote collector work or authorize any integration.

| Delivery | Current state | Remaining dependency / owner |
| --- | --- | --- |
| C24/C30 registration PLAN, C27 structured frontmatter, C26 admission part 1 | On main through #734 | Graph-present views are unavailable in 0.0.1; no Graph release prerequisite |
| C32/C33/C38 standalone Node support | On main through #734 | Locked build retains Graph-owned Form/identity provenance; no runtime Graph |
| C28/C36/C37/C39 consumer contract and C29 partial DO | Documents, delivered loops, runner/verifier and committed manifest on main through #734 | Core's scoped name, complete release-suite enrollment, current independent conformance and final package acceptance remain |
| Foundation 0.0.1 package | On main and independently registry-accepted, run 41226966787 | No private/publication blocker; owner-authored initialization declaration is a distinct new dependency |
| Hosting scoped package and consumer verification | #657/#700 integrated in kaal/hosting at 58ef6f6 | Hosting's governed preparation, current-head assurance and focused promotion; publication separately |
| Core compatibility for Hosting | Prepared in #786 | Its ordering/review state is independent of C40; Core takes the eventual promoted dependency through main SYNC |
| Core BASS/initialization completion | Proposed C40 PLAN in ../initialization/ | Owner review; dependency-owner declaration contracts; TDD/DO; source/consumer configuration evidence |
| Testing/Packaging verification alignment | Evolving owner contracts, not fully on main | Pin accepted model/report/conformance interfaces; use existing independent tools, never copy their semantics or merge collectors directly |
| Core scoped rename and consumer references | Not delivered | Core owns its package; consuming owners prepare their references separately where Core isolation requires it; permitted root/lock/Core acceptance support remains focused |
| Core package acceptance and promotion | Not yet established for the final candidate | Fresh installed tarball, independent integrity/behavior/three-host evidence, current main SYNC, required CI and independent Owner review |
| Core publication | Separate future decision | Real runtime registry resolution and publication acceptance of the exact tested artifact; existing release engine |

## Remaining release blockers

1. **Scoped runtime delivery.** Core is still `kaal-core`; main still carries unscoped `kaal-hosting`. Existing core/T79 remains RED. Core and Hosting each own their changes. Graph's runtime publication is no longer a blocker. core/T78's private-dependency check is now GREEN; it is not proof of registry resolution.
2. **Consumer completion.** The remaining C40 Skill/initialization and verification proposals require review and their own TDD/DO. Missing Foundation contribution delivery is owned by Foundation, not solved by an invented Core Node. See [the focused architecture](../initialization/architecture.md).
3. **Independent package evidence.** Current Packaging expects Testing model/trace and report interfaces that Core does not yet deliver. Preserve unknown/failed findings until aligned. Source Workspaces GREEN and a matching self-manifest are insufficient for independent release acceptance.
4. **Assurance enrollment.** Source `npm test` does not currently run all of `release.test.mjs`, and three-host Acceptance does not run Core's installed verifier. C40 proposes reusing these existing mechanisms, not a new lane/service.
5. **Final candidate and governance.** Current-head integrity, installed behavior, configuration preservation, boundary and three-host evidence, focused SYNC/PROMOTION and independent review remain required. #786's hold is not lifted by this document. Publication is not authorized.

The result vocabulary belongs to Testing. Source-versus-installed test entry is already resolved by core/F75/A34; its implementation stays comprehensive for declared suites. Historical RED evidence in testing.md describes the earlier PLAN baseline and is not a statement that the delivered documents or verifier are still absent.
