// Case release/T910 (release/C71): the global metamodel exists, holds one Mermaid diagram, and every node of it is a defined object
import assert from "node:assert/strict";
import { model, mermaid, edges, objects, norm } from "./helper.mjs";

export const id = "release/T910";
export const tests = ["release/C71"];
export const title = "the global metamodel is one Markdown file with exactly one Mermaid diagram whose nodes are all objects defined in its Objects table";
export async function run() {
  const text = model();
  const blocks = mermaid(text);
  assert.equal(blocks.length, 1, "the global metamodel holds exactly one Mermaid diagram");
  const es = edges(blocks[0]);
  assert.ok(es.length >= 14, `the diagram holds ${es.length} labelled edges, fewer than the 14 the PLAN draws`);
  const names = new Set(objects(text).map((o) => norm(o.name)));
  for (const e of es) for (const n of [e.from, e.to]) assert.ok(names.has(n), `${n} is a node of the diagram and is not defined in the Objects table`);
}
