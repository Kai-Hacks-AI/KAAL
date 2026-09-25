import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { birthErrors, checkSkills, standardErrors } from "./skills.js";
import { skill, SKILLS } from "./test-data.js";

const LONG = "a".repeat(65);

test("a skill with a name and description, or with every optional field, follows the standard", () => {
  assert.deepEqual(standardErrors(skill("born")), []);
  assert.deepEqual(standardErrors(skill("full")), []);
});

test("the name may be lowercase letters of any script, as the standard's reference validator allows", () => {
  assert.deepEqual(standardErrors(skill("données")), []);
});

test("the name must be lowercase with single hyphens, at most 64 characters, and the skill's directory", () => {
  const shape = "name must be lowercase letters, digits and single hyphens, not starting or ending with a hyphen";
  assert.deepEqual(standardErrors(skill("mismatch")), ['mismatch: name "other" does not match the skill\'s directory']);
  assert.deepEqual(standardErrors(skill("Upper")), [`Upper: ${shape}`]);
  assert.deepEqual(standardErrors(skill("double--hyphen")), [`double--hyphen: ${shape}`]);
  assert.deepEqual(standardErrors(skill(LONG)), [`${LONG}: name is longer than 64 characters`]);
});

test("the description is required and at most 1024 characters", () => {
  assert.deepEqual(standardErrors(skill("no-description")), ["no-description: description is required"]);
  assert.deepEqual(standardErrors(skill("long-description")), [
    "long-description: description is longer than 1024 characters",
  ]);
});

test("optional fields keep to the standard, and no other field is allowed", () => {
  assert.deepEqual(standardErrors(skill("bad-optional")), [
    "bad-optional: compatibility must be 1 to 500 characters",
    "bad-optional: metadata must map strings to strings",
  ]);
  assert.deepEqual(standardErrors(skill("unknown-field")), ['unknown-field: "version" is not a field of the standard']);
});

test("a skill needs a SKILL.md that starts with frontmatter", () => {
  assert.deepEqual(standardErrors(skill("empty")), ["empty: no SKILL.md"]);
  assert.deepEqual(standardErrors(skill("no-frontmatter")), [
    "no-frontmatter: SKILL.md does not start with YAML frontmatter",
  ]);
});

test("a skill is born when its SKILL.md is exactly what its init generates", async () => {
  assert.deepEqual(await birthErrors(skill("born")), []);
  assert.deepEqual(await birthErrors(skill("hand-edited")), [
    "hand-edited: SKILL.md is not what scripts/init.ts generates; change init and run it, never SKILL.md",
  ]);
});

test("a skill without an init, or whose init exports no init(target), is not born from it", async () => {
  assert.deepEqual(await birthErrors(skill("no-init")), [
    "no-init: no scripts/init.ts; a skill is born from its own init",
  ]);
  assert.deepEqual(await birthErrors(skill("no-export")), ["no-export: scripts/init.ts does not export init(target)"]);
});

test("checking runs init into a scratch file, never over the skill", async () => {
  const before = fs.readFileSync(`${skill("hand-edited")}/SKILL.md`);
  await birthErrors(skill("hand-edited"));
  assert.deepEqual(fs.readFileSync(`${skill("hand-edited")}/SKILL.md`), before);
});

test("checkSkills reports every skill in the directory, in name order", async () => {
  const errors = await checkSkills(SKILLS);
  const skills = [...new Set(errors.map((e) => e.slice(0, e.indexOf(":"))))];
  assert.deepEqual(skills, [...skills].sort());
  assert.equal(errors.filter((e) => e.startsWith("born:")).length, 0);
  assert.ok(errors.includes("no-init: no scripts/init.ts; a skill is born from its own init"));
  assert.ok(errors.includes('unknown-field: "version" is not a field of the standard'));
});
