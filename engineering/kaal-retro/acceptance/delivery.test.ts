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
import { payload } from "kaal-retro";
import { admit, CAPABILITY, PACKAGE, REPO, deployKaal, read } from "../helpers/setup.js";

const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");
const { kaal, skills } = payload();
const nodeFile = "Retro.md";
const manifest = skills[`${CAPABILITY}/SKILL.md`];

test("Core carries no Retro: a capability joins without becoming Core", () => {
  assert.ok(!admit(core()).some((n) => n.name === "Retro"));
  assert.ok(!Object.keys(core()).some((p) => p.startsWith("skills/")));
});

test("registering through Core admits the Retro Skill, typed by the sealed Skill Node, and nothing else changes", (t) => {
  const dir = deployKaal(t);
  const before = admit(read(dir));
  const skill = before.find((n) => n.name === "Skill")!;
  const sealsBefore = readdirSync(join(dir, "seals"));
  const ids = registerSkill(dir, CAPABILITY, kaal);
  const after = admit(read(dir));
  assert.deepEqual(ids, [sha256(kaal[nodeFile])], "the Skill's identity is the SHA-256 of the shipped bytes");
  assert.equal(after.length, before.length + 1);
  assert.deepEqual(after.filter((n) => n.type?.name === "Skill" && n.type.id === skill.id).map((n) => n.name), ["Retro"], "found by Node type alone");
  assert.equal(readFileSync(join(dir, "skills", CAPABILITY, nodeFile), "utf8"), kaal[nodeFile], "bytes kept exactly");
  assert.deepEqual(readdirSync(join(dir, "seals")).filter((id) => !sealsBefore.includes(id)), ids, "exactly one seal is added");
});

test("the capability is one Skill Node, sealed by its own bytes, and it is the Node sealed in birth", () => {
  assert.deepEqual(Object.keys(kaal).filter((p) => !p.startsWith("seals/")), [nodeFile]);
  assert.equal(kaal[`seals/${sha256(kaal[nodeFile])}`], "");
  assert.equal(Object.keys(kaal).length, 2);
  assert.equal(sha256(kaal[nodeFile]), "01576bf0db92ec27e443764ea4ae5124617f978f4a5cd557c08d3d3eaca479ab");
});

test("the Node says what a retrospective is and which part is Retro's, and defines no mechanism", () => {
  const meaning = kaal[nodeFile].split("---\n").pop()!;
  assert.match(meaning, /does not decide when a retrospective is owed, who writes it, or what it is about/);
  for (const part of ["Learned", "Liked", "Lacked", "Longed"]) assert.match(meaning, new RegExp(`\\b${part}\\b`));
  for (const word of [/github/i, /\bgit\b/i, /\bPRs?\b/, /\bnpm\b/, /\.mjs/, /\bCI\b/, /\bChange\b/, /\bWork\b/, /\bReviewer\b/, /\bOwner\b/, /\bObserver\b/, /\.md\b/]) assert.doesNotMatch(meaning, word);
});

test("the Agent Skill is one skill, named as its capability, pointing to the Nodes and not restating them", () => {
  for (const path of Object.keys(skills)) assert.ok(path.startsWith(`${CAPABILITY}/`), path);
  assert.match(manifest, new RegExp(`^---\\nname: ${CAPABILITY}\\n`));
  assert.ok(manifest.includes("`Retro`") && manifest.includes("`Skill`"));
  assert.ok(!manifest.includes(kaal[nodeFile].split("\n").filter((l) => l.startsWith("Retro is"))[0]));
  assert.ok(!manifest.includes(sha256(kaal[nodeFile])), "carries no ID of its own Node");
});

test("the shipped script is exactly retro.mjs, and knows nothing of Git, GitHub or any process", () => {
  assert.deepEqual(Object.keys(skills).filter((p) => p.includes("/scripts/")), [`${CAPABILITY}/scripts/retro.mjs`]);
  for (const path of Object.keys(skills).filter((p) => p.includes("/scripts/"))) assert.doesNotMatch(skills[path], /github|\bgit\b|pull request|\bchange\b|\bwork\/|retro-(work|review|owner|observe)/i, path);
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
  assert.match(r.stdout, /can register kaal-retro: [0-9a-f]{64}/);
});
