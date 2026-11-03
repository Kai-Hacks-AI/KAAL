# kaal-core 0.0.1 Release and Consumer Readiness: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **core/N19** [core/I22]: The package explains itself. No delivered document refers a consumer to a file that does not ship, such as a repository `plan/` folder, for anything the consumer needs to install, use, verify or remove kaal-core.

- **core/N23** [core/I22, core/I23] (added by `core/C36`): **An intact consumer**, which realizes packaging/N7. The installed verification writes only in a scratch directory that it removes, and it leaves the consumer's project, its dependencies and its configuration as they were (testing/F15).

## Functional: scope

- **core/F68** [core/I22]: kaal-core 0.0.1 contains:
  - what Core ships today: the Kernel and its foundational Nodes, admission, frontmatter validation, the Installation Contract with its conformance cases, Agent Realization, the lifecycle commands and `kaal verify`;
  - registration, as `core/C26` delivers it from `core/C24` and `core/C30`: scoped kinds, owner-defined outgoing rules, `acyclic` declarations, derived incoming views, reported cycles and untraced instances, reported shared terms, and unknown-kind findings that list their candidates.

  It does not contain:
  - a record of how owners aligned a shared term;
  - typed relationship kinds, such as two relations between the same pair of kinds;
  - a distinction between an absent optional complement and a malformed registration.

  Each of these is a future decision (`plan/registration/architecture.md`). The delivered documents name each one as an explicit limitation, and `core/C29` does not implement any of them.

## Functional: delivered documents

- **core/F69** [core/I22, core/N19]: The package ships `docs/intent.md`, `docs/requirements.md`, `docs/architecture.md`, `docs/limitations.md`, `docs/operations.md` and `docs/testing.md`.
  - **Coverage.** Together they state Core's semantics, guarantees, boundaries, installation, use, verification and removal.
  - **Identifiers.** They use the `core/…` identifiers that the delivered tests name.
  - **README.** It links each one.
  - **Limitations.** `docs/limitations.md` lists what 0.0.1 does not do (`core/F68`) and what its tests cannot show.

## Functional: delivered tests

- **core/F70** [core/I22] (revised by `core/C36`): The package ships its consumer tests, which are its Embedded verification contract (packaging/F9). In an installation, `npm test` from the package's directory, for example `npm explore kaal-core -- npm test`, runs them against the installed copy, the candidate, and reports Testing's result for that run. It ends in exactly one result.

  **What `verified` means is Testing's, not Core's.** Testing = verification and Review = validation, as the Owner set on #673. `verified` is the evidence-backed relationship by which every required Test Case of the candidate has executed successfully against it. A missing, skipped, unexecuted or failed required case cannot establish it. kaal-core neither redefines nor widens that meaning. It realizes it for its own package:
  - **the required cases** are the Embedded Test Cases the shipped manifest declares (`core/F85`). Which of them apply on a given platform follows testing/F47;
  - **the candidate** is the installed copy, identified as `core/F87` states. Its files are first checked against the manifest. This consistency check is not the meaning of `verified`. It establishes that the run is about the candidate the inventory describes. When it fails, the run cannot be evidence about that candidate, so it is `cannot verify` (testing/F14). Whether Testing later calls a changed file failed or unknown is Testing's to settle (#610). Until then, kaal-core reports `cannot verify`, which is never `verified`;
  - **the result.** `verified` when every required case executed successfully. `failed` when a required case executed and failed. Otherwise `cannot verify`, Testing's unknown. That covers a required case that did not run, was skipped or was marked todo, an undeclared case that ran, no declared case, and a candidate that cannot be exercised.

  No result kaal-core reports is a validation. `validated` is Review's judgment, never an automatic consequence of a GREEN run.

  The result is the last line of standard output, and the exit status is 0, 1 or 2 respectively (packaging/F10). The line names the candidate and the declared and executed counts. For `failed` and `cannot verify`, it also names the cause: the file or case concerned. Its exact form follows Testing's verifier contract once the Owner approves it (testing/C29, #639).

  The delivered tests need only Node and the package's runtime dependencies, never the repository, a build tool or the network (packaging/N8).
- **core/F75** [core/I22, core/I23]: One test entry, two places, as the Owner set the convention on #625 (comment 6504401799):
  - **in the source workspace,** `npm test` is comprehensive. It runs every suite the package declares as a `test:<name>` script, the publisher's and the consumer's included, and it never invokes itself;
  - **in an installation,** `npm test` runs the consumer verification only (`core/F70`). The installed package needs neither the publisher's tests nor KAAL's repository.

  Core owns its suites, its scripts and their implementations. Engineering runs them in the package's own directory and may select a named suite, but never copies or redefines them.

  Which of the two places applies is detected explicitly, never inferred from a missing file. A damaged source checkout is never mistaken for an installation, so the publisher's tests are never silently skipped. When the place cannot be told, or a required suite is missing, or no suite is declared at all, the result is `cannot verify`. A failing suite always fails the run.
- **core/F71** [core/I22]: `docs/testing.md` separates what runs where:
  - it names each delivered test file, its loop and what it checks;
  - it names the publisher's Engineering tests (the planned outer tests, the build-time Code tests and the bench) as not delivered and not run in an installation;
  - it says, for each `core/…` Requirement, whether a delivered test, a publisher test or no test checks it.

  Nothing a consumer runs reports a publisher test as run.

## Functional: release acceptance

- **core/F72** [core/I23] (revised by `core/C36`): The packed artifact is accepted in a clean installation:
  - kaal-core is installed from its packed tarball into a fresh directory outside any KAAL repository, with its runtime dependencies at the versions it pins;
  - the installed files are exactly those the shipped manifest lists (`core/F85`), plus the manifest itself: nothing more and nothing less;
  - `npm test` in the installed package ends in `verified`;
  - when an installed file the tests exercise is corrupted, the result is never `verified`;
  - when a delivered test file is changed or emptied, the result is `cannot verify`, because the file no longer matches the manifest;
  - when the delivered tests are removed from an otherwise intact installation, the result is `cannot verify`.
- **core/F85** [core/I22, core/I23] (added by `core/C36`): **The shipped manifest**, which realizes packaging/F11. kaal-core ships one manifest. It lists every other file the package delivers, with that file's SHA-256. It also declares every required Embedded Test Case by its delivered file, its full name and the `core/…` Intents, Requirements, Architecture elements or Defects it tests. That last part is the Test Case —tests→ subject relationship in Testing's model.

  The manifest is generated when the package is built, from the files it describes, and is never edited by hand. Consistency with the manifest is not provenance (testing/F14). A matching installation shows that the files agree with the manifest the package carries, not that they are the bytes the publisher packed. The packed artifact's identity is Packaging's (packaging/F4), and Engineering records it.
- **core/F87** [core/I22, core/I23] (added by `core/C36`): **Execution evidence, and the derived `verified` relationship.**
  - **One run is one Test Execution.** The verifier emits it on standard output, before the result line, as one machine-readable record. The record holds:
    - the candidate: the package's name, its version, and the SHA-256 of its shipped manifest;
    - each required case with its outcome for that run: passed, failed, skipped, todo or not run.
  - **Where the evidence lives.** kaal-core persists nothing in the consumer's environment (`core/N23`). The record lives with whoever ran the verification: a consumer's terminal or CI log, or Engineering's release-readiness record. Engineering keys that record by the packed artifact's identity (packaging/F4, engineering/F17–F19).
  - **The derived relationship belongs to Testing.** Testing owns the meaning and lifecycle of `verified` between the subject and its candidate, and Graph provides only the relationship mechanism. Core neither stores nor updates the relationship. Core guarantees its inputs:
    - a record speaks only for the candidate it names;
    - a different candidate starts with no evidence, so earlier runs never carry over to it. That covers another version, another manifest, or another packed artifact;
    - a later record for the same candidate supersedes an earlier one. A later run that fails or misses a required case invalidates an earlier `verified`.
- **core/F88** [core/I22, core/I23] (added by `core/C37`): **No operating-system decision outside Hosting**, as the Owner set on #675: Hosting is KAAL's only OS boundary, test implementations included.
  - The shipped runner and verifier run npm and Node, read files and find what is at a path only through kaal-hosting. SHA-256 is Foundation's. Neither branches on the platform.
  - Core's planned tests that run commands do so through kaal-hosting too, with no platform branch.
  - **The one gap.** Hosting offers no scratch working directory today. Until it does, the verifier makes its scratch directory (`core/N23`) with Node's portable temporary-directory call and removes it, with no platform decision. Whether Hosting offers a scratch abstraction is Hosting's to decide. If it does, a later Core Change adopts it.
  - A GREEN Core suite is not portability evidence on its own. Hosting's conformance challenges the shipped scripts (`core/A44`).
- **core/F86** [core/I22] (added by `core/C36`): **Declared runtime and platforms**, which realizes packaging/F12.
  - The package declares Node.js 24 or later as its runtime.
  - `docs/operations.md` names the platforms kaal-core supports: Linux, macOS and Windows, which are the hosts Hosting supports.
  - What host compatibility means, and how a platform difference is tested, are Hosting's. Not-applicable cases are governed by testing/F47.
- **core/F73** [core/I23]: Every runtime dependency of kaal-core is installable by a consumer at release. A dependency that cannot be published, such as one marked `private`, blocks the release, and the blocker is reported rather than worked around. `@kaihacksai/kaal-foundation` is published independently, under its owner's plan and the Owner's authorization.
- **core/F74** [core/I23]: kaal-core publishes as `@kaihacksai/kaal-core`, and each runtime dependency that is a KAAL workspace package publishes under the `@kaihacksai/kaal-*` namespace. Core renames only kaal-core. Each other package is renamed by its owner's Change, never by a Core Change.
