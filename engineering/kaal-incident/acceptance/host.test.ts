// The capability on a repository that is not KAAL: nothing installs it unless it
// is selected by the exact ID of its Node; a carrier made there stays in the
// KAAL directory, where a reader that knows only the form finds it; and neither
// installing again nor the install check disturbs it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestContext } from "node:test";
import { installedSkills } from "kaal-core";
import { payload } from "kaal-incident";
import { REPO, CAPABILITY, read } from "../helpers/setup.js";

const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");
const id = sha256(payload().kaal["KAAL-Incident.md"]);
const host = (t: TestContext) => {
  const d = mkdtempSync(join(tmpdir(), "incident-host-"));
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
  assert.notEqual(helper("install-kaal", dir, "--select", "KAAL Incident").code, 0, "a name selects nothing");
  assert.ok(!existsSync(join(dir, "skills")));
  assert.equal(helper("install-kaal", dir, "--select", id).code, 0);
  assert.deepEqual(installedSkills(join(dir, ".kaal")), [{ name: "KAAL Incident", id }]);
  assert.ok(existsSync(join(dir, "skills", CAPABILITY, "SKILL.md")), "its Agent Skill is projected");
  assert.ok(!existsSync(join(dir, "skills", "kaal-request")) && !existsSync(join(dir, ".kaal", "skills", "kaal-request")), "selecting this capability installs not kaal-request");
  const check = helper("check-kaal-install", dir);
  assert.equal(check.code, 0, check.err);
});

test("a carrier made there stays with the embedded KAAL, is found by a reader that knows only the form, and survives installing again", (t) => {
  const dir = host(t);
  assert.equal(helper("install-kaal", dir, "--select", id).code, 0);
  const script = join(dir, "skills", CAPABILITY, "scripts", "incident.mjs");
  const made = spawnSync("node", [script, "write", join(dir, ".kaal"), "--happened", "one thing", "--expected", "another", "--date", "2026-10-07"], { encoding: "utf8" });
  assert.equal(made.status, 0, made.stderr);
  const carrier = made.stdout.trim();
  assert.equal(carrier, "incidents/26/10/07/01.md");
  assert.equal(readFileSync(join(dir, ".kaal", carrier), "utf8"), "# KAAL Incident\n\n## Happened\n\none thing\n\n## Expected\n\nanother\n");

  // Later harvestable: the carriers are plain files at a known place inside the KAAL directory; nothing about them lives anywhere else.
  const base = join(dir, ".kaal", "incidents");
  const collected = readdirSync(base, { recursive: true, encoding: "utf8" }).filter((p) => statSync(join(base, p)).isFile());
  assert.deepEqual(collected, ["26/10/07/01.md"]);
  assert.deepEqual(Object.keys(read(dir)).filter((p) => /(^|\/)incidents\//.test(p) && !p.startsWith(".kaal/incidents/")), [], "no copy, queue or index elsewhere");
  assert.equal(spawnSync("node", [script, "check", join(dir, ".kaal", carrier)]).status, 0);

  const before = JSON.stringify(read(dir));
  const check = helper("check-kaal-install", dir);
  assert.equal(check.code, 0, "the install check does not report a carrier: " + check.err);
  assert.equal(helper("install-kaal", dir).code, 0);
  assert.equal(helper("install-kaal", dir, "--select", id).code, 0);
  assert.equal(JSON.stringify(read(dir)), before, "installing again changes nothing, the carrier included");
});

test("the package itself holds no carrier and encodes no client", () => {
  const { kaal, skills } = payload();
  for (const path of [...Object.keys(kaal), ...Object.keys(skills)]) assert.ok(!path.startsWith("incidents/") && !path.includes("/incidents/"), path);
  for (const content of [...Object.values(kaal), ...Object.values(skills)]) assert.doesNotMatch(content, /enercon/i);
});
