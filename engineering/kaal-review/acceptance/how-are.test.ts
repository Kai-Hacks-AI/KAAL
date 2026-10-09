// HOW and ARE: what a fresh Agent can find and what the Nodes may and may not say.
// Review keeps its sealed identity (a Process composes it by that ID); HOW and ARE
// are born after it, refer to it, and are found from an installed KAAL by type and name.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestContext } from "node:test";
import { admit, CAPABILITY, REPO } from "../helpers/setup.js";
import { payload } from "kaal-review";

const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");
const { kaal, skills } = payload();
const reviewId = "7c3d4d8e6f56f9d3a6bf6e49d1ed912ec1808ac44e61541196160ddf9ab46d5f";
const definitionId = "17bf407006223729ebcfa04476cb1ef9f0012a9f352d6a14ad37c43fde73f53a";
const body = (file: string) => kaal[file].split("---\n").pop()!;
const manifest = skills[`${CAPABILITY}/SKILL.md`];

test("Review keeps the identity a Process composes it by, and HOW and ARE are sealed Definitions that refer to it", () => {
  assert.equal(sha256(kaal["Review.md"]), reviewId);
  for (const [file, name] of [["HOW.md", "HOW"], ["ARE.md", "ARE"]] as const) {
    assert.match(kaal[file], new RegExp(`^---\\nname: ${name}\\ntype:\\n  name: KAAL Definition\\n  id: ${definitionId}\\n---\\n`));
    assert.equal(kaal[`seals/${sha256(kaal[file])}`], "", `${name} is sealed by its own bytes`);
    assert.ok(body(file).includes(`Review ${reviewId}`), `${name} refers to Review by name and ID`);
  }
});

test("from an installed KAAL a fresh Agent finds HOW and ARE by type and name, and each leads to Review by ID", (t: TestContext) => {
  const host = mkdtempSync(join(tmpdir(), "how-are-"));
  t.after(() => rmSync(host, { recursive: true, force: true }));
  writeFileSync(join(host, "README.md"), "# Some host\n");
  const run = (...args: string[]) => spawnSync("node", [join(REPO, "engineering", "kaal-install", "dist", "helpers", "install-kaal.js"), ...args], { env: { ...process.env, INIT_CWD: host }, encoding: "utf8" });
  assert.equal(run("--select", reviewId).status, 0);
  const nodes = admit(readTree(join(host, ".kaal")));
  const definitions = nodes.filter((n) => n.type?.id === definitionId).map((n) => n.name);
  assert.ok(definitions.includes("HOW") && definitions.includes("ARE"), "found among the KAAL Definitions");
  const review = nodes.find((n) => n.name === "Review")!;
  assert.equal(review.id, reviewId);
  for (const name of ["HOW", "ARE"]) assert.ok(readFileSync(join(host, ".kaal", "skills", CAPABILITY, `${name}.md`), "utf8").includes(`Review ${reviewId}`));
  assert.equal(spawnSync("node", [join(REPO, "engineering", "kaal-install", "dist", "helpers", "check-kaal-install.js")], { env: { ...process.env, INIT_CWD: host }, encoding: "utf8" }).status, 0);
});

test("HOW is a human taking part, and adds no authority, no particular human and no product", () => {
  const how = body("HOW.md");
  assert.match(how, /with a human taking part in it while it happens/);
  assert.match(how, /does not matter who the human is, which account or channel they use/);
  assert.match(how, /an agent that assists is not the human observing/);
  assert.match(how, /adds no authority/);
  assert.match(how, /it is not approval, and it does not establish, accept or carry out the result/);
  assert.match(how, /does not excuse an examiner that is not independent/);
  assert.match(how, /does not say when a human must observe a review/);
});

test("ARE is independent agent review of another actor's result, independence of judgment and not of product, with no authority", () => {
  const are = body("ARE.md");
  assert.match(are, /without needing a human to take part in the ordinary course/);
  assert.match(are, /A helper that the maker starts on its own side to examine its own result is part of the maker, and that is not ARE/);
  assert.match(are, /Independence here is of judgment and not of product/);
  assert.match(are, /Nothing here measures independence/);
  assert.match(are, /no agent acquires authority to review, or to approve, establish or carry out anything/);
  assert.match(are, /convergence among agents is not approval/);
  assert.match(are, /For the rounds a human observes, the review is also HOW/);
});

test("neither Node depends on a product, host, account, mechanism, process or historical Idea", () => {
  for (const file of ["HOW.md", "ARE.md"]) for (const word of [/github/i, /\bgit\b/i, /\bPRs?\b/, /claude/i, /codex/i, /copilot/i, /openai|anthropic|chatgpt/i, /\bnpm\b/, /\.mjs/, /\bCI\b/, /\bChange\b/, /\bROWING\b/, /\bWORK\b/, /\bOwner\b/, /\bWorker\b/, /\bseal\b/i, /enercon/i, /\bBRAIN\b/, /\bIdeas?\b/]) assert.doesNotMatch(body(file), word, `${file} ${word}`);
});

test("the Agent Skill is found by the words HOW and ARE, points to the Nodes without restating them, and keeps the human's words the human's", () => {
  const description = manifest.split("\n").find((l) => l.startsWith("description:"))!;
  assert.match(description, /HOW review/);
  assert.match(description, /ARE review/);
  assert.ok(description.length < 1024);
  assert.ok(manifest.includes("`HOW`") && manifest.includes("`ARE`"));
  assert.ok(!manifest.includes(body("HOW.md").split("\n").filter((l) => l.startsWith("HOW is Review"))[0]), "does not restate HOW");
  assert.ok(!manifest.includes(reviewId) && !manifest.includes(sha256(kaal["HOW.md"])) && !manifest.includes(sha256(kaal["ARE.md"])), "carries no ID of a Node");
  assert.match(manifest, /never write an observation, direction or approval as the human's/);
  assert.match(manifest, /If you are not independent of its maker, stop and say so/);
  assert.match(manifest, /Convergence is not approval/);
  assert.match(manifest, /Review keeps no store of observations/);
  assert.doesNotMatch(manifest, /kaal-(sealing|changing|retro)|ROWING|\bWorker\b|\bOwner\b/);
});

function readTree(dir: string): Record<string, string> {
  const files: Record<string, string> = {};
  for (const path of readdirSync(dir, { recursive: true, encoding: "utf8" })) if (statSync(join(dir, path)).isFile()) files[path.split("\\").join("/")] = readFileSync(join(dir, path), "utf8");
  return files;
}
