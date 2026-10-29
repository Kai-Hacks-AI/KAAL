# kaal-core 0.0.1 Release and Consumer Readiness: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A33** [core/F69, core/F70, core/N19]: Delivered layout. `package.json` `files` adds `docs`, `test/acceptance`, `test/unit` and `test/verify.mjs`, beside `dist`, `payload` and `installation.kaal.json`.
  - `test/acceptance/` holds one file for each outer loop: `intent`, `requirements` and `architecture`.
  - `test/unit/` holds the Code tests that need no build.
  - The delivered tests are plain `node:test` files that import kaal-core by its package name, so they exercise whichever copy is installed.
- **core/A34** [core/F70]: Two test scripts.
  - `npm test` becomes the consumer entry, `node test/verify.mjs`. It runs the delivered loops, counts the tests in each, and prints and exits with the result (`verified` 0, `failed` 1, `cannot verify` 2). It builds nothing.
  - Today's script, which builds with `tsc` and runs the publisher's tests, becomes `npm run test:publisher`.
  - Engineering's Workspaces lane runs `npm test` in each workspace, so it must run kaal-core's `test:publisher` from `core/C29` on (see the conflicts below).
- **core/A35** [core/F72, core/F73]: Release acceptance packs and installs:
  - `npm pack` packs kaal-core and each runtime dependency;
  - the tarballs install with `npm install` into a directory under the operating system's temporary directory;
  - `npm test` runs in `node_modules/kaal-core`.

  Core's planned test does this itself for 0.0.1. Engineering's consumer harness for Guard (`engineering/guard/consumer/`) may later host it.

## Ownership

| Who | Owns |
| --- | --- |
| Core | the delivered documents, the delivered tests, `test/verify.mjs`, the package layout, the scope of 0.0.1, and the planned release acceptance |
| Testing | what verification, a result and coverage mean. `docs/testing.md` cites Testing and does not restate it |
| Engineering | the Workspaces and Acceptance lanes, and any shared consumer harness |
| Graph, Hosting, Foundation | the publication of `kaal-graph`, `kaal-hosting` and `@kaihacksai/kaal-foundation`, which Core depends on |
| the Owner | the version, the package scope, synchronization, promotion and publication |

## Release dependency map

| Order | Change | Owner | Depends on | State |
| --- | --- | --- | --- | --- |
| 1 | `core/C30` PLAN (#600): scoped kinds, hierarchies, shared terms, candidates | Core | `core/C24` | open, awaiting review |
| 2 | `core/C28` PLAN, this Change | Core | the Owner's 0.0.1 decision on #600 | this PR |
| 3 | `graph/C3` DO on `main`: reach, reverse and cycles | Graph | — | merged into `kaal/graph` (#593), promotion in flight |
| 4 | sync `main` → `kaal/core`, carrying `graph/C3` | Core | 3 | after Graph's promotion, in the promotion queue |
| 5 | `core/C26` DO: Registration Type, `kaal-core/registration`, `verify`, core/T50–T59, T67, T72, T73 GREEN | Core | 1, 4, `core/C11`, `core/C27` (both merged) | — |
| 6 | `core/C29` DO: delivered documents and tests, `test/verify.mjs`, core/T74–T78 GREEN | Core | 2, 5, and the conflicts below | — |
| 7 | promotion `kaal/core` → `main` | Core | 5, 6 | Owner's go |
| 8 | publication of `kaal-hosting`, `kaal-graph`, `@kaihacksai/kaal-foundation` 0.0.1 | their owners | — | Owner's go |
| 9 | publication of kaal-core 0.0.1 | Owner | 7, 8 | Owner's hand |

`core/C29` writes the documents after `core/C26`, so they describe the registration that ships.

## Conflicts for Owner alignment

1. **A private dependency.** kaal-core depends on `@kaihacksai/kaal-foundation` 0.0.1, which is marked `private`, so a consumer cannot install it. core/T78 is RED on this. Either Foundation is published, or Core stops depending on it, or its SHA-256 is vendored. Foundation's own decision, then the Owner's.
2. **Package scope.** Guard publishes as `@kaihacksai/kaal-guard`, while kaal-core, `kaal-graph` and `kaal-hosting` are unscoped and none is on npm yet. Renaming changes every `kaal-core/…` import. The Owner decides before the first publication, because a published name cannot be taken back.
3. **The result vocabulary.** `verified`, `failed` and `cannot verify` are Guard's (guard/F31–guard/F36). Core reuses the words through Testing's definitions, not Guard's code, since Guard depends on no other KAAL package. If Testing does not define them, Testing owns that decision.
4. **The test script.** Making `npm test` the consumer entry (`core/A34`) means Engineering's Workspaces lane runs `test:publisher` for kaal-core. That is a one-line Engineering change, needed before `core/C29` merges.
