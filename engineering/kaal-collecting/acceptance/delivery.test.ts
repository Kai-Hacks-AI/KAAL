// The capability's delivery, proven on what is actually shipped: it joins an
// installed KAAL through Core's registration without becoming Core, its Node
// keeps the identity it was sealed with, it passes the conventions Engineering
// KAAL Skill teaches, and the Agent Skill realizes it without defining it again.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { payload as core, registerSkill } from "kaal-core";
import { payload } from "kaal-collecting";
import { admit, CAPABILITY, PACKAGE, REPO, deployKaal, read } from "../helpers/setup.js";

const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");
const { kaal, skills } = payload();
const nodeFile = "Collecting-KAAL.md";
const manifest = skills[`${CAPABILITY}/SKILL.md`];

test("Core carries no Collecting KAAL: a capability joins without becoming Core", () => {
  assert.ok(!admit(core()).some((n) => n.name === "Collecting KAAL"));
  assert.ok(!Object.keys(core()).some((p) => p.startsWith("skills/")));
});

test("registering through Core admits the Collecting KAAL Skill, typed by the sealed Skill Node, and nothing else changes", (t) => {
  const dir = deployKaal(t);
  const before = admit(read(dir));
  const skill = before.find((n) => n.name === "Skill")!;
  const sealsBefore = readdirSync(join(dir, "seals"));
  const ids = registerSkill(dir, CAPABILITY, kaal);
  const after = admit(read(dir));
  assert.deepEqual(ids, [sha256(kaal[nodeFile])], "the Skill's identity is the SHA-256 of the shipped bytes");
  assert.equal(after.length, before.length + 1);
  assert.deepEqual(after.filter((n) => n.type?.name === "Skill" && n.type.id === skill.id).map((n) => n.name), ["Collecting KAAL"], "found by Node type alone");
  assert.equal(readFileSync(join(dir, "skills", CAPABILITY, nodeFile), "utf8"), kaal[nodeFile], "bytes kept exactly");
  assert.deepEqual(readdirSync(join(dir, "seals")).filter((id) => !sealsBefore.includes(id)), ids, "exactly one seal is added");
});

test("the capability is one Skill Node, sealed by its own bytes, and it is the Node sealed in birth", () => {
  assert.deepEqual(Object.keys(kaal).filter((p) => !p.startsWith("seals/")), [nodeFile]);
  assert.equal(kaal[`seals/${sha256(kaal[nodeFile])}`], "");
  assert.equal(Object.keys(kaal).length, 2);
  assert.equal(sha256(kaal[nodeFile]), "d938e5310a9139c66ec503c9dcb7d37a3f0ca50b2c1b9effec020746a1e66230");
});

test("the Node keeps known, reachable and all clients apart, and defines no mechanism", () => {
  const meaning = kaal[nodeFile].split("---\n").pop()!;
  assert.match(meaning, /known/);
  assert.match(meaning, /reachable/);
  assert.match(meaning, /not all the clients there are/);
  assert.match(meaning, /keeps no list of clients/);
  assert.match(meaning, /only the KAAL-addressed carriers it carries within its embedded KAAL/);
  assert.match(meaning, /is a name and not where it was found/);
  assert.match(meaning, /evidence only/);
  for (const word of [/github/i, /\bgit\b/i, /\bPRs?\b/, /\bnpm\b/, /\.mjs/, /\bCI\b/, /enercon/i, /\bIssues?\b/, /\bWork\b/, /\bReviewer\b/, /\bOwner\b/, /https?:/, /\.md\b/, /\bregistry\b/i]) assert.doesNotMatch(meaning, word);
});

test("the Agent Skill is one skill, named as its capability, pointing to the Nodes and not restating them", () => {
  for (const path of Object.keys(skills)) assert.ok(path.startsWith(`${CAPABILITY}/`), path);
  assert.match(manifest, new RegExp(`^---\\nname: ${CAPABILITY}\\n`));
  assert.ok(manifest.includes("`Collecting KAAL`") && manifest.includes("`Skill`"));
  assert.ok(!manifest.includes(kaal[nodeFile].split("\n").filter((l) => l.startsWith("Collecting KAAL is"))[0]));
  assert.ok(!manifest.includes(sha256(kaal[nodeFile])), "carries no ID of its own Node");
});

test("the shipped script is exactly collect.mjs, and reaches nothing, names no host and no client", () => {
  assert.deepEqual(Object.keys(skills).filter((p) => p.includes("/scripts/")), [`${CAPABILITY}/scripts/collect.mjs`]);
  for (const path of Object.keys(skills).filter((p) => p.includes("/scripts/"))) {
    assert.doesNotMatch(skills[path], /github|enercon|https?:|node:(net|http|https|child_process|dns|tls)|\bfetch\(/i, path);
  }
});

test("the Agent Skill names no host and no particular client", () => {
  assert.doesNotMatch(manifest, /github|enercon|https?:/i);
});

test("the capability passes the conventions Engineering KAAL Skill teaches", () => {
  const checker = join(REPO, "packages", "kaal-engineering", "skills", "kaal-engineering", "scripts", "check-skill.mjs");
  const r = spawnSync("node", [checker, REPO, CAPABILITY], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
});

test("registering is Core's: the shipped contribution passes register-skill --check", (t) => {
  const registrar = join(REPO, "packages", "kaal-engineering", "skills", "kaal-engineering", "scripts", "register-skill.mjs");
  const r = spawnSync("node", [registrar, "--check", deployKaal(t), CAPABILITY, join(PACKAGE, "kaal")], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /can register kaal-collecting: [0-9a-f]{64}/);
});
