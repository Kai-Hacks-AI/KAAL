# Publication Readiness: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional: the package

- **foundation/F4** [foundation/I4, foundation/I5]: The package is publishable. `package.json` is not marked `private`, keeps the name `@kaihacksai/kaal-foundation` and the version `0.0.1`, and declares no dependencies of any kind (`foundation/N2`).
- **foundation/F5** [foundation/I4]: The packed artifact holds exactly the files that its `docs/operations.md` lists under "Shipped files", nothing more and nothing less. No plan and no publisher test ships. Installed from that tarball into a fresh directory outside any KAAL repository, `@kaihacksai/kaal-foundation/sha256` imports and gives the FIPS 180-4 digest of `abc`.
- **foundation/F6** [foundation/I4, foundation/I5]: The README tells a consumer how to install the package (`npm install @kaihacksai/kaal-foundation`), links each delivered document, no longer says that the package is private or not published, and states that each concern's ownership is provisional (`foundation/N4`).

## Functional: what a consumer receives

- **foundation/F7** [foundation/I6]: The package ships six concise documents: `docs/intent.md`, `docs/requirements.md`, `docs/architecture.md`, `docs/limitations.md`, `docs/operations.md` and `docs/testing.md`.
  - They link only files that ship, and name no plan or repository path.
  - `docs/limitations.md` says what Foundation does not do: it hashes bytes only, so a caller encodes text as UTF-8 first; it holds SHA-256 only; it is a pure implementation, slower than the host's native one; and each concern's ownership is provisional.
  - `docs/operations.md` covers installation, use, verification and removal, and lists the shipped files under "Shipped files".
  - `docs/testing.md` names each delivered test file and what it checks, and names the publisher's tests as not delivered and not run in an installation.
- **foundation/F8** [foundation/I6]: The package ships its consumer tests. In an installation, `npm test` runs them against the installed copy and ends in exactly one result:
  - **verified**, when the delivered tests ran at least one test and none failed;
  - **failed**, when any delivered test failed;
  - **cannot verify**, when no test ran, a delivered test file is missing, or the installed copy cannot be exercised.

  The result is printed as the last line of standard output, with exit code 0, 1 or 2. Its meanings are cited from Testing (testing/C9), not taken from Guard. The delivered tests cover, at least:
  - the FIPS 180-4 known-answer vectors: the empty message, `abc`, and the 448-bit and 896-bit messages;
  - inputs whose lengths sit at SHA-256's padding boundaries (55, 56, 63, 64 and 65 bytes), against digests recorded in the test;
  - a view: only the bytes a `Uint8Array` views count, and the input is not modified;
  - refusals: a string, an `ArrayBuffer`, a `DataView`, another typed array, an array of numbers and `undefined` each throw a `TypeError`.
- **foundation/F9** [foundation/I4, foundation/I6]: One test entry, two places, as the Owner set the convention on #625:
  - **in the source workspace,** `npm test` is comprehensive. It runs every suite the package declares as a `test:<name>` script, the publisher's and the consumer's included, and never invokes itself;
  - **in an installation,** `npm test` runs the consumer verification only.

  Which applies is detected explicitly, never inferred from a missing file. A damaged source checkout is never taken for an installation, so the publisher's tests are never silently skipped. When the place cannot be told, a required suite is missing, or no suite is declared, the result is `cannot verify`. A failing suite always fails the run.

## Nonfunctional

- **foundation/N5** [foundation/I5]: Readiness changes nothing a consumer computes. `lib/` is unchanged, so every digest stays the same.
- **foundation/N6** [foundation/I4]: Foundation stays dependency-free. The delivered tests, the verifier and the runner import only Node's built-in modules and the package itself.

## Not in this Change

- Publication, the version and the release workflow. They are the Owner's.
- A Foundation KAAL Capability Node, which `foundation/C1` left for the delivery contract. It is not needed to install, use or verify the package, so it stays a later Change.
- Renaming Core's own "foundation" term (`foundation/C1`, Name).
