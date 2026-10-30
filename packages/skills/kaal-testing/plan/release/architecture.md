# Testing 0.0.1 Release Readiness: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A21** [testing/F59–testing/F66, testing/N12, testing/N13]: **The packed package.** The tarball holds exactly:
  - `package.json`, `README.md`, `LICENSE`;
  - `capability/`, `lib/`, `payload/`, `skills/`;
  - `docs/`;
  - `test/acceptance/`, `test/unit/`, `test/verify.mjs` and `test/verify.json`.

  Nothing else ships: no `plan/`, no `test/plan/`, no publisher test, and neither `evidence.kaal.json` nor `ownership.kaal.json`. `test/verify.mjs` runs the delivered cases with Node's test runner against the installed copy. It reads the manifest, compares hashes, compares the consumer before and after, and prints the summary line.

## Ownership

| Who | Owns |
| --- | --- |
| Testing | the package, its documents, its delivered cases, its verifier and its manifest |
| Hosting | publishing `@kaihacksai/kaal-hosting` 0.0.1 first, which testing/F59 needs |
| Packaging | the generic contract and its conformance suite (packaging/A7) |
| Engineering | the harness that checks Testing's verifier like any other (#625), the release lane on Linux, Windows and macOS, and packing the candidate |
| The Owner | the namespace (#622), the release order, sync, promotion and publication |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C35` PLAN, this Change | Testing | none |
| `testing/C36` DO: the rename to `@kaihacksai/kaal-testing`, every importer, `publishConfig` and `repository` (testing/T74) | Testing | `testing/C35`, Hosting's rename (`hosting/C11`, #657) |
| `testing/C37` DO: `docs/` and the README (testing/T75) | Testing | `testing/C35` |
| `testing/C38` DO: the delivered cases, `test/verify.mjs`, `test/verify.json` and the scripts (testing/T76–testing/T79) | Testing | `testing/C34`, `testing/C36`, `testing/C37` |
| The release candidate: Packaging's suite and Testing's own on one packed and installed candidate | Engineering | `testing/C38`, packaging/C5 |
| Publication of `@kaihacksai/kaal-testing` 0.0.1 | the Owner | Hosting 0.0.1 published, the candidate accepted |

## For the Owner

The release order recorded on 2026-10-29 puts Testing before Foundation and Hosting. Under testing/F59, Testing has a runtime dependency on Hosting, so Hosting 0.0.1 must be published first. This PLAN assumes the order Guard, Foundation, Hosting, Testing, and asks the Owner to confirm it.
