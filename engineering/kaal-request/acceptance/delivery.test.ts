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
import { payload } from "kaal-request";
import { admit, CAPABILITY, PACKAGE, REPO, deployKaal, read } from "../helpers/setup.js";

const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");
const { kaal, skills } = payload();
const nodeFile = "KAAL-Request.md";
const manifest = skills[`${CAPABILITY}/SKILL.md`];

test("Core carries no KAAL Request: a capability joins without becoming Core", () => {
  assert.ok(!admit(core()).some((n) => n.name === "KAAL Request"));
  assert.ok(!Object.keys(core()).some((p) => p.startsWith("skills/")));
});

test("registering through Core admits the KAAL Request Skill, typed by the sealed Skill Node, and nothing else changes", (t) => {
  const dir = deployKaal(t);
  const before = admit(read(dir));
  const skill = before.find((n) => n.name === "Skill")!;
  const sealsBefore = readdirSync(join(dir, "seals"));
  const ids = registerSkill(dir, CAPABILITY, kaal);
  const after = admit(read(dir));
  assert.deepEqual(ids, [sha256(kaal[nodeFile])], "the Skill's identity is the SHA-256 of the shipped bytes");
  assert.equal(after.length, before.length + 1);
  assert.deepEqual(after.filter((n) => n.type?.name === "Skill" && n.type.id === skill.id).map((n) => n.name), ["KAAL Request"], "found by Node type alone");
  assert.equal(readFileSync(join(dir, "skills", CAPABILITY, nodeFile), "utf8"), kaal[nodeFile], "bytes kept exactly");
  assert.deepEqual(readdirSync(join(dir, "seals")).filter((id) => !sealsBefore.includes(id)), ids, "exactly one seal is added");
});

test("the capability is one Skill Node, sealed by its own bytes, and it is the Node sealed in birth", () => {
  assert.deepEqual(Object.keys(kaal).filter((p) => !p.startsWith("seals/")), [nodeFile]);
  assert.equal(kaal[`seals/${sha256(kaal[nodeFile])}`], "");
  assert.equal(Object.keys(kaal).length, 2);
  assert.equal(sha256(kaal[nodeFile]), "1f7c06321c96b72fb4f37cc8a5034f4da4d7d0a52fbf7256402c8d7ed49248a0");
});

test("the Node says what a carrier is, that it is addressed to KAAL and optional, and that collection is not its concern, and defines no mechanism", () => {
  const meaning = kaal[nodeFile].split("---\n").pop()!;
  assert.match(meaning, /deliberately addresses to KAAL/);
  assert.match(meaning, /kept locally with the embedded KAAL/);
  assert.match(meaning, /neither replaces nor governs/);
  assert.match(meaning, /is optional\. It is not Core, a valid embedding does not need it, and embedding KAAL does not install it/);
  assert.match(meaning, /transport, submission and collection are other problems/);
  for (const part of ["Wanted","Missing"]) assert.match(meaning, new RegExp(`\\b${part}\\b`));
  for (const word of [/github/i, /\bgit\b/i, /\bPRs?\b/, /\bnpm\b/, /\.mjs/, /\bCI\b/, /\bChange\b/, /\bWork\b/, /\.md\b/, /enercon/i, /\bnetwork/i, /\bHTTP/i, /requests\//]) assert.doesNotMatch(meaning, word);
});

test("the Agent Skill is one skill, named as its capability, pointing to the Nodes and not restating them", () => {
  for (const path of Object.keys(skills)) assert.ok(path.startsWith(`${CAPABILITY}/`), path);
  assert.match(manifest, new RegExp(`^---\\nname: ${CAPABILITY}\\n`));
  assert.ok(manifest.includes("`KAAL Request`") && manifest.includes("`Skill`"));
  assert.ok(!manifest.includes(kaal[nodeFile].split("\n").filter((l) => l.startsWith("KAAL Request is the capability"))[0]));
  assert.ok(!manifest.includes(sha256(kaal[nodeFile])), "carries no ID of its own Node");
  assert.doesNotMatch(manifest, /^compatibility:.*kaal-/m, "declares no sibling it needs");
  assert.doesNotMatch(manifest, /\bcommit|version control|\bpush|publish|submit/i, "no instruction about what becomes of a carrier beyond the KAAL directory");
});

test("the shipped script is exactly request.mjs, and knows nothing of Git, GitHub, a network, a process or any client", () => {
  assert.deepEqual(Object.keys(skills).filter((p) => p.includes("/scripts/")), [`${CAPABILITY}/scripts/request.mjs`]);
  for (const path of Object.keys(skills).filter((p) => p.includes("/scripts/"))) {
    assert.doesNotMatch(skills[path], /github|\bgit\b|pull request|enercon|node:(net|http|https|dgram|dns|child_process)|fetch\(|createHash/i, path);
  }
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
  assert.match(r.stdout, /can register kaal-request: [0-9a-f]{64}/);
});
