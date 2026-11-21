// Case testing/T382 tests: testing/N35. Minimal Skill surface and Engineer Skill conformance.
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { read } from "@kaihacksai/kaal-hosting";
import { checkSkill } from "kaal-engineer-skill";
import { SKILL_DIR } from "./lib.mjs";

export const id = "testing/T382";
export const tests = ["testing/N35"];
export const title = "skills/kaal-testing holds only SKILL.md and references/findings.md (no scripts/) and passes checkSkill cleanly";

export async function run() {
  assert.deepEqual(readdirSync(SKILL_DIR).sort(), ["SKILL.md", "references"], "skills/kaal-testing/ holds only SKILL.md and references/");
  assert.deepEqual(readdirSync(join(SKILL_DIR, "references")).sort(), ["findings.md"], "references/ holds only findings.md");
  const result = checkSkill("kaal-testing", await read(SKILL_DIR));
  assert.deepEqual(result, { standard: [], kaal: [], warnings: [] }, `checkSkill reported issues: ${JSON.stringify(result)}`);
}
