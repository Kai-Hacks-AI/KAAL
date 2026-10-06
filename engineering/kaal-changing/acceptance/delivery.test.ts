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
import { payload } from "kaal-changing";
import { admit, CAPABILITY, deployKaal, read } from "../helpers/setup.js";

const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");
const { kaal, skills } = payload();
const nodeFile = "Changing-KAAL.md";
const ratificationFile = "RATIFICATION.md";
const rowingFile = "ROWING.md";
const manifest = skills[`${CAPABILITY}/SKILL.md`];

test("Core carries no Changing KAAL: a capability joins without becoming Core", () => {
  assert.ok(!admit(core()).some((n) => n.name === "Changing KAAL"));
  assert.ok(!Object.keys(core()).some((p) => p.startsWith("skills/")));
});

test("registering through Core admits the Changing KAAL Skill and the RATIFICATION and ROWING definitions, and nothing else changes", (t) => {
  const dir = deployKaal(t);
  const before = admit(read(dir));
  const skill = before.find((n) => n.name === "Skill")!;
  const definition = before.find((n) => n.name === "KAAL Definition")!;
  const sealsBefore = readdirSync(join(dir, "seals"));
  const ids = registerSkill(dir, CAPABILITY, kaal);
  const after = admit(read(dir));
  assert.deepEqual(ids, [sha256(kaal[nodeFile])], "the Skill's identity is the SHA-256 of the shipped bytes");
  assert.equal(after.length, before.length + 3);
  const found = after.filter((n) => n.type?.name === "Skill" && n.type.id === skill.id);
  assert.deepEqual(found.map((n) => n.name), ["Changing KAAL"], "exactly one Skill, found by Node type alone");
  const defined = after.filter((n) => n.type?.name === "KAAL Definition" && n.type.id === definition.id && !before.some((b) => b.id === n.id));
  assert.deepEqual(defined.map((n) => [n.name, n.id]).sort(), [["RATIFICATION", sha256(kaal[ratificationFile])], ["ROWING", sha256(kaal[rowingFile])]].sort(), "admitted as the KAAL Definitions they are typed by");
  for (const file of [nodeFile, ratificationFile, rowingFile]) assert.equal(readFileSync(join(dir, "skills", CAPABILITY, file), "utf8"), kaal[file], `${file}: bytes kept exactly`);
  assert.deepEqual(readdirSync(join(dir, "seals")).filter((id) => !sealsBefore.includes(id)).sort(), [sha256(kaal[nodeFile]), sha256(kaal[ratificationFile]), sha256(kaal[rowingFile])].sort(), "exactly one seal per Node is added");
});

test("the Skill's meaning is narrow, each Node is sealed by its own bytes, and Changing KAAL knows nothing of RATIFICATION or ROWING", () => {
  const nodes = Object.keys(kaal).filter((p) => !p.startsWith("seals/")).sort();
  assert.deepEqual(nodes, [nodeFile, ratificationFile, rowingFile].sort());
  for (const file of nodes) assert.equal(kaal[`seals/${sha256(kaal[file])}`], "", file);
  assert.equal(Object.keys(kaal).length, nodes.length * 2);
  assert.match(kaal[nodeFile], /managing changes to KAAL through KAAL's change process/);
  for (const other of [ratificationFile, rowingFile]) assert.ok(!kaal[nodeFile].includes(other.replace(".md", "")) && !kaal[nodeFile].includes(sha256(kaal[other])), `no relationship to ${other} is asserted`);
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

test("ROWING is a Node typed by the exact KAAL Definition Node and claims no relationship", (t) => {
  const dir = deployKaal(t);
  const definition = admit(read(dir)).find((n) => n.name === "KAAL Definition")!;
  registerSkill(dir, CAPABILITY, kaal);
  const rowing = admit(read(dir)).find((n) => n.name === "ROWING");
  assert.ok(rowing, "admitted");
  assert.deepEqual(rowing.type, { name: "KAAL Definition", id: definition.id });
  const meaning = kaal[rowingFile].split("---\n").pop()!;
  assert.ok(!meaning.includes("Changing KAAL") && !meaning.includes("RATIFICATION"));
});

test("ROWING is meaning alone: the mnemonic and what it restricts, with no host, role, file, seal or procedure", () => {
  const meaning = kaal[rowingFile].split("---\n").pop()!;
  for (const word of [/\bgit\b/i, /github/i, /\bbranch/i, /\bcommit/i, /pull request/i, /\bmerge/i, /\bCI\b/, /actions/i, /ruleset/i, /status check/i, /\bhook/i, /\bseal/i, /\bhash/i, /\bnpm\b/, /\.mjs/, /changes\//, /\bretro/i, /\bowner\b/i, /\bworker\b/i, /\bReviewer\b/, /\bround/i, /review\//, /chatgpt|claude/i]) assert.doesNotMatch(meaning, word);
  assert.ok(meaning.includes("```\nR  Review\nO  Observed\nW  Work\nI  Intelligent\nN  Not\nG  Generalized\n```"), "the mnemonic, as it is spelled");
  for (const phrase of [/deterministic checks are evidence/, /never a replacement/, /Intent, Requirements and Architecture/, /does not redesign the system, widen the Change/, /not part of this one/]) assert.match(meaning, phrase);
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
  assert.match(retro, /^# Reference: retro-work\.md and retro-review\.md/);
  for (const heading of ["# Retro", "## Learned", "## Liked", "## Lacked", "## Longed"]) assert.ok(retro.includes(`${heading}\n`), heading);
  for (const rule of [/own seat/, /Neither infers what the user thought/, /Do not take one observation and write it four ways/, /not a restatement of something Lacked/, /A retrospective is not the review/, /never a verdict/]) assert.match(retro, rule);
});

test("the realization pulls the agent through work, review, seal work, both retros, close, by the repository's own commands", () => {
  assert.ok(manifest.includes("allocate → work ⇄ review → seal work → retro-work and retro-review → seal Change (closed)"), "the sequence, exactly");
  assert.ok(manifest.includes("scripts/next-change.mjs"), "the allocator stays the existing allocator");
  for (const command of ["state-kaal-change", "seal-kaal-work", "close-kaal-change"]) assert.ok(manifest.includes(command), command);
  assert.ok(manifest.indexOf("`review/NN.md`") < manifest.indexOf("seal-kaal-work"), "review comes before the work is sealed");
  assert.ok(manifest.indexOf("seal-kaal-work") < manifest.indexOf("references/retro.md"), "work is sealed before the retro is written");
  assert.match(manifest, /Do not seal work before a review round has converged on it, do not write a retro before the work is sealed/);
  assert.match(skills[`${CAPABILITY}/references/retro.md`], /only after the change's `work\/` is sealed, which is after review has converged/);
  assert.match(manifest, /references\/rowing\.md/);
});

test("ROWING, the roles and the review rounds are stated once, in their reference, as roles and not as actors", () => {
  const rowing = skills[`${CAPABILITY}/references/rowing.md`];
  for (const heading of ["## The roles", "## What ROWING asks of a round", "## A round", "## Iterating", "## Separation: required, recommended, and unprovable"]) assert.ok(rowing.includes(`${heading}\n`), heading);
  for (const role of ["**Owner.**", "**Worker.**", "**Reviewer.**"]) assert.ok(rowing.includes(role), role);
  for (const rule of [/not a number of actors, models or contexts/, /one actor may hold several/, /Deterministic checks are evidence for the review, never the review/, /Do not edit the Work/, /A review that approves can still have a critical retro, and a retro never approves/, /does not show that the realization outside `work\/` is what the Work describes/, /Work: <identity of work\/ as reviewed>/, /Result: findings \| converged/]) assert.match(rowing, rule);
  assert.ok(manifest.includes("one actor may hold several roles") || /One actor may hold several roles/.test(manifest));
});

test("the Agent Skill, its references and its Nodes speak of no host, provider or person, and mandate no number of agents", () => {
  for (const [path, text] of [...Object.entries(skills), ...Object.entries(kaal)].filter(([p]) => /\.md$/.test(p))) {
    for (const word of [/\bgit\b/i, /github/i, /\bbranch/i, /\bcommit/i, /pull request/i, /\bmerge[ds]?\b/i, /\bCI\b/, /ruleset/i, /chatgpt/i, /\bclaude\b/i, /\bkai\b/i, /anthropic|openai/i, /three agents|two agents/i]) assert.doesNotMatch(text, word, `${path}: ${word}`);
  }
});

test("the process adds no second implementation, no retro seal, no phase state and no new KAAL artifact", () => {
  assert.doesNotMatch(manifest, /seal retro/i);
  assert.doesNotMatch(manifest, /\b(status|phase):/);
  assert.doesNotMatch(manifest, /\b(git|github|branch|commit|pull request|CI)\b/i);
  assert.ok(!Object.keys(skills).some((p) => /seal|state/i.test(p.split("/").pop()!)), "no sealing or state script is shipped");
  assert.deepEqual(Object.keys(kaal).filter((p) => !p.startsWith("seals/")).sort(), [nodeFile, ratificationFile, rowingFile].sort(), "no Work, Role or other Node: only the Skill and two definitions");
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
