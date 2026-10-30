# Testing 0.0.1 Release Readiness: Requirements

Each Requirement names, in brackets, the Intents it serves, and the packaging/ Requirement it realizes. Where another capability owns the meaning, it is referenced, not restated (packaging/N10).

## Functional

- **testing/F59** [testing/I17] (packaging/F7): **Identity.**
  - The package is named `@kaihacksai/kaal-testing`, at version `0.0.1`, with `publishConfig.access` set to `public`. Its `repository` names `packages/skills/kaal-testing`.
  - Its runtime dependencies are exact registry versions: `c8` `12.0.0` and `@kaihacksai/kaal-hosting` `0.0.1`. Every development dependency is an exact version too, and none is a workspace, file or Git dependency.
  - Its `exports` are unchanged.
  - No reference to it by its old name remains. Each module specifier, dependency entry, workspace selector and `package-lock.json` entry becomes the new name in the same Change, as hosting/F16 states for Hosting. There is no alias.
  - **This makes Hosting's 0.0.1 publication a prerequisite of Testing's.**
- **testing/F60** [testing/I17] (packaging/F8): **Shipped documents.**
  - The package ships `docs/intent.md`, `docs/requirements.md`, `docs/architecture.md`, `docs/testing.md`, `docs/limitations.md` and `docs/operations.md`.
  - They consolidate today's `plan/`, and they are authoritative. They define each Testing identifier a shipped case or the coverage cites, once.
  - None cites a `plan/` path, a Change, an Engineering path or a pull request as its authority. Each links only files that ship.
  - `docs/operations.md` covers installation, use, verification and removal, and lists the shipped files under `## Shipped files`.
  - The README keeps the overview and links each document.
- **testing/F61** [testing/I17] (packaging/F9, packaging/N9): **Delivered cases.**
  - The package ships its consumer Test Cases as plain `node:test` JavaScript that needs only Node 24: the outer acceptance loops in `test/acceptance/` and the inner Code loop in `test/unit/`.
  - They reach the package only by its name, so they exercise the installed copy. They read no repository checkout, and they write only to the operating system's temporary directory.
  - Each case decides its Requirement from behaviour or bytes, never from a file's presence.
  - Cases that verify the publisher's process stay the publisher's, as the planned tests in `test/plan/` and the Engineering tests do. They are allocated in `docs/testing.md` (testing/F66).
- **testing/F62** [testing/I17] (packaging/F14, packaging/A11): **One test entry, two places.**
  - In the source workspace, `npm test` runs every suite the package declares as a `test:<name>` script: at least `test:publisher` (today's suite, with the workspace builds it needs) and `test:consumer` (the installed verification). It never invokes itself.
  - In an installation, `npm test` runs `test:consumer` only.
  - Which place applies is detected explicitly, never inferred from a missing file, as foundation/F9 states. When the place cannot be told, the result is unknown.
  - No `pretest` step runs.
- **testing/F63** [testing/I17] (packaging/F10): **One result, by the shared contract.**
  - The installed verification, `test/verify.mjs`, ends in exactly one of Testing's results: `verified`, `failed` or `unknown` (testing/F13). The exit statuses are 0, 1 and 2 (testing/A9).
  - It prints one summary line starting `kaal-testing-verification `, holding the JSON summary of testing/F44, with `coverage` (testing/F55) once `testing/C34` lands.
  - It decides failed and unknown as testing/F50 states, and diagnoses as testing/F49 states.
  - It conforms to every scenario of testing/F43 and testing/F54 in Engineering's harness.
- **testing/F64** [testing/I17] (packaging/F11): **Shipped manifest.** `test/verify.json` holds:
  - `hashes`: the SHA-256 of every other shipped file;
  - `cases`: the delivered cases, by name;
  - `applicability`: testing/F47's form, per case;
  - `coverage`: testing/F51's form;
  - `platforms`: testing/F65's list.

  The run's `digest` is the SHA-256 of one line `<path>\0<sha256>\n` per installed file other than the manifest and the copy's own `node_modules`, in path order, as hosting/F22 states. Consistency with the manifest is not provenance (testing/F14).
- **testing/F65** [testing/I17] (packaging/F12): **Platforms and runtime.**
  - The package supports Linux, macOS and Windows on Node 24 or later. `engines` and the manifest's `platforms` state this.
  - A case that does not apply on a platform says so only by testing/F47's applicability.
- **testing/F66** [testing/I17] (packaging/F13): **Coverage.**
  - Every identifier defined in `docs/` is in the manifest's `coverage`, and its static trace (testing/F51) is resolved.
  - Each allocation names what the publisher's Engineering Test Plan runs. Allocated items include:
    - the verifier's own conformance to testing/F43 and testing/F54, in Engineering's harness;
    - cross-platform parity (testing/F56), in Engineering's release lane;
    - the publisher's planned tests.

## Nonfunctional

- **testing/N12** [testing/I17] (packaging/N7, packaging/N8):
  - The verification leaves the consumer intact, as testing/F15 states, and writes only in a scratch space it removes.
  - `test/verify.mjs` imports only Node's built-ins, never the package's own `lib/`, so a broken library cannot mask itself. The same holds for hosting/N4.
- **testing/N13** [testing/I17] (packaging/N9): No delivered case reads this repository, its `plan/` or another package's sources.

## Not in this Change

- Publication, the release workflow, and any sync or promotion of `kaal/testing`. They are the Owner's.
- The version, which stays `0.0.1`.
- Engineering's harness and release lane (#625, #641, #610).
