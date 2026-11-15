# Architecture

- **foundation/A1** **Position.** Foundation and Hosting are siblings at the bottom of KAAL's packages. Neither depends on the other or on anything above.
- **foundation/A7** **Layout.**

  | Path | Role |
  | --- | --- |
  | `lib/sha256.mjs`, `lib/sha256.d.ts` | `@kaihacksai/kaal-foundation/sha256`, plain ESM with no build step. A consumer imports only the concern it uses. |
  | `bin/kaal-foundation.mjs` | the `kaal-foundation` command |
  | `skills/kaal-foundation/SKILL.md` | the skill |
  | `docs/` | these documents, which define the identifiers the delivered cases test |
  | `test/embed/` | the delivered cases, each titled `foundation/T<n> [<targets>]: …` |
  | `test/verify.json` | the manifest: every other shipped file with its SHA-256, the delivered cases, and the cases as a Testing model |
  | `test/verify.mjs` | the verification, which imports only Node's built-in modules |
  | `test/run.mjs` | `npm test`. In an installed package it runs only the verification. See [Operations](operations.md). |

- **foundation/A9** **An independent check.** Foundation's own `sha256` wrote the manifest before the package was packed. The verification checks it with the host's SHA-256, never with Foundation's `lib/`, so a broken library cannot hide itself.
