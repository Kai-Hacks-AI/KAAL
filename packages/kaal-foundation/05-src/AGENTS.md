# Foundation: instructions for an agent

Foundation (`@kaihacksai/kaal-foundation`) is KAAL's one SHA-256. Read `skills/kaal-foundation/SKILL.md` first.

- Hash bytes with `import { sha256 } from "@kaihacksai/kaal-foundation/sha256"`; encode text as UTF-8 yourself.
- Run the command by the scoped package's own bin, never `npx` or `npm exec`:
  `node node_modules/@kaihacksai/kaal-foundation/dist/skills/kaal-foundation/scripts/kaal-foundation.mjs sha256 <file>`.
- `npm test` in the installed package verifies the copy: `verified`, `failed` or `cannot verify`.
- A new shared helper belongs to the capability whose meaning it carries. Foundation holds only reviewed, provisional concerns.
