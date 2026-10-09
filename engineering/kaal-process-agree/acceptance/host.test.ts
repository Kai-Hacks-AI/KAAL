// The Process on a repository that is not KAAL: nothing installs it unless it is
// selected by the exact ID of its Node, and it will not install without the two
// Skills it composes beside it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestContext } from "node:test";
import { installedSkills } from "kaal-core";
import { payload as intent } from "kaal-intent";
import { payload } from "kaal-process-agree";
import { payload as review } from "kaal-review";
import { REPO, CAPABILITY } from "../helpers/setup.js";

const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");
const AGREE = sha256(payload().kaal["Agreement.md"]);
const INTENT = sha256(intent().kaal["Intent.md"]);
const REVIEW = sha256(review().kaal["Review.md"]);
const host = (t: TestContext) => {
  const d = mkdtempSync(join(tmpdir(), "agree-host-"));
  t.after(() => rmSync(d, { recursive: true, force: true }));
  writeFileSync(join(d, "README.md"), "# Some host\n");
  return d;
};
const helper = (command: string, dir: string, ...args: string[]) => {
  const r = spawnSync("node", [join(REPO, "engineering", "kaal-install", "dist", "helpers", `${command}.js`), ...args], { env: { ...process.env, INIT_CWD: dir }, encoding: "utf8" });
  return { code: r.status, err: r.stderr };
};

test("a repository embedding KAAL does not get the Process unless it is selected by the exact ID of its Node, and then only with what it composes", (t) => {
  const dir = host(t);
  assert.equal(helper("install-kaal", dir).code, 0);
  assert.deepEqual(installedSkills(join(dir, ".kaal")), [], "Core only on a fresh checkout");
  assert.notEqual(helper("install-kaal", dir, "--select", "Agreement").code, 0, "a name selects nothing");
  const alone = helper("install-kaal", dir, "--select", AGREE);
  assert.notEqual(alone.code, 0, "the Process alone is refused");
  assert.match(alone.err, /kaal-process-agree declares that it needs kaal-intent beside it/);
  assert.ok(!existsSync(join(dir, "skills")), "and nothing is written");
  const all = helper("install-kaal", dir, "--select", AGREE, "--select", INTENT, "--select", REVIEW);
  assert.equal(all.code, 0, all.err);
  assert.deepEqual(installedSkills(join(dir, ".kaal")).map((s) => s.name).sort(), ["Agreement", "Intent", "Review"]);
  for (const skill of ["kaal-process-agree", "kaal-intent", "kaal-review"]) assert.ok(existsSync(join(dir, "skills", skill, "SKILL.md")), skill);
  const check = helper("check-kaal-install", dir);
  assert.equal(check.code, 0, check.err);
});

test("an installed Process runs where it is installed and the installed KAAL stays whole", (t) => {
  const dir = host(t);
  assert.equal(helper("install-kaal", dir, "--select", AGREE, "--select", INTENT, "--select", REVIEW).code, 0);
  const script = join(dir, "skills", CAPABILITY, "scripts", "agree.mjs");
  const made = spawnSync("node", [script, "begin", join(dir, "loop"), "--worker", "w", "--reviewer", "r", "--rounds", "2", "--words", "the Owner grants it"], { encoding: "utf8" });
  assert.equal(made.status, 0, made.stderr);
  const s = spawnSync("node", [script, "state", join(dir, "loop")], { encoding: "utf8" });
  assert.equal(s.status, 0);
  assert.match(s.stdout, /^DESCRIBE\n/);
  const check = helper("check-kaal-install", dir);
  assert.equal(check.code, 0, check.err);
});

test("the package encodes no client", () => {
  const { kaal, skills } = payload();
  for (const content of [...Object.values(kaal), ...Object.values(skills)]) assert.doesNotMatch(content, /enercon/i);
});
