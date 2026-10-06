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
const ratificationFile = "RATIFICATION.md";
const manifest = skills[`${CAPABILITY}/SKILL.md`];

test("Core carries no Changing KAAL: a capability joins without becoming Core", () => {
  assert.ok(!admit(core()).some((n) => n.name === "Changing KAAL"));
  assert.ok(!Object.keys(core()).some((p) => p.startsWith("skills/")));
});

test("registering through Core admits the Changing KAAL Skill and the RATIFICATION definition, and nothing else changes", (t) => {
  const dir = deployKaal(t);
  const before = admit(read(dir));
  const skill = before.find((n) => n.name === "Skill")!;
  const definition = before.find((n) => n.name === "KAAL Definition")!;
  const sealsBefore = readdirSync(join(dir, "seals"));
  const ids = registerSkill(dir, CAPABILITY, kaal);
  const after = admit(read(dir));
  assert.deepEqual(ids, [sha256(kaal[nodeFile])], "the Skill's identity is the SHA-256 of the shipped bytes");
  assert.equal(after.length, before.length + 2);
  const found = after.filter((n) => n.type?.name === "Skill" && n.type.id === skill.id);
  assert.deepEqual(found.map((n) => n.name), ["Changing KAAL"], "exactly one Skill, found by Node type alone");
  const defined = after.filter((n) => n.type?.name === "KAAL Definition" && n.type.id === definition.id && !before.some((b) => b.id === n.id));
  assert.deepEqual(defined.map((n) => [n.name, n.id]), [["RATIFICATION", sha256(kaal[ratificationFile])]], "admitted as the KAAL Definition it is typed by");
  for (const file of [nodeFile, ratificationFile]) assert.equal(readFileSync(join(dir, "skills", CAPABILITY, file), "utf8"), kaal[file], `${file}: bytes kept exactly`);
  assert.deepEqual(readdirSync(join(dir, "seals")).filter((id) => !sealsBefore.includes(id)).sort(), [sha256(kaal[nodeFile]), sha256(kaal[ratificationFile])].sort(), "exactly one seal per Node is added");
});

test("the Skill's meaning is narrow, each Node is sealed by its own bytes, and Changing KAAL knows nothing of RATIFICATION", () => {
  const nodes = Object.keys(kaal).filter((p) => !p.startsWith("seals/")).sort();
  assert.deepEqual(nodes, [nodeFile, ratificationFile]);
  for (const file of nodes) assert.equal(kaal[`seals/${sha256(kaal[file])}`], "", file);
  assert.equal(Object.keys(kaal).length, nodes.length * 2);
  assert.match(kaal[nodeFile], /managing changes to KAAL through KAAL's change process/);
  assert.ok(!kaal[nodeFile].includes("RATIFICATION") && !kaal[nodeFile].includes(sha256(kaal[ratificationFile])), "no relationship is asserted");
});

test("RATIFICATION is a Node typed by the exact KAAL Definition Node and claims no relationship", (t) => {
  const dir = deployKaal(t);
  const definition = admit(read(dir)).find((n) => n.name === "KAAL Definition")!;
  registerSkill(dir, CAPABILITY, kaal);
  const ratification = admit(read(dir)).find((n) => n.name === "RATIFICATION");
  assert.ok(ratification, "admitted");
  assert.deepEqual(ratification.type, { name: "KAAL Definition", id: definition.id });
  assert.ok(!kaal[ratificationFile].split("---\n").pop()!.includes("Changing KAAL"));
});

test("RATIFICATION is meaning alone: no Git, GitHub or enforcement vocabulary, no mechanism", () => {
  const meaning = kaal[ratificationFile].split("---\n").pop()!;
  for (const word of [/\bgit\b/i, /github/i, /\bbranch/i, /\bcommit/i, /pull request/i, /\bmerge/i, /\bCI\b/, /actions/i, /ruleset/i, /status check/i, /\bhook/i, /\bseal/i, /\bhash/i, /\bnpm\b/, /\.mjs/, /changes\//]) assert.doesNotMatch(meaning, word);
  for (const word of ["Requirements", "Architecture", "Intend", "Formalized", "Implement", "Code", "And", "Test", "Its", "Outcome", "Neat"]) assert.match(meaning, new RegExp(`\\b${word}\\b`), word);
});

test("no Core change is needed: Core carries neither RATIFICATION nor Changing KAAL", () => {
  assert.ok(!admit(core()).some((n) => n.name === "RATIFICATION" || n.name === "Changing KAAL"));
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
  assert.match(manifest, /<kaal-dir>\/changes\/<name>\/YY\/MM\/DD\/CC\//);
  assert.match(manifest, /references\/retro\.md/);
  const retro = skills[`${CAPABILITY}/references/retro.md`];
  assert.match(retro, /^# Reference: retro-work\.md and retro-observe\.md/);
  for (const heading of ["# Retro", "## Learned", "## Liked", "## Lacked", "## Longed"]) assert.ok(retro.includes(`${heading}\n`), heading);
  for (const rule of [/own seat/, /Neither infers what the user thought/, /Do not take one observation and write it four ways/, /not a restatement of something Lacked/]) assert.match(retro, rule);
});

test("the realization pulls the agent through work, seal work, both retros, close, by the repository's own commands", () => {
  assert.ok(manifest.includes("allocate → work → seal work → retro-work → retro-observe → seal Change (closed)"), "the sequence, exactly");
  assert.ok(manifest.includes("scripts/next-change.mjs"), "the allocator stays the existing allocator");
  for (const command of ["state-kaal-change", "seal-kaal-work", "close-kaal-change"]) assert.ok(manifest.includes(command), command);
  assert.ok(manifest.indexOf("seal-kaal-work") < manifest.indexOf("references/retro.md"), "work is sealed before the retro is written");
  assert.match(manifest, /Do not write a retro before the work is sealed, do not write `retro-observe\.md` before `retro-work\.md` exists/);
  assert.ok(manifest.indexOf("`retro-work.md` in the change directory") < manifest.indexOf("## If you are the observer"), "the worker's retro comes before the observer's");
  assert.match(skills[`${CAPABILITY}/references/retro.md`], /only after the change's `work\/` is sealed/);
});

test("the process stops the worker at the handoff and gives the observer its role, input and output", () => {
  assert.match(manifest, /The handoff is a state, and it is the one `state-kaal-change` calls `RETRO-WORK PRESENT`/);
  assert.match(manifest, /\*\*Then the worker stops\.\*\*/);
  assert.match(manifest, /The worker does not write `retro-observe\.md`, does not produce it through a sub-agent or any other part of its own execution, and does not close the change/);
  assert.match(manifest, /must not have participated in the work or in the worker's execution/);
  assert.match(manifest, /How an actor comes to occupy that seat is outside KAAL/);
  const observer = manifest.slice(manifest.indexOf("## If you are the observer"), manifest.indexOf("## Rules"));
  for (const part of [/not the worker, and not an approver/, /\*\*Input:\*\*/, /\*\*Output:\*\*/, /exactly one file, `retro-observe\.md`/, /Change nothing else/, /does not reopen the change/]) assert.match(observer, part);
  assert.match(manifest, /unchanged in substance/);
  assert.match(manifest, /A fresh context is not an independent observer/);
  assert.match(manifest, /KAAL's checks cannot prove/);
  assert.match(manifest, /does not depend on which model or provider/);
});

test("the observer is described as a requirement on the seat, never as selection or orchestration", () => {
  for (const text of [manifest, skills[`${CAPABILITY}/references/retro.md`]]) assert.doesNotMatch(text, /\b(selected|selects|orchestrat\w*|assigned|spawns? the observer)\b/i);
});

test("the process adds no second implementation, no retro seal, no phase state and no new KAAL artifact", () => {
  assert.doesNotMatch(manifest, /seal retro/i);
  assert.doesNotMatch(manifest, /\b(status|phase):/);
  assert.doesNotMatch(manifest, /\b(git|github|branch|commit|pull request|CI)\b/i);
  assert.ok(!Object.keys(skills).some((p) => /seal|state/i.test(p.split("/").pop()!)), "no sealing or state script is shipped");
  assert.deepEqual(Object.keys(kaal).filter((p) => !p.startsWith("seals/")).sort(), [nodeFile, ratificationFile], "no Work Node or other definition");
  assert.ok(!/requirements\.md|architecture\.md|test\.md|intend\.md/.test(manifest), "RATIFICATION is not turned into files");
});

test("the Changing KAAL Node and RATIFICATION are byte-for-byte what they were sealed as", () => {
  assert.equal(sha256(kaal[nodeFile]), "7b2470732033e9ca6e916cf1ff7d73629bd203737aaf1894a9d621b517e896c2");
  assert.equal(sha256(kaal[ratificationFile]), "ff114bfe71e7780df04c290e142c002fe985046d2635b46c78ff3d1e464b9a77");
});

test("the only executable procedure is the allocator, and it carries no sealing of its own", () => {
  const scripts = Object.keys(skills).filter((p) => p.includes("/scripts/"));
  assert.deepEqual(scripts, [`${CAPABILITY}/scripts/next-change.mjs`]);
  assert.ok(manifest.includes("scripts/next-change.mjs"));
  assert.ok(!Object.keys(skills).some((p) => /seal/i.test(p.split("/").pop()!)));
});
