# Testing 0.0.1 Release Readiness: Requirements

Each Requirement names, in brackets, the Intents it serves, and the packaging/ Requirement it realizes. Where another capability owns the meaning, it is referenced, not restated (packaging/N10).

## Functional

- **testing/F59** [testing/I17] (packaging/F7): **Identity.**
  - The package is named `@kaihacksai/kaal-testing`, at version `0.0.1`, with `publishConfig.access` set to `public`. Its `repository` names `packages/skills/kaal-testing`.
  - Its runtime dependencies are exact registry versions: `c8` `12.0.0` and `@kaihacksai/kaal-hosting` `0.0.1`. Every development dependency is an exact version too, and none is a workspace, file or Git dependency.
  - Its `exports` are unchanged.
  - No reference to it by its old name remains. Each module specifier, dependency entry, workspace selector and `package-lock.json` entry becomes the new name in the same Change, as hosting/F16 states for Hosting. There is no alias.
  - **Why Hosting is a runtime dependency.** Installed behaviour needs it, not the publisher's tooling. Three shipped exports execute commands and read or write the host, and Testing may not know the operating system, so they do that only through Hosting:
    - `kaal-testing/acceptance` installs packed tarballs into fresh hosts, runs the scenarios and keeps the ledger (`execute`, `initialize`, `kind`, `read`, `readFile`, `update`);
    - `kaal-testing/coverage` runs a workspace's tests under `c8` and reads the summary (`execute`, `kind`, `readFile`), which is also why `c8` is a runtime dependency;
    - `kaal-testing/contracts` imports `kaal-testing/acceptance`.

    Every other export, `kaal-testing/model` and `kaal-testing/verifiers` among them, imports nothing. A consumer that imports only those still installs Hosting, because npm has no per-export dependency.
  - **So Hosting's 0.0.1 publication is a prerequisite of Testing's.**
- **testing/F60** [testing/I17] (packaging/F8): **Shipped documents.**
  - The package ships `docs/intent.md`, `docs/requirements.md`, `docs/architecture.md`, `docs/testing.md`, `docs/limitations.md` and `docs/operations.md`.
  - They consolidate today's `plan/`, and they are authoritative. They define, once, each Testing identifier a shipped case's `tests` names.
  - None cites a `plan/` path, a Change, an Engineering path or a pull request as its authority. Each links only files that ship.
  - `docs/operations.md` covers installation, use, verification and removal, and lists the shipped files under `## Shipped files`.
  - The README keeps the overview and links each document.
- **testing/F61** [testing/I17] (packaging/F9, packaging/N9): **Delivered cases.**
  - The package ships its consumer Test Cases as plain `node:test` JavaScript that needs only Node 24: the outer acceptance loops and the inner Code loop, all in `test/embed/` (amended by testing/C43; a location, not a kind: each case's loop is its trace in the model).
  - They reach the package only by its name, so they exercise the installed copy. They read no repository checkout, and they write only to the operating system's temporary directory.
  - Each case decides its Requirement from behaviour or bytes, never from a file's presence.
  - Cases that verify the publisher's process stay the publisher's, as the planned tests in `test/plan/` and the Engineering tests do. They are allocated in `docs/testing.md` (testing/F66).
- **testing/F62** [testing/I17] (packaging/F14, packaging/A11): **One test entry, two places.**
  - In the source workspace, `npm test` runs every suite the package declares as a `test:<name>` script: at least `test:publisher` (today's suite, with the workspace builds it needs) and `test:consumer` (the installed verification). It never invokes itself.
  - In an installation, `npm test` runs `test:consumer` only.
  - Which place applies is detected explicitly, never inferred from a missing file, as foundation/F9 states. When the place cannot be told, the result is unknown.
  - Asked with `--list` (`npm test -- --list`), the entry runs nothing. It prints one line `kaal-testing-suite <script>` for each suite it would run in the detected place, and it runs exactly those suites otherwise.
  - No `pretest` step runs.
- **testing/F63** [testing/I17] (packaging/F10): **One result, by the shared contract.**
  - The installed verification, `test/verify.mjs`, ends in exactly one of Testing's results: `verified`, `failed` or `unknown` (testing/F13). The exit statuses are 0, 1 and 2 (testing/A9).
  - It prints one summary line starting `kaal-testing-verification `, holding the JSON summary of testing/F44.
  - It decides failed and unknown as testing/F50 states, and diagnoses as testing/F49 states.
  - It conforms to every scenario of testing/F43 and testing/F54 in Engineering's harness.
- **testing/F64** [testing/I17] (packaging/F11): **Shipped manifest.** `test/verify.json` holds:
  - `hashes`: the SHA-256 of every other shipped file;
  - `cases`: the delivered cases, by name;
  - `model`: the delivered cases as Testing's own model (testing/F66);
  - `applicability`: testing/F47's form, per case. It is empty, because no delivered case is scoped by platform (testing/F65) and Testing 0.0.1 has no optional complement;
  - `platforms`: testing/F65's list.

  The run's `digest` is the SHA-256 of one line `<path>\0<sha256>\n` per installed file other than the manifest and the copy's own `node_modules`, in path order, as hosting/F22 states. Consistency with the manifest is not provenance (testing/F14).
- **testing/F65** [testing/I17] (packaging/F12): **Platforms and runtime, by Hosting's boundary.**
  - The package declares portability: it supports Linux, macOS and Windows on Node 24 or later. `engines` and the manifest's `platforms` state this.
  - Testing authorizes no OS-specific exemption. No delivered case is scoped by platform. Applicability could name only optional complements (`requires`, `absent`), and Testing 0.0.1 has none, so no delivered case is inapplicable anywhere. Every delivered case runs, with the same identity and assertions, on every supported platform.
  - No shipped file branches on the operating system. Every command, read and write the shipped library makes goes through Hosting.
  - Hosting owns OS-specific behaviour, in solutions and in tests. Its cross-capability boundary suite and review guides (`kaal-hosting/boundary`, hosting/C13/C14, extended by hosting/C16) challenge this package's implementation, test selection, assertions and applicability. Their result on the candidate is release evidence, and Testing does not restate their rule.
- **testing/F66** [testing/I17] (packaging/F13): **Traceability, derived.**
  - Each delivered case is a Case in Testing's own model (testing/F25), and its `tests` names the Testing identifiers it verifies. The manifest's `model` is that model, and `check` (testing/F24, testing/F25) finds nothing in it.
  - Every target a delivered case names is an identifier defined in `docs/`.
  - Whether an identifier is evidenced is derived, never declared: `tested(model)` gives the Cases that test it, and its evidence is their latest relevant Run (testing/F40). There is no coverage map beside the model and no allocated or unverified state.
  - The verifier's own conformance to testing/F43 and testing/F54, cross-platform parity and the publisher's planned tests are Cases of the publisher's Engineering Test Plan. They are not delivered and not in the shipped model.

## Nonfunctional

- **testing/N12** [testing/I17] (packaging/N7, packaging/N8):
  - The verification leaves the whole consumer intact, its installed packages included, as testing/F15 states. It writes only in a scratch space it removes.
  - `test/verify.mjs` imports only Node's built-ins, never the package's own `lib/`, so a broken library cannot mask itself. The same holds for hosting/N4.
- **testing/N13** [testing/I17] (packaging/N9): No delivered case reads this repository, its `plan/` or another package's sources.

## Not in this Change

- Publication, the release workflow, and any sync or promotion of `kaal/testing`. They are the Owner's.
- The version, which stays `0.0.1`.
- Engineering's harness and release lane (#625, #641, #610).
- Any rule that every identifier must be tested before release, or any coverage measure across the model. That waits on the Owner's decision about `testing/C33` (#667). This PLAN depends on no part of it.
