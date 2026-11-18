// Case release/T914 (release/C71): views link to the global model and the global model indexes every view
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { read, model, section, templates, viewPath, DIR } from "./helper.mjs";

export const id = "release/T914";
export const tests = ["release/C71"];
export const title = "every view links to the global metamodel and the link resolves, and the Views index of the global metamodel links every view and no other file, each link resolving";
export async function run() {
  const text = model();
  const indexed = [...(section(text, "Views") ?? "").matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
  const want = templates().map((t) => `views/${t.name}.md`);
  assert.deepEqual([...indexed].sort(), [...want].sort(), "the Views index lists exactly the views of the templates");
  for (const l of indexed) assert.ok(existsSync(join(DIR, l)), `the index link ${l} does not resolve`);
  for (const t of templates()) {
    const p = viewPath(t.name);
    const links = [...read(p).matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
    const back = links.filter((l) => resolve(dirname(p), l) === join(DIR, "metamodel.md"));
    assert.equal(back.length >= 1, true, `${t.name}: the view does not link to the global metamodel`);
  }
}
