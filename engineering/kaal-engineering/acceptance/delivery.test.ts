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
import { payload } from "kaal-engineering";
import { admit, CAPABILITY, deployKaal, read } from "../helpers/setup.js";

const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");
const { kaal, skills } = payload();
const nodeFile = "Engineering-Skill.md";

test("Core carries no Engineering Skill: a capability joins without becoming Core", () => {
  assert.ok(!admit(core()).some((n) => n.name === "Engineering Skill"));
  assert.ok(!Object.keys(core()).some((p) => p.startsWith("skills/")));
});

test("registering through Core admits the Engineering Skill Node, typed by the sealed Skill Node, and nothing else changes", (t) => {
  const dir = deployKaal(t);
  const before = admit(read(dir));
  const skill = before.find((n) => n.name === "Skill")!;
  const sealsBefore = readdirSync(join(dir, "seals"));
  const ids = registerSkill(dir, CAPABILITY, kaal);
  const after = admit(read(dir));
  assert.deepEqual(ids, [sha256(kaal[nodeFile])], "the Skill's identity is the SHA-256 of the shipped bytes");
  assert.equal(after.length, before.length + 1);
  const found = after.filter((n) => n.type?.name === "Skill" && n.type.id === skill.id);
  assert.deepEqual(found.map((n) => n.name), ["Engineering Skill"], "found by Node type alone");
  assert.equal(readFileSync(join(dir, "skills", CAPABILITY, nodeFile), "utf8"), kaal[nodeFile], "bytes kept exactly");
  assert.deepEqual(readdirSync(join(dir, "seals")).filter((id) => !sealsBefore.includes(id)), ids, "exactly one seal is added");
});

test("the capability is one Skill Node whose meaning is narrow, and the shipped seal is its own", () => {
  const nodes = Object.keys(kaal).filter((p) => !p.startsWith("seals/"));
  assert.deepEqual(nodes, [nodeFile]);
  assert.ok(`seals/${sha256(kaal[nodeFile])}` in kaal && kaal[`seals/${sha256(kaal[nodeFile])}`] === "");
  assert.match(kaal[nodeFile], /the capability for engineering KAAL Skills/);
  assert.match(kaal[nodeFile], /not software engineering in general/);
});

test("the Agent Skill is one skill directory, named as its capability", () => {
  for (const path of Object.keys(skills)) assert.ok(path.startsWith(`${CAPABILITY}/`), path);
  assert.match(skills[`${CAPABILITY}/SKILL.md`], new RegExp(`^---\\nname: ${CAPABILITY}\\n`));
});

test("SKILL.md realizes the capability without defining it again: it points to the Nodes", () => {
  const manifest = skills[`${CAPABILITY}/SKILL.md`];
  const meaning = kaal[nodeFile].split("\n").filter((l) => l.startsWith("Engineering Skill is"))[0];
  assert.ok(!manifest.includes(meaning), "does not restate the Node's definition");
  assert.ok(manifest.includes("`Engineering Skill`") && manifest.includes("`Skill`"), "names the Nodes it defers to");
  for (const id of [sha256(kaal[nodeFile])]) assert.ok(!manifest.includes(id), "carries no ID of its own Node");
});

test("the scripts it carries are the only executable procedure, and it carries no sealing of its own", () => {
  const scripts = Object.keys(skills).filter((p) => p.includes("/scripts/")).sort();
  assert.deepEqual(scripts, ["check-skill.mjs", "register-skill.mjs"].map((s) => `${CAPABILITY}/scripts/${s}`));
  assert.ok(!Object.keys(skills).some((p) => /seal/i.test(p.split("/").pop()!)), "sealing is the repository's helper, not reimplemented here");
  for (const name of ["check-skill", "register-skill"]) assert.ok(skills[`${CAPABILITY}/SKILL.md`].includes(`scripts/${name}.mjs`), name);
});
