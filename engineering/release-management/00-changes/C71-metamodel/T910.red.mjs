// Case release/T910 (release/C71): the global metamodel exists, holds one Mermaid diagram, and every node of it is a defined object
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { model, mermaid, edges, objects, norm, DIR } from "./helper.mjs";

export const id = "release/T910";
export const tests = ["release/C71"];
export const title = "the global metamodel states its purpose and the trace chain Intent, Requirement, Architecture and Test Case (Control by its objective, Defect as a root), names the chain INFORMED (with its Definition) and is one Markdown file with exactly one Mermaid diagram whose nodes are all objects defined in its Objects table";
export async function run() {
  const text = model();
  assert.match(text, /^## Purpose\n[\s\S]*semantic reasoning/m, "the model states its purpose: an anchor for semantic reasoning");
  const chain = text.match(/^## Trace chain\n([\s\S]*?)^## /m);
  assert.ok(chain, "the model holds the Trace chain");
  const order = ["Intent", "Requirement", "Architecture", "Test Case"].map((w) => chain[1].indexOf(`| ${w} |`));
  assert.ok(order.every((i, k) => i >= 0 && (k === 0 || i > order[k - 1])), "the Trace chain lists Intent, Requirement, Architecture and Test Case in that order");
  assert.match(text, /INFORMED[^\n]*Implementation Navigates Forward: Observed Results Mirror Earlier Decisions/, "the model names the chain INFORMED with its expansion");
  const def = join(DIR, "INFORMED.md");
  assert.ok(existsSync(def), "INFORMED.md is absent");
  const d = readFileSync(def, "utf8");
  assert.match(d, /^name: INFORMED$/m); assert.match(d, /^  name: KAAL Definition$/m);
  assert.match(d, /^Implementation Navigates Forward: Observed Results Mirror Earlier Decisions\.$/m, "INFORMED states its expansion");
  for (const w of ["Implementation", "Navigates Forward", "Observed Results", "Mirror", "Earlier Decisions"]) assert.ok(d.includes(`- **${w}**`), `INFORMED does not define ${w}`);
  assert.match(d, /mnemonic, not a procedure: it owns no instruction, no capability and no control/, "INFORMED says what it is not");
  assert.ok(chain[1].includes("| Control |") && chain[1].includes("| Defect |"), "the Trace chain places Control (objective Intent, no chain of its own) and Defect (a root)");
  const blocks = mermaid(text);
  assert.equal(blocks.length, 1, "the global metamodel holds exactly one Mermaid diagram");
  const es = edges(blocks[0]);
  assert.ok(es.length >= 10, `the diagram holds ${es.length} labelled edges, fewer than the 10 of the Owner-decided model`);
  const names = new Set(objects(text).map((o) => norm(o.name)));
  for (const e of es) for (const n of [e.from, e.to]) assert.ok(names.has(n), `${n} is a node of the diagram and is not defined in the Objects table`);
}
