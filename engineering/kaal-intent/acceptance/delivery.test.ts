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
import { payload } from "kaal-intent";
import { admit, CAPABILITY, PACKAGE, REPO, deployKaal, read } from "../helpers/setup.js";

const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");
const { kaal, skills } = payload();
const nodeFile = "Intent.md";
const manifest = skills[`${CAPABILITY}/SKILL.md`];
const meaning = kaal[nodeFile].split("---\n").pop()!;

test("Core carries no Intent: a capability joins without becoming Core", () => {
  assert.ok(!admit(core()).some((n) => n.name === "Intent"));
  assert.ok(!Object.keys(core()).some((p) => p.startsWith("skills/")));
});

test("registering through Core admits the Intent Skill, typed by the sealed Skill Node, and nothing else changes", (t) => {
  const dir = deployKaal(t);
  const before = admit(read(dir));
  const skill = before.find((n) => n.name === "Skill")!;
  const sealsBefore = readdirSync(join(dir, "seals"));
  const ids = registerSkill(dir, CAPABILITY, kaal);
  const after = admit(read(dir));
  assert.deepEqual(ids, [sha256(kaal[nodeFile])], "the Skill's identity is the SHA-256 of the shipped bytes");
  assert.equal(after.length, before.length + 1);
  assert.deepEqual(after.filter((n) => n.type?.name === "Skill" && n.type.id === skill.id).map((n) => n.name), ["Intent"], "found by its type alone");
  assert.equal(readFileSync(join(dir, "skills", CAPABILITY, nodeFile), "utf8"), kaal[nodeFile], "bytes kept exactly");
  assert.deepEqual(readdirSync(join(dir, "seals")).filter((id) => !sealsBefore.includes(id)), ids, "exactly one seal is added");
});

test("the capability is one Skill Node, sealed by its own bytes", () => {
  assert.deepEqual(Object.keys(kaal).filter((p) => !p.startsWith("seals/")), [nodeFile]);
  assert.equal(kaal[`seals/${sha256(kaal[nodeFile])}`], "");
  assert.equal(Object.keys(kaal).length, 2);
  assert.equal(sha256(kaal[nodeFile]), "7317b19e2a09ee18bbac37c3ed5ccb4e20e108bf2aa569faae5d7348b0ed22cf");
});

test("the Node says what Intent is and is not: what is wanted and why, for the Owner, fixed once established, owning no process", () => {
  assert.match(meaning, /capability of stating what is wanted and why, and of establishing that statement as a target/);
  assert.match(meaning, /primarily serves the Owner/);
  assert.match(meaning, /which outcomes they want, why they want them, and within what boundaries/);
  assert.match(meaning, /does not define Requirements, Architecture or implementation/);
  assert.match(meaning, /that it is what the Owner wants is the Owner's to say, and nothing records that it was said/);
  assert.match(meaning, /identified exactly, by the identity of its bytes/);
  assert.match(meaning, /another Intent with another identity, never the established one revised/);
  assert.match(meaning, /is not edited to fit: what is done with it is the Owner's/);
  assert.match(meaning, /prescribes no template/);
  assert.match(meaning, /not a requirement, not an architecture, not a plan and not a role/);
  assert.match(meaning, /bound to no process/);
  assert.match(meaning, /Intent is optional: it is not Core/);
});

test("the Node defines no mechanism and names no process, host or neighbouring capability", () => {
  for (const word of [/github/i, /\bgit\b/i, /\bPRs?\b/, /\bnpm\b/, /\.mjs/, /\bCI\b/, /\bChange\b/, /\bWork\b/, /\bROWING\b/, /\bWORK\b/, /\bWorker\b/, /\bReviewer\b/, /\bObserver\b/, /\.md\b/, /\bseal/i, /\bReview\b/, /\bRetro\b/, /enercon/i]) assert.doesNotMatch(meaning, word);
});

test("the Agent Skill is one skill, named as its capability, pointing to the Nodes and not restating them", () => {
  for (const path of Object.keys(skills)) assert.ok(path.startsWith(`${CAPABILITY}/`), path);
  assert.match(manifest, new RegExp(`^---\\nname: ${CAPABILITY}\\n`));
  assert.ok(manifest.includes("`Intent`") && manifest.includes("`Skill`"));
  assert.ok(!manifest.includes(meaning.split("\n").filter((l) => l.startsWith("Review is the capability"))[0]));
  assert.ok(!manifest.includes(sha256(kaal[nodeFile])), "carries no ID of its own Node");
  assert.doesNotMatch(manifest.split("---")[1]!, /kaal-(sealing|changing|retro|review)/, "declares no sibling");
  assert.doesNotMatch(manifest, /ROWING|\bWorker\b|\bChange\b/, "names no process");
});

test("the shipped script is exactly intent.mjs, and knows nothing of Git, GitHub, a Change or any process", () => {
  assert.deepEqual(Object.keys(skills).filter((p) => p.includes("/scripts/")), [`${CAPABILITY}/scripts/intent.mjs`]);
  const source = skills[`${CAPABILITY}/scripts/intent.mjs`];
  assert.doesNotMatch(source, /github|\bgit\b|pull request|\bchanges?\b|\bwork\/|rowing|retro|review|\bseals?\b/i);
  assert.doesNotMatch(source, /child_process|fetch\(|https?:/, "it neither runs anything nor reaches a network");
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
  assert.match(r.stdout, /can register kaal-intent: [0-9a-f]{64}/);
});
