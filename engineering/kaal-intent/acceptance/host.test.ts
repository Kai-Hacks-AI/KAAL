// The capability on a repository that is not KAAL: nothing installs it unless it
// is selected by the exact ID of its Node, and a round written there is a plain
// file that the shipped script checks.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestContext } from "node:test";
import { installedSkills } from "kaal-core";
import { payload } from "kaal-intent";
import { REPO, CAPABILITY } from "../helpers/setup.js";

const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");
const id = sha256(payload().kaal["Intent.md"]);
const host = (t: TestContext) => {
  const d = mkdtempSync(join(tmpdir(), "intent-host-"));
  t.after(() => rmSync(d, { recursive: true, force: true }));
  writeFileSync(join(d, "README.md"), "# Some host\n");
  return d;
};
const helper = (command: string, dir: string, ...args: string[]) => {
  const r = spawnSync("node", [join(REPO, "engineering", "kaal-install", "dist", "helpers", `${command}.js`), ...args], { env: { ...process.env, INIT_CWD: dir }, encoding: "utf8" });
  return { code: r.status, err: r.stderr };
};

test("a repository embedding KAAL does not get the capability unless it is selected by the exact ID of its Node", (t) => {
  const dir = host(t);
  assert.equal(helper("install-kaal", dir).code, 0);
  assert.deepEqual(installedSkills(join(dir, ".kaal")), [], "Core only on a fresh checkout");
  assert.ok(!existsSync(join(dir, "skills")), "no Agent Skill is installed merely because KAAL is embedded");
  assert.notEqual(helper("install-kaal", dir, "--select", "Intent").code, 0, "a name selects nothing");
  assert.ok(!existsSync(join(dir, "skills")));
  assert.equal(helper("install-kaal", dir, "--select", id).code, 0);
  assert.deepEqual(installedSkills(join(dir, ".kaal")), [{ name: "Intent", id }]);
  assert.ok(existsSync(join(dir, "skills", CAPABILITY, "SKILL.md")), "its Agent Skill is projected");
  const check = helper("check-kaal-install", dir);
  assert.equal(check.code, 0, check.err);
});

test("an Intent written there is a plain file the installed script checks and identifies, and the installed KAAL stays whole", (t) => {
  const dir = host(t);
  assert.equal(helper("install-kaal", dir, "--select", id).code, 0);
  const script = join(dir, "skills", CAPABILITY, "scripts", "intent.mjs");
  const to = join(dir, "intent.md");
  writeFileSync(to, "# Intent\n\nWe want it to be possible to plan a trip in one evening.\n");
  assert.equal(spawnSync("node", [script, "check", to]).status, 0);
  const r = spawnSync("node", [script, "identity", to], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), sha256(readFileSync(to, "utf8")));
  const check = helper("check-kaal-install", dir);
  assert.equal(check.code, 0, check.err);
});

test("the package encodes no client", () => {
  const { kaal, skills } = payload();
  for (const content of [...Object.values(kaal), ...Object.values(skills)]) assert.doesNotMatch(content, /enercon/i);
});
