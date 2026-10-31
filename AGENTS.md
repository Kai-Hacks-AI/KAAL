# AGENTS.md

This repository is governed by KAAL.

- `packages/` holds distributable capabilities.
- `engineering/` holds engineering and acceptance work.
- The KAAL Engine for this repository is `.kaal/`. Start with `.kaal/AGENTS.md`.

## Foundation

`@kaihacksai/kaal-foundation` (`packages/kaal-foundation/`) is KAAL's one SHA-256.
- **When to use it.** Use it whenever KAAL code needs a SHA-256: Node ids, Seals, records and manifests. Never use `node:crypto` or a copied implementation for a KAAL digest.
- **The skill.** Read `packages/kaal-foundation/skills/kaal-foundation/SKILL.md`, which also ships as `skills/kaal-foundation/SKILL.md` in the package.
- **The commands.**
  - `kaal-foundation sha256 [<file>…]` prints `<digest>  <file>`, and reads standard input when no file is given.
  - `kaal-foundation verify` checks an installed copy and ends in `verified`, `failed` or `cannot verify`.
- **What it holds.** Foundation holds only reviewed, provisional concerns, and it is not a utilities bucket. A new shared helper belongs to the capability whose meaning it carries, and anything that touches the operating system belongs to Hosting.
