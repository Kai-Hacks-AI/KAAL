// The Process's delivery, proven on what is actually shipped: it joins an
// installed KAAL through Core's registration without becoming Core, its Node
// keeps the identity it was sealed with, it composes Intent and Review by the
// identities they were sealed with and redefines neither, and the Agent Skill
// realizes it without defining it again.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { payload as core, registerSkill } from "kaal-core";
import { payload as intent } from "kaal-intent";
import { payload } from "kaal-process-agree";
import { payload as review } from "kaal-review";
import { admit, CAPABILITY, PACKAGE, REPO, deployKaal, read } from "../helpers/setup.js";

const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");
const { kaal, skills } = payload();
const nodeFile = "Agreement.md";
const manifest = skills[`${CAPABILITY}/SKILL.md`];
const meaning = kaal[nodeFile].split("---\n").pop()!;
const INTENT = sha256(intent().kaal["Intent.md"]);
const REVIEW = sha256(review().kaal["Review.md"]);

test("Core carries no Agreement: a Process joins without becoming Core", () => {
  assert.ok(!admit(core()).some((n) => n.name === "Agreement"));
  assert.ok(!Object.keys(core()).some((p) => p.startsWith("skills/")));
});

test("registering through Core admits the Agreement Skill, typed by the sealed Skill Node, and nothing else changes", (t) => {
  const dir = deployKaal(t);
  const before = admit(read(dir));
  const skill = before.find((n) => n.name === "Skill")!;
  const sealsBefore = readdirSync(join(dir, "seals"));
  const ids = registerSkill(dir, CAPABILITY, kaal);
  const after = admit(read(dir));
  assert.deepEqual(ids, [sha256(kaal[nodeFile])], "the Skill's identity is the SHA-256 of the shipped bytes");
  assert.equal(after.length, before.length + 1);
  assert.deepEqual(after.filter((n) => n.type?.name === "Skill" && n.type.id === skill.id).map((n) => n.name), ["Agreement"], "a Process is found by the same type as every Skill");
  assert.equal(readFileSync(join(dir, "skills", CAPABILITY, nodeFile), "utf8"), kaal[nodeFile], "bytes kept exactly");
  assert.deepEqual(readdirSync(join(dir, "seals")).filter((id) => !sealsBefore.includes(id)), ids, "exactly one seal is added");
});

test("the Process is one Skill Node, sealed by its own bytes", () => {
  assert.deepEqual(Object.keys(kaal).filter((p) => !p.startsWith("seals/")), [nodeFile]);
  assert.equal(kaal[`seals/${sha256(kaal[nodeFile])}`], "");
  assert.equal(Object.keys(kaal).length, 2);
  assert.equal(sha256(kaal[nodeFile]), "29c44ad3baf72b9f8c66ad8447dee7b47a30bc864346dcdf5418d23624e76fb5");
});

test("it leads with what it composes, pinned by the identities Intent and Review were sealed with, and says what it owns and what it does not", () => {
  assert.match(meaning, new RegExp(`^\\s*# Agreement\\n\\nComposes: Intent ${INTENT} and Review ${REVIEW}\\. Boundary:`));
  assert.match(meaning, /Agreement is the Process by which a Worker comes to agreement with an independent Reviewer/);
  assert.match(meaning, /It redefines neither, neither names it/);
  assert.match(meaning, /What it may do next is not its own to decide/);
  assert.match(meaning, /Agreement is recognized in that record and never declared/);
  assert.match(meaning, /the Process requires HOW, Human Observes Work/);
  assert.match(meaning, /the rounds granted are spent/);
  assert.match(meaning, /It does not grant authority, assign or choose a Reviewer, establish the result/);
  assert.match(meaning, /It cannot show that a report is truly the Reviewer's or that a direction is truly a human's/);
  assert.match(meaning, /Agreement is optional: it is not Core/);
});

test("the Node defines no mechanism and names no host", () => {
  for (const word of [/github/i, /codex/i, /\bgit\b/i, /\bPRs?\b/, /\bnpm\b/, /\.mjs/, /\bCI\b/, /\.md\b/, /\bseal/i, /enercon/i, /\bChange\b/]) assert.doesNotMatch(meaning, word);
});

test("composing changes nothing in what is composed: Intent and Review carry no Agreement and keep their sealed identities", () => {
  assert.equal(INTENT, "7317b19e2a09ee18bbac37c3ed5ccb4e20e108bf2aa569faae5d7348b0ed22cf");
  assert.equal(REVIEW, "7c3d4d8e6f56f9d3a6bf6e49d1ed912ec1808ac44e61541196160ddf9ab46d5f");
  for (const files of [intent(), review()]) for (const content of [...Object.values(files.kaal), ...Object.values(files.skills)]) assert.doesNotMatch(content, /agreement|agree\.mjs|kaal-process/i);
});

test("the Agent Skill is one skill, named as its capability, pointing to the Nodes and not restating them", () => {
  for (const path of Object.keys(skills)) assert.ok(path.startsWith(`${CAPABILITY}/`), path);
  assert.match(manifest, new RegExp(`^---\\nname: ${CAPABILITY}\\n`));
  assert.ok(manifest.includes("`Agreement`") && manifest.includes("`Skill`"));
  assert.ok(!manifest.includes(meaning.split("\n").filter((l) => l.startsWith("Agreement is the Process"))[0]));
  assert.ok(!manifest.includes(sha256(kaal[nodeFile])), "carries no ID of its own Node");
  assert.match(manifest, /compatibility: Needs Node\.js 20 or later, and the kaal-intent and kaal-review Skills installed beside this one\./);
});

test("the shipped script is exactly agree.mjs, runs nothing and reaches no network", () => {
  assert.deepEqual(Object.keys(skills).filter((p) => p.includes("/scripts/")), [`${CAPABILITY}/scripts/agree.mjs`]);
  const source = skills[`${CAPABILITY}/scripts/agree.mjs`];
  assert.doesNotMatch(source, /child_process|fetch\(|https?:/);
  assert.doesNotMatch(source.replace(/^\/\/.*$/gm, ""), /github|\bgit\b/i, "it knows no host beyond the text of the request it prints");
});

test("the Process passes the conventions Engineering KAAL Skill teaches", () => {
  const checker = join(REPO, "packages", "kaal-engineering", "skills", "kaal-engineering", "scripts", "check-skill.mjs");
  const r = spawnSync("node", [checker, REPO, CAPABILITY], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
});

test("registering is Core's: the shipped contribution passes register-skill --check", (t) => {
  const registrar = join(REPO, "packages", "kaal-engineering", "skills", "kaal-engineering", "scripts", "register-skill.mjs");
  const r = spawnSync("node", [registrar, "--check", deployKaal(t), CAPABILITY, join(PACKAGE, "kaal")], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /can register kaal-process-agree: [0-9a-f]{64}/);
});
