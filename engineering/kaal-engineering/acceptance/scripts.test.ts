// The Agent Skill's scripts, through the commands as an agent would run them:
// where a deterministic procedure beats judgement (Skill -> Script in BASS),
// it must decide exactly what it claims and nothing else.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { payload } from "kaal-engineering";
import { CAPABILITY, PACKAGE, REPO, SCRIPTS, deployKaal, read, repoCopy, scratch } from "../helpers/setup.js";

const run = (script: string, ...args: string[]) => {
  const r = spawnSync("node", [join(SCRIPTS, `${script}.mjs`), ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout.trim(), err: r.stderr };
};
const { kaal } = payload();
const manifestOf = (root: string) => join(root, "packages", CAPABILITY, "skills", CAPABILITY, "SKILL.md");

test("check-skill passes on this very capability", () => {
  const r = run("check-skill", REPO, CAPABILITY);
  assert.equal(r.code, 0, r.err);
});

test("check-skill refuses what the conventions forbid, and repairs nothing", async (t) => {
  const cases: [string, (root: string) => void, RegExp][] = [
    ["no engineering directory", (r) => rmSync(join(r, "engineering"), { recursive: true }), /engineering\/kaal-engineering\/ is missing/],
    ["a second skill in the package", (r) => mkdirSync(join(r, "packages", CAPABILITY, "skills", "other")), /exactly one skill/],
    ["a skill named otherwise", (r) => writeFileSync(manifestOf(r), readFileSync(manifestOf(r), "utf8").replace(`name: ${CAPABILITY}`, "name: Other")), /name is the capability/],
    ["an unknown frontmatter field", (r) => writeFileSync(manifestOf(r), readFileSync(manifestOf(r), "utf8").replace("license: MIT", "license: MIT\nowner: me")), /owner is not in the Agent Skills standard/],
    ["a description over 1024 characters", (r) => writeFileSync(manifestOf(r), readFileSync(manifestOf(r), "utf8").replace(/description: .*/, `description: ${"x".repeat(1025)}`)), /at most 1024/],
    ["no description", (r) => writeFileSync(manifestOf(r), readFileSync(manifestOf(r), "utf8").replace(/description: .*\n/, "")), /has a description/],
    ["no kaal contribution", (r) => rmSync(join(r, "packages", CAPABILITY, "kaal"), { recursive: true }), /kaal\/ is missing/],
  ];
  for (const [what, damage, expected] of cases) {
    await t.test(what, (sub) => {
      const root = repoCopy(sub);
      damage(root);
      const before = JSON.stringify(read(root));
      const r = run("check-skill", root, CAPABILITY);
      assert.equal(r.code, 1, what);
      assert.match(r.err, expected);
      assert.equal(JSON.stringify(read(root)), before, "nothing repaired");
    });
  }
  assert.equal(run("check-skill", REPO, "Bad Name").code, 1, "a name Agent Skills forbids");
  assert.equal(run("check-skill").code, 2, "usage");
});

test("check-skill decides nothing about seals: that is Core's, through registration", (t) => {
  const changed = (r: string) => writeFileSync(join(r, "packages", CAPABILITY, "kaal", "Engineering-Skill.md"), kaal["Engineering-Skill.md"] + " ");
  const orphan = (r: string) => writeFileSync(join(r, "packages", CAPABILITY, "kaal", "seals", "0".repeat(64)), "");
  for (const [what, damage, refusal] of [
    ["a Node changed after it was sealed", changed, /not an empty seal of a carried Node|is not admitted/],
    ["a seal that seals nothing", orphan, /not an empty seal of a carried Node/],
  ] as const) {
    const root = repoCopy(t);
    damage(root);
    assert.equal(run("check-skill", root, CAPABILITY).code, 0, `${what}: layout and conformance are all check-skill judges`);
    const r = run("register-skill", "--check", deployKaal(t), CAPABILITY, join(root, "packages", CAPABILITY, "kaal"));
    assert.equal(r.code, 1, what);
    assert.match(r.err, refusal, `${what}: refused by Core's registration`);
  }
});

test("register-skill --check decides through Core and writes nothing; without --check it registers", (t) => {
  const dir = deployKaal(t);
  const before = JSON.stringify(read(dir));
  const contribution = join(PACKAGE, "kaal");
  const checked = run("register-skill", "--check", dir, CAPABILITY, contribution);
  assert.equal(checked.code, 0, checked.err);
  assert.match(checked.out, /can register kaal-engineering: [0-9a-f]{64}/);
  assert.equal(JSON.stringify(read(dir)), before, "the installed KAAL is untouched");
  assert.equal(run("register-skill", "--check", dir, "Bad Name", contribution).code, 1, "Core refuses a bad capability name");
  const done = run("register-skill", dir, CAPABILITY, contribution);
  assert.equal(done.code, 0, done.err);
  assert.ok(read(dir)[`skills/${CAPABILITY}/Engineering-Skill.md`], "registered under its capability");
  assert.equal(run("register-skill", dir, CAPABILITY, contribution).code, 0, "registering again is fine");
  assert.equal(run("register-skill", dir).code, 2, "usage");
});

test("register-skill refuses a contribution Core refuses", (t) => {
  const dir = deployKaal(t);
  const bad = scratch(t);
  writeFileSync(join(bad, "N.md"), "# not a Node\n");
  const r = run("register-skill", "--check", dir, CAPABILITY, bad);
  assert.equal(r.code, 1);
  assert.match(r.err, /Nodes and their seals/);
});
