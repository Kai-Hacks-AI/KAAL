import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// Skills are independent capabilities: none may import another. A using system
// such as KAAL's Genesis composes them; they never compose each other.
const SKILLS = fileURLToPath(new URL("../skills/", import.meta.url));

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
