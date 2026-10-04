// The capability's delivery, proven end to end on what is actually shipped:
// it joins an installed KAAL through Core's registration without becoming
// Core, its Node keeps the identity it was sealed with, and the Agent Skill is
// the agent-facing realization, not a second definition of the capability.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { payload as core, registerSkill } from "kaal-core";
import { payload } from "changing-kaal";
import { admit, CAPABILITY, deployKaal, read } from "../helpers/setup.js";

const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");
const { kaal, skills } = payload();
const nodeFile = "Changing-KAAL.md";
const manifest = skills[`${CAPABILITY}/SKILL.md`];

test("Core carries no Changing KAAL: a capability joins without becoming Core", () => {
  assert.ok(!admit(core()).some((n) => n.name === "Changing KAAL"));
  assert.ok(!Object.keys(core()).some((p) => p.startsWith("skills/")));
});

test("registering through Core admits the Changing KAAL Node, typed by the sealed Skill Node, and nothing else changes", (t) => {
  const dir = deployKaal(t);
  const before = admit(read(dir));
  const skill = before.find((n) => n.name === "Skill")!;
  const sealsBefore = readdirSync(join(dir, "seals"));
  const ids = registerSkill(dir, CAPABILITY, kaal);
  const after = admit(read(dir));
  assert.deepEqual(ids, [sha256(kaal[nodeFile])], "the Skill's identity is the SHA-256 of the shipped bytes");
  assert.equal(after.length, before.length + 1);
  const found = after.filter((n) => n.type?.name === "Skill" && n.type.id === skill.id);
  assert.deepEqual(found.map((n) => n.name), ["Changing KAAL"], "found by Node type alone");
  assert.equal(readFileSync(join(dir, "skills", CAPABILITY, nodeFile), "utf8"), kaal[nodeFile], "bytes kept exactly");
  assert.deepEqual(readdirSync(join(dir, "seals")).filter((id) => !sealsBefore.includes(id)), ids, "exactly one seal is added");
});

test("the capability is one Skill Node whose meaning is narrow, and the shipped seal is its own", () => {
  const nodes = Object.keys(kaal).filter((p) => !p.startsWith("seals/"));
  assert.deepEqual(nodes, [nodeFile]);
  assert.equal(kaal[`seals/${sha256(kaal[nodeFile])}`], "");
  assert.match(kaal[nodeFile], /managing changes to KAAL through KAAL's change process/);
});

test("the Node defines no GitHub, PR, directory format, retrospective, command or implementation", () => {
  const meaning = kaal[nodeFile].split("---\n").pop()!;
  for (const word of [/github/i, /\bPRs?\b/, /pull request/, /changes\//, /retro/i, /\bnpm\b/, /\.mjs/, /\bCC\b/, /YY/]) assert.doesNotMatch(meaning, word);
});

test("the Agent Skill is one skill directory, named as its capability", () => {
  for (const path of Object.keys(skills)) assert.ok(path.startsWith(`${CAPABILITY}/`), path);
  assert.match(manifest, new RegExp(`^---\\nname: ${CAPABILITY}\\n`));
});

test("SKILL.md realizes the capability without defining it again: it points to the Nodes", () => {
  const meaning = kaal[nodeFile].split("\n").filter((l) => l.startsWith("Changing KAAL is"))[0];
  assert.ok(!manifest.includes(meaning), "does not restate the Node's definition");
  assert.ok(manifest.includes("`Changing KAAL`") && manifest.includes("`Skill`"), "names the Nodes it defers to");
  assert.ok(!manifest.includes(sha256(kaal[nodeFile])), "carries no ID of its own Node");
});

test("the change record convention is stated once, with the retro form in its reference", () => {
  assert.match(manifest, /changes\/<name>\/YY\/MM\/DD\/CC\//);
  assert.match(manifest, /references\/RETRO\.md/);
  const retro = skills[`${CAPABILITY}/references/RETRO.md`];
  assert.match(retro, /^# Reference: RETRO\.md/);
  for (const heading of ["# Retro", "## Learned", "## Liked", "## Lacked", "## Longed"]) assert.ok(retro.includes(`${heading}\n`), heading);
  for (const rule of [/own seat/, /does not infer what the user thought/, /Do not take one observation and write it four ways/, /not a restatement of something Lacked/]) assert.match(retro, rule);
});

test("the only executable procedure is the allocator, and it carries no sealing of its own", () => {
  const scripts = Object.keys(skills).filter((p) => p.includes("/scripts/"));
  assert.deepEqual(scripts, [`${CAPABILITY}/scripts/next-change.mjs`]);
  assert.ok(manifest.includes("scripts/next-change.mjs"));
  assert.ok(!Object.keys(skills).some((p) => /seal/i.test(p.split("/").pop()!)));
});
