# Testing 0.0.1 Release Readiness: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A21** [testing/F59–testing/F66, testing/N12, testing/N13]: **The packed package.** The tarball holds exactly:
  - `package.json`, `README.md`, `LICENSE`;
  - `capability/`, `lib/`, `payload/`, `skills/`;
  - `docs/`;
  - `test/embed/`, `test/verify.mjs` and `test/verify.json` (amended by testing/C43).

  Nothing else ships: no `plan/`, no `test/plan/`, no publisher test, and neither `evidence.kaal.json` nor `ownership.kaal.json`. `test/verify.mjs` runs the delivered cases with Node's test runner against the installed copy. It reads the manifest, compares hashes, compares the consumer before and after, and prints the summary line.

## Ownership

| Who | Owns |
| --- | --- |
| Testing | the package, its documents, its delivered cases, its verifier and its manifest |
| Hosting | publishing `@kaihacksai/kaal-hosting` 0.0.1 first, which testing/F59 needs; OS-specific behaviour, and the boundary suite and review guides that challenge this package (testing/F65) |
| Packaging | the generic contract and its conformance suite (packaging/A7) |
| Engineering | the harness that checks Testing's verifier like any other (#625), the release lane on Linux, Windows and macOS, running Hosting's boundary suite on the candidate, and packing the candidate. It owns none of their rules. |
| The Owner | the release order, sync, promotion and publication |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C35` PLAN, this Change | Testing | none |
| `testing/C36` DO: the rename to `@kaihacksai/kaal-testing`, every importer, `publishConfig` and `repository` (testing/T74) | Testing | `testing/C35`, Hosting's rename (`hosting/C11`, #657) |
| `testing/C37` DO: `docs/` and the README (testing/T75) | Testing | `testing/C35` |
| `testing/C38` DO: the delivered cases, `test/verify.mjs`, `test/verify.json` and the scripts (testing/T76–testing/T79) | Testing | `testing/C36`, `testing/C37` |
| The release candidate: Packaging's suite, Hosting's boundary suite and Testing's own on one packed and installed candidate | Engineering | `testing/C38`, packaging/C5, hosting/C13/C14 (#650), extended by hosting/C16 |
| Publication of `@kaihacksai/kaal-testing` 0.0.1 | the Owner | Hosting 0.0.1 published, the candidate accepted |

## For the Owner

The Owner accepted the name. The release order recorded on 2026-10-29 puts Testing before Foundation and Hosting. testing/F59 shows that installed behaviour, the acceptance, coverage and contracts exports, needs Hosting at runtime. So Hosting 0.0.1 must be published first. This PLAN assumes the order Guard, Foundation, Hosting, Testing, and asks the Owner to confirm it.
