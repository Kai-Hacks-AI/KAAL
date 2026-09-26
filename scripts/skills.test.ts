import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { checkSkills } from "../skills/using-skills/scripts/skills.js";

const SKILLS = fileURLToPath(new URL("../skills/", import.meta.url));

// Why: brain/learning/genesis/26/09/25/01/nodes/skill.md
test("no skill imports another skill", () => {
  const crossing: string[] = [];
  for (const skill of fs.readdirSync(SKILLS)) {
    const scripts = path.join(SKILLS, skill, "scripts");
    if (!fs.existsSync(scripts)) continue;
    for (const file of fs.readdirSync(scripts).filter((f) => f.endsWith(".ts"))) {
      const source = fs.readFileSync(path.join(scripts, file), "utf8");
      for (const [, specifier] of source.matchAll(/\bfrom\s+"([^"]+)"/g)) {
        if (!specifier.startsWith(".")) continue;
        const target = path.resolve(scripts, specifier);
        if (!target.startsWith(path.join(SKILLS, skill) + path.sep))
          crossing.push(`${skill}/scripts/${file} -> ${specifier}`);
      }
    }
  }
  assert.deepEqual(crossing, []);
});

// Why: brain/learning/genesis/26/09/25/01/nodes/using-skills.md
test("every skill follows the Agent Skills standard and is born from its own init", () => {
  assert.deepEqual(checkSkills(SKILLS), []);
});
