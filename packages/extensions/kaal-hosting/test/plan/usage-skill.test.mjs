// Publisher-only structural checks. Passing them is not agent behavior evidence.
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SKILL = join(PACKAGE, "skills/kaal-hosting");
const skillName = basename(SKILL);
function contents(root) {
  const files = {};
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else files[relative(root, path).split("\\").join("/")] = readFileSync(path);
    }
  };
  walk(root);
  return files;
}

it("hosting/T71 [hosting/I14, hosting/F57, hosting/F61, hosting/A23]: the packaged usage Skill validates after relocation; absent resources and an escaping reference are rejected", async () => {
  assert.ok(existsSync(join(SKILL, "SKILL.md")), "Hosting delivers a general usage Skill, beyond its boundary reviewer");
  const checker = resolve(PACKAGE, "../../skills/kaal-engineer-skill/skills/kaal-engineer-skill/scripts/validate.mjs");
  const { checkSkill } = await import(pathToFileURL(checker));
  const relocated = join(mkdtempSync(join(tmpdir(), "kaal-hosting-relocated-")), skillName);
  cpSync(SKILL, relocated, { recursive: true });
  const files = contents(relocated);
  assert.ok(files["references/operations.md"], "the relocated Skill carries its operational resource");
  const good = checkSkill(skillName, files);
  assert.deepEqual({ standard: good.standard, kaal: good.kaal }, { standard: [], kaal: [] });
  const missing = { ...files };
  delete missing["references/operations.md"];
  assert.ok(checkSkill(skillName, missing).kaal.length > 0, "a referenced file cannot be omitted");
  const escaped = { ...files, "SKILL.md": Buffer.from(files["SKILL.md"].toString() + "\n[escape](../outside.md)\n") };
  assert.ok(checkSkill(skillName, escaped).kaal.length > 0, "the relocated Skill cannot escape its directory");
});
