import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const SKILL = fileURLToPath(new URL("../SKILL.md", import.meta.url));

/** This skill's SKILL.md. The skill is born from init: SKILL.md is generated from here, never edited by hand. */
export const SKILL_MD = `---
name: using-seals
description: Seal directories so their files cannot change unnoticed, and check when seals are broken.
---

# Using Seals

A seal closes a unit: a directory whose files must not change once sealed. Sealing writes \`seal.json\` into the unit, recording the hash of every other file in it.

Units form a chain. The using system decides which units belong to a chain and in which order; this skill never knows what a unit means. Each seal also records the previous seal of its chain, so changing any sealed unit breaks its own seal and every seal after it.

Seal with \`scripts/seal.ts <root> <unit>...\`: every open unit of the chain is sealed, oldest first. Sealing refuses a chain whose seals are already broken, an empty unit, and a unit holding symlinks, and writes nothing when it refuses. A fully sealed chain is left as it is.

Check with \`scripts/check.ts <root> <unit>...\`. It reports files added, changed or removed after sealing, a seal that no longer matches its own content or belongs to another unit, a seal that does not chain to the one before it, a sealed unit after an open one, and symlinks in a sealed unit.

Seals hash exact bytes. The using system must keep sealed files byte-exact wherever they are checked out, for example by disabling line-ending conversion for them. When to seal and what to seal is the using system's decision; this skill only seals and checks.
`;

/** Generates this skill's SKILL.md at `target` (by default, next to this skill's scripts). */
export function init(target = SKILL): string {
  fs.writeFileSync(target, SKILL_MD);
  return target;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) init();
