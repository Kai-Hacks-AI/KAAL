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
import { payload } from "kaal-review";
import { admit, CAPABILITY, PACKAGE, REPO, deployKaal, read } from "../helpers/setup.js";

const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");
const { kaal, skills } = payload();
const nodeFile = "Review.md";
const manifest = skills[`${CAPABILITY}/SKILL.md`];
const meaning = kaal[nodeFile].split("---\n").pop()!;

test("Core carries no Review: a capability joins without becoming Core", () => {
  assert.ok(!admit(core()).some((n) => n.name === "Review"));
  assert.ok(!Object.keys(core()).some((p) => p.startsWith("skills/")));
});

test("registering through Core admits the Review Skill, typed by the sealed Skill Node, with the Definitions HOW and ARE it delivers", (t) => {
  const dir = deployKaal(t);
  const before = admit(read(dir));
  const skill = before.find((n) => n.name === "Skill")!;
  const sealsBefore = readdirSync(join(dir, "seals"));
  const ids = registerSkill(dir, CAPABILITY, kaal);
  const after = admit(read(dir));
  assert.deepEqual(ids, [sha256(kaal[nodeFile])], "the Skill's identity is the SHA-256 of the shipped bytes");
  assert.equal(after.length, before.length + 3);
  assert.deepEqual(after.filter((n) => n.type?.name === "Skill" && n.type.id === skill.id).map((n) => n.name), ["Review"], "found by its type alone");
  assert.equal(readFileSync(join(dir, "skills", CAPABILITY, nodeFile), "utf8"), kaal[nodeFile], "bytes kept exactly");
  assert.deepEqual(readdirSync(join(dir, "seals")).filter((id) => !sealsBefore.includes(id)).sort(), ["ARE.md", "HOW.md", nodeFile].map((f) => sha256(kaal[f])).sort(), "exactly one seal is added per Node");
});

test("the capability is one Skill Node, sealed by its own bytes, and it is the Node sealed in birth; its Definitions come after it", () => {
  assert.deepEqual(Object.keys(kaal).filter((p) => !p.startsWith("seals/")), ["ARE.md", "HOW.md", nodeFile]);
  for (const f of Object.keys(kaal).filter((p) => !p.startsWith("seals/"))) assert.equal(kaal[`seals/${sha256(kaal[f])}`], "");
  assert.equal(Object.keys(kaal).length, 6);
  assert.equal(sha256(kaal[nodeFile]), "7c3d4d8e6f56f9d3a6bf6e49d1ed912ec1808ac44e61541196160ddf9ab46d5f");
});

test("the Node says what Review is and is not: a capability and not a role, for any result, owning the round and convergence and nothing else", () => {
  assert.match(meaning, /capability of examining a result, reporting what was found, and establishing whether review has converged/);
  assert.match(meaning, /Review is a capability and not a role\. Any role may review/);
  assert.match(meaning, /it may come from any viewpoint or any capability of KAAL, and Review is specific to none of them/);
  assert.match(meaning, /authority and the independence/);
  assert.match(meaning, /a reviewer that cannot make it does not report convergence/);
  assert.match(meaning, /does not decide when a review is owed, which actor reviews, how a seat is assigned, what is done with findings, or what follows convergence/);
  assert.match(meaning, /Review is optional: it is not Core/);
  assert.match(meaning, /not a retrospective/);
});

test("the Node defines no mechanism and names no process, host or particular result", () => {
  for (const word of [/github/i, /\bgit\b/i, /\bPRs?\b/, /\bnpm\b/, /\.mjs/, /\bCI\b/, /\bChange\b/, /\bWork\b/, /\bROWING\b/, /\bWORK\b/, /\bOwner\b/, /\bWorker\b/, /\bObserver\b/, /\.md\b/, /\bseal/i, /enercon/i]) assert.doesNotMatch(meaning, word);
  assert.doesNotMatch(meaning, /\bRetro\b/, "it names the neighbour only as what it is not, in words");
});

test("the Agent Skill is one skill, named as its capability, pointing to the Nodes and not restating them", () => {
  for (const path of Object.keys(skills)) assert.ok(path.startsWith(`${CAPABILITY}/`), path);
  assert.match(manifest, new RegExp(`^---\\nname: ${CAPABILITY}\\n`));
  assert.ok(manifest.includes("`Review`") && manifest.includes("`Skill`"));
  assert.ok(!manifest.includes(meaning.split("\n").filter((l) => l.startsWith("Review is the capability"))[0]));
  assert.ok(!manifest.includes(sha256(kaal[nodeFile])), "carries no ID of its own Node");
  assert.doesNotMatch(manifest, /kaal-(sealing|changing|retro)|ROWING|\bWorker\b|\bOwner\b/, "declares no sibling and names no process");
});

test("the shipped script is exactly review.mjs, and knows nothing of Git, GitHub, a Change or any process", () => {
  assert.deepEqual(Object.keys(skills).filter((p) => p.includes("/scripts/")), [`${CAPABILITY}/scripts/review.mjs`]);
  const source = skills[`${CAPABILITY}/scripts/review.mjs`];
  assert.doesNotMatch(source, /github|\bgit\b|pull request|\bchanges?\b|\bwork\/|rowing|retro|\bseals?\b/i);
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
  assert.match(r.stdout, /can register kaal-review: [0-9a-f]{64}/);
});
