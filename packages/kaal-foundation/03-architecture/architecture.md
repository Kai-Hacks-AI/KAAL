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
