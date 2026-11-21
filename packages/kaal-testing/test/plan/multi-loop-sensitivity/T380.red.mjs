// Case testing/T380 tests: testing/N34. Checks minimal Skill surface, conformance, Node invariance and consumer-agnostic guidance.
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { read } from "@kaihacksai/kaal-hosting";
import { checkSkill } from "kaal-engineer-skill";
import { CAPABILITY_SHA, HEADING, PAYLOAD_SHA, PKG, SKILL_DIR, lfSha256, readJson, skillParts } from "./lib.mjs";

export const id = "testing/T380";
export const tests = ["testing/N34"];
export const title = "the Skill stays consumer-agnostic and minimal, passes Engineer Skill conformance, and leaves Nodes and package boundary unchanged";

export async function run() {
  const { section } = skillParts();
  assert.ok(section, `the Skill has no section "${HEADING}"`);
  assert.doesNotMatch(section, /\.kaal\/|engineering\/|\bpackages\//i, "the new Skill guidance names no hardcoded KAAL repository paths");

  assert.deepEqual(readdirSync(PKG + "/skills"), ["kaal-testing"], "no extra Skill directory is added");
  assert.deepEqual(readdirSync(SKILL_DIR).sort(), ["SKILL.md", "references"], "skills/kaal-testing/ holds only SKILL.md and references/ (no scripts/)");
  assert.deepEqual(readdirSync(join(SKILL_DIR, "references")).sort(), ["findings.md"], "references/ holds only findings.md");

  assert.deepEqual(checkSkill("kaal-testing", await read(SKILL_DIR)), { standard: [], kaal: [], warnings: [] });

  assert.deepEqual(readdirSync(join(PKG, "capability")), ["Testing.md"]);
  assert.deepEqual(readdirSync(join(PKG, "payload")), ["Testing.md"]);
  assert.equal(lfSha256(join(PKG, "capability/Testing.md")), CAPABILITY_SHA, "capability/Testing.md bytes changed");
  assert.equal(lfSha256(join(PKG, "payload/Testing.md")), PAYLOAD_SHA, "payload/Testing.md bytes changed");

  const pkg = readJson(join(PKG, "package.json"));
  assert.deepEqual(
    Object.keys(pkg.exports).sort(),
    ["./acceptance", "./attribution", "./contracts", "./coverage", "./duplicates", "./expectations", "./inventory", "./package.json", "./report", "./run"],
    "package exports remain unchanged",
  );
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), ["@kaihacksai/kaal-hosting", "c8"], "runtime dependencies remain unchanged");
}
