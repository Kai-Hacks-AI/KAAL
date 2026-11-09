# AGENTS.md

This repository is governed by KAAL.

- `packages/` holds distributable capabilities.
- `engineering/` holds engineering and acceptance work.
- The KAAL Engine for this repository is `.kaal/`. Start with `.kaal/AGENTS.md`.

## Foundation

`@kaihacksai/kaal-foundation` (`packages/kaal-foundation/`) is KAAL's one SHA-256.
- **When to use it.** Use it whenever KAAL code needs a SHA-256: Node ids, Seals, records and manifests. Never use `node:crypto` or a copied implementation for a KAAL digest.
- **The skill.** Read `packages/kaal-foundation/05-src/skills/kaal-foundation/SKILL.md`, which also ships as `dist/skills/kaal-foundation/SKILL.md` in the package.
- **The commands.** Run them by the scoped package's own bin, as `node node_modules/@kaihacksai/kaal-foundation/dist/skills/kaal-foundation/scripts/kaal-foundation.mjs …`, from the directory where the package is installed. Never use `npx kaal-foundation` or `npm exec … kaal-foundation`: those run whichever installed package owns `node_modules/.bin/kaal-foundation`, and npx may fetch an unrelated unscoped package.
  - `kaal-foundation sha256 [<file>…]` prints `<digest>  <file>`, and reads standard input when no file is given.
  - `kaal-foundation verify` checks an installed copy and ends in `verified`, `failed` or `cannot verify`.
  - `node engineering/boundary/engine.mjs --tests node_modules/@kaihacksai/kaal-foundation/dist/test/boundary-check/boundary-check.md --target <path>...` (Engineering's Boundary Engine, given Foundation's Boundary Test definition) reports places where the SHA-256 Foundation owns is done elsewhere, and ends in `kaal-boundary-scan {json}`. You name the targets. A finding is audit, a place to look at and not a fault; decisions about findings belong to the repository, not to the package.
- **What it holds.** Foundation holds only reviewed, provisional concerns, and it is not a utilities bucket. A new shared helper belongs to the capability whose meaning it carries, and anything that touches the operating system belongs to Hosting.
