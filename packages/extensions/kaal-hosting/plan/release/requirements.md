# Scoped Package Name: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **hosting/F15** [hosting/I5]: The package is named `@kaihacksai/kaal-hosting`, at version `0.0.1`, unchanged. Its `exports` (`.`, `./conformance`, `./package.json`), `files`, `engines`, license and runtime dependencies are unchanged. It declares `publishConfig.access` `public`, which a scoped package needs to be published openly, and its `repository` names `packages/extensions/kaal-hosting` in this repository, as Guard's does. Its README is titled with the new name and states how to install it.
- **hosting/F16** [hosting/I5]: No reference to Hosting by its old name remains in the repository. A reference is a module specifier (`kaal-hosting` or `kaal-hosting/<subpath>`, quoted, in JavaScript, TypeScript or JSON), a dependency entry, a workspace selector (`-w kaal-hosting`, `--workspace kaal-hosting`), or an entry of `package-lock.json`. Each becomes `@kaihacksai/kaal-hosting`, in the same Change, and nothing else in the importing files changes, except where a test depends on how the name sorts, hashes or nests, or names it outside quotes (hosting/A7). Prose that mentions Hosting stays its owner's to revise. The directory `packages/extensions/kaal-hosting` keeps its path. There is no alias and no compatibility package under the old name.
- **hosting/F17** [hosting/I5]: Hosting's packed consumer experience is verified. The tarball `npm pack` makes holds exactly `package.json`, `README.md`, `LICENSE`, `dist/` without `.tsbuildinfo`, and `payload/`. Installed alone into a fresh, empty consumer outside this repository, with its runtime dependencies from the registry, it lands at `node_modules/@kaihacksai/kaal-hosting`, and a consumer script that imports `@kaihacksai/kaal-hosting` and `@kaihacksai/kaal-hosting/conformance` runs `within`, `reconcile` and `execute` there.

## Limits

- The rename is planned here and not applied. `hosting/C11` applies it only after this PLAN merges.
- The version stays `0.0.1`. Publication, and any sync or promotion of `kaal/hosting`, need the Owner's own go and are not part of this PLAN or its DO.
- The consumer runs no tests shipped inside the installed package. Guard's bar for consumer-executable tests is not adopted here; it would be its own Hosting Change if the Owner asks for it.
- hosting/F16 covers references on `kaal/hosting`'s base when `hosting/C11` is raised. A reference added elsewhere afterwards is updated when that branch next takes `main`.
