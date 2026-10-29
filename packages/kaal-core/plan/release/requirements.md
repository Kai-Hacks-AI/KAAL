# kaal-core 0.0.1 Release and Consumer Readiness: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **core/N19** [core/I22]: The package explains itself. No delivered document refers a consumer to a file that does not ship, such as a repository `plan/` folder, for anything the consumer needs to install, use, verify or remove kaal-core.

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

- **core/F70** [core/I22]: The package ships its consumer tests. In an installation, `npm test` from the package's directory, for example `npm explore kaal-core -- npm test`, runs them against the installed copy and ends in exactly one result:
  - **verified**, when every delivered loop ran at least one test and none failed;
  - **failed**, when any delivered test failed;
  - **cannot verify**, when a loop ran no test or the installed copy cannot be exercised, for example because a file is missing.

  Zero tests is never `verified`. The delivered tests need only Node and the package's runtime dependencies, never the repository, a build tool or the network.
- **core/F71** [core/I22]: `docs/testing.md` separates what runs where:
  - it names each delivered test file, its loop and what it checks;
  - it names the publisher's Engineering tests (the planned outer tests, the build-time Code tests and the bench) as not delivered and not run in an installation;
  - it says, for each `core/…` Requirement, whether a delivered test, a publisher test or no test checks it.

  Nothing a consumer runs reports a publisher test as run.

## Functional: release acceptance

- **core/F72** [core/I23]: The packed artifact is accepted in a clean installation:
  - kaal-core is installed from its packed tarball into a fresh directory outside any KAAL repository, with its runtime dependencies at the versions it pins;
  - the installed files are exactly those listed in the installed `docs/operations.md`, under "Shipped files": nothing more and nothing less;
  - `npm test` in the installed package ends in `verified`;
  - when an installed file the tests exercise is corrupted, the result is never `verified`;
  - when the delivered tests are removed from an otherwise intact installation, the result is `cannot verify`.
- **core/F73** [core/I23]: Every runtime dependency of kaal-core is installable by a consumer at release. A dependency that cannot be published, such as one marked `private`, blocks the release, and the blocker is reported rather than worked around.
