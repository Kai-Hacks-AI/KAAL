# Architecture

- **foundation/A1** **Position.** Foundation and Hosting are siblings at the bottom of KAAL's packages. Neither depends on the other or on anything above.
- **foundation/A7** **Layout.**

  | Path in the package | Role |
  | --- | --- |
  | `01-intent/`, `02-requirements/`, `03-architecture/`, `06-defects/` | the Nodes of the Foundation graph, each loop with its Test Cases beside the Nodes. They ship under `dist/docs/`. |
  | `05-src/skills/kaal-foundation/scripts/sha256.mjs`, `sha256.d.ts` | `@kaihacksai/kaal-foundation/sha256`, plain ESM with no build step. A consumer imports only the concern it uses. |
  | `05-src/skills/kaal-foundation/scripts/kaal-foundation.mjs` | the `kaal-foundation` command |
  | `05-src/skills/kaal-foundation/` | the skill (`SKILL.md`) and its `references/` (limitations, operations) |
  | `kaal/Foundation.md` | the owner declaration |
  | `*.test.mjs` beside a Node | the delivered cases, each titled `foundation/T<n> [<targets>]: …`. They ship beside the Nodes in `dist/` |
  | `04-test/package-check/` | the verification (`verify.mjs`, which imports only Node's built-in modules and the temporary `collect.mjs`), the manifest `verify.json` (every other shipped file with its SHA-256, the delivered cases, and the cases as a Testing model) and `testing.md` |
  | `04-test/engineering-check/` | the build and the publisher's tests. Never shipped |
  | `dist/` | the only thing shipped (`files: ["dist"]`), built by `04-test/engineering-check/build.mjs` as byte-for-byte copies of the folders above. It is not committed. |
  | `npm test` | in source it builds `dist/` first (`pretest`) and then runs `dist/test/package-check/verify.mjs`, exactly as in an installed package. |

- **foundation/A9** **An independent check.** Foundation's own `sha256` wrote the manifest before the package was packed. The verification checks it with the host's SHA-256, never with Foundation's own library, so a broken library cannot hide itself.

- **foundation/A15** `kaal/Foundation.md` (shipped as `dist/kaal/Foundation.md`) is the one owner declaration.
  `./capability` exposes that file as data. It needs no loader or generated copy;
  its bytes participate in the existing committed manifest and delivered Case.
- **foundation/A16** Foundation's package owns declaration bytes and distribution.
  Core owns explicit registration and Engine lifecycle. No Foundation-owned
  installation record or automatic registration hook exists in this delivery.
- **foundation/A19** **One definition, no script, targets as arguments.** `04-test/boundary-check/boundary-check.md` holds Foundation's three Boundary Tests as typed data in its front matter, and the record below it. It is not a package export and not a `bin`, and Foundation ships no scanner and no YAML parser: parsing, traversal, the typed detectors (`file-identity`, `token-sequence`, `call-with-literal`) and reporting are Engineering's Boundary Engine (`engineering/boundary/`). `scripts/kaal-foundation.mjs` is unchanged, and there are no `check` or `boundary` commands. The tests are data in the definition. Targets are never.
- **foundation/A20** **Where it runs, and who decides.** Foundation ships the definition. Whoever promotes a package, or the repository's own lane, gives it to the Boundary Engine and names the packages and the repository as targets. Foundation never runs it against anyone. The engine reports and Foundation ships no finding list. A finding is audit, held by Engineering; the repository records its decisions about findings against the finding `id` and `digest`, with the deciders its own role mapping names. Packaging may read the finding list later (its C23 reads only `id`, references and line digest); nothing here depends on Packaging.
- **foundation/A21** **The engine's output shape.** The evidence line, the per-line finding and the exit codes 0 and 2 are the Boundary Engine's, one shape for every provider. The id prefix is the provider's own (`Foundation`), and the tests are Foundation's. Each test carries a `tests` edge and a `ships` flag, so it can become a Boundary Case of BEST when Testing is embedded; until then Engineering's Case adapter is provisional.

- **foundation/A6** [foundation/F9, foundation/F17, foundation/N6]: **The delivered layout and the scripts.** `files` is `["dist"]`; `npm` adds `package.json`, `README.md` and `LICENSE`. `dist/` is built by `04-test/engineering-check/build.mjs` and holds the Nodes, their delivered Cases, the skill, the declaration, the verification and the Boundary Check. `npm test` builds `dist/` first in source and runs `dist/test/package-check/verify.mjs`; `npm run test:publisher` runs the publisher's Cases. Plans, the publisher's Cases and `00-changes/` never ship. The delivered Cases are plain `node:test` files that import the package by its name, so they exercise whichever copy is installed.

## Held for kaal-packaging

Not ours: carried forward from the publication Change and held here until kaal-packaging lands on main (foundation/I16).

- **foundation/A5** [foundation/F5, foundation/F8]: **Release acceptance.** Acceptance packs the package with `npm pack`, installs the tarball with `npm install` into a directory under the operating system's temporary directory, and runs there: the import, the file inventory and the installed `npm test`.
