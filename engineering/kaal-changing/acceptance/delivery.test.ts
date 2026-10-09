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
const workFile = "WORK.md";
const manifest = skills[`${CAPABILITY}/SKILL.md`];

test("Core carries no Changing KAAL: a capability joins without becoming Core", () => {
  assert.ok(!admit(core()).some((n) => n.name === "Changing KAAL"));
  assert.ok(!Object.keys(core()).some((p) => p.startsWith("skills/")));
});

test("registering through Core admits the Changing KAAL Skill and the RATIFICATION, ROWING and WORK definitions, and nothing else changes", (t) => {
  const dir = deployKaal(t);
  const before = admit(read(dir));
  const skill = before.find((n) => n.name === "Skill")!;
  const definition = before.find((n) => n.name === "KAAL Definition")!;
  const sealsBefore = readdirSync(join(dir, "seals"));
  const ids = registerSkill(dir, CAPABILITY, kaal);
  const after = admit(read(dir));
  assert.deepEqual(ids, [sha256(kaal[nodeFile])], "the Skill's identity is the SHA-256 of the shipped bytes");
  assert.equal(after.length, before.length + 4);
  const found = after.filter((n) => n.type?.name === "Skill" && n.type.id === skill.id);
  assert.deepEqual(found.map((n) => n.name), ["Changing KAAL"], "exactly one Skill, found by Node type alone");
  const defined = after.filter((n) => n.type?.name === "KAAL Definition" && n.type.id === definition.id && !before.some((b) => b.id === n.id));
  assert.deepEqual(defined.map((n) => [n.name, n.id]).sort(), [["RATIFICATION", sha256(kaal[ratificationFile])], ["ROWING", sha256(kaal[rowingFile])], ["WORK", sha256(kaal[workFile])]].sort(), "admitted as the KAAL Definitions they are typed by");
  for (const file of [nodeFile, ratificationFile, rowingFile, workFile]) assert.equal(readFileSync(join(dir, "skills", CAPABILITY, file), "utf8"), kaal[file], `${file}: bytes kept exactly`);
  assert.deepEqual(readdirSync(join(dir, "seals")).filter((id) => !sealsBefore.includes(id)).sort(), [sha256(kaal[nodeFile]), sha256(kaal[ratificationFile]), sha256(kaal[rowingFile]), sha256(kaal[workFile])].sort(), "exactly one seal per Node is added");
});

test("the Skill's meaning is narrow, each Node is sealed by its own bytes, and Changing KAAL knows nothing of RATIFICATION, ROWING or WORK", () => {
  const nodes = Object.keys(kaal).filter((p) => !p.startsWith("seals/")).sort();
  assert.deepEqual(nodes, [nodeFile, ratificationFile, rowingFile, workFile].sort());
  for (const file of nodes) assert.equal(kaal[`seals/${sha256(kaal[file])}`], "", file);
  assert.equal(Object.keys(kaal).length, nodes.length * 2);
  assert.match(kaal[nodeFile], /managing changes to KAAL through KAAL's change process/);
  for (const other of [ratificationFile, rowingFile, workFile]) assert.ok(!kaal[nodeFile].includes(other.replace(".md", "")) && !kaal[nodeFile].includes(sha256(kaal[other])), `no relationship to ${other} is asserted`);
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
  assert.match(retro, /^# Reference: retro-work\.md, retro-owner\.md and retro-review\.md/);
  for (const heading of ["# Retro", "## Learned", "## Liked", "## Lacked", "## Longed"]) assert.ok(retro.includes(`${heading}\n`), heading);
  for (const rule of [/own seat/, /Neither infers what the user thought/, /Do not take one observation and write it four ways/, /not a restatement of something Lacked/, /A retrospective is not the review, and the Owner's retrospective is not the Owner's judgment/, /never a verdict/]) assert.match(retro, rule);
});

test("the realization pulls the agent through work, review, seal work, both retros, close, by the repository's own commands", () => {
  assert.ok(manifest.includes("allocate → work ⇄ review (ROWING) → seal work → retro-work, retro-owner, retro-review (WORK) → seal Change (closed)"), "the sequence, exactly");
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
  for (const rule of [/not a number of actors, models or contexts/, /nothing here forbids one actor from holding several roles/, /Deterministic checks are evidence for the review, never the review/, /Do not edit the Work/, /A review that approves can still have a critical retro, and a retro never approves/, /does not show that the realization outside `work\/` is what the Work describes/, /Work: <identity of work\/ as reviewed>/, /Result: findings \| converged/]) assert.match(rowing, rule);
  assert.ok(manifest.includes("one actor may hold several roles") || /One actor may hold several roles/.test(manifest));
});

test("the process has three perspectives, two that row and one that steers, and ROWING is not that topology", () => {
  const rowing = skills[`${CAPABILITY}/references/rowing.md`];
  const retro = skills[`${CAPABILITY}/references/retro.md`];
  for (const rule of [/ROWING is the discipline between realized Work and its review, and it stays that if the process around it gains other roles/, /not what ROWING means/, /WORKER ⇄ REVIEWER/, /Judgment and retrospective are two acts, and the retrospective is not approval/, /Host admission mechanics are outside KAAL/]) assert.match(rowing, rule);
  for (const file of ["retro-work.md", "retro-review.md", "retro-owner.md"]) assert.ok(manifest.includes(file) && retro.includes(file), file);
  assert.ok(!manifest.replace(/`retro-observe\.md` is the historical name[^.]*\./, "").includes("retro-observe") || /historical/.test(manifest), "retro-observe.md appears only as history");
  assert.match(retro, /no Observer role exists/);
  assert.match(manifest, /How a host then authorizes or admits the closed change is outside KAAL/);
  assert.match(manifest, /the judgment is no artifact, and the retro carries no approval/);
  const meaning = kaal[rowingFile].split("---\n").pop()!;
  for (const word of [/\bOwner\b/, /\bWorker\b/, /retro-/, /helm|steer/i]) assert.doesNotMatch(meaning, word, "the Node does not define the topology");
});

test("the Intent is the fixed target: review does not renegotiate it, and what the Owner does with an undeliverable one is outside the change", () => {
  const rowing = skills[`${CAPABILITY}/references/rowing.md`];
  for (const rule of [/The Intent is the fixed target and is not renegotiated in review/, /cannot converge as a successful realization, and it is not resolved by editing the Intent in the same change/, /including establishing a different Intent in another change, is outside the change/]) assert.match(rowing, rule);
  assert.match(manifest, /The Intent is the fixed target of a change: neither the Worker, the Reviewer nor the Owner inside the loop revises it/);
  for (const text of [rowing, manifest]) assert.doesNotMatch(text, /Owner either revises the Intent|revises the Intent in `work\/`/, "no path revises the Intent inside the change");
});

test("the Reviewer seat is assigned under the Owner's authority, never inferred from capability, and an empty seat stops the process", () => {
  const rowing = skills[`${CAPABILITY}/references/rowing.md`];
  for (const rule of [/Process determines the turn\. Authority assigns the seat\. Provider capability executes the work\./, /never inferred from what a provider, tool, session or account can do/, /Delegation reaches only as far as it was explicitly granted/, /does not hold the Worker and the Reviewer seats of the same change merely because it can do both jobs/, /orchestration does not erase the separation of judgment/, /without an assignment to the Reviewer seat is part of the Worker, and its output is Work evidence, never a round/, /writes rounds under that grant, even when the Worker prompts or resumes it/, /The process stops and names the missing seat\. It does not substitute another actor/, /under whose authority the Reviewer occupies the seat/, /does not write `converged`/, /one realization of this and no part of what KAAL requires/]) assert.match(rowing, rule);
  for (const rule of [/Process determines the turn\. Authority assigns the seat\. Provider capability executes the work\./, /the process stops here: the Worker says that the Reviewer seat is empty/, /never inferred from what a provider, tool, session or account can do/, /never by the Worker/]) assert.match(manifest, rule);
  for (const text of [rowing, manifest]) {
    assert.doesNotMatch(text, /with weaker independence|separation is only weaker|Do not switch actors merely to look independent|Worker and Reviewer in separate contexts|whether or not the Reviewer is the same actor|unless the Owner's authority assigned it/);
    assert.doesNotMatch(text, /subscription|vendor/i, "no operating setup is a definition");
  }
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
  assert.ok(!Object.keys(skills).some((p) => /seal/i.test(p.split("/").pop()!)), "no sealing script is shipped");
  assert.deepEqual(Object.keys(skills).filter((p) => /state/i.test(p.split("/").pop()!)), [`${CAPABILITY}/scripts/change-state.mjs`], "the one state script is the compass, which keeps no state: it derives it");
  assert.deepEqual(Object.keys(kaal).filter((p) => !p.startsWith("seals/")).sort(), [nodeFile, ratificationFile, rowingFile, workFile].sort(), "no Work, Role or other Node: only the Skill and three definitions");
  assert.ok(!/requirements\.md|architecture\.md|test\.md|intend\.md/.test(manifest), "RATIFICATION is not turned into files");
});

test("the Changing KAAL Node and RATIFICATION are byte-for-byte what they were sealed as", () => {
  assert.equal(sha256(kaal[nodeFile]), "7b2470732033e9ca6e916cf1ff7d73629bd203737aaf1894a9d621b517e896c2");
  assert.equal(sha256(kaal[ratificationFile]), "ff114bfe71e7780df04c290e142c002fe985046d2635b46c78ff3d1e464b9a77");
});

test("the executable procedures are the allocator and the process compass, and neither carries sealing of its own", () => {
  const scripts = Object.keys(skills).filter((p) => p.includes("/scripts/"));
  assert.deepEqual(scripts, [`${CAPABILITY}/scripts/change-state.mjs`, `${CAPABILITY}/scripts/next-change.mjs`]);
  assert.ok(manifest.includes("scripts/next-change.mjs"));
  assert.ok(manifest.includes("scripts/change-state.mjs"));
  assert.ok(!Object.keys(skills).some((p) => /seal/i.test(p.split("/").pop()!)));
});

test("WORK orders the retrospectives after the Work seal, Worker then Owner then Reviewer, apart from ROWING and with no approval inside KAAL", () => {
  const rowing = skills[`${CAPABILITY}/references/rowing.md`];
  const retro = skills[`${CAPABILITY}/references/retro.md`];
  assert.match(rowing, /Intent → work ⇄ ROWING → seal work → WORK → seal Change → host and admission mechanics outside KAAL/);
  assert.match(rowing, /\*\*WORK\*\* governs what comes after it: the ordered retrospectives, Worker, Owner, Reviewer, then Knowledge/);
  assert.match(retro, /That ordered discipline is \*\*WORK\*\*: Worker, Owner, Reviewer, Knowledge/);
  for (const rule of [/`retro-work\.md`, first/, /judgment is a process act and is no artifact/, /`retro-owner\.md`, second/, /`retro-review\.md`, third/, /A later retro may, and is expected to, read the earlier ones/, /carries no approval or verdict/]) assert.match(retro, rule);
  assert.match(manifest, /retro-work, retro-owner, retro-review \(WORK\)/);
  assert.doesNotMatch(retro + rowing + manifest, /in any order|no retro read before writing one's own|none be read before/, "no retro is asked to avoid the earlier ones, and none is in any order");
  assert.ok(manifest.indexOf("Retro, from the Work's seat") < manifest.indexOf("Retro, from the Owner's seat") && manifest.indexOf("Retro, from the Owner's seat") < manifest.indexOf("Retro, from the review's seat"), "the steps follow WORK");
});

test("WORK is a KAAL Definition: the mnemonic and its ordered, non-approving knowledge, with no host, file, stage or procedure", (t) => {
  const dir = deployKaal(t);
  registerSkill(dir, CAPABILITY, kaal);
  const definition = admit(read(dir)).find((n) => n.name === "KAAL Definition")!;
  const work = admit(read(dir)).find((n) => n.name === "WORK")!;
  assert.equal(work.type?.id, definition.id, "typed by the exact KAAL Definition Node");
  const meaning = kaal[workFile].split("---\n").pop()!;
  for (const word of ["Worker", "Owner", "Reviewer", "Knowledge"]) assert.ok(meaning.includes(word), word);
  assert.ok(!/GitHub|account|\bCI\b|pull request|retro-|\.md|WORK SEALED|RETROS PRESENT|ROWING|Changing KAAL/.test(meaning), "no host, filename, evaluator stage or relationship");
});
