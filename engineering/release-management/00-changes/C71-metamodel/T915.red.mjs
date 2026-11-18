// Case release/T915 (release/C71): a view defines nothing; it selects from the global model
import assert from "node:assert/strict";
import { read, model, mermaid, edges, key, objects, relationships, templates, viewPath, section, norm } from "./helper.mjs";

export const id = "release/T915";
export const tests = ["release/C71"];
export const title = "a view holds no table and no definition, its diagram draws only edges of the global model in the same style, and every object and relationship it lists is defined in the global model";
export async function run() {
  const text = model();
  const globalEdges = new Set(edges(mermaid(text)[0] ?? "").map(key));
  const names = new Set(objects(text).map((o) => norm(o.name)));
  const labels = new Set(relationships(text).map((r) => r.label));
  for (const t of templates()) {
    const v = read(viewPath(t.name));
    assert.ok(!/^\|/m.test(v), `${t.name}: a view holds no table`);
    for (const e of edges(mermaid(v)[0] ?? "")) assert.ok(globalEdges.has(key(e)), `${t.name}: the edge ${e.from} ${e.label} ${e.to} is not an edge of the global model`);
    const listed = (s) => (section(v, s) ?? "").replace(/\.\s*$/, "").split(",").map((x) => x.trim()).filter(Boolean);
    for (const o of listed("Objects")) assert.ok(names.has(norm(o)), `${t.name}: ${o} is not an object of the global model`);
    for (const r of listed("Relationships")) assert.ok(labels.has(r), `${t.name}: ${r} is not a relationship of the global model`);
  }
}
