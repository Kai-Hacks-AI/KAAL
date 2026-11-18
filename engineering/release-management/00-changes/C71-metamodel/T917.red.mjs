// Case release/T917 (release/C71): a reviewer answers the six questions on the PLAN, DO, ACT and PROMOTION of release/C65 by following the model
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { read, model, section, rows, frontmatter, walk, RM, REPO } from "./helper.mjs";

export const id = "release/T917";
export const tests = ["release/C71"];
export const title = "following only the relationships the model names for Q1 to Q6, a reviewer answers, from the recorded pull requests of release/C65 (PLAN, DO, ACT, PROMOTION) and the repository, which objects it affects, which Intent it delivers, what supports the Intent, what each Case tests, which Gap it closes and what evidence there is";
const USED = { Q1: ["realizes", "records"], Q2: ["realizes", "delivers"], Q3: ["answers", "has"], Q4: ["tests"], Q5: ["addresses", "closes"], Q6: ["records", "references"] };

export async function run() {
  const text = model();
  const q = Object.fromEntries(rows(section(text, "Reviewer questions")).map(([n, , path]) => [n, path]));
  for (const [n, rels] of Object.entries(USED)) {
    assert.ok(q[n], `${n} is not in the Reviewer questions of the model`);
    for (const r of rels) assert.ok(q[n].includes(r), `${n}: the model's path does not name ${r}`);
  }
  const sample = JSON.parse(readFileSync(new URL("./sample-c65.json", import.meta.url), "utf8")).prs;
  assert.deepEqual(sample.map((p) => p.title.split(":")[0]), ["PLAN", "DO", "ACT", "PROMOTION"], "the sample is a PLAN, a DO, an ACT and a PROMOTION");
  const changeId = (p) => p.changeLine.match(/^(\S+\/C\d+)\b/)[1];
  for (const p of sample) assert.equal(changeId(p), "release/C65", `#${p.pr}: realizes release/C65`); // PR realizes Change
  const folder = readdirSync(join(RM, "00-changes")).find((d) => d.startsWith("C65-"));
  assert.ok(folder, "Change release/C65 has a record folder");
  const node = frontmatter(readFileSync(join(RM, "00-changes", folder, "C65.md"), "utf8"));
  assert.deepEqual(node.implements, ["release/I35"], "Q2: C65 delivers release/I35 (key implements)");
  // Q1: the folders the DO touches
  const folders = new Set(sample.find((p) => p.title.startsWith("DO")).files.map((f) => f.replace("engineering/release-management/", "").split("/")[0]));
  assert.deepEqual([...folders].sort(), ["00-changes", "01-intent", "04-controls", "05-src"], "Q1: the objects the DO affects, by folder");
  // Q3: no Requirement or Architecture serves I35; Controls have it
  const fm = (dir) => walk(join(RM, dir)).filter((f) => f.endsWith(".md")).map((f) => frontmatter(readFileSync(f, "utf8")));
  assert.equal(fm("02-requirements").filter((x) => (x.serves ?? []).includes("release/I35")).length, 0, "Q3: no Requirement answers I35");
  const controls = fm("04-controls").filter((x) => (x.has ?? []).includes("release/I35")).map((x) => x.id).sort();
  assert.deepEqual(controls, ["release/CTL7", "release/CTL8"], "Q3: the Controls that have I35");
  // Q4: what each Case explicitly tests
  const tested = {};
  for (const f of walk(RM).filter((f) => /\/T85[0-5]\.test\.mjs$/.test(f))) { const t = readFileSync(f, "utf8"); tested[t.match(/export const id = ['"]([^'"]+)/)[1]] = t.match(/export const tests = \[([^\]]*)\]/)[1].replace(/['"\s]/g, ""); }
  assert.deepEqual(tested, { "release/T850": "release/I35", "release/T851": "release/C65", "release/T852": "release/C65", "release/T853": "release/C65", "release/T854": "release/C65", "release/T855": "release/C65" }, "Q4: what T850 to T855 test");
  // Q5: the Gap it closes; no Defect is addressed
  assert.deepEqual(node.closes, ["release/G93"], "Q5: C65 closes release/G93");
  // Q6: the record references evidence
  for (const f of ["evidence.md", "act.md", "gap.md"]) assert.ok(existsSync(join(RM, "00-changes", folder, f)), `Q6: ${f} is in the record`);
}
