# Publication Readiness: Architecture

Each element names, in brackets, the Requirements it answers.

- **foundation/A4** [foundation/F4, foundation/F5, foundation/F6]: `foundation/C4` removes `private` from `package.json` and updates the README. `files` stays `["lib"]`, and npm adds `package.json`, `README.md` and `LICENSE` itself. Nothing in `lib/` changes.
- **foundation/A5** [foundation/F5]: Release acceptance packs the package with `npm pack`, installs the tarball with `npm install` into a directory under the operating system's temporary directory, and imports the subpath from there. The planned test does this itself. Engineering's consumer harness for Guard may later host it.

## Release dependency map

This Change is row 8 of kaal-core's release dependency map (`core/C28`, #622).

| Order | Change | Owner | Depends on |
| --- | --- | --- | --- |
| 1 | `foundation/C3` PLAN, this Change | Foundation | the Owner's decision on #622 |
| 2 | `foundation/C4` DO: not private, README, foundation/T9–T11 GREEN | Foundation | 1 |
| 3 | promotion `kaal/foundation` → `main` | Foundation | 2, the Owner's go |
| 4 | publication of `@kaihacksai/kaal-foundation` 0.0.1 | the Owner | 3 |

kaal-core's release waits on row 4 (`core/F73`).
