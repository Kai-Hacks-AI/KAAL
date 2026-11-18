// Case release/T917 (release/C71): a reviewer answers the five questions about release/C65 by following the model
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { read, model, section, rows, frontmatter, walk, RM, REPO } from "./helper.mjs";

export const id = "release/T917";
export const tests = ["release/C71"];
export const title = "following only the relationships the model names for Q1 to Q5, a reviewer answers, from the repository alone, which Intent release/C65 delivers, what supports the Intent, which Controls pursue it, what each Case verifies and which Gap the Change identifies";
const USED = { Q1: ["delivers", "solves"], Q2: ["answers", "addresses", "objective"], Q3: ["objective"], Q4: ["verifies"], Q5: ["identifies", "verifies", "addresses"] };

export async function run() {
  const text = model();
  const q = Object.fromEntries(rows(section(text, "Reviewer questions")).map(([n, , path]) => [n, path]));
  for (const [n, rels] of Object.entries(USED)) {
    assert.ok(q[n], `${n} is not in the Reviewer questions of the model`);
    for (const r of rels) assert.ok(q[n].includes(r), `${n}: the model's path does not name ${r}`);
  }
  const folder = readdirSync(join(RM, "00-changes")).find((d) => d.startsWith("C65-"));
  assert.ok(folder, "Change release/C65 has a record folder");
  const node = frontmatter(readFileSync(join(RM, "00-changes", folder, "C65.md"), "utf8"));
  assert.deepEqual(node.implements, ["release/I35"], "Q1: C65 delivers release/I35 (key implements)");
  // Q2: no Requirement or Architecture serves I35; Controls have it
  const fm = (dir) => walk(join(RM, dir)).filter((f) => f.endsWith(".md")).map((f) => frontmatter(readFileSync(f, "utf8")));
  assert.equal(fm("02-requirements").filter((x) => (x.serves ?? []).includes("release/I35")).length, 0, "Q2: no Requirement answers I35");
  const controls = fm("04-controls").filter((x) => (x.has ?? []).includes("release/I35")).map((x) => x.id).sort();
  assert.deepEqual(controls, ["release/CTL7", "release/CTL8"], "Q3: the Controls whose objective is I35");
  // Q4: what each Case explicitly tests
  const tested = {};
  for (const f of walk(RM).filter((f) => /\/T85[0-5]\.test\.mjs$/.test(f))) { const t = readFileSync(f, "utf8"); tested[t.match(/export const id = ['"]([^'"]+)/)[1]] = t.match(/export const tests = \[([^\]]*)\]/)[1].replace(/['"\s]/g, ""); }
  assert.deepEqual(tested, { "release/T850": "release/I35", "release/T851": "release/C65", "release/T852": "release/C65", "release/T853": "release/C65", "release/T854": "release/C65", "release/T855": "release/C65" }, "Q4: what T850 to T855 test");
  // Q5: the Gap the Change identifies (key closes); no Defect is addressed
  assert.deepEqual(node.closes, ["release/G93"], "Q5: C65 closes release/G93");
}
