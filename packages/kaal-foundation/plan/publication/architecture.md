# Publication Readiness: Architecture

Each element names, in brackets, the Requirements it answers.

- **foundation/A4** [foundation/F4, foundation/F5, foundation/F6]: `foundation/C4` removes `private` from `package.json` and updates the README. Nothing in `lib/` changes.
- **foundation/A5** [foundation/F5, foundation/F8]: Release acceptance packs the package with `npm pack`, installs the tarball with `npm install` into a directory under the operating system's temporary directory, and runs there: the import, the file inventory and the installed `npm test`. The planned test does this itself. Engineering's Consumer lane (engineering/C6, #625) may later run the installed verdict too.
- **foundation/A6** [foundation/F7, foundation/F8, foundation/F9, foundation/N6]: The delivered layout and the scripts.
  - `files` is `lib`, `docs`, `test/consumer`, `test/verify.mjs` and `test/run.mjs`. npm adds `package.json`, `README.md` and `LICENSE` itself. `plan/` and `test/plan/` never ship.
  - `test/consumer/` holds the delivered tests, plain `node:test` files that import `@kaihacksai/kaal-foundation/sha256` by its package name, so they exercise whichever copy is installed.
  - `test:consumer` is `node test/verify.mjs`. It runs the delivered tests, counts the tests they declare (a file that declares none is not one test), and prints and exits with the result. It clears `NODE_TEST_CONTEXT` for the run, as core/C28 found it must.
  - `test:publisher` runs the publisher's tests, `test/plan/sha256.test.mjs` and `test/plan/publication.test.mjs`.
  - `npm test` is `node test/run.mjs`, a runner that ships. It decides where it is, then runs declared `test:<name>` scripts with `npm run`, in declared order, never `test` itself:
    - **installed,** when the package directory's real path sits directly in a `node_modules` directory. It runs `test:consumer` alone and exits with its result;
    - **source,** otherwise, and only when both source markers are present: `plan/` and `test/plan/`, neither of which ships. It runs every declared suite, continues past a failing one, and exits non-zero if any failed;
    - **refused, as `cannot verify` with exit 2, before any suite runs:** an installed package that carries a source marker, a source directory missing a marker, no declared `test:<name>` suite, `test:consumer` missing, or `test:publisher` missing in source.

  The runner follows the same convention as kaal-core's (core/A34). Foundation depends on nothing, so it carries its own copy and imports nothing from Core.

## Release dependency map

This Change is row 8 of kaal-core's release dependency map (`core/C28`, merged in #622).

| Order | Change | Owner | Depends on |
| --- | --- | --- | --- |
| 1 | `foundation/C3` PLAN, this Change | Foundation | the Owner's decision on #622 |
| 2 | `foundation/C4` DO: not private, documents, delivered tests, verifier, runner, foundation/T9–T14 GREEN | Foundation | 1 |
| 3 | promotion `kaal/foundation` → `main` | Foundation | 2, the Owner's go |
| 4 | publication of `@kaihacksai/kaal-foundation` 0.0.1 | the Owner | 3 |

kaal-core's release waits on row 4 (`core/F73`).
